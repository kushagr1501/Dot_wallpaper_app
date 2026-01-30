module.exports = {
  dependencies: {
    'react-native-view-shot': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-view-shot/android',
          packageImportPath: 'import io.reactnative.viewshot.RNViewShotPackage;',
        },
      },
    },
  },
  assets: ['./assets/fonts/', './assets/images/'],
};