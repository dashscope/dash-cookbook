import ChatContext from '@/context/chatContext';
import { Chat } from '@/libs/chatSDK';
import store from '@/store';
import { useRef, useState } from 'react';
import ChatContent from '../ChatContent';
import Toast from '@/components/Toast';
import styles from './index.module.less';
import { ChatHeader } from '../ChatHeader';
import { useIntl } from 'react-intl';

interface IProps {
  children?: JSX.Element;
}

export default function ChatLayout(props: IProps) {
  const [chatState, chatDispatchers] = store.useModel('app');
  const [chat] = useState(new Chat({}));
  const [selectedId, setSelectedId] = useState('');
  const [isSessionEnd, setIsSessionEnd] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const { loading } = chatState;
  const intl = useIntl();

  const handleAdd = () => {
    if (!selectedId) {
      Toast.show({ type: 'warning', message: intl.formatMessage({ id: "hasNewConversation" }) });
      return;
    }
    if (loading) {
      Toast.show({ type: 'warning', message: intl.formatMessage({ id: "loadingNew" }) });
      return;
    }
    setSelectedId('');
    setIsSessionEnd(false);
    chat.updateConversationId('');
    chat.updateChatList([]);
    Toast.show({
      type: 'success',
      message: intl.formatMessage({ id: "newSuccess" }),
    });
  };

  const updateSessionId = (sessionItem, disableQueryHistory = false) => {
    setSelectedId(sessionItem.sessionId);
    setIsSessionEnd(
      ['QuerySecurityMax', 'ChatCountMax'].includes(sessionItem.errorCode),
    );
    chat.updateConversationId(sessionItem.sessionId);
    chat.updateChatList([]);
    chatDispatchers.update({ questionIsEdit: false });
    if (disableQueryHistory) return;
  };

  return (
    <div className={styles.container}>
      <ChatHeader addEvent={handleAdd} logoClick={handleAdd} />
      <div className={styles.content}>
        <ChatContext.Provider value={{ chat }}>
          <ChatContent
            isSessionEnd={isSessionEnd}
            addSession={handleAdd}
            updateSession={(sessionItem) => {
              updateSessionId(sessionItem, true);
              chat.updateConversationId(sessionItem.sessionId);
            }}
            selectedId={selectedId}
          />
        </ChatContext.Provider>
      </div>
      <div className={styles.footer} ref={footerRef} id="pageFooter">
        {chatState.pageConfig.footerDesc}
      </div>
    </div>
  );
}
