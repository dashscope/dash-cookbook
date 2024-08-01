import React from 'react';
import useMemo from 'rc-util/lib/hooks/useMemo';

import { IAvatarOptions } from './config';
import ConfigContext, { ConfigConsumerProps } from './context';

export interface ConfigProviderProps {
  children?: React.ReactNode;
  avatar?: IAvatarOptions;
}

interface ProviderChildrenProps extends ConfigProviderProps {
  parentContext: ConfigConsumerProps;
}

const ProviderChildren: React.FC<ProviderChildrenProps> = (props) => {
  const {
    children,
    avatar,
    parentContext,
  } = props;

  const baseConfig: Record<string, any> = {
    avatar,
  };

  const config = {
    ...parentContext,
  };

  Object.keys(baseConfig).forEach((key: keyof typeof baseConfig) => {
    if (baseConfig[key] !== undefined) {
      (config as any)[key] = baseConfig[key];
    }
  });

  const memoedConfig = useMemo(
    () => config,
    config,
    (prevConfig, currentConfig) => {
      const prevKeys = Object.keys(prevConfig) as Array<keyof typeof config>;
      const currentKeys = Object.keys(currentConfig) as Array<
        keyof typeof config
      >;
      return (
        prevKeys.length !== currentKeys.length ||
        prevKeys.some((key) => prevConfig[key] !== currentConfig[key])
      );
    }
  );

  const childNode = children;

  // if (locale) {
  //   childNode = (
  //     <LocaleProvider locale={locale} _ANT_MARK__={ANT_MARK}>
  //       {childNode}
  //     </LocaleProvider>
  //   );
  // }

  console.log('configProvider:', memoedConfig);

  return (
    <ConfigContext.Provider value={memoedConfig}>
      {childNode}
    </ConfigContext.Provider>
  );
};

const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
  const context = React.useContext<ConfigConsumerProps>(ConfigContext);
  // const locale = React.useContext<LocaleContextProps | undefined>(
  //   LocaleContext
  // );
  return (
    <ProviderChildren
      parentContext={context}
      // legacyLocale={antLocale!}
      {...props}
    />
  );
};

export { ConfigContext };
export default ConfigProvider;
