// this file contains extras that should override angular's default configs

const { CycloneDxWebpackPlugin } = require('@cyclonedx/webpack-plugin')

let BundleAnalyzerPlugin
try {
  BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
} catch (e) {
  BundleAnalyzerPlugin = null
}

const plugins = [
  // @see https://www.npmjs.com/package/@cyclonedx/webpack-plugin
  new CycloneDxWebpackPlugin({
    outputLocation: '../bom',
    includeWellknown: false
  })
]

if (BundleAnalyzerPlugin) {
  // @see https://www.npmjs.com/package/webpack-bundle-analyzer
  plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    reportFilename: 'bundle-report.html',
    defaultSizes: 'gzip'
  }))
}

module.exports = {
  plugins
}
