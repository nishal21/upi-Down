# Capacitor reaches plugins and bridge methods by name through reflection.
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}
-keep public class * extends com.getcapacitor.Plugin { public <init>(...); }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep readable line numbers for Play Console crash reports (upload mapping.txt).
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
