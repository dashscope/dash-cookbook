import ChatContext from '@/context/chatContext';
import { Chat } from '@/libs/chatSDK';
import store from '@/store';
import { useState } from 'react';
import NewButton from '../NewButton';
import ChatContent from '../ChatContent';
import IconFont from '../IconFont';

import Toast from '../Toast';
import styles from './index.module.less';
import { ChatHeader } from '../ChatHeader';
import { FormattedMessage, useIntl } from 'react-intl';

export default function ChatLayout() {
  const [chatState, chatDispatchers] = store.useModel('app');
  const [chat] = useState(new Chat({}));
  const [isSessionEnd, setIsSessionEnd] = useState(false);
  const [chatIndex, setChatIndex] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const intl = useIntl();
  const { loading } = chatState;

  const handleAdd = (showToastTip = true) => {
    chatDispatchers.update({ questionIsEdit: false });
    setChatIndex((prev) => prev + 1);
    if (!selectedId && showToastTip) {
      Toast.show({ type: 'success', message: intl.formatMessage({ id: "hasNewConversation" }) });
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
  };

  const updateSessionId = (sessionItem, disableQueryHistory = false) => {
    setSelectedId(sessionItem.sessionId);
    setIsSessionEnd(
      ['QuerySecurityMax', 'ChatCountMax'].includes(sessionItem.errorCode),
    );
    chat.updateConversationId(sessionItem.sessionId);
    chat.updateChatList([]);
    chatDispatchers.update({
      questionIsEdit: false,
      sessionType: sessionItem.sessionType || 'text_chat',
    });
    if (disableQueryHistory) return;
  };

  return (
    <div className={styles.container} id="chat-layout-container">
      <ChatHeader
        onLogoClick={() => {
          chatDispatchers.update({ source: 'new_top_logo' });
          handleAdd(true);
        }}
      />
      <div className={styles.contentWrap}>
        <div className={styles.side}>
          <NewButton
            type="primary"
            disabled={loading}
            onClick={() => {
              chatDispatchers.update({ source: 'new_top' });
              handleAdd();
            }}
            className={styles.addBtn}
          >
            <IconFont
              className={styles.icon}
              type="icon-xinjianduihua_default"
            />
            <FormattedMessage id="newConversation" />
          </NewButton>
        </div>
        <div className={styles.content}>
          <div className={styles.contentWrap}>
            <div className={styles.main}>
              <ChatContext.Provider value={{ chat }}>
                <ChatContent
                  isSessionEnd={isSessionEnd}
                  addSession={handleAdd}
                  updateSession={(sessionItem) => {
                    updateSessionId(sessionItem, true);
                    chat.updateConversationId(sessionItem.sessionId);
                  }}
                  selectedId={selectedId}
                  chatKey={selectedId || chatIndex}
                />
              </ChatContext.Provider>
            </div>
            <div className={styles.footer}>
              <div className={styles.desc}>
                {chatState.pageConfig.footerDesc}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
