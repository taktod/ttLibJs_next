var webpack = require("webpack");
var Copy = require("copy-webpack-plugin");
var BrowserSync = require("browser-sync-webpack-plugin");

module.exports = {
  entry:  __dirname + "/src/ts/app.ts",
  output: {
    path: __dirname + "/dist/js",
    filename: "app.js"
  },
  devtool: "#inline-source-map",
  resolve: {
    extensions: ["", ".ts"]
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: "awesome-typescript-loader"}
    ]
  },
  plugins: [
    new Copy([
      {context:__dirname + "/src", from: "*", to: __dirname + "/dist"}
    ]),
    new BrowserSync({
      host: "localhost",
      https: {
        key: "server.key",
        cert: "server.crt"
      },
      port: 3000,
      server: {baseDir: __dirname + "/dist"}
    })
  ]
}
