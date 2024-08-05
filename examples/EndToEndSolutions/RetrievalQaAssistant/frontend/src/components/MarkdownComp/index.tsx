import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import {
  ReactMarkdownOptions,
} from 'react-markdown/lib/react-markdown';
import { message } from 'antd';
import classnames from 'classnames';
import deepmerge from 'deepmerge';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, {
  defaultSchema as sanitizeSchema,
} from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import useClassNames from '@/hooks/useClassNames';
import { isMobile } from '@/libs/utils';

import remarkAudio from './utils/remark-audio';
import remarkEmbed from './utils/remark-embed';
import remarkVideo from './utils/remark-video';
import {
  AComponent,
  AudioComponent,
  EmbedComponent,
  ImageComponent,
  VideoComponent,
} from './components';
import Highlighter, { HljsStyleParams } from './Highlighter';

import 'github-markdown-css/github-markdown-light.css';
import 'katex/dist/katex.min.css';
import './index.less';

const defaultSchema = deepmerge(sanitizeSchema, {
  // deepmerge to https://github.com/syntax-tree/hast-util-sanitize/blob/main/lib/schema.js
  tagNames: ['video', 'audio'],
  attributes: {
    '*': ['className', 'style'],
    code: ['inline'],
    video: ['src', 'loop', 'autoplay', 'autoPlay', 'muted', 'controls'],
    audio: ['src', 'loop', 'autoplay', 'autoPlay', 'muted', 'controls'],
  },
});

export interface CodeOptions {}

export interface MarkdownProps {
  /**
   * 输入的 Markdown 文本
   */
  text: string;
  /**
   * 设置是否需要在末尾元素后设置 '\_' 闪烁动画。
   * @default 'false'
   */
  flushing?: boolean;
  /**
   * 设置是否需要渲染 Html 元素。
   * @default 'false'
   */
  disableRenderHtml?: boolean;

  // code?: CodeOptions;
  /**
   * 设置需要自定义的 style, 修改的部分会覆盖默认值。
   */
  style?: HljsStyleParams;
  /**
   * 设置需要自定义的字号大小, 有small, medium, large三种选择。
   * @default 'medium'
   */
  markdownFontSize?: 'medium' | 'small' | 'large' | 'qianwen';
  // /**
  //  * 设置需要自定义的字体(font-family)。
  //  * @default 'PingFang SC'
  //  */
  // markdownFontFamily?: string;
  components?: ReactMarkdownOptions['components'];
  className?: string;
  /**
   * 设置安全策略 schema，可以扩展允许的 标签和属性等
   */
  customSanitizeSchema?: typeof sanitizeSchema;
  /**
   * 已有组件的配置
   */
  options?: {
    imgOptions?: {
      downloadable?: boolean;
    };
  };
}

const CodeHighLighter: React.FC<CodeProps & { hlstyle?: HljsStyleParams }> = ({
  inline,
  className,
  children,
  hlstyle,
  ...props
}) => {
  const { addPrefix } = useClassNames('custom-markdown-code');
  const match = /language-(\w+)/.exec(className || '');
  const matchLang = match && match[1] ? match[1].toLowerCase() : '';
  const [messageApi, contextHolder] = message.useMessage();
  const code = String(children)
    .replace(/\n$/, '')
    .replace(`<span class="cursor-custom"></span>`, '');
  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const success = () => {
    messageApi.open({
      type: 'success',
      content: '复制成功',
    });
  };

  return (
    <div className={addPrefix('codeContainer')}>
      {contextHolder}
      <div className={addPrefix('codeHead')}>
        <span className={addPrefix('codeLang')}>{matchLang}</span>
      </div>
      <Highlighter
        style={hlstyle}
        language={matchLang}
        code={code}
        options={{
          PreTag: 'div',
          showLineNumbers: false,
          ...props,
        }}
      />
    </div>
  );
};

const MarkdownComp: React.FC<MarkdownProps> = ({
  text,
  flushing = false,
  disableRenderHtml = false,
  style,
  markdownFontSize = 'medium',
  components = {},
  className,
  customSanitizeSchema = {},
  options = {},
}) => {
  const customSchema = deepmerge(defaultSchema, customSanitizeSchema);
  const { imgOptions } = options;

  const { addPrefix } = useClassNames(
    `custom-markdown${isMobile() ? '-mobile' : ''}`
  );

  return (
    <ReactMarkdown
      remarkPlugins={[
        [remarkGfm, { singleTilde: false }],
        remarkMath,
        [remarkAudio, { preload: true, controls: true, autoplay: false }],
        [remarkVideo, { preload: true, controls: true, autoplay: false }],
        remarkEmbed,
      ]}
      rehypePlugins={
        disableRenderHtml
          ? [rehypeKatex]
          : [rehypeKatex, rehypeRaw, [rehypeSanitize, customSchema]]
      }
      className={classnames(
        'markdown-body',
        addPrefix('markdownContent'),
        {
          [addPrefix('fontMedium')]: markdownFontSize === 'medium',
          [addPrefix('fontSmall')]: markdownFontSize === 'small',
          [addPrefix('fontLarge')]: markdownFontSize === 'large',
          [addPrefix('fontQianwen')]: markdownFontSize === 'qianwen',
        },
        {
          [addPrefix('flushing')]: flushing,
          [addPrefix('flushingEmpty')]: !text && flushing,
        },
        className
      )}
      components={{
        code: (props) => <CodeHighLighter {...props} hlstyle={style} />,
        img: (props) => (
          <ImageComponent addtionalOptions={imgOptions} {...props} />
        ),
        a: AComponent,
        audio: AudioComponent,
        video: VideoComponent,
        embed: EmbedComponent,
        ...components,
      }}
    >
      {text || ''}
    </ReactMarkdown>
  );
};

export default MarkdownComp;
