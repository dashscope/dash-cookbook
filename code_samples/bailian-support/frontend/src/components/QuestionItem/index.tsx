import cls from 'classnames';
import { useEffect, useState } from 'react';
import MarkdownComponent from '../MarkdownComp';
import Chat from '@/libs/chatSDK/chat';
import { onMobile } from '@/libs/utils';
import store from '@/store';
import { IChatNode } from '@/types/serivce';
import mStyles from '../../mComponents/QuestionItem.module.less';
import { CardCut } from '../CardCut';
import IconFont from '../IconFont';
import Pagination from '../Pagination';
import SimpleTextArea from '../TextArea';
import Toast from '../Toast';
import pcStyles from './index.module.less';
import { Tooltip } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
const styles = onMobile ? mStyles : pcStyles;

const TextArea = SimpleTextArea;
interface IQuestionItemProps {
  text: string;
  peerCount: number;
  current: number;
  node: IChatNode;
  chat: Chat;
  onSwitchNode: (current: number) => void;
  onFocus: (focus: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
  noAvatar?: boolean;
}

export default function QuestionItem(props: IQuestionItemProps) {
  const { peerCount, current, onFocus } = props;
  const [chatState, chatDispatchers] = store.useModel('app');
  const [isEdit, setIsEdit] = useState(false);
  const [text, setText] = useState(props.text);
  const [focus, setFocus] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    setText(props.text);
  }, [props.text]);

  useEffect(() => {
    if (!onMobile) return;
    onFocus(focus);
  }, [focus]);

  const handleCancel = () => {
    setIsEdit(false);
    chatDispatchers.update({ questionIsEdit: false });
  };

  const handleSubmit = () => {
    if (text === props.text) {
      return;
    }
    if (!text?.trim()) {
      setText(props.text);
      handleCancel();
      return;
    }
    props.chat.modifyGenerate(props.node.msgId, text);
    chatDispatchers.update({ loading: true, questionIsEdit: false });
  };

  const handleEdit = () => {
    if (props.loading || props.disabled) {
      return;
    }
    if (chatState.questionIsEdit) {
      Toast.show({
        type: 'warning',
        message: intl.formatMessage({ id: "loadingEdit" }),
      });
      return;
    }
    if (peerCount >= 5) {
      Toast.show({ type: 'warning', message: intl.formatMessage({ id: "questionEditDisabledTip" }) });
      return;
    }
    setIsEdit(true);
    chatDispatchers.update({ questionIsEdit: true });
  };

  return (
    <div className={styles.questionItem}>
      <div
        className={cls(styles.questionContent, {
          [styles.noAvatar]: props.noAvatar,
          [styles.edit]: isEdit,
        })}
      >
        {props.noAvatar ? null : (
          <div className={styles.avatar}>
            <IconFont type="icon-zhanghaoguanli_default" />
          </div>
        )}
        <div className={styles.content}>
          {isEdit ? (
            <CardCut
              className={cls(styles.wrapTextArea)}
            >
              <TextArea
                simple={true}
                onSubmit={handleSubmit}
                wrapClassName={styles.textareaWrapper}
                currentCountClassName={styles.currentCount}
                textareaClassName={styles.textarea}
                maxLength={5500}
                onChange={(val) => setText(val)}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                autoFocus
                autoSize={
                  onMobile
                    ? {
                        maxRows: 3,
                        minRows: 1,
                      }
                    : {
                        maxRows: 4,
                        minRows: 1,
                      }
                }
                disableHistory
                value={text}
                toolsClassName={styles.tools}
                tools={
                  <div
                    className={cls(styles.btnGroup, {
                      [styles.disabled]: props.loading,
                    })}
                  >
                    <div
                      onClick={() => {
                        setText(props.text);
                        handleCancel();
                      }}
                      className={styles.btn}
                    >
                      <IconFont
                        className={styles.icon}
                        type="icon-quxiao_default"
                      />
                    </div>
                    <div onClick={handleSubmit} className={styles.btn}>
                      <IconFont
                        className={cls(
                          styles.icon,
                          props.text === text && styles.disabled,
                        )}
                        type="icon-queren_default"
                      />
                    </div>
                  </div>
                }
              />
            </CardCut>
          ) : (
            <MarkdownComponent
              text={text}
              markdownFontSize="qianwen"
              disableRenderHtml
            />
          )}
        </div>
        {isEdit || chatState.sessionType !== 'text_chat' ? null : (
          <div
            onClick={handleEdit}
            className={cls(styles.editBtn, {
              [styles.showBtn]: onMobile,
              [styles.disabled]:
                props.loading ||
                props.disabled ||
                chatState.questionIsEdit ||
                peerCount >= 5,
            })}
          >
            <Tooltip
              title={peerCount >= 5 ? <FormattedMessage id="reEditDisabledTip" /> : <FormattedMessage id="reEdit" />}
              placement="top"
              overlayClassName={styles.tooltip}
            >
              <IconFont type="icon-bianji_default" className={styles.icon} />
            </Tooltip>
          </div>
        )}
        {peerCount > 1 && !isEdit && (
          <Pagination
            className={styles.page}
            disabled={props.loading}
            total={peerCount}
            current={current}
            onChange={(c) => {
              props.onSwitchNode(c);
            }}
          />
        )}
      </div>
    </div>
  );
}
