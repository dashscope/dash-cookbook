export const TOAST_ICONS_MAP = {
  success: 'icon-xiugaichenggong',
  error: 'icon-error',
  warning: 'icon-tishi',
  loading: 'icon-loading',
};

export const placeholderImg =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABdJREFUKFNjZCASMBKpjmFUId6QIjp4AAppAAuXjCs4AAAAAElFTkSuQmCC';

export const DEFAULT_LANGUAGE = "zh";  
export const DEFAULT_INPUT_FUNCS = [
  { title: "文本问答", type: "text_chat", code: "text_chat" }];
export const DEFAULT_PAGE_CONFIG = {
  headerLogo: "https://img.alicdn.com/imgextra/i2/O1CN01KmdQ0922NyXlOZFIv_!!6000000007109-2-tps-832-96.png",
  content: {
    logo: "https://img.alicdn.com/imgextra/i2/O1CN01tjE7uZ1GGYZTUqq7L_!!6000000000595-2-tps-1248-144.png",
    guideText: "你好，我是阿里云百炼大模型",
  },
  answer: {
    logo: "https://img.alicdn.com/imgextra/i4/O1CN01cscY6j1IWhkFN4nkd_!!6000000000901-2-tps-128-128.png",
    animateLogo: "https://img.alicdn.com/imgextra/i4/O1CN01YfEPwr1yl63VHcOc9_!!6000000006618-1-tps-420-420.gif",
  },
  textRecommends: [
    {
      showData: "如何调用通义千问大模型？",
      contentData: "如何调用通义千问大模型？",
      iconUrl: "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "调用通义千问大模型",
    },
    {
      showData:
        "如何创建和调用智能体应用?",
      contentData:
        "如何创建和调用智能体应用?",
      iconUrl: "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "创建和调用智能体应用",
    },
    {
      showData:
        "如何下载和安装SDK?",
      contentData:
        "如何下载和安装SDK?",
      iconUrl: "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "下载和安装SDK",
    },
    {
      showData:
        "如何获取API-KEY?",
      contentData:
        "如何获取API-KEY?",
      iconUrl: "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "获取API-KEY",
    }
  ],
  footerDesc: "服务生成的所有内容均由人工智能模型生成，其生成内容的准确性和完整性无法保证"
};

export const darkTheme = {
  "--primary-color": "#434343",
  "--answer-bg-color": "#878AAB",
  "--primary-color-2": "#434343",
  "--primary-button-bg": "#434343",
  "--primary-button-hover-bg": "#434343",
  "--primary-text-color": "#434343",
  "--text-gray-1": "#3f3f3f",
  "--module-bg": "#F7F7F7",
  "--description-color": "#888",
  "--description-text-color": "#bbb",
  "--gradient-border-color": "#434343",
  "--gradient-bg-color": "#fff",
  "--prompt-hover-bg": "transparent",
  "--prompt-hover-before-bg": "#F0F0F0",
  "--button-disabled-bg": "#dcdcdc",
  "--border-hover-color": "#F0F0F0", 
  "--border-shadow-color": "rgba(#bbb, .2)",
  "--send-btn-bg": "#434343",
  "--mobile-button-disabled-bg": "rgba(#888, 0.24)",
  "--mobile-button-disabled-color": "rgba(63, 63, 63, 0.5)",
  "--mobile-button-focus-bg": "#434343",
  "--mobile-question-bg": "#434343",
  "--mobile-question-color": "#fff",
}

export const primaryTheme = {
  "--primary-color": "#615ced",
  "--answer-bg-color": "#615ced",
  "--primary-color-2": "#624aff",
  "--primary-button-bg": "linear-gradient(75deg, #615ced -8%, #3e2fa7 181%)",
  "--primary-button-hover-bg": "linear-gradient(79deg, #746ff4 0%, #3820d9 181%)",
  "--primary-text-color": "#26244c",
  "--text-gray-1": "#3f3f3f",
  "--module-bg": "#f7f8fc",
  "--description-color": "rgba(135, 138, 171, 0.8)",
  "--description-text-color": "#878aab",
  "--gradient-border-color": `conic-gradient(
    from 90deg at 50% 50%,
    #624aff 0deg,
    #624aff 3deg,
    #6202a6 123deg,
    #d877fd 242deg,
    #624aff 360deg,
    #624aff 363deg
  )`,
  "--gradient-bg-color": "#fff",
  "--prompt-hover-bg": "rgba(97, 92, 237, 0.06)",
  "--prompt-hover-before-bg": "#fff",
  "--border-hover-color": "rgba(195, 197, 217, 0.65)", 
  "--border-shadow-color": "rgba(115, 110, 240, 0.1)",
  "--button-disabled-bg": "#dcdcdc",
  "--send-btn-bg": "linear-gradient(47deg, #615ced 0%, #3e2fa7 176%)",
  "--mobile-button-disabled-bg": "rgba(135, 138, 171, 0.24)",
  "--mobile-button-disabled-color": "rgba(63, 63, 63, 0.5)",
  "--mobile-button-focus-bg": "linear-gradient(68deg, #615ced 0%, #3e2fa7 180%)",
  "--mobile-question-bg": "linear-gradient(75deg, #615ced -3%, #3e2fa7 249%)",
  "--mobile-question-color": "#fff",
}

export const changeTheme = (themeObj: Record<string, string>) => {
  const bodyStyle = document.body.style;

  Object.keys(themeObj).map(itemKey => {
    bodyStyle.setProperty(itemKey, themeObj[itemKey]);
  });
}

export const changeMetaIcon = (iconUrl: string) => {
  const link = document.querySelector("link[rel='shortcut icon']");
  if (!link) return;
  link.href = iconUrl;
}