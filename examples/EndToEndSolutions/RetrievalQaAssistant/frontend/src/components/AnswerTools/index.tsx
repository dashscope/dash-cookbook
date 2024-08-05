import IconFont from '@/components/IconFont';
import Toast from '@/components/Toast';
import classnames from 'classnames';
import { useRef } from 'react';

import { Tooltip } from 'antd';
import { throttle } from 'lodash';
import { copy } from '@/libs/utils';
import styles from './index.module.less';
import Pagination from '../Pagination';
import store from '@/store';
import { FormattedMessage, useIntl } from 'react-intl';

export default (props) => {
  const {
    answerItem,
    text,
    disabled,
    peerCount,
    onSwitchNode,
    reRun,
    isLast,
  } = props;
  const {
    msgId,
    flushing: loading,
    interrupted,
    order,
  } = answerItem || {};
  const [chatState] = store.useModel('app');
  const containerRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();

  const handleCopy = () => {
    if (loading) return;
    copy(text);
    Toast.show({ type: 'success', message: intl.formatMessage({ id: "copySuccess" }) });
  };

  const handleReGenerate = throttle(() => {
    reRun();
  }, 3000);

  if (loading) {
    return (
      <div className={styles.tools}>
      </div>
    );
  }

  return (
    <div className={styles.tools} ref={containerRef}>
      {peerCount > 1 && (
        <Pagination
          disabled={loading}
          total={peerCount}
          current={order}
          onChange={onSwitchNode}
        />
      )}
      <div className={styles.leftArea}>
        {interrupted && <div className={styles.pauseTag}><FormattedMessage id="stopDesc" /></div>}
        <a className={styles.btn} onClick={() => {
          copy(answerItem.parentMsgId);
          Toast.show({ type: 'success', message: intl.formatMessage({ id: "copySuccess" }) });
        }}><FormattedMessage id="copyRequestId" /></a>
      </div>
      <div className={styles.rightArea}>
        {!disabled && (
          <>
            <Tooltip
              title={<FormattedMessage id="copy" />}
              overlayClassName={styles.tooltip}
              align={{ offset: [0, 4] }}
              trigger={'hover'}
              mouseEnterDelay={0.5}
            >
              <div className={classnames(styles.btn)} onClick={handleCopy}>
                <IconFont
                  type="icon-fuzhi_default"
                  className={classnames(styles.icon, loading && 'disable')}
                />
              </div>
            </Tooltip>
            {isLast && chatState.sessionType === 'text_chat' && (
              <Tooltip
                title={peerCount >= 5 ? <FormattedMessage id="regenerationMaxCount" /> : undefined}
                overlayClassName={styles.tooltip}
                placement="top"
              >
                <div
                  className={classnames(
                    styles.btn,
                    styles.reloadBtn,
                    peerCount >= 5 && styles.disabled,
                  )}
                  onClick={handleReGenerate}
                >
                  <IconFont
                    className={classnames(styles.icon)}
                    type="icon-zhongxinshengcheng_default"
                  />
                  <span><FormattedMessage id="regeneration" /></span>
                </div>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
};
