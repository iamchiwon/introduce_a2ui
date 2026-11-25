#!/bin/zsh
# Build, install, screenshot 4 cases, then run the UI test that captures the action log.
set -euo pipefail
cd "$(dirname "$0")"
SIM=${SIM:-$(xcrun simctl list devices available | grep -m1 "iPhone 16 Pro (" | grep -oE "[0-9A-F-]{36}")}
DEST="platform=iOS Simulator,id=$SIM"
/opt/homebrew/bin/xcodegen generate --quiet
# Note: passing -sdk iphonesimulator breaks the A2UI SPM build-tool plugin; use -destination only.
xcodebuild build -project A2UIRenderer.xcodeproj -scheme A2UIRenderer -destination "$DEST" -derivedDataPath build/dd -quiet
xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl bootstatus "$SIM" -b >/dev/null
xcrun simctl install "$SIM" build/dd/Build/Products/Debug-iphonesimulator/A2UIRenderer.app
mkdir -p screenshots
for c in schedule golf clinic flight; do
  xcrun simctl terminate "$SIM" dev.a2ui.renderer 2>/dev/null || true
  xcrun simctl launch "$SIM" dev.a2ui.renderer -case $c >/dev/null
  sleep 3
  xcrun simctl io "$SIM" screenshot screenshots/$c.png >/dev/null 2>&1
done
xcodebuild test -project A2UIRenderer.xcodeproj -scheme A2UIRenderer -destination "$DEST" -derivedDataPath build/dd -quiet
ls -1 screenshots
