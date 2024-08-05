import React, { memo, useMemo } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import c from 'react-syntax-highlighter/dist/esm/languages/hljs/c';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import shell from 'react-syntax-highlighter/dist/esm/languages/hljs/shell';

import mapl from './highlight_mapl';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('sh', shell);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('mapl', mapl);

export interface HighlighterProps {
  language: string;
  code: string;
  options?: Record<string, any>;
  style?: HljsStyleParams;
  [key: string]: any;
}

const styleTypeList = [
  'hljs-strong',
  'hljs-emphasis',
  'hljs',
  'hljs-selector-tag',
  'hljs-keyword',
  'hljs-comment',
  'hljs-quote',
  'hljs-variable',
  'hljs-template-variable',
  'hljs-tag',
  'hljs-name',
  'hljs-selector-id',
  'hljs-selector-class',
  'hljs-regexp',
  'hljs-deletion',
  'hljs-number',
  'hljs-built_in',
  'hljs-builtin-name',
  'hljs-literal',
  'hljs-type',
  'hljs-params',
  'hljs-meta',
  'hljs-link',
  'hljs-attribute',
  'hljs-string',
  'hljs-symbol',
  'hljs-bullet',
  'hljs-addition',
  'hljs-title',
  'hljs-section',
] as const;

export type Style = (typeof styleTypeList)[number];

export type HljsStyleParams = {
  [s in Style]: {
    color?: string;
    fontStyle?: string;
    fontWeight?: string;
    display?: string;
    padding?: string;
    overflowX?: string;
  };
};

const originalStyle: HljsStyleParams = {
  'hljs-comment': {
    color: '#624AFF',
  },
  'hljs-quote': {
    color: '#696969',
  },
  'hljs-variable': {
    color: '#d91e18',
  },
  'hljs-template-variable': {
    color: '#d91e18',
  },
  'hljs-tag': {
    color: '#d91e18',
  },
  'hljs-name': {
    color: '#d91e18',
  },
  'hljs-selector-id': {
    color: '#d91e18',
  },
  'hljs-selector-class': {
    color: '#d91e18',
  },
  'hljs-regexp': {
    color: '#d91e18',
  },
  'hljs-deletion': {
    color: '#d91e18',
  },
  'hljs-number': {
    color: '#aa5d00',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-built_in': {
    color: '#aa5d00',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-builtin-name': {
    color: '#aa5d00',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-literal': {
    color: '#aa5d00',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-type': {
    color: '#aa5d00',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-params': {
    color: '#aa5d00',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-meta': {
    color: '#aa5d00',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-link': {
    color: '#aa5d00',
  },
  'hljs-attribute': {
    color: '#aa5d00',
  },
  'hljs-string': {
    color: '#008000',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-symbol': {
    color: '#008000',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-bullet': {
    color: '#008000',
    // color: 'rgb(98, 74, 255)',
  },
  'hljs-addition': {
    color: '#008000',
    // color: 'rgb(98, 74, 255)',
  },
  'hljs-title': {
    color: '#007faa',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-section': {
    color: '#007faa',
  },
  'hljs-keyword': {
    color: '#7928a1',
    //color: 'rgb(98, 74, 255)',
  },
  'hljs-selector-tag': {
    color: '#7928a1',
  },
  hljs: {
    display: 'block',
    overflowX: 'auto',
    //background: "#fefefe",
    color: '#545454',
    padding: '0.5em',
  },
  'hljs-emphasis': {
    fontStyle: 'italic',
  },
  'hljs-strong': {
    fontWeight: 'bold',
  },
};

const Highlighter: React.FC<HighlighterProps> = ({
  code,
  language = '',
  options = {},
  style = originalStyle,
}) => {
  const newStyle = useMemo(() => {
    const curStyle = originalStyle;
    for (const ele in curStyle) {
      if (style[ele].color) {
        curStyle[ele].color = style[ele].color;
      }
      if (style[ele].fontStyle) {
        curStyle[ele].fontStyle = style[ele].fontStyle;
      }
      if (style[ele].fontWeight) {
        curStyle[ele].fontWeight = style[ele].fontWeight;
      }
      if (style[ele].display) {
        curStyle[ele].display = style[ele].display;
      }
      if (style[ele].padding) {
        curStyle[ele].padding = style[ele].padding;
      }
      if (style[ele].overflowX) {
        curStyle[ele].overflowX = style[ele].overflowX;
      }
    }
    return curStyle;
  }, [style]);

  if (typeof code !== 'string') return <div>{code}</div>;

  return (
    <SyntaxHighlighter
      style={newStyle}
      showLineNumbers={!!code}
      language={language}
      {...options}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default memo(Highlighter);
