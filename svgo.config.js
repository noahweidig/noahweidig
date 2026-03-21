module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeUnknownsAndDefaults: false,
          removeHiddenElems: false,
          cleanupIds: false,
          removeViewBox: false,
        },
      },
    },
    'removeDimensions',
  ],
};
