import A2UICore
import A2UISwiftUI
import BasicCatalogSwiftUI
import SwiftUI

@main
struct A2UIRendererApp: App {
  var body: some Scene { WindowGroup { ContentView() } }
}

let cases = ["schedule", "golf", "clinic", "flight"]

@MainActor @Observable
final class Model {
  var selected: String { didSet { load() } }
  var surface: SurfaceViewModel?
  var log: [String] = []
  @ObservationIgnored let catalogs = [BasicCatalogImplementation.makeCatalog(version: .v10)]
  @ObservationIgnored var processor: MessageProcessor?

  init() {
    let args = UserDefaults.standard
    selected = args.string(forKey: "case").flatMap { cases.contains($0) ? $0 : nil } ?? cases[0]
    load()
  }

  func load() {
    log = []
    processor?.dispose()
    let processor = MessageProcessor(catalogs: catalogs)
    // Outbound messages (action / error) are what would be sent to the agent.
    processor.outboundListener = { message in
      let encoder = JSONEncoder()
      encoder.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
      let json = (try? encoder.encode(message)).flatMap { String(data: $0, encoding: .utf8) } ?? "\(message)"
      print("[Agent log]\n\(json)")
      Task { @MainActor in self.log.insert(json, at: 0) }
    }
    self.processor = processor
    do {
      let url = Bundle.main.url(forResource: "fixtures/\(selected)", withExtension: "json")!
      let clinicOverride = selected == "clinic" ? ProcessInfo.processInfo.environment["A2UI_CLINIC_FIXTURE"] : nil
      let fixture = try clinicOverride.map { Data($0.utf8) } ?? Data(contentsOf: url)
      let root = try JSONSerialization.jsonObject(with: fixture) as! [String: Any]
      for raw in root["messages"] as! [Any] {
        let data = try JSONSerialization.data(withJSONObject: raw)
        processor.process(message: try MessageParser().decode(jsonData: data))
      }
    } catch {
      log = ["Load error: \(error)"]
    }
    surface = processor.surfaceGroupModel.surfacesMap.values.first
  }
}

struct ContentView: View {
  @State private var model = Model()

  var body: some View {
    VStack(spacing: 0) {
      Picker("Case", selection: $model.selected) {
        ForEach(cases, id: \.self) { Text($0).tag($0) }
      }
      .pickerStyle(.segmented)
      .padding()
      ScrollView {
        if let surface = model.surface {
          SurfaceView(surface: surface, catalogs: model.catalogs).id(model.selected).padding()
        }
      }
      VStack(alignment: .leading, spacing: 4) {
        Text("Agent log").font(.headline)
        ScrollView {
          Text(model.log.isEmpty ? "(no actions yet)" : model.log.joined(separator: "\n\n"))
            .font(.system(.caption, design: .monospaced))
            .frame(maxWidth: .infinity, alignment: .leading)
            .textSelection(.enabled)
            .accessibilityIdentifier("agentLog")
        }
      }
      .padding()
      .frame(height: 200)
      .background(Color(.secondarySystemBackground))
    }
  }
}

private struct SurfaceView: View {
  @ObservedObject var surface: SurfaceViewModel
  let catalogs: [Catalog<ComponentImplementation>]
  var body: some View { A2UISwiftUI.Surface(viewModel: surface, catalogs: catalogs) }
}
