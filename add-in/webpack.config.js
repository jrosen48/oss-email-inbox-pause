const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  return {
    entry: {
      taskpane: './src/taskpane/taskpane.js',
      commands: './src/commands/commands.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    devtool: devMode ? 'eval-source-map' : 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/taskpane/taskpane.html',
        filename: 'taskpane.html',
        chunks: ['taskpane']
      }),
      new HtmlWebpackPlugin({
        template: './src/commands/commands.html',
        filename: 'commands.html',
        chunks: ['commands']
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'manifest.xml',
            to: 'manifest.xml'
          },
          {
            from: 'assets',
            to: 'assets',
            noErrorOnMissing: true
          }
        ]
      })
    ],
    devServer: {
      port: 3001,
      https: true,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  };
};
