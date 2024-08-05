import classnames from 'classnames';
import { Input } from 'antd';
import IconFont from '@/components/IconFont';
import React, {
  forwardRef,
  KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import mStyles from '../../mComponents/TextArea.module.less';
import pcStyles from './index.module.less';
import { breakLine, onMobile } from '@/libs/utils';
import { TextAreaRef } from 'antd/es/input/TextArea';
import store from '@/store';
import Toast from '@/components/Toast';
import { FormattedMessage, useIntl } from 'react-intl';
const styles = onMobile ? mStyles : pcStyles;

function moveCaretToEnd(el: HTMLTextAreaElement) {
  el.selectionStart = el.value.length;
  el.selectionEnd = el.value.length;
}

export interface ITextAreaRefProps {
  inputInstance: TextAreaRef | null;
  setTextValue: (val: string) => void;
  changeState;
}

const maxLength = 5500;
const TextInput = (props, ref) => {
  const [chatState] = store.useModel('app');

  const { onSubmit, loading, themeType, setFocus } = props;
  const inputRef = useRef(null as TextAreaRef | null);
  const [fadeOut, setFadeOut] = useState(false);
  const [show, setShow] = useState(true);
  // 输入内容
  const [textValue, setTextValue] = useState(
    props.value || chatState?.inputText,
  );
  const cacheLoading = useRef(loading);
  const cacheIndex = useRef(-1);
  const intl = useIntl();

  useImperativeHandle(
    ref,
    () => ({
      inputInstance: inputRef.current,
      setTextValue,
      focus: () => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 30);
      },
      clear: () => {
        setTextValue('');
      },
    }),
    [setTextValue],
  );

  useEffect(() => {
    if (chatState.sessionType === 'text_chat') {
      setTimeout(() => {
        setShow(true);
      }, 200);
    }
    if (!fadeOut && chatState.sessionType !== 'text_chat') {
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        setFadeOut(false);
      }, 200);
    }
  }, [chatState.sessionType]);

  useEffect(() => {
    cacheLoading.current = loading;
  }, [loading]);

  useEffect(() => {
    props.onChange?.(textValue);
  }, [textValue]);

  // 修改输入框内容
  const changeInputValue = (e) => {
    const { value } = e.target;
    setTextValue(value);
  };

  const onEnter = () => {
    if (!textValue?.trim()) return;

    if (cacheLoading.current) {
      Toast.show({
        type: 'warning',
        message: intl.formatMessage({ id: "loadingTip" }),
      });
      return;
    }
    onSubmit(textValue);
    cacheIndex.current = -1;
    if (props.onChange) return;
    setTextValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const keyCode = window.event ? e.keyCode : e.which;
    switch (keyCode) {
      case 13:
        const TextArea = inputRef.current?.resizableTextArea?.textArea;
        if (TextArea && (e.ctrlKey || e.metaKey)) {
          breakLine(TextArea, setTextValue);
        }
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
          onEnter();
          e.cancelable = true;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        break;
      default:
        break;
    }
  };

  if (!show) {
    return null;
  }
  return (
    <div
      className={classnames(props.className, styles.chatTextareaText, {
        [styles.chatTextarea]: true,
        [styles.dark]: themeType === 'dark',
      })}
    >
      <Input.TextArea
        autoFocus
        id="primary-textarea"
        className={classnames(
          styles.textarea,
          styles.fadeIn,
          props.textareaClassName,
          { [styles.fadeOut]: fadeOut },
        )}
        placeholder={intl.formatMessage({ id: 'textPlaceholder' })}
        autoSize={
          props.autoSize || {
            minRows: 1.5,
            maxRows: 4,
          }
        }
        disabled={props.disabled}
        ref={inputRef}
        maxLength={maxLength}
        value={textValue}
        onKeyDown={handleKeyDown}
        onChange={changeInputValue}
        onBlur={() => {
          const timer = setTimeout(() => {
            setFocus(false);
            props.onBlur?.();
            clearTimeout(timer);
            window.scrollTo(0, 0);
          }, 10);
        }}
        onFocus={(e) => {
          setFocus(true);
          requestAnimationFrame(() => {
            moveCaretToEnd(e.target);
          });
          props.onFocus?.(e);
        }}
      />
      <div className={classnames(styles.tools, props.toolsClassName)}>
        <div className={styles.leftArea}></div>
        <div className={styles.rightArea}>
          <div className={styles.count}>
            <div
              className={classnames(
                styles.wordLen,
                props.currentCountClassName,
                {
                  [styles.limitMax]: maxLength <= textValue.length,
                },
              )}
            >
              {textValue.length}
            </div>
            <div className={styles.wordLen}>/{maxLength}</div>
          </div>
          {props.tools || (
            <div
              className={classnames(styles.chatBtn, {
                [styles.disabled]: !textValue?.trim() || loading,
              })}
              onClick={onEnter}
              onMouseUp={(e) => e.stopPropagation()}
            >
              {
                <IconFont
                  className={classnames('iconfont', {
                    [styles.loadingIcon]: loading,
                  })}
                  type="icon-fasong_default"
                />
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default forwardRef<ITextAreaRefProps, ITextAreaRefProps>(TextInput);
