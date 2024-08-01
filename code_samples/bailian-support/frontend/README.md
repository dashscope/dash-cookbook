# 百炼大模型平台saas页面模板

## 开发提示

1. 项目使用ice.js框架，框架问题可参考https://v3.ice.work/。
2. 开发环境：node.js版本16以上。
3. 在入口文件的时候会根据平台类型（PC、pad/移动端）来确定加载移动端组件和PC组件，注意改动内容时要留意双端是否同步修改。
4. 目前只支持react版本。

## 本地运行

```bash
$ npm install

$ npm start
```

## 本地开发

1. 通过设置HOST变量，值为后端服务本地ip地址加端口；在libs/request.tsx文件里设置。
2. 如果已经有一个页面地址，如http://ip:80这样的地址能够访问页面的话，可以通过谷歌浏览器插件[xswitch](https://chromewebstore.google.com/detail/xswitch/idkjhjggpffolpidfkikidcokdkdaogg?hl=zh-CN&utm_source=ext_sidebar)进行代理。代理方法如下：
```json
{
  "proxy": [
    [
      "http://[页面地址ip]:[端口]/js/main.js",
      "http://[本地ip]:[端口]/js/main.js"
    ],
    [
      "http://[页面地址ip]:[端口]/css/main.css",
      "http://[本地ip]:[端口]/css/main.css"
    ]
  ]
}
```

### 如何设置主题和页面内容

1. 设置主题, 可以复制```src/theme.less```文件，然后按照自己产品的主题色进行设置。
```less
body {
  --primary-color: #615ced;
  --primary-color-2: #624aff;
  --primary-button-bg: linear-gradient(75deg, #615ced -8%, #3e2fa7 181%);
  --primary-button-hover-bg: linear-gradient(79deg, #746ff4 0%, #3820d9 181%);
  --primary-text-color: #26244c;
  --module-bg: #f7f8fc;
  --description-color: rgba(135, 138, 171, 0.8);
  --description-text-color: #878aab;
  --gradient-border-color: conic-gradient(
    from 90deg at 50% 50%,
    #624aff 0deg,
    #624aff 3deg,
    #6202a6 123deg,
    #d877fd 242deg,
    #624aff 360deg,
    #624aff 363deg
  );
  --gradient-bg-color: #fff;
  --prompt-hover-bg: rgba(97, 92, 237, 0.06);
  --prompt-hover-before-bg: #fff;
  --border-hover-color: rgba(195, 197, 217, 0.65); 
  --border-shadow-color: rgba(115, 110, 240, 0.1);
  --button-disabled-bg: #dcdcdc;
  
  --send-btn-bg: linear-gradient(47deg, #615ced 0%, #3e2fa7 176%);

  --mobile-button-disabled-bg: rgba(135, 138, 171, 0.24);
  --mobile-button-disabled-color: rgba(63, 63, 63, 0.5);
  --mobile-button-focus-bg: linear-gradient(68deg, #615ced 0%, #3e2fa7 180%);
  --mobile-question-bg: linear-gradient(75deg, #615ced -3%, #3e2fa7 249%);
  --mobile-question-color: #fff;
}
```

2. 设置页面内容，在```src/app.tsx```入口文件中设置全局变量，也可以直接在html文件中写入。
```javascript
// 支持英语、中文两种语言 zh | en
window.language = "zh";
// 页面内容配置
window.qianwen_page_config = {
  // 顶部区 logo地址
  header: {
    logo: "https://img.alicdn.com/imgextra/i1/O1CN01N4Gd8P1Ulc2Va3gjG_!!6000000002558-55-tps-400-105.svg",
  },
  // 引导区 logo内容和引导话术
  content: {
    logo: "https://img.alicdn.com/imgextra/i1/O1CN01N4Gd8P1Ulc2Va3gjG_!!6000000002558-55-tps-400-105.svg",
    guideText: "你好，我是阿里云百炼大模型",
  },
  // 答案区 logo头像 和 动态logo头像
  answer: {
    logo: "https://img.alicdn.com/imgextra/i4/O1CN01cscY6j1IWhkFN4nkd_!!6000000000901-2-tps-128-128.png",
    animateLogo: "https://img.alicdn.com/imgextra/i4/O1CN01YfEPwr1yl63VHcOc9_!!6000000006618-1-tps-420-420.gif",
  },
  // 推荐prompts
  textRecommends: [
    {
      showData:
        "根据主题，帮我列一下ppt的大纲，逻辑要分明，框架要清晰。我的ppt主题是：2023年手机销售总结",
      contentData:
        "根据主题p，帮我列一下ppt的大纲，逻辑要分明，框架要清晰。我的ppt主题是：2023年手机销售总结",
      iconUrl: ppt_assistant,
      title: "ppt大纲助手",
    },
    {
      showData:
        "将工作概要整理成周报，依次罗列带有数据的进展、明确下阶段todo。输入：熟悉新环境，上线新功能",
      contentData:
        "将工作概要整理成周报，依次罗列带有数据的进展、明确下阶段todo。输入：熟悉新环境，上线新功能",
      iconUrl: ppt_assistant,
      title: "周报小助理",
    },
    {
      showData:
        "请帮我拆解问题、下探真实意图并提供方案，我的问题是：我的科研工作遇到了难题",
      contentData:
        "请帮我拆解问题、下探真实意图并提供方案，我的问题是：我的科研工作遇到了难题",
      iconUrl: assistant,
      title: "怎么办助手",
    },
    {
      showData:
        "帮我输出知识点的基本原理，以及不同类型的3个题目，并给出对应的答案。我的输入是：勾股定理",
      contentData:
        "帮我输出知识点的基本原理，以及不同类型的3个题目，并给出对应的答案。我的输入是：勾股定理",
      iconUrl: knowledge_icon,
      title: "知识巩固小助手",
    },
  ],
  // 底部描述文案
  footer: {
    desc: "服务生成的所有内容均由人工智能模型生成，其生成内容的准确性和完整性无法保证",
  },
};
```

## 构建

```bash
$ npm run build
```

## 部署
1. 执行 ```npm run build``` 会在目录里创建一个build文件夹。
2. 将build文件夹放到后端项目里。

## 目录文件

```md
.
├── README.md
├── ice.config.mts                  # 项目配置
├── package.json
├── .browserslistrc                 # Browsers that support.
├── src                             # 项目文件夹
│   ├── app.ts                      # 入口文件
│   ├── assets                      # 静态资源文件（图片、iconfont.js）
│   ├── document.tsx                # 本地运行和构建打包时的html模板
│   ├── components                  # 组件库
│   ├── context                     # useContext
│   ├── hooks                       # hooks
│   ├── libs                        # hooks
│   │   └── chatSDK                 # 对话sdk
│   │   └── fetchEventSource        # sse配置
│   │   └── constant.ts             # 常量配置
│   │   └── eventEmit.ts            # 事件监听
│   │   └── request.ts              # 网络请求封装
│   │   └── utils.ts                # 工具函数
│   ├── locales                     # 语言配置文件
│   ├── mComponents                 # 移动端h5组件库
│   ├── model                       # 状态管理
│   ├── pages                       # 页面 采用约定式路由，全局是spa，hash路由的模式，文件名就是hash路由路径名
│   │   └── index.tsx               # 首页/对话页
│   ├── providers                   # providers
│   ├── services                    # 接口请求
│   ├── types                       # interface定义
│   ├── global.less                 # 全局样式，自动引入的样式文件
│   ├── theme.less                  # 主题样式文件
│   ├── lightStyle.less             # 覆盖一些antd组件样式
│   └── typings.d.ts                # 全局types
└── tsconfig.json
```

For more detail, please visit [docs](https://v3.ice.work/).