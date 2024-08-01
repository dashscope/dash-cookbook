/*
Language: MAPL
Contributors: panjunqiu.pjq
Description: MAPL language
Website: https://opt.aliyun.com/
*/

export default function (hljs) {
  'use strict';

  const ACCUMULATORS = '';

  const DATATYPES = '';

  const FUNCTIONS =
    'option display solve not and or xor set param var maximize minimize subto s.t. subject to sos def let in with | do : binary integer real sum prod for forall exists if then else end to .. by setof union inter symdiff cross proj without \\ mod modulo div min max argmin argmax read as skip use comment scale separate checkonly indicator card priority startval default subsets powerset indexset print check infinity pi PI uniform random ord type1 type2 implicit len substr match suffix stage stages using scenario probability expectation variance block function return alldiff alldisjoint atmost atleast exactly countof';

  const LITERALS = '';

  const OPERATORS = '';

  const PRIVILEGES = '';

  const ROLES = '';

  const RESERVED_WORDS = '';

  const NON_RESERVED_WORDS = '';

  return {
    name: 'MAPL',
    case_insensitive: true,
    keywords: {
      keyword:
        FUNCTIONS +
        OPERATORS +
        PRIVILEGES +
        ROLES +
        RESERVED_WORDS +
        NON_RESERVED_WORDS,
      type: ACCUMULATORS + DATATYPES,
      literal: LITERALS,
    },
    contains: [
      hljs.QUOTE_STRING_MODE,
      hljs.HASH_COMMENT_MODE,
      // hljs.NUMBER_MODE,
      // hljs.C_BLOCK_COMMENT_MODE,
      // hljs.COMMENT('#'),
      {
        className: 'keyword',
        begin: 'POST-ACCUM',
      },
      // {
      //   className: 'variable',
      //   begin: 'var|set',
      // },
      {
        className: 'meta',
        begin: "-\\(|\\)->|\\)-|'",
      },
      {
        className: 'symbol',
        begin: '\\+=|:=|-=|>=|<=|!=|>>|<<|->|=|\\+|-|\\*|\\/|%|<|>|\\||&',
      },
      {
        className: 'punctuation',
        begin: ',|:|;|\\(|\\)|\\{|\\}|\\[|\\]',
      },
    ],
  };
}
