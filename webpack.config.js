const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const autoprefixer = require('autoprefixer');
const precss = require('precss');

const ROOT_PATH = path.join(__dirname, '.');
const BUILD_PATH = path.join(ROOT_PATH, 'assets/dist/debug');
const STATIC_RESOURCE = path.join(__dirname, './static');
const TEMPLATE_PATH = path.join(ROOT_PATH, './');

const WEBPACK_DEV_SERVER_CONFIG = 'webpack-dev-server/client?http://0.0.0.0:8008';
const WEBPACK_HOT_DEV_SERVER_CONFIG = 'webpack/hot/dev-server';

const HtmlWebpackPluginOptions = {
    inject: true,
    hash: true, // 开启掉追加哈希的行为
    minify: {
        removeComments: false,
        collapseWhitespace: false
    }
};

module.exports = {
    entry: {
        app: [
            WEBPACK_DEV_SERVER_CONFIG, //资源服务器地址
            WEBPACK_HOT_DEV_SERVER_CONFIG,
            './js/modules/app.js'
        ]
    },
    output: {
        path: BUILD_PATH, // 文件地址，使用绝对路径形式
        filename: '[name].bundle.js', //[name]这里是webpack提供的根据路口文件自动生成的名字
        chunkFilename: "[id].bundle.js",
        publicPath: '/assets/dist/debug/'
    },
    // 加载器
    module: {
        // 加载器
        loaders: [{
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel'
            },
            // 解析.vue文件
            {
                test: /\.vue$/,
                loader: 'vue'
            },
            // 编译css/less/sass
            {
                test: /\.css/,
                exclude: [
                    path.resolve(__dirname, 'node_modules')
                ],
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&sourceMap!postcss-loader")
            },
            {
                test: /\.less|\.css$/,
                exclude: [
                    path.resolve(__dirname, 'node_modules')
                ],
                // modules 模块化，可以在样式中composes: className. 然后less已经解决了这个问题
                // minimize 最小化
                // sourceMap 源文件隐射
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&sourceMap!postcss-loader!less-loader?sourceMap")
            },
            // 图片转化，小于8K自动转化为base64的编码
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=8192'
            }
        ]
    },
    postcss: function() {
        return [autoprefixer, precss];
    },
    vue: {
        loaders: {
            css: ExtractTextPlugin.extract('css'),
            // less: ExtractTextPlugin.extract('css!less')
        }
    },
    resolve: {
        // require时省略的扩展名，如：require('module') 不需要module.js
        extensions: ['', '.js', '.vue'],
        // 别名，可以直接使用别名来代表设定的路径以及其他
        alias: {
            components: path.join(ROOT_PATH, './js/components'),
            styles: path.join(ROOT_PATH, './css'),
            images: path.join(ROOT_PATH, './images'),
            data: path.join(ROOT_PATH, './data')
        }
    },
    plugins: [
        new CleanWebpackPlugin([BUILD_PATH], {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        new ExtractTextPlugin('[name].style.css', {
            disable: false,
            allChunks: true
        }),
        // 复制移动文件
        // new TransferWebpackPlugin([
        //     { from: './static/' }
        // ]),
        // 共享代码
        // new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ 'vendor', /* filename= */ 'vendor.js'),
        new HtmlWebpackPlugin(Object.assign({}, HtmlWebpackPluginOptions, {
            filename: 'index.html',
            template: 'app.html',
            chunks: ['app']
        }))
    ],
    // new webpack.HotModuleReplacementPlugin()
    // 开启source-map，webpack有多种source-map，在官网文档可以查到
    devtool: 'eval-source-map',
    watchOptions: {
        aggregateTimeout: 500, // default 300ms
        poll: true
    },
    devServer: {
        historyApiFallback: true,
        hot: false,
        inline: true,
        progress: true,
        proxy: {
            '/v1_mall/*': {
                // target: 'http://123.59.66.74:8099',
                target: 'http://betapi.knowbox.cn',
                secure: false,
                changeOrigin: true
            }
        }
    }
};
