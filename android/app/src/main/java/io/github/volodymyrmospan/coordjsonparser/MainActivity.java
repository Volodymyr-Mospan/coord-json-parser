package io.github.volodymyrmospan.coordjsonparser;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Обробка файлу якщо додаток запущено через відкриття .json
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Обробка файлу якщо додаток вже запущений
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        Uri data = intent.getData();

        if (!Intent.ACTION_VIEW.equals(action) || data == null) return;

        // Перевіряємо що це .json файл
        String path = data.getPath();
        if (path != null && !path.toLowerCase().endsWith(".json")) {
            String mimeType = intent.getType();
            if (mimeType == null || !mimeType.contains("json")) return;
        }

        try {
            // Читаємо вміст файлу
            InputStream inputStream = getContentResolver().openInputStream(data);
            if (inputStream == null) return;

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(inputStream, StandardCharsets.UTF_8)
            );
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            reader.close();
            inputStream.close();

            String jsonString = sb.toString();

            // Передаємо в WebView з затримкою — WebView може ще не бути готовий
            getBridge().getWebView().postDelayed(() -> {
                String escaped = jsonString
                        .replace("\\", "\\\\")
                        .replace("`", "\\`");

                String js = "window.dispatchEvent(new CustomEvent('jsonFileOpened', { detail: `" + escaped + "` }));";

                getBridge().getWebView().evaluateJavascript(js, null);
            }, 800);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}