'use strict'
process.env.NODE_ENV = 'development'

const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    client: './client/index.js'
  },
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'app.js',
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true
  },
  resolve: {
    extensions: ['.js', '.vue', '.css', '.json'],
    alias: {
      root: path.join(__dirname, 'client'),
      components: path.join(__dirname, 'client/components'),
      artifacts: path.join(__dirname, 'contracts/build/contracts'),
      data: path.join(__dirname, '../contracts/data')
    },
    modules: [
      cwd('node_modules'),
      // this meanse you can get rid of dot hell
      // for example import 'components/Foo' instead of import '../../components/Foo'
      cwd('client')
    ]
  },
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      { test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            "plugins": ["@babel/plugin-proposal-object-rest-spread"]
          }
        }
      },
      { test: /\.css$/, use: 'css-loader' },
    ]
  }
}

function cwd(file) {
  return path.join(process.cwd(), file || '')
}
