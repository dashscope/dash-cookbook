import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import IconFont from '@/components/IconFont';
import MarkdownComponent from '@/components/MarkdownComp';
import Toast from '@/components/Toast';
import { IChatContext } from '@/context/chatContext';
import { copyText } from '@/libs/utils';
import { IChatNode } from '@/types/serivce';
import styles from './index.module.less';
import { FormattedMessage, useIntl } from 'react-intl';

interface IAnswerItemProps {
  context: IChatContext;
  scrollToBottom: (smooth?: boolean, forceUpdate?: boolean) => void;
  loading?: boolean;
  isLast?: boolean;
  curEle: IChatNode;
  disabled?: boolean;
  setTyping: (value: boolean) => void;
  current: number;
}

function AnswerItem(props: IAnswerItemProps, ref) {
  const { scrollToBottom, curEle, setTyping } = props;
  const [text, setText] = useState(curEle.content.value);
  const [finish, setFinish] = useState(false);
  const intl = useIntl();
  const { disabled } = props;

  useImperativeHandle(ref, () => ({
    flush: () => {},
  }));

  const onFlush = (data) => {
    setText(data);
    setTyping(true);
    scrollToBottom(false, false);
  };

  useEffect(() => {
    if (curEle.flushing) {
      props.context.chat.on('flush', onFlush);
      setFinish(false);
    } else {
      setTyping(false);
      props.context.chat.off('flush', onFlush);
      setTimeout(() => {
        setFinish(true);
      }, 2000);
    }
    return () => {
      props.context.chat.off('flush', onFlush);
    };
  }, [curEle.flushing]);

  const copy = () => {
    copyText(text);
    Toast.show({
      type: 'success',
      message: intl.formatMessage({ id: 'copySuccess' }),
    });
  };

  return (
    <div className={styles.answerItem}>
      <div className={styles.answerContent}>
        <MarkdownComponent
          flushing={curEle.flushing}
          text={text}
          markdownFontSize="qianwen"
          disableRenderHtml
        />

        {curEle.content.error && (
          <div className={styles.error}>
            <span className={styles.errorInfo}>
              {curEle.content.error.errorMsg}
            </span>
          </div>
        )}
      </div>
      {!disabled && (
        <div className={styles.tools}>
          <div className={styles.left}>
            {curEle.flushing && !text && (
              <FormattedMessage id="mobileLoading1" />
            )}
            {curEle.flushing && text && (
              <FormattedMessage id="mobileLoading2" />
            )}
            {curEle.interrupted && !finish && (
              <FormattedMessage id="stopDesc" />
            )}

            {!curEle.flushing && !curEle.interrupted && !finish && (
              <>
                <FormattedMessage id="finishTip" />
                <IconFont
                  type="icon-xiugaichenggong"
                  className={styles.green}
                />
              </>
            )}
            {!curEle.flushing && finish && (
              <IconFont type="icon-fuzhi_default" onClick={copy} />
            )}

            {!curEle.flushing ? (
              <a
                className={styles.btn}
                onClick={() => {
                  copyText(curEle.parentMsgId);
                  Toast.show({
                    type: 'success',
                    message: intl.formatMessage({ id: 'copySuccess' }),
                  });
                }}
              >
                <FormattedMessage id="copyRequestId" />
              </a>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(AnswerItem);
