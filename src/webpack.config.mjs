
import path from "path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import CopyWebpackPlugin from 'copy-webpack-plugin';
import { merge } from 'webpack-merge';
import baseConfig from '@splunk/webpack-configs/base.config.js';
import remarkGfm from 'remark-gfm'

const stage_folder = path.resolve(__dirname, '..', 'dist')

const entries = {
    lab: './web/index.js'
}

const config = merge(baseConfig.default, {
    entry: entries,
    output: {
      filename: '[name].bundle.js',
      path: path.join(stage_folder, 'appserver', 'static'),
      clean: true,
    },
    module: {
        rules: [
            {
                test: /\.mdx?$/i,
                use: [
                  {
                    loader: '@mdx-js/loader',
                    /** @type {import('@mdx-js/loader').Options} */
                    options: {
                      remarkPlugins: [remarkGfm]
                    }
                   
                  }
                ]
              },
              {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
              },
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [ 
            {
                from: path.join(__dirname, 'package'),
                to: path.join(__dirname, '..', 'dist')
            }]
        }),
    ],
    resolve: {
        fallback: { "querystring": false }
     }     
  });
 
export default config