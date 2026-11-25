import XCTest

final class ActionLogTests: XCTestCase {
  // Fills golf's required fields, submits, and saves a screenshot with the Agent log.
  @MainActor func testGolfSubmitLogsAction() throws {
    let app = XCUIApplication()
    app.launchArguments = ["-case", "golf"]
    app.launch()
    let submit = app.buttons["예약하기"]
    XCTAssertFalse(submit.isEnabled, "checks should disable the button")
    app.buttons["스카이힐 CC"].tap()
    app.buttons["06:30"].tap()
    app.swipeUp()
    XCTAssertTrue(submit.waitForExistence(timeout: 5))
    XCTAssertTrue(submit.isEnabled)
    submit.tap()
    let log = app.staticTexts["agentLog"]
    XCTAssertTrue(log.label.contains("golf_submit"), log.label)
    let png = XCUIScreen.main.screenshot().pngRepresentation
    let out = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
      .appendingPathComponent("../screenshots/golf_action.png")
    try png.write(to: out)
  }
}
