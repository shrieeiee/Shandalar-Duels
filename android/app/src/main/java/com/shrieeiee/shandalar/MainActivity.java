package com.shrieeiee.shandalar;
import android.app.Activity; import android.os.Bundle; import android.view.View; import android.webkit.*;
public class MainActivity extends Activity {
    private WebView wv;
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        wv = new WebView(this); setContentView(wv);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setMediaPlaybackRequiresUserGesture(false); s.setAllowFileAccess(true);
        wv.setWebViewClient(new WebViewClient()); wv.setWebChromeClient(new WebChromeClient());
        wv.loadUrl("file:///android_asset/index.html");
        hide();
    }
    private void hide() { getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE); }
    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) hide(); }
    @Override public void onBackPressed() { wv.evaluateJavascript("(function(){var m=document.getElementById('modal');return m&&!m.hidden})()", v -> { if ("true".equals(v)) wv.evaluateJavascript("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))", null); else moveTaskToBack(true); }); }
    @Override protected void onPause() { super.onPause(); wv.onPause(); }
    @Override protected void onResume() { super.onResume(); wv.onResume(); }
}
