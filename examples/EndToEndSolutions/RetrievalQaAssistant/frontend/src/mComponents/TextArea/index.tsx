import { TextArea, TextAreaRef } from 'antd-mobile';
import styles from './index.module.less';
import IconFont from '@/components/IconFont';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import cls from 'classnames';
import { scorllToEnd } from '@/libs/utils';
import Toast from '@/components/Toast';
import { FormattedMessage, useIntl } from 'react-intl';
interface Iprops {
  disabled?: boolean;
  onSubmit: (value: string) => void;
  loading: boolean;
}
export default forwardRef((props: Iprops, ref) => {
  const MAX_LEN = 1000;
  const { disabled, onSubmit, loading } = props;
  const inputRef = useRef<TextAreaRef>(null);
  const [value, setValue] = useState('');
  const stop = useRef(false);
  const [count, setCount] = useState(0);
  const intl = useIntl();

  useImperativeHandle(ref, () => ({
    setTextValue: (v: string) => {
      setValue(v);
      setTextCount(v)
      inputRef.current?.focus();
    },
  }));
  
  const setTextCount = (str: string) => {
    setCount(str.length > 1000 ? 1000 : str.length);
  };

  const submit = () => {
    if (!value?.trim()) return;
    onSubmit(value.trim());
    setValue('');
    setTextCount('');
  };
  return (
    <div
      className={cls(styles.TextAreaBox, disabled && styles.disabled)}
      onClick={(e) => {
        if (loading) {
          Toast.show({ type: 'loading', message: intl.formatMessage({ id: "loadingTip" }) });
          e.stopPropagation();
        }
      }}
    >
      <TextArea
        maxLength={MAX_LEN}
        ref={inputRef}
        value={value}
        onChange={(v) => {
          if (!stop.current) {
            // 计算非中文的字数
            setTextCount(v);
          }
          setValue(v);
        }}
        onCompositionStart={(e) => {
          stop.current = true;
        }}
        onCompositionEnd={(e) => {
          stop.current = false;
          // 同步中文字数
          setTextCount(value);
        }}
        onFocus={scorllToEnd}
        onBlur={() => {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 50);
        }}
        placeholder={intl.formatMessage({ id: "textPlaceholder" })}
        disabled={disabled}
        rows={1}
        autoSize={{
          minRows: 1,
          maxRows: 3,
        }}
      />
      <div className={styles.tools}>
        <>
          {count}/{MAX_LEN}
        </>
        <div className={styles.but} onClick={submit}>
          <FormattedMessage id="mobileEnter" />
          <IconFont type="icon-fasong_default" />
        </div>
      </div>
    </div>
  );
});
