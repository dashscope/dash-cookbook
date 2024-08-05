import { throttle } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react';

import AnswerItem from '../AnswerItem';
import QuestionItem from '../QuestionItem';
import ChatContext, { IChatContext } from '@/context/chatContext';
import store from '@/store';

import { ISessionItem } from '@/types/serivce';
import GuideComp from './components/GuideComp';
import IconFont from '@/components/IconFont';
import TextArea from '../TextArea';
import { ITextAreaRefProps } from '@/components/TextArea';
import { v4 as uuidv4 } from 'uuid';

import styles from './index.module.less';
import { FormattedMessage } from 'react-intl';

const MOBILE_MISTAKE_DISTANCE = 120;

const MAX_LEN = window.warnSessionContextCount;

interface IChatContextProps {
  updateSession: (val: ISessionItem) => void;
  addSession: () => void;
  isSessionEnd: boolean;
  selectedId: string;
}

export default function ChatContent(props: IChatContextProps) {
  const { isSessionEnd } = props;
  const scrollRef = useRef(null as HTMLDivElement | null);
  const [chatState, chatDispatchers] = store.useModel('app');
  const { loading } = chatState;
  const context: IChatContext = useContext(ChatContext);
  const inputRef = useRef(null as ITextAreaRefProps | null);
  const scrollConRef = useRef(null as HTMLDivElement | null);
  const [typing, setTyping] = useState(false);
  const cacheData = useRef({
    isSessionEnd: true,
  });
  const [list, setList] = useState<any>([]);

  const setCacheData = (payload: Partial<typeof cacheData.current>) => {
    cacheData.current = {
      ...cacheData.current,
      ...payload,
    };
  };

  const onFlushEnd = () => {
    chatDispatchers.update({ loading: false });
  };

  useEffect(() => {
    setCacheData({ isSessionEnd: props.isSessionEnd });
  }, [props.isSessionEnd]);

  useEffect(() => {
    const onUpdateList = (_list) => {
      setList(_list.map((item) => JSON.parse(JSON.stringify(item))));
      setTimeout(() => {
        if (
          (scrollConRef.current?.scrollHeight || 0) <=
          (scrollConRef.current?.offsetHeight || 0)
        )
          return;
        scrollToBottom();
      }, 300);
    };
    context.chat.on('updateList', onUpdateList);
    context.chat.on('flushEnd', onFlushEnd);
    // context.chat.initData();
    return () => {
      context.chat.off('updateList', onUpdateList);
      context.chat.off('flushEnd', onFlushEnd);
      context.chat.close();
      chatDispatchers.update({ loading: false });
    };
  }, []);

  const scrollToBottom = throttle((smooth = true, forceUpdate = true) => {
    const {
      clientHeight = 0,
      scrollTop = 0,
      scrollHeight = 0,
    } = scrollConRef.current || {};
    const distance = scrollHeight - scrollTop - clientHeight;
    if (distance >= MOBILE_MISTAKE_DISTANCE && !forceUpdate) return; // 没有贴到底部
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, 300);

  const stopGenerate = throttle(() => {
    context.chat.stopGenerate(list[list.length - 1]);
  }, 3000);

  const onSubmit = async (text) => {
    console.log(context.chat.conversation_id, '>>>sss');
    if (!context.chat.conversation_id) {
      const updateSessionItem = {
        sessionId: uuidv4().replace(/-/g, ''),
        summary: "",
        firstQuery: ""
      }
      props.updateSession(updateSessionItem);
    }
    if (!context.chat.conversation_id) return;
    chatDispatchers.update({ loading: true });
    context.chat.normalGenerate(text, {
      sessionType: "text_chat",
    });
    scrollToBottom();
  };

  const clickRecommend = (recommend: any) => {
    chatDispatchers.update({ source: 'recommendation' });
    inputRef.current?.setTextValue(recommend.contentData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatContent} ref={scrollConRef}>
        {/* prompt引导 */}
        {!props.selectedId && <GuideComp onClick={clickRecommend} />}
        {/* 对话主体 */}
        {list.map((el: any, index) => (
          <React.Fragment key={el.msgId}>
            {el.type === 'q' && (
              <QuestionItem key={el.msgId} text={el.content.value} />
            )}
            {el.type === 'a' && (
              <AnswerItem
                disabled={isSessionEnd}
                curEle={el}
                loading={loading}
                key={el.msgId}
                current={el.order}
                setTyping={setTyping}
                isLast={index === list.length - 1}
                scrollToBottom={scrollToBottom}
                context={context}
              />
            )}
          </React.Fragment>
        ))}

        {/* 新建对话tip */}
        {(isSessionEnd || (MAX_LEN && list.length >= MAX_LEN)) && !loading && (
          <div className={styles.textLine}>
            <IconFont type="icon-xinzeng_default" />
            {isSessionEnd ? (
              <span
                onClick={() => {
                  chatDispatchers.update({ source: 'new_middle' });
                  props.addSession();
                }}
              >
                <FormattedMessage id="openAddConversation" />
              </span>
            ) : (
              MAX_LEN &&
              list.length >= MAX_LEN && (
                <span
                  onClick={() => {
                    chatDispatchers.update({ source: 'new_middle' });
                    props.addSession();
                  }}
                >
                  <FormattedMessage id="openAddConversation" />
                </span>
              )
            )}
          </div>
        )}

        {/* 自动滚动锚点 */}
        <div ref={scrollRef} className={styles.hiddenEle} />
      </div>

      {/* 打字中才可以停止 */}
      {loading && typing && (
        <div className={styles.stopBut} onClick={stopGenerate}>
          <IconFont type="icon-tingzhihuida_default" />
          <FormattedMessage id="stopGeneration" />
        </div>
      )}

      <TextArea
        onSubmit={onSubmit}
        disabled={isSessionEnd || loading}
        loading={loading}
        ref={inputRef}
      />
    </div>
  );
}
