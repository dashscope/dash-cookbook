import { defineConfig } from '@ice/app';
import store from '@ice/plugin-store';

// The project config, see https://v3.ice.work/docs/guide/basic/config
const minify = process.env.NODE_ENV === 'production' ? 'swc' : false;
export default defineConfig(() => ({
  minify,
  plugins: [store()],
  webpack: (webpackConfig) => {
    webpackConfig.devServer = {
      ...(webpackConfig.devServer || {}),
      client: {
        overlay: false,
      },
    };
    return webpackConfig;
  },
  ssr: false,
  ssg: false,
  server: {
    onDemand: true,
    format: 'esm',
  },
  codeSplitting: false,
  postcss: {
    plugins: [
      [
        'postcss-px-to-viewport-8-plugin',
        {
          mediaQuery: true,
          viewportWidth: 750,
          exclude: [
            /\/src\/components\//,
            /\/src\/lightStyle\.less/,
            /\/src\/global\.less/,
            /node_modules\//,
            /\/src\/pages/,
          ],
        },
      ],
    ],
  },
}));
