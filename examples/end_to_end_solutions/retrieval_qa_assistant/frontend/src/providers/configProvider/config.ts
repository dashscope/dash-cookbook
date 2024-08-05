import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

export interface IAvatarOptions {
  user: {
    avatarUrl: string;
    visible?: boolean;
  };
  bot: {
    avatarUrl: string;
  };
}

export interface ILayoutOptions {
  mode: 'fullWidth' | 'bubble';
}

export interface IQuestionOptions {
  maxQuestionEditLimit: number;
}

export interface IMarkdownOptions
  extends Omit<ReactMarkdownOptions, 'children'> {
  image: {
    /** 图片无法展示时的fallback图url */
    fallback?: string;
    /* 将透传给每个<img/>标签 */
    imageProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  };
}

const DefaultAvatar: IAvatarOptions = {
  user: {
    visible: true,
    avatarUrl:
      '//img.alicdn.com/imgextra/i1/O1CN01CDF6pc1JiRT65xjcu_!!6000000001062-2-tps-120-120.png',
  },
  bot: {
    avatarUrl:
      '//img.alicdn.com/imgextra/i2/O1CN01IvyMNA1GjPSOtEdKS_!!6000000000658-2-tps-120-120.png',
  },
};

const DefaultLayout: ILayoutOptions = {
  mode: 'bubble',
};

const DefaultQuestion: IQuestionOptions = {
  maxQuestionEditLimit: 5,
};

const DefaultMarkdown: IMarkdownOptions = {
  image: {
    fallback:
      'https://img.alicdn.com/imgextra/i1/O1CN01pX8NaC1cK98xD45BO_!!6000000003581-2-tps-640-480.png',
    /**
     * 可以自定义markdown中图片的样式
     * 栗子
     * imageProps: {
     *   width: 'auto',
     *   style: { maxWidth: 200 },
     * },
     */
  },
};

export const DefaultConfig = {
  avatar: DefaultAvatar,
  layout: DefaultLayout,
  question: DefaultQuestion,
  markdown: DefaultMarkdown,
};
