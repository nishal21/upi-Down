package dev.nishal.upidown;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import androidx.activity.EdgeToEdge;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import java.util.concurrent.atomic.AtomicBoolean;

public class MainActivity extends BridgeActivity {
  private final AtomicBoolean keepSplash = new AtomicBoolean(true);

  public static class SplashBridge {
    private final AtomicBoolean keep;

    SplashBridge(AtomicBoolean keep) {
      this.keep = keep;
    }

    @JavascriptInterface
    public void dismissSplash() {
      keep.set(false);
    }
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    SplashScreen splash = SplashScreen.installSplashScreen(this);
    splash.setKeepOnScreenCondition(keepSplash::get);
    EdgeToEdge.enable(this);
    super.onCreate(savedInstanceState);

    // Fallback so we never stick on the system splash forever.
    new Handler(Looper.getMainLooper()).postDelayed(() -> keepSplash.set(false), 5000);

    // JS: window.UpiDownNative.dismissSplash() when Lottie is ready.
    new Handler(Looper.getMainLooper()).post(() -> {
      if (this.bridge != null && this.bridge.getWebView() != null) {
        this.bridge.getWebView().addJavascriptInterface(new SplashBridge(keepSplash), "UpiDownNative");
      }
    });
  }
}
