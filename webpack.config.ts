import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'

const config = (env: any, argv: any) => {
  return {
    mode: 'production',
    entry: {
      script: path.join(__dirname, 'src', 'script.ts'),
      search: path.join(__dirname, 'src', 'search.ts'),
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /.ts$/,
          use: 'ts-loader',
          exclude: '/node_modules/',
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: 'popup.html',
        template: './src/popup.html',
        chunks: ['search'],
      }),
    ],
  }
}

export default config
