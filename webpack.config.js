/* eslint-disable no-undef */
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const postCss = require('postcss-preset-env');

const mode = process.env.NODE_ENV || 'development'; //устанавливаем mode если есть переменная env то будет продакшн если нет то дев
const devMode = mode === 'development'; //проверяем является ли mode == development
const target = devMode ? 'web' : 'browserslist'; //проверяем для каких браузеров сборка
const devtool = devMode ? 'source-map' : undefined; //настраиваем соурсмапы в режиме дев

// функция вставляет хэширование в зависимости от сборки
const filename = (name, ext) =>
	devMode ? `${name}${ext}` : `${name}.[contenthash]${ext}`;

// получаем список имен html-файлов из директории src
const htmlFiles = glob.sync('./src/*.html').map((file) => {
	const fileName = path.basename(file, '.html');
	console.log(fileName);
	return new HtmlWebpackPlugin({
		template: path.resolve(__dirname, 'src', `${fileName}.html`),
		filename: `${fileName}.html`,
		// filename: filename(fileName, '.html'),
		chunks: [fileName],
		minify: {
			collapseWhitespace: !devMode,
		},
	});
});
//получаем список входных точек из src
const jsFiles = glob.sync('./src/js/*.js').reduce((prev, file) => {
	prev[path.basename(file, '.js')] = file;
	return prev;
}, {});
// webp generator
const webpGenerator = () => [
	{
		// You can apply generator using `?as=webp`, you can use any name and provide more options
		preset: 'webp',
		implementation: ImageMinimizerPlugin.imageminGenerate,
		options: {
			// Please specify only one plugin here, multiple plugins will not work
			plugins: ['imagemin-webp'],
		},
	},
];

module.exports = {
	mode,
	target,
	devtool,
	watch: devMode,
	entry: jsFiles,
	output: {
		path: path.resolve(__dirname, 'dist'),
		clean: true,
		filename: `js/${filename('[name]', '.js')}`,
	},
	plugins: [
		...htmlFiles,
		new MiniCssExtractPlugin({
			filename: `css/${filename('[name]', '.css')}`,
		}),
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				loader: 'html-loader',
			},
			{
				test: /\.(c|sa|sc)ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
					// Translates CSS into CommonJS
					'css-loader',
					// post css settings - prefixes
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [postCss],
							},
						},
					},
					// Compiles Sass to CSS
					'sass-loader',
				],
			},
			{
				test: /\.woff2?$/i,
				type: 'asset/resource',
				generator: {
					filename: `assets/fonts/${filename('[name]', '[ext]')}`,
				},
			},
			{
				test: /\.(png|svg|jpe?g|gif)$/i,
				type: 'asset/resource',
				generator: {
					filename: `assets/img/${filename('[name]', '[ext]')}`,
				},
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				loader: ImageMinimizerPlugin.loader,
				enforce: 'pre',
				options: {
					generator: webpGenerator(),
				},
			},
			{
				test: /\.(?:js|mjs|cjs)$/i,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { targets: 'defaults' }]],
					},
				},
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader',
			},
		],
	},
	devServer: {
		historyApiFallback: true,
		open: true,
		hot: true,
	},
	optimization: {
		minimize: !devMode,
		minimizer: [
			new ImageMinimizerPlugin({
				deleteOriginalAssets: false,
				minimizer: {
					// Implementation
					implementation: ImageMinimizerPlugin.imageminMinify,
					// Options
					options: {
						plugins: [
							['gifsicle', { interlaced: true, optimizationLevel: 2 }],
							['jpegtran', { progressive: true }],
							['optipng', { optimizationLevel: 5 }],
							[
								'svgo',
								{
									plugins: [
										{
											removeViewBox: false,
										},
									],
								},
							],
						],
					},
				},
				generator: webpGenerator(),
			}),
			new TerserPlugin(),
			new CssMinimizerPlugin(),
		],
	},
	externals: {
		ymaps3: 'ymaps3',
	},
};
