const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'ReduxSagaServiceWrapper',
      type: 'umd',
    },
    globalObject: 'this',
    clean: true,
  },
  externals: {
    'redux-saga': 'redux-saga',
    'redux-saga/effects': 'redux-saga/effects',
    'axios': 'axios',
    'react': 'react',
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
};
