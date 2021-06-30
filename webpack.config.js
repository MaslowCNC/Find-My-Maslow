const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
require('babel-core/register')
require('babel-polyfill')

module.exports = {
    mode: 'development',
    entry: ['babel-polyfill', './src/flowDraw.js'],
    output: {
        path: __dirname + '/dist/',
        filename: './js/flowDraw.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            server: { baseDir: ['dist'] },
            files: ['./dist/*, !./dist/example001.jscad']
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: false
        }),
        new CopyPlugin([
            { from: 'src/run/index.html', to: 'run/index.html' }
        ]),
    ],
    node: {
        esm: 'empty',
        fs: 'empty'
    },
    watch: true,
    devtool: 'cheap-module-source-map'
}
