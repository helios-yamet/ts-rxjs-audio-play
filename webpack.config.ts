import * as extractTextPlugin from "extract-text-webpack-plugin";
import * as path from "path";
import * as webpack from "webpack";

const config: webpack.Configuration = {

    entry: "./src/main.ts",
    devtool: "source-map",
    devServer: {
        contentBase: "./dist"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: "file-loader"
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: "file-loader"
            },
            {
                test: /\.html$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                }
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new extractTextPlugin("styles.css"),
    ]
};

export default config;