import ChatLayout from '@/components/ChatLayout';
import { onMobile } from '@/libs/utils';
import ChatLayoutMobile from '@/mComponents/ChatLayout';
import { IntlProvider } from 'react-intl';
import enMessages from '@/locales/en.json';
import zhMessages from '@/locales/zh.json';
import { useMemo } from 'react';
import store from '@/store';

export default function Chat() {
  const [appState] = store.useModel("app");

  const messages = useMemo(() => {
    return appState.language === 'zh' ? zhMessages : enMessages
  }, [appState.language]);

  const renderContent = () => {
    return onMobile ? (
      <ChatLayoutMobile />
    ) : (
      <ChatLayout />
    );
  };

  return (
    <IntlProvider messages={messages} locale={appState.language}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, height: '0px' }}>{renderContent()}</div>
      </div>
    </IntlProvider>
  );
}
