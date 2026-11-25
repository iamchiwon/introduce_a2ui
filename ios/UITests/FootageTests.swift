import XCTest

@MainActor
final class FootageTests: XCTestCase {
  func testTour() throws {
    let app = try launch("schedule")
    select("golf", in: app)
    select("clinic", in: app)
    select("flight", in: app)
    select("golf", in: app)
    fillGolf(in: app)
    submitGolf(in: app)
    finish()
  }

  func testGolf() throws {
    let app = try launch("golf")
    XCTAssertTrue(app.staticTexts["골프장을 선택하세요."].isHittable)
    let form = app.scrollViews.firstMatch
    form.swipeUp()
    let submit = app.buttons["예약하기"]
    XCTAssertTrue(submit.isHittable)
    XCTAssertFalse(submit.isEnabled)
    pause()
    form.swipeDown()
    pause()

    fillGolf(in: app)
    let players = app.sliders.firstMatch
    players.adjust(toNormalizedSliderPosition: 0.67)
    pause()
    app.switches["카트 사용"].tap()
    pause()
    submitGolf(in: app)
    let log = app.staticTexts["agentLog"]
    XCTAssertTrue(log.label.contains("\"players\" : 3"), log.label)
    XCTAssertTrue(log.label.contains("\"cart\" : false"), log.label)
    app.scrollViews.element(boundBy: 1).swipeUp(velocity: .slow)
    finish()
  }

  func testAll() throws {
    let app = try launch("schedule")
    select("golf", in: app)
    select("clinic", in: app)
    select("flight", in: app)
    select("clinic", in: app)

    app.scrollViews.firstMatch.swipeUp()
    pause()
    let phone = app.textFields["연락처"]
    phone.tap()
    pause()
    for digit in "12345" {
      phone.typeText(String(digit))
      pause(0.12)
    }
    XCTAssertEqual(phone.value as? String, "12345")
    pause()
    phone.typeText("\n")
    pause()
    let warning = app.staticTexts["휴대폰 번호 형식이 아닙니다."]
    XCTAssertTrue(warning.isHittable, "The phone validation message should be visible after typing.")
    finish()
  }

  func testBefore() throws {
    try showClinic()
  }

  func testAfter() throws {
    let fixtures = URL(fileURLWithPath: #filePath)
      .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
      .appendingPathComponent("fixtures/clinic.json")
    let original = try Data(contentsOf: fixtures)
    var fixture = try JSONSerialization.jsonObject(with: original) as! [String: Any]
    var messages = fixture["messages"] as! [[String: Any]]
    var surface = messages[0]["createSurface"] as! [String: Any]
    var components = surface["components"] as! [[String: Any]]

    let department = try XCTUnwrap(components.firstIndex { $0["id"] as? String == "dept" })
    var options = components[department]["options"] as! [[String: String]]
    options.append(["value": "eye", "label": "안과"])
    components[department]["options"] = options
    let submitLabel = try XCTUnwrap(components.firstIndex { $0["id"] as? String == "submit_label" })
    components[submitLabel]["text"] = "진료 예약하기"

    surface["components"] = components
    messages[0]["createSurface"] = surface
    fixture["messages"] = messages
    let variant = String(decoding: try JSONSerialization.data(withJSONObject: fixture), as: UTF8.self)
    try showClinic(variant: variant)
  }

  private func launch(_ screen: String, clinicFixture: String? = nil) throws -> XCUIApplication {
    continueAfterFailure = false
    let app = XCUIApplication()
    app.launchArguments = ["-case", screen]
    app.launchEnvironment["A2UI_CLINIC_FIXTURE"] = clinicFixture
    app.launch()
    let picker = try XCTUnwrap(app.segmentedControls.firstMatch.buttons.allElementsBoundByIndex.first)
    XCTAssertTrue(picker.isHittable)
    XCTContext.runActivity(named: "Footage start") { _ in }
    pause(1.0)
    return app
  }

  private func select(_ screen: String, in app: XCUIApplication) {
    app.segmentedControls.firstMatch.buttons[screen].tap()
    pause()
  }

  private func fillGolf(in app: XCUIApplication) {
    app.buttons["스카이힐 CC"].tap()
    pause()
    app.buttons["06:30"].tap()
    pause()
    app.scrollViews.firstMatch.swipeUp()
    pause()
  }

  private func submitGolf(in app: XCUIApplication) {
    let submit = app.buttons["예약하기"]
    XCTAssertTrue(submit.isHittable && submit.isEnabled)
    submit.tap()
    let log = app.staticTexts["agentLog"]
    XCTAssertTrue(log.label.contains("golf_submit"), log.label)
    pause(1.1)
  }

  private func showClinic(variant: String? = nil) throws {
    let app = try launch("clinic", clinicFixture: variant)
    let eye = app.buttons["안과"]
    if variant != nil {
      XCTAssertTrue(eye.isHittable)
      eye.tap()
    } else {
      XCTAssertFalse(eye.exists)
      app.buttons["내과"].tap()
    }
    pause(1.1)
    app.scrollViews.firstMatch.swipeUp()
    let submit = app.buttons[variant == nil ? "예약 신청" : "진료 예약하기"]
    XCTAssertTrue(submit.isHittable)
    finish()
  }

  private func finish() {
    pause(1.2)
    XCTContext.runActivity(named: "Footage end") { _ in }
  }

  private func pause(_ seconds: TimeInterval = 0.7) {
    Thread.sleep(forTimeInterval: seconds)
  }
}
