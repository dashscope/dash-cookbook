import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE_CONFIG,
  darkTheme,
  primaryTheme,
  changeTheme,
  changeMetaIcon,
} from "@/libs/constant";
import _ from "lodash";

export const delay = (time) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), time));

let pageVars = JSON.parse(JSON.stringify(DEFAULT_PAGE_CONFIG));
let language = DEFAULT_LANGUAGE;
let theme = "dark";
if (window.pageConfig) {
  if (["light", "dark"].includes(window.pageConfig.theme)) {
    theme = window.pageConfig.theme;
  };
  if (['zh', 'en'].includes(window.pageConfig.language)) {
    language = window.pageConfig.language;
  }
  pageVars = {
    headerLogo: window.pageConfig.headerLogo,
    content: {
      logo: window.pageConfig.contentLogo || pageVars.content.logo,
      guideText: window.pageConfig.guideText || pageVars.content.guideText,
    },
    answer: {
      animateLogo: window.pageConfig.answerAnimateLogo || pageVars.answer.animateLogo,
      logo: window.pageConfig.answerLogo || pageVars.answer.logo,
    },
    textRecommends: window.pageConfig.textRecommends || pageVars.textRecommends,
    footerDesc: window.pageConfig.footerDesc || pageVars.footerDesc,
  }
}

changeTheme(theme === "dark"? darkTheme : primaryTheme);
if (window.pageConfig?.metaIcon) changeMetaIcon(window.pageConfig.metaIcon);

export default {
  // 定义 model 的初始 state
  state: {
    /* 传入chat输入框的内容 */
    inputText: "",
    sessionCode: "text_chat",
    sessionType: "text_chat",
    loading: false,
    userId: "4d192c8c8db811eebd43d76c09724fd3",
    questionIsEdit: false,
    source: undefined as string | undefined,
    language,
    pageConfig: pageVars,
    theme,
  },

  // 定义改变该模型状态的纯函数
  reducers: {
    update(prevState, payload) {
      return _.merge(prevState, payload);
    },
  },

  // 定义处理该模型副作用的函数
  effects: (dispatch) => ({}),
};
