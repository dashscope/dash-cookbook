import classnames from 'classnames';
import { throttle } from 'lodash';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import AnswerItem from '@/components/AnswerItem';
import QuestionItem from '@/components/QuestionItem';
import ChatContext, { IChatContext } from '@/context/chatContext';
import store from '@/store';
import SimpleTextArea, { ITextAreaRefProps } from '../TextArea';

import { isMobile, onMobile } from '@/libs/utils';
import { ISessionItem } from '@/types/serivce';
import Toast from '../Toast';
import IconFont from '../IconFont';
import styles from './index.module.less';
import GuideComp from './components/GuideComp';
import NewButton from '../NewButton';
import useBus from 'use-bus';
import { FormattedMessage, useIntl } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';


const MISTAKE_DISTANCE = 100;
const MOBILE_MISTAKE_DISTANCE = 120;

const TextArea = SimpleTextArea;

const MAX_LEN = window.warnSessionContextCount;

interface IChatContextProps {
  updateSession: (val: ISessionItem) => void;
  addSession: () => void;
  isSessionEnd: boolean;
  selectedId: string;
  chatKey: string | number;
}

export default function ChatContent(props: IChatContextProps) {
  const { isSessionEnd } = props;
  const scrollRef = useRef(null as HTMLDivElement | null);
  const [chatState, chatDispatchers] = store.useModel('app');
  const { loading } = chatState;
  const context: IChatContext = useContext(ChatContext);
  const [qFocus, setQfocus] = useState(false);
  const inputRef = useRef(null as ITextAreaRefProps | null);
  const scrollConRef = useRef(null as HTMLDivElement | null);
  const answerItemRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);
  const cacheData = useRef({
    isSessionEnd: true,
  });
  const [list, setList] = useState<any>([]);
  const [flushingText, setFlushingText] = useState('');
  const [flushingTextIsNull, setFlushingTextIsNull] = useState(true);
  const intl = useIntl();

  const setCacheData = (payload: Partial<typeof cacheData.current>) => {
    cacheData.current = {
      ...cacheData.current,
      ...payload,
    };
  };

  const onFlushEnd = () => {
    chatDispatchers.update({ loading: false });
    setFlushingTextIsNull(true);
  };

  useBus(
    '@@ui/TAB_CHANGE_ANIMATION',
    () => {
      setFadeOut(true);
      setTimeout(() => {
        setFadeOut(false);
      }, 1000);
    },
    [],
  );

  useEffect(() => {
    setCacheData({ isSessionEnd: props.isSessionEnd });
  }, [props.isSessionEnd]);

  useEffect(() => {
    const onFlush = (text) => {
      setFlushingText(text);
      if (text.length) {
        setFlushingTextIsNull(false);
      }
    };
    const onUpdateList = (_list) => {
      setList(_list.map((item) => JSON.parse(JSON.stringify(item))));
      setFlushingText(_list[_list.length - 1]?.content?.value || '');
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
    context.chat.on('flush', onFlush);
    context.chat.on('flushEnd', onFlushEnd);

    return () => {
      context.chat.off('updateList', onUpdateList);
      context.chat.off('flush', onFlush);
      context.chat.off('flushEnd', onFlushEnd);
      context.chat.close();
      chatDispatchers.update({ loading: false });
    };
  }, [setFlushingText, setList]);

  useEffect(() => {
    chatDispatchers.update({ inputText: '' });
    inputRef.current?.setTextValue('');
  }, [props.chatKey, chatDispatchers]);

  const scrollToBottom = throttle((smooth = true, forceUpdate = true) => {
    const {
      clientHeight = 0,
      scrollTop = 0,
      scrollHeight = 0,
    } = scrollConRef.current || {};
    const distance = scrollHeight - scrollTop - clientHeight;
    const mistakeDistance = isMobile()
      ? MOBILE_MISTAKE_DISTANCE
      : MISTAKE_DISTANCE;
    if (distance >= mistakeDistance && !forceUpdate) return; // 没有贴到底部
    scrollRef.current?.scrollIntoView(
      smooth
        ? {
            behavior: 'smooth',
          }
        : {},
    );
  }, 300);

  const lastNode = useMemo(() => {
    return list[list.length - 1];
  }, [list]);

  const stopGenerate = throttle(() => {
    if (lastNode?.flushing && !flushingText) return;
    context.chat.stopGenerate({
      msgId: lastNode.msgId,
      parentMsgId: lastNode.parentMsgId,
      content: flushingText,
    });
    setFlushingTextIsNull(true);
  }, 3000);

  const onRegenerate = () => {
    if ((list[list.length - 1] as any)?.peerCount >= 5) {
      Toast.show({ type: 'warning', message: intl.formatMessage({ id: "regenerationDisabledTip" }) });
      return;
    }
    chatDispatchers.update({ loading: true });
    context.chat.reGenerate();
  };

  const onSubmit = async (text, inputType, options = {}) => {
    const updateSessionItem = {
      sessionId: uuidv4().replace(/-/g, ''),
      sessionType: inputType || chatState.sessionType,
      summary: "",
      firstQuery: ''
    }
    console.log(updateSessionItem, '>>>sss');
    if (!context.chat.conversation_id) {
      if (!chatState.source) chatDispatchers.update({ source: 'new' });
      props.updateSession(updateSessionItem);
    }
    if (!updateSessionItem && !context.chat.conversation_id) return;
    chatDispatchers.update({ loading: true });
    context.chat.normalGenerate(
      text,
      {
        sessionType: inputType || chatState.sessionType,
        ...options,
      }
    );
    scrollToBottom();
  };

  const clickRecommend = (recommend: any) => {
    chatDispatchers.update({ source: 'recommendation' });
    inputRef.current?.setTextValue(recommend.contentData);
    inputRef.current?.focus();
  };

  const stopGenerateBtn = useMemo(() => {
    if (lastNode?.flushing) {
      return (
        <NewButton
          onClick={stopGenerate}
          className={classnames(styles.btn, styles.pauseBtn, {
            [styles.disabled]: lastNode?.flushing && flushingTextIsNull,
          })}
        >
          <div className="flexCon">
            <IconFont
              className={classnames(styles.icon, styles.endIcon)}
              type="icon-tingzhihuida_default"
            />
            <span><FormattedMessage id="stopGeneration" /></span>
          </div>
        </NewButton>
      );
    }
    return null;
  }, [lastNode?.flushing, flushingTextIsNull, stopGenerate]);

  const renderGuideComp = () => {
    if (props.selectedId) {
      return null;
    }
    if (chatState.sessionType === 'doc_chat') {
      return (
        <div key={2} className={styles.sysTip}>
          <FormattedMessage id="docsDesc" />
        </div>
      );
    }
    return (
      <div className={styles.nullTip} key={3}>
        <GuideComp onClick={clickRecommend} />
      </div>
    );
  };

  return (
    <div className={styles.chatContent}>
      <div
        ref={scrollConRef}
        className={
          qFocus ? styles.chatDialogScrollUnlimit : styles.chatDialogScroll
        }
      >
        {renderGuideComp()}
        <div
          className={classnames({
            [styles.fadeOutLeft]: fadeOut,
          })}
        >
          {list.map((el: any, index) => {
            if (el.type === 'q') {
              return (
                <QuestionItem
                  noAvatar={onMobile}
                  disabled={isSessionEnd}
                  node={el}
                  loading={loading}
                  current={el.order}
                  peerCount={el.peerCount}
                  key={el.msgId}
                  chat={context.chat}
                  text={el.content.value}
                  onFocus={setQfocus}
                  onSwitchNode={(ind) => {
                    context.chat.switchNode(el.msgId, ind - 1);
                  }}
                />
              );
            } else if (el.type === 'a') {
              return (
                <AnswerItem
                  ref={answerItemRef}
                  noAvatar={onMobile}
                  disabled={isSessionEnd}
                  curEle={el}
                  loading={loading}
                  key={el.msgId}
                  current={el.order}
                  peerCount={el.peerCount}
                  isLast={index === list.length - 1}
                  scrollToBottom={scrollToBottom}
                  context={context}
                  onRegenerate={() => onRegenerate(el)}
                  onSwitchNode={(ind) => {
                    context.chat.switchNode(el.msgId, ind - 1);
                  }}
                />
              );
            } else {
              return <>error</>;
            }
          })}
          {(isSessionEnd || (MAX_LEN && list.length >= MAX_LEN)) &&
            !lastNode?.flushing && (
              <div className={styles.textLine}>
                <div
                  className={styles.text}
                  onClick={() => {
                    chatDispatchers.update({ source: 'new_middle' });
                    props.addSession();
                  }}
                >
                  <IconFont
                    type="icon-xinzeng_default"
                    style={{ fontSize: 18, marginRight: 4 }}
                  />
                  <FormattedMessage id="openAddConversation" />
                </div>
              </div>
            )}
          {props.selectedId && (
            <div
              ref={scrollRef}
              className={classnames({
                [styles.hiddenEle]: true,
              })}
            />
          )}
        </div>
      </div>
      <div className={classnames(styles.chatContentFooterFixed)}>
        {stopGenerateBtn}
        <div
          className={classnames(styles.textInput)}
          onClick={() => {
            if (chatState.questionIsEdit) {
              Toast.show({
                type: 'warning',
                message: intl.formatMessage({ id: "loadingEdit" }),
              });
              return;
            }
          }}
        >
          <TextArea
            addSession={props.addSession}
            disabled={isSessionEnd || chatState.questionIsEdit}
            autoSize={
              onMobile
                ? {
                    minRows: 1,
                    maxRows: 5,
                  }
                : undefined
            }
            ref={inputRef}
            themeType="dark"
            onSubmit={(val, inputType, options = {}) => {
              window.qianwenRegenerate = undefined;
              onSubmit(val, inputType, options);
            }}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
