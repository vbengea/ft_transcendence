module.exports = {
    entry: [
		"./src/ui/ts/router.ts"
	],
	output: {
		filename: 'main.js',
		path: __dirname + '/public',
	},
    resolve: {
        extensions: [".ts"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    mode: "production"
};