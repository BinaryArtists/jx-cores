module.exports = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    "@babel/proposal-class-properties",
    [
      "@babel/plugin-transform-runtime",
      {
        "absoluteRuntime": false,
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ],
};
