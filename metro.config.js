const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  // Ignore nested node_modules to save watchers
  /\/node_modules\/.*\/node_modules\/.*/,
  // Ignore the heavy debugger frontend
  /\/@react-native\/debugger-frontend\/.*/,
  // Ignore git and build folders
  /\.git\/.*/,
  /android\/.*/,
  /ios\/.*/
];

module.exports = config;
