const { withPlugins, withDangerousMod } = require('@expo/config-plugins');
const {
  mergeContents,
} = require('@expo/config-plugins/build/utils/generateCode');
const { resolve } = require('path');
const { readFileSync, writeFileSync } = require('fs');

function withPlaidIos(config) {
  console.log('==> Configuring Plaid iOS');
  return withDangerousMod(config, [
    'ios',
    cfg => {
      // Gets project root file from mod request
      const { platformProjectRoot } = cfg.modRequest;
      // Gets podfile from project
      const podfile = resolve(platformProjectRoot, 'Podfile');
      // Opens content of podfile in utf encoding
      const contents = readFileSync(podfile, 'utf-8');

      // Adds required Pod into Podfile
      const addMapboxPod = mergeContents({
        tag: 'add plaid pod',
        src: contents,
        newSrc: `  pod 'Plaid', '~> 4.2.0'`,
        anchor: /\s+use_expo_modules!/,
        offset: 0,
        comment: '#',
      });
      if (!addMapboxPod.didMerge) {
        console.log(
          "ERROR: Cannot add block to the project's ios/Podfile because it's malformed. Please report this with a copy of your project Podfile.",
        );
        return config;
      }
      writeFileSync(podfile, addMapboxPod.contents);

      return cfg;
    },
  ]);
}

function withPlaidAndroid(config) {
  console.log('==> Configuring Plaid android');
  return withDangerousMod(config, [
    'android',
    cfg => {
      return cfg;
    },
  ]);
}

function withPlaid(config) {
  return withPlugins(config, [withPlaidIos, withPlaidAndroid]);
}

module.exports = withPlaid;
