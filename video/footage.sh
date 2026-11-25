#!/bin/bash
# Run from any directory. Set SIM to select a particular iPhone 16 Pro UDID.
set -euo pipefail
cd "$(dirname "$0")/.."
exec python3 - "$@" <<'PY'
import argparse
import json
import os
from pathlib import Path
import select
import shutil
import signal
import subprocess
import tempfile
import time


def run(*command, cwd=None):
    subprocess.run(command, cwd=cwd, check=True)


def read_json(*command):
    return json.loads(subprocess.check_output(command))


def activity_times(result, test):
    activities = read_json(
        "xcrun", "xcresulttool", "get", "test-results", "activities",
        "--path", result, "--test-id", f"FootageTests/{test}()",
    )["testRuns"][0]["activities"]
    return {activity["title"]: activity["startTime"] for activity in activities}


def record(device, video, test_command):
    process = subprocess.Popen(
        ("xcrun", "simctl", "io", device, "recordVideo", "--codec=h264", "--mask=ignored", video),
        stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, bufsize=0,
    )
    try:
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            if not select.select([process.stderr], [], [], max(0, deadline - time.monotonic()))[0]:
                break
            line = process.stderr.readline()
            if not line:
                break
            if b"Recording started" in line:
                start = time.time()
                run(*test_command)
                return start
            print(line.decode(errors="replace").strip(), flush=True)
        raise RuntimeError("simctl did not start recording")
    finally:
        if process.poll() is None:
            process.send_signal(signal.SIGINT)
        try:
            _, stderr = process.communicate(timeout=15)
        except subprocess.TimeoutExpired:
            process.kill()
            process.communicate()
            raise
        if stderr:
            print(stderr.decode(errors="replace").strip(), flush=True)
        if process.returncode != 0:
            raise RuntimeError(f"simctl recordVideo exited {process.returncode}")


def record_test(udid, build, raw, result, test):
    try:
        started = record(udid, raw, (
            "xcodebuild", "test-without-building", *build,
            f"-only-testing:A2UIRendererUITests/FootageTests/{test}",
            "-resultBundlePath", result, "-collect-test-diagnostics", "never", "-quiet",
        ))
    except subprocess.CalledProcessError:
        if result.exists():
            subprocess.run(("xcrun", "xcresulttool", "get", "test-results", "summary", "--path", result))
        raise
    return started, activity_times(result, test)


def capture_screenshots(udid, build):
    names = ("schedule", "golf", "clinic", "flight", "golf_action")
    output = Path("ios/screenshots")
    with tempfile.TemporaryDirectory(prefix="a2ui-screenshots-") as directory:
        temp = Path(directory)
        raw = temp / "tour.mov"
        started, markers = record_test(udid, build, raw, temp / "tour.xcresult", "testTour")
        for name in names:
            offset = markers[f"Screenshot {name}"] - started
            screenshot = temp / f"{name}.png"
            # Extract from the same capture path as the footage so the Dynamic Island matches.
            run(
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", raw,
                "-vf", f"fps=30,tpad=stop_mode=clone:stop_duration=2,select=gte(t\\,{offset:.3f})",
                "-frames:v", "1", "-update", "1", screenshot,
            )
            stream = read_json(
                "ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "json", screenshot,
            )["streams"][0]
            if (stream["width"], stream["height"]) != (1206, 2622):
                raise RuntimeError(f"Unexpected screenshot dimensions for {name}: {stream}")

        output.mkdir(parents=True, exist_ok=True)
        for name in names:
            shutil.copyfile(temp / f"{name}.png", output / f"{name}.png")
    print(output)


def main():
    parser = argparse.ArgumentParser(prog="footage.sh", description="Capture A2UI on an iPhone 16 Pro simulator.")
    parser.add_argument("--screenshots", action="store_true", help="regenerate the five PNGs in ios/screenshots")
    args = parser.parse_args()

    devices = read_json("xcrun", "simctl", "list", "devices", "available", "--json")["devices"]
    candidates = [
        device for runtime in devices.values() for device in runtime
        if device["name"] == "iPhone 16 Pro"
    ]
    candidates.sort(key=lambda device: device["state"] != "Booted")
    requested = os.environ.get("SIM")
    device = next((device for device in candidates if not requested or device["udid"] == requested), None)
    if device is None:
        raise SystemExit("An available iPhone 16 Pro simulator is required. Check SIM and simctl list devices.")
    udid = device["udid"]
    if device["state"] == "Shutdown":
        run("xcrun", "simctl", "boot", udid)
    run("xcrun", "simctl", "bootstatus", udid, "-b")
    run("xcrun", "simctl", "ui", udid, "appearance", "light")
    run(
        "xcrun", "simctl", "status_bar", udid, "override", "--time", "9:41",
        "--dataNetwork", "wifi", "--wifiMode", "active", "--wifiBars", "3",
        "--cellularMode", "active", "--cellularBars", "4",
        "--batteryState", "discharging", "--batteryLevel", "100",
    )

    run("xcodegen", "generate", "--quiet", cwd="ios")
    build = (
        "-project", "ios/A2UIRenderer.xcodeproj", "-scheme", "A2UIRenderer",
        "-destination", f"platform=iOS Simulator,id={udid}",
        "-derivedDataPath", "ios/build/dd", "-parallel-testing-enabled", "NO",
    )
    run("xcodebuild", "build-for-testing", *build, "-quiet")
    if args.screenshots:
        capture_screenshots(udid, build)
        return

    clips = {
        "s00_tour": ("testTour", "일정·골프·진료·항공권 전환 후 골프 예약 제출"),
        "s08_golf": ("testGolf", "필수 검증, 골프장·티타임 선택, 인원·카트 변경, 제출 및 Agent log"),
        "s09_all": ("testAll", "네 화면을 전환하고 진료 연락처에 잘못된 번호를 입력해 경고 확인"),
        "s10_before": ("testBefore", "원본 진료과 선택지와 예약 신청 버튼"),
        "s10_after": ("testAfter", "추가된 안과 선택지와 진료 예약하기 버튼"),
    }
    output = Path("video/public/footage")
    index = {}
    with tempfile.TemporaryDirectory(prefix="a2ui-footage-") as directory:
        temp = Path(directory)
        for name, (test, note) in clips.items():
            print(f"Recording {name} on {udid}", flush=True)
            raw = temp / f"{name}.mov"
            result = temp / f"{name}.xcresult"
            started, markers = record_test(udid, build, raw, result, test)
            begin, end = markers["Footage start"], markers["Footage end"]
            offset = begin - started
            duration = end - begin
            if offset < 0 or not 3 <= duration <= 25:
                raise RuntimeError(f"Invalid trim for {name}: start {offset:.3f}, duration {duration:.3f}")
            clip = temp / f"{name}.mp4"
            # simctl records display updates at variable intervals. Fill static frames before trimming.
            timing = (
                f"fps=30,tpad=stop_mode=clone:stop_duration=2,"
                f"trim=start={offset:.3f}:duration={duration:.3f},setpts=PTS-STARTPTS"
            )
            run(
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", raw, "-an", "-vf", timing,
                "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", clip,
            )
            stream = read_json(
                "ffprobe", "-v", "error", "-select_streams", "v:0",
                "-show_entries", "stream=codec_name,width,height,duration", "-of", "json", clip,
            )["streams"][0]
            duration = float(stream["duration"])
            if stream["codec_name"] != "h264" or not 3 <= duration <= 25:
                raise RuntimeError(f"Invalid encoded video for {name}: {stream}")
            index[name] = {
                "durationSec": round(duration, 3),
                "width": stream["width"], "height": stream["height"], "note": note,
            }
            run(
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{duration / 2:.3f}",
                "-i", clip, "-frames:v", "1", "-update", "1", temp / f"{name}.png",
            )

        (output / "thumbs").mkdir(parents=True, exist_ok=True)
        for name in clips:
            shutil.copyfile(temp / f"{name}.mp4", output / f"{name}.mp4")
            shutil.copyfile(temp / f"{name}.png", output / "thumbs" / f"{name}.png")
        (output / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(output / "index.json")


main()
PY
