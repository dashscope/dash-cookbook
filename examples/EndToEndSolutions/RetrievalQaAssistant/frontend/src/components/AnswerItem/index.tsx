import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import cls from 'classnames';
import MarkdownComponent from '@/components/MarkdownComp';
import ChatContext, { IChatContext } from '@/context/chatContext';
import { throttle } from 'lodash';
import { IChatNode, IChatNodeItem } from '@/types/serivce';
import styles from './index.module.less';
import AnswerTools from '../AnswerTools';
import store from '@/store';

interface IAnswerItemProps {
  context: IChatContext;
  scrollToBottom: (smooth?: boolean, forceUpdate?: boolean) => void;
  onSwitchNode: (index: number) => void;
  loading?: boolean;
  isLast?: boolean;
  peerCount: number;
  onRegenerate?: () => void;
  curEle: IChatNode;
  disabled?: boolean;
  current: number;
  noAvatar?: boolean;
}

function AnswerItem(props: IAnswerItemProps, ref) {
  const {
    scrollToBottom,
    onSwitchNode,
    curEle,
    isLast,
    peerCount,
    disabled,
  } = props;
  const [text, setText] = useState(curEle.content.value);
  const context: IChatContext = useContext(ChatContext);
  const [appState] = store.useModel("app");

  useImperativeHandle(ref, () => ({
    setText,
    flush: () => {},
  }));

  const handleReGenerate = throttle(() => {
    if (props.disabled) return;
    if ((props.peerCount || 0) >= 5) {
      return;
    }
    props.onRegenerate?.();
  }, 3000);

  useEffect(() => {
    const onFlush = (data) => {
      setText(data);
      scrollToBottom(false, false);
    };

    if (curEle.flushing) {
      props.context.chat.on('flush', onFlush);
    } else {
      setText(curEle.content.value);
      props.context.chat.off('flush', onFlush);
    }
    return () => {
      props.context.chat.off('flush', onFlush);
    };
  }, [curEle.flushing]);

  useEffect(() => {
    const onModify = (node: IChatNodeItem) => {
      if (node.msgId !== curEle.msgId) return;
      setText(node.content);
    };
    context.chat.on('modifyValue', onModify);
    return () => {
      context.chat.off('modifyValue', onModify);
    };
  }, []);

  return (
    <div className={styles.answerItem}>
      <div
        className={cls(styles.answerContent, {
          [styles.noAvatar]: props.noAvatar,
        })}
      >
        {props.noAvatar ? null : (
          <img className={styles.logo} src={curEle.flushing && appState.pageConfig.answer.animateLogo ? appState.pageConfig.answer.animateLogo : appState.pageConfig.answer.logo} />
        )}
        <div className={styles.containerWrap}>
          <div className={styles.content}>
            <div className={styles.stream}>
              <MarkdownComponent
                flushing={curEle.flushing}
                text={text}
                markdownFontSize="qianwen"
                disableRenderHtml
              />
            </div>
            {curEle.content.error && (
              <div className={styles.error}>
                <span className={styles.errorInfo}>
                  {curEle.content.error.errorMsg}
                </span>
              </div>
            )}
          </div>
          <AnswerTools
            answerItem={curEle}
            text={text}
            isLast={isLast}
            peerCount={peerCount}
            onSwitchNode={onSwitchNode}
            disabled={isLast && disabled}
            reRun={handleReGenerate}
          />
        </div>
      </div>
    </div>
  );
}

export default forwardRef(AnswerItem);
