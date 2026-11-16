const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const android = path.join(root, 'android');
if (!fs.existsSync(android)) throw new Error('Android project not found. Run npx cap add android first.');
const javaSource = path.join(root, 'native/android/com/filevault/app');
const javaTarget = path.join(android, 'app/src/main/java/com/filevault/app');
fs.mkdirSync(javaTarget, { recursive: true });
for (const name of ['MainActivity.java', 'FileVaultPlugin.java', 'MusicPlugin.java', 'MusicService.java']) {
  fs.copyFileSync(path.join(javaSource, name), path.join(javaTarget, name));
}
const manifestPath = path.join(android, 'app/src/main/AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
const permissions = [
  '<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />',
  '<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />',
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />',
  '<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />',
  '<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />',
  '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
  '<uses-permission android:name="android.permission.WAKE_LOCK" />',
  '<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />',
  '<uses-permission android:name="android.permission.USE_BIOMETRIC" />',
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />'
];
for (const permission of permissions) {
  const name = permission.match(/android:name="([^"]+)/)[1];
  if (!manifest.includes(name)) manifest = manifest.replace('<application', `${permission}\n    <application`);
}
const provider = `\n        <provider\n            android:name="androidx.core.content.FileProvider"\n            android:authorities="\${applicationId}.fileprovider"\n            android:exported="false"\n            android:grantUriPermissions="true">\n            <meta-data\n                android:name="android.support.FILE_PROVIDER_PATHS"\n                android:resource="@xml/file_paths" />\n        </provider>\n`;
if (!manifest.includes('androidx.core.content.FileProvider')) {
  manifest = manifest.replace('</application>', `${provider}    </application>`);
}
const service = `\n        <service\n            android:name="com.filevault.app.MusicService"\n            android:exported="false"\n            android:foregroundServiceType="mediaPlayback" />\n`;
if (!manifest.includes('com.filevault.app.MusicService')) {
  manifest = manifest.replace('</application>', `${service}    </application>`);
}

// Install theme-specific launcher icon resources.
for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
  const sourceDir = path.join(root, 'native/res', `mipmap-${density}`);
  const targetDir = path.join(android, 'app/src/main/res', `mipmap-${density}`);
  fs.mkdirSync(targetDir, { recursive: true });
  for (const theme of ['gold', 'crimson', 'ocean', 'forest', 'violet', 'paper']) {
    fs.copyFileSync(
      path.join(sourceDir, `ic_launcher_vylt_${theme}.png`),
      path.join(targetDir, `ic_launcher_vylt_${theme}.png`)
    );
  }
}

// Give each theme a launcher alias. The native plugin enables one alias at a time.
const mainActivityPattern = /(<activity\b[^>]*android:name="[^"]*MainActivity"[^>]*>)([\s\S]*?)(<\/activity>)/;
const mainMatch = manifest.match(mainActivityPattern);
if (!mainMatch) throw new Error('Could not find the generated MainActivity in AndroidManifest.xml.');
const launcherFilter = /\s*<intent-filter>\s*<action android:name="android.intent.action.MAIN"\s*\/>\s*<category android:name="android.intent.category.LAUNCHER"\s*\/>\s*<\/intent-filter>/;
if (launcherFilter.test(mainMatch[2])) {
  manifest = manifest.replace(mainActivityPattern, (whole, open, body, close) =>
    open + body.replace(launcherFilter, '') + close
  );
}
const aliases = [
  ['Gold', 'gold'], ['Crimson', 'crimson'], ['Ocean', 'ocean'],
  ['Forest', 'forest'], ['Violet', 'violet'], ['Paper', 'paper']
].map(([label, theme]) => `
        <activity-alias
            android:name=".MainActivity${label}"
            android:targetActivity=".MainActivity"
            android:enabled="${theme === 'violet' ? 'true' : 'false'}"
            android:exported="true"
            android:icon="@mipmap/ic_launcher_vylt_${theme}"
            android:label="VYLT">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity-alias>`).join('');
if (!manifest.includes('android:name=".MainActivityViolet"')) {
  manifest = manifest.replace('</application>', `${aliases}\n    </application>`);
}

fs.writeFileSync(manifestPath, manifest);
const res = path.join(android, 'app/src/main/res/xml');
fs.mkdirSync(res, { recursive: true });
fs.copyFileSync(path.join(root, 'native/res/xml/file_paths.xml'), path.join(res, 'file_paths.xml'));
const drawable = path.join(android, 'app/src/main/res/drawable');
fs.mkdirSync(drawable, { recursive: true });
fs.writeFileSync(path.join(drawable, 'ic_stat_music.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFFFF" android:pathData="M12,3v10.55c-0.59,-0.34 -1.27,-0.55 -2,-0.55 -2.21,0 -4,1.79 -4,4s1.79,4 4,4 4,-1.79 4,-4V7h4V3h-6z"/></vector>\n');
console.log('VYLT Android native plugin, theme launcher icons, and permissions installed.');
