const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withProguard(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const proguardPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro'
      );
      const rules = `
# Expo AV & Modules Proguard / R8 Keep Rules
-dontwarn expo.modules.av.**
-dontwarn expo.modules.core.**
-dontwarn expo.modules.kotlin.**
-dontwarn expo.modules.core.interfaces.services.KeepAwakeManager
-keep class expo.modules.av.** { *; }
-keep class expo.modules.core.** { *; }
-keep class expo.modules.kotlin.** { *; }
`;
      if (fs.existsSync(proguardPath)) {
        fs.appendFileSync(proguardPath, rules);
      }
      return config;
    },
  ]);
};
