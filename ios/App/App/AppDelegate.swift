import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {

        // Обробляємо .json файли
        if url.pathExtension.lowercased() == "json" {
            handleIncomingJSON(url: url)
            return true
        }

        // Решта — стандартна обробка Capacitor (Universal Links тощо)
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // MARK: - JSON File Handler

    private func handleIncomingJSON(url: URL) {
        do {
            // Файл може лежати поза sandbox — копіюємо у tmp
            let tempDir = FileManager.default.temporaryDirectory
            let destURL = tempDir.appendingPathComponent(url.lastPathComponent)

            if FileManager.default.fileExists(atPath: destURL.path) {
                try FileManager.default.removeItem(at: destURL)
            }
            try FileManager.default.copyItem(at: url, to: destURL)

            let jsonString = try String(contentsOf: destURL, encoding: .utf8)

            // Передаємо в WebView з затримкою — WebView може ще не бути готовий
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                self.dispatchToWebView(jsonString: jsonString)
            }

        } catch {
            print("❌ handleIncomingJSON error: \(error)")
        }
    }

    private func dispatchToWebView(jsonString: String) {
        guard
            let rootVC = window?.rootViewController as? CAPBridgeViewController,
            let webView = rootVC.bridge?.webView
        else {
            print("❌ WebView не знайдено")
            return
        }

        // Безпечне екранування для вставки в JS-рядок
        let escaped = jsonString
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "`", with: "\\`")

        // Передаємо через CustomEvent з template literal — безпечно для багаторядкових JSON
        let js = """
        window.dispatchEvent(new CustomEvent('jsonFileOpened', {
            detail: `\(escaped)`
        }));
        """

        webView.evaluateJavaScript(js) { _, error in
            if let error = error {
                print("❌ evaluateJavaScript error: \(error)")
            } else {
                print("✅ jsonFileOpened dispatched")
            }
        }
    }
}