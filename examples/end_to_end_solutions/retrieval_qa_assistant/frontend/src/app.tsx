import { defineAppConfig, definePageConfig } from 'ice';
import { insertMeta, isMobile, softKeyboardFit } from '@/libs/utils';
import 'antd/dist/antd.less';
import 'hacktimer';

import './lightStyle.less';
// import './theme.less';

(function init(){
  if (process.env.NODE_ENV !== 'development') {
    window.console.log = () => {};
    window.console.warn = () => {};
  }

  // 禁止横屏
  try {
    if (isMobile()) {
      insertMeta('screen-orientation', 'portrait');
      insertMeta('x5-orientation', 'portrait');
      screen?.orientation?.lock('any');
    }
  } catch (e) {}

  // 适配软件盘
  softKeyboardFit();
})()

document.title = "百炼答疑机器人";

export default defineAppConfig(() => ({
  router: {
    type: 'hash',
  },
  routes: {
    defineRoutes: (route) => {
      route('/index', 'index.tsx');
    },
  }
}));
