const { withDangerousMod, withGradleProperties } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withProguard(config) {
  // 1. Proguard keep rules and ignorewarnings
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const proguardPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro'
      );
      const rules = `
# Ignore R8 warnings and preserve Expo modules
-ignorewarnings
-dontwarn **
-keep class expo.modules.** { *; }
-keep class com.facebook.react.** { *; }
`;
      if (fs.existsSync(proguardPath)) {
        fs.appendFileSync(proguardPath, rules);
      }
      return config;
    },
  ]);

  // 2. Disable R8 minification in release builds so standalone APK has zero missing class issues
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => item.key !== 'android.enableMinifyInReleaseBuilds'
    );
    config.modResults.push({
      type: 'property',
      key: 'android.enableMinifyInReleaseBuilds',
      value: 'false',
    });
    return config;
  });

  return config;
};
