import { Tabs, Popover } from "antd";
import classnames from "classnames";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import IconFont from "@/components/IconFont";
import store from "@/store";
import { onMobile } from "@/libs/utils";
import { TextAreaRef } from "antd/es/input/TextArea";
import mStyles from "../../mComponents/TextArea.module.less";
import pcStyles from "./index.module.less";
import TextInput from "@/components/TextArea/TextInput";
import PDFInput from "@/components/TextArea/PDFInput";
import { dispatch } from "use-bus";
import Toast from "@/components/Toast";
import { FormattedMessage, useIntl } from "react-intl";
import { DEFAULT_INPUT_FUNCS } from "@/libs/constant";

const styles = onMobile ? mStyles : pcStyles;
interface ITextAreaProps {
  maxLength?: number;
  onSubmit: (val: string, inputType: string, options: any) => void;
  loading?: boolean;
  themeType?: string;
  isHome?: boolean;
  className?: string;
  wrapClassName?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  autoSize?: {
    minRows: number;
    maxRows: number;
  };
  autoFocus?: boolean;
  disableHistory?: boolean;
  value?: string;
  tools?: JSX.Element;
  currentCountClassName?: string;
  toolsClassName?: string;
  textareaClassName?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  addSession?: (val?: boolean) => void;
}

export interface ITextAreaRefProps {
  inputInstance: TextAreaRef | null;
  setTextValue: (val: string) => void;
  focus: () => void;
}

const ICON_MAP = {
  text_chat: "icon-a-wenbenlijie-hover",
  doc_chat: "icon-wendangjiexi1",
};

function TextArea(props, ref) {
  const [chatState, chatDispatchers] = store.useModel("app");
  const { maxLength, loading } = props;
  const [focus, setFocus] = useState(false);
  const contentRef = useRef(null);
  const [firstPopUp, setFirstPopUp] = useState(true);

  const inputRef = useRef(null as TextAreaRef | null);
  const textRef = useRef<any>(null);
  const pdfRef = useRef<any>(null);
  // 输入内容
  const [textValue, setTextValue] = useState(
    props.value || chatState?.inputText
  );
  const intl = useIntl();
  const cacheLoading = useRef(loading);
  const inputFuncList = window.pageConfig?.chatTabs || DEFAULT_INPUT_FUNCS;

  useEffect(() => {
    cacheLoading.current = loading;
  }, [loading]);

  useImperativeHandle(
    ref,
    () => ({
      inputInstance: inputRef.current,
      setTextValue: (val) => {
        textRef.current.setTextValue(val);
      },
      focus: () => {
        setTimeout(() => {
          textRef.current?.focus();
        }, 30);
      },
    }),
    [setTextValue]
  );

  useEffect(() => {
    props.onChange?.(textValue);
  }, [textValue]);

  const renderTabItems = () => {
    return inputFuncList.map((item) => ({
      label:
        item.type === "doc_chat" ? (
          <Popover
            mouseEnterDelay={firstPopUp ? 0 : 1.5}
            overlayClassName={styles.tipPop}
            showArrow={false}
            onOpenChange={(v) => {
              if (v) {
                setFirstPopUp(false);
              }
            }}
            content={
              <>
                <h3>
                  <FormattedMessage id="docsHelpTitle" />
                </h3>
                <p>
                  <FormattedMessage id="docsHelpText" />
                </p>
              </>
            }
          >
            <span className={styles.tabLabel}>
              <IconFont type={ICON_MAP[item.type]} />
              {item.title}
            </span>
          </Popover>
        ) : (
          <span className={styles.tabLabel}>
            <IconFont type={ICON_MAP[item.type]} />
            {item.title}
          </span>
        ),
      key: item.code,
    }));
  };

  const renderContent = () => {
    if (props.simple || !inputFuncList.length) return <TextInput setFocus={setFocus} {...props} ref={textRef} />;
    return (
      <>
        {inputFuncList.length > 1 && <Tabs
          className={styles.tabs}
          activeKey={chatState.sessionCode}
          onChange={(checkedValue) => {
            if (cacheLoading.current) {
              Toast.show({
                type: "warning",
                message: intl.formatMessage({ id: "loadingTip" }),
              });
              return;
            }
            textRef.current?.clear?.();
            pdfRef.current?.clear?.();

            dispatch("@@ui/TAB_CHANGE_ANIMATION");

            chatDispatchers.update({
              source: "new_top",
              sessionType: inputFuncList.find(vItem => vItem.code === checkedValue)?.type,
              sessionCode: checkedValue,
            });
            setTimeout(() => {
              props.addSession(false);
            }, 500);
          }}
          items={renderTabItems()}
        />}
        <TextInput {...props} ref={textRef} setFocus={setFocus} />
        <PDFInput {...props} ref={pdfRef} setFocus={setFocus} />
      </>
    );
  };
  return (
    <div
      className={classnames(styles.chatInput, props.wrapClassName, {
        [styles.focused]: focus,
        [styles.error]: maxLength <= textValue.length,
        [styles.disabled]: props.disabled,
        [styles.loading]: props.loading,
        [styles.singleModel]: inputFuncList.length <= 1 || props.simple,
      })}
      ref={contentRef}
      onMouseUp={() => {
        inputRef.current?.focus();
      }}
    >
      {renderContent()}
    </div>
  );
}

export default forwardRef<ITextAreaRefProps, ITextAreaProps>(TextArea);
