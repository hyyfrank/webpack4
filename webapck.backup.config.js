const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

const baseConfig = {
    entry: [
        "@babel/polyfill",
        "./src/index.js"
    ],
    devtool: 'cheap-module-source-map',
    module: {
        rules: [
            {
                test: /\.(css|sass|scss)$/,
                use: isProd? cssProdRules:cssDevRules,
                exclude: /node_modules/,
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src', 'index.html'),//模板
            filename: 'index.html',
            hash: true,//防止缓存
        }),
        new MiniCssExtractPlugin({
            filename: isProd ?  '[name].[hash].css':'[name].css',
            chunkFilename: isProd ? '[id].[hash].css':'[id].css',
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        publicPath: "",
        path: path.resolve(__dirname, "dist"),
        filename: "[name]-bundle.js"
    },
};
if (!isProd) {
    baseConfig.devtool = 'inline-source-map';
    baseConfig.devServer = {
        contentBase: './dist',
        hot: true,
        open: true,
    };
}
module.exports = baseConfig;