import React from 'react';

import {
  DefaultConfig,
  IAvatarOptions,
  ILayoutOptions,
  IMarkdownOptions,
  IQuestionOptions,
} from './config';

export interface ConfigConsumerProps {
  avatar: IAvatarOptions;
  layout: ILayoutOptions;
  question?: IQuestionOptions;
  markdown?: IMarkdownOptions;
}

const ConfigContext = React.createContext<ConfigConsumerProps>(DefaultConfig);

export default ConfigContext;
