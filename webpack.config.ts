import { ConfigurationFactory } from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import path from 'path'

const config: ConfigurationFactory = () => {
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
          exclude: '/node_modules/'
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin(
        {
          patterns: [
            {
              from: '*.html', to: '.', context: 'src'
            },
            {
              from: '*.css', to: '.', context: 'src'
            },
            {
              from: 'public', to: '.'
            },
          ],
        }
      ),
    ],
  }
}

export default config
