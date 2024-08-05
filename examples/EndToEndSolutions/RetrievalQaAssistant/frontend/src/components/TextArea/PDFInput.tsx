import classnames from 'classnames';
import { Input, Space, Upload } from 'antd';
import IconFont from '@/components/IconFont';
import {
  forwardRef,
  KeyboardEvent,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import mStyles from '../../mComponents/TextArea.module.less';
import pcStyles from './index.module.less';
import { breakLine, onMobile, uploadFile } from '@/libs/utils';
import {
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { TextAreaRef } from 'antd/es/input/TextArea';
import store from '@/store';
import Toast from '@/components/Toast';
import NewButton from '@/components/NewButton';
import ChatContext, { IChatContext } from '@/context/chatContext';
import { FormattedMessage, useIntl } from 'react-intl';
import pdfIcon from '@/assets/images/pdf_icon.png';

const styles = onMobile ? mStyles : pcStyles;

export interface ITextAreaRefProps {
  inputInstance: TextAreaRef | null;
  setTextValue: (val: string) => void;
  changeState;
}

function moveCaretToEnd(el: HTMLTextAreaElement) {
  el.selectionStart = el.value.length;
  el.selectionEnd = el.value.length;
}

const maxLength = 1000;
let abortController: AbortController | null = null;

const PDFInput = (props, ref) => {
  const [chatState] = store.useModel('app');
  const intl = useIntl();

  const { onSubmit, loading, themeType, setFocus } = props;
  const context: IChatContext = useContext(ChatContext);
  const inputRef = useRef(null as TextAreaRef | null);
  const [fadeOut, setFadeOut] = useState(false);
  const [show, setShow] = useState(false);
  const [state, setState] = useState({
    filename: '',
    loading: false,
    errorMsg: '',
    dataId: "",
    hasDataId: false,
  });
  const changeState = (payload: Partial<typeof state>) => {
    setState((prev) => ({
      ...prev,
      ...payload,
    }));
  };
  // 输入内容
  const [textValue, setTextValue] = useState(
    props.value || chatState?.inputText,
  );
  const cacheLoading = useRef(loading);
  const cacheIndex = useRef(-1);

  const clear = () => {
    abortController?.abort();

    setTextValue('');
    changeState({
      // filename: '',
      loading: false,
      errorMsg: '',
      // dataId: "",
      hasDataId: true,
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      inputInstance: inputRef.current,
      setTextValue,
      changeState,
      clear,
    }),
    [setTextValue, changeState],
  );

  useEffect(() => {
    if (chatState.sessionType === 'doc_chat') {
      setTimeout(() => {
        setShow(true);
      }, 200);
    }
    if (!fadeOut && chatState.sessionType !== 'doc_chat') {
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
    if (!textValue?.trim() || state.loading) return;

    if (cacheLoading.current) {
      Toast.show({
        type: 'warning',
        message: intl.formatMessage({ id: "loadingTip" }),
      });
      return;
    }

    if (!state.dataId && !context.chat.store.latestNode) {
      Toast.show({
        type: 'warning',
        message: intl.formatMessage({ id: "emptyFileTip" }),
      });
      return;
    }

    onSubmit(
      textValue,
      'doc_chat',
      { dataId: state.dataId },
    );
    clear();
    cacheIndex.current = -1;
    if (props.onChange) return;
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

  const upload = async (args) => {
    if (args.file.size > 10 * 1024 * 1024) {
      Toast.show({ type: 'warning', message: intl.formatMessage({ id: "maxFileSizeTip" }) });
      return;
    }
    try {
      abortController = new AbortController();

      changeState({
        loading: true,
        filename: args.file.name,
        errorMsg: '',
        dataId: "",
      });
      const uploadRes: any = await uploadFile({
        file: args.file,
        fileType: 'pdf',
        abortSignal: abortController.signal,
      });
      changeState({
        dataId: uploadRes.dataId,
        filename: args.file.name,
        loading: false,
      });
      
    } catch {
      changeState({ loading: false });
    }
  };

  const renderPDFStatus = () => {
    if (state.errorMsg) {
      return (
        <NewButton
          size={'small'}
          className={classnames(styles.pdfBtn, styles.pdfError)}
        >
          <Space>
            <IconFont type="icon-daorushibai" />
            {state.errorMsg}
            <DeleteOutlined
              onClick={() => {
                changeState({
                  filename: '',
                  loading: false,
                  errorMsg: '',
                  dataId: "",
                });
              }}
            />
          </Space>
        </NewButton>
      );
    }

    if (state.dataId) {
      return (
        <NewButton
          size={'small'}
          className={classnames(styles.pdfBtn, styles.pdfBtnUploaded)}
        >
          <Space style={{ whiteSpace: 'nowrap' }}>
            <img
              src={pdfIcon}
              alt=""
            />
            <p>{state.filename.replace(/^(.{26}).*?(\.pdf)?$/, '$1...$2')}</p>
            <DeleteOutlined
              onClick={(e) => {
                e.stopPropagation();
                changeState({
                  filename: '',
                  loading: false,
                  dataId: "",
                  errorMsg: '',
                });
              }}
            />
          </Space>
        </NewButton>
      );
    }

    return (
      <NewButton
        size={'small'}
        loading={state.loading ? true : undefined}
        className={classnames(styles.pdfBtn, {
          [styles.pdfUploading]: state.loading,
        })}
      >
        {state.loading ? (
          <Space style={{ whiteSpace: 'nowrap' }}>
            <LoadingOutlined />
            <p className={styles.filename}>
              <FormattedMessage id="uploadingTip" />
              {state.filename.replace(/^(.{10}).*?(\.pdf)?$/, '$1...$2')}
            </p>
            <FormattedMessage id="uploadingTip2" />
            <DeleteOutlined
              onClick={() => {
                changeState({
                  filename: '',
                  loading: false,
                  dataId: "",
                  errorMsg: '',
                });
              }}
            />
          </Space>
        ) : (
          <Space>
            <IconFont type={'icon-shangchuan1'} />
            <FormattedMessage id="pdfUpload" />
          </Space>
        )}
      </NewButton>
    );
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className={classnames(styles.chatTextareaText, {
        [styles.chatTextarea]: true,
        [styles.dark]: themeType === 'dark',
      })}
    >
      <Input.TextArea
        autoFocus
        id="primary-textarea"
        className={classnames(
          styles.textarea,
          props.textareaClassName,
          styles.fadeIn,
          { [styles.fadeOut]: fadeOut },
        )}
        placeholder={intl.formatMessage({ id: "docsPlaceholder" })}
        autoSize={
          props.autoSize || {
            minRows: 1.5,
            maxRows: 3,
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
        <div className={styles.leftArea}>
          <Upload
            name="file"
            withCredentials
            disabled={!!(state.loading || state.errorMsg)}
            showUploadList={false}
            customRequest={upload}
            maxCount={1}
            accept={'.pdf'}
            className={classnames(styles.fadeIn, {
              [styles.fadeOut]: fadeOut,
            })}
          >
            {renderPDFStatus()}
          </Upload>
        </div>
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
                [styles.disabled]: !textValue?.trim() || loading || (!state.dataId && !state.hasDataId),
              })}
              onClick={onEnter}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <IconFont
                className={classnames('iconfont', {
                  [styles.loadingIcon]: loading || !state.dataId,
                })}
                type="icon-fasong_default"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default forwardRef<ITextAreaRefProps, ITextAreaRefProps>(PDFInput);
