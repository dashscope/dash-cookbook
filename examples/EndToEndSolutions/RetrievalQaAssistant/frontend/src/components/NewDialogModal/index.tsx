/* eslint-disable no-negated-condition */
import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { isMobile } from '../../libs/utils';
import IconFont from '../IconFont';

import mStyles from '../../mComponents/NewDialogModal.module.less';
import pcStyles from './index.module.less';
import NewButton from '../NewButton';

const styles = isMobile() ? mStyles : pcStyles;

interface IProps {
  visible?: boolean;
  children?: React.ReactNode;
  title?: React.ReactNode;
  contentClassName?: string;
  childWrappClassName?: string;
  footerClassName?: string;
  onCancel?: () => void;
  showCloseIcon?: boolean;
  footer?: React.ReactNode;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  disabledMaskClose?: boolean;
  showCancelBtn?: boolean;
}

const hidden = () => {
  const rootEle = document.body.querySelector(
    '#ice-container',
  ) as HTMLDivElement;
  if (rootEle) rootEle.style.filter = 'blur(0px)';
  if (document.querySelector('div[role=alert-biz-modal]')) {
    document.body.removeChild(
      document.querySelector('div[role=alert-biz-modal]') as HTMLDivElement,
    );
  }
};

export function NewDialogModal(props: IProps) {
  const { disabledMaskClose, onOk, footer, title, onCancel } = props;
  return (
    <div className={classnames(styles.modal)}>
      <div
        onClick={() => {
          if (disabledMaskClose) return;
          hidden();
        }}
        className={styles.mask}
      />
      <div className={classnames(styles.modalCon, props.contentClassName)}>
        <div className={styles.title}>{title}</div>
        {props.showCloseIcon && (
          <IconFont
            onClick={onCancel}
            className={classnames(styles.hiddenIcon)}
            type="icon-guanbi"
          />
        )}
        {props.children ? (
          <div
            className={classnames(styles.content, props.childWrappClassName)}
          >
            {props.children}
          </div>
        ) : null}
        {footer !== undefined ? (
          footer
        ) : (
          <div
            className={classnames(
              styles.footer,
              props.footerClassName,
              props.showCancelBtn && styles.showCancelBtn,
            )}
          >
            {props.showCancelBtn && (
              <NewButton
                className={styles.cancelBtn}
                onClick={() => {
                  if (onCancel) onCancel();
                }}
              >
                {props.cancelText || '取消'}
              </NewButton>
            )}
            <NewButton
              type="primary"
              className={styles.okBtn}
              onClick={() => {
                if (onOk) onOk();
              }}
            >
              {props.okText || '确定'}
            </NewButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default {
  show: (props: IProps) => {
    if (document.querySelector('div[role=alert-biz-modal]')) {
      document.body.removeChild(
        document.querySelector('div[role=alert-biz-modal]') as HTMLDivElement,
      );
    }

    const ele = document.createElement('div');
    ele.setAttribute('role', 'alert-biz-modal');
    document.body.appendChild(ele);
    const root = ReactDOM.createRoot(ele);
    
    root.render(
      <NewDialogModal key={new Date().valueOf()} {...props} />,
    );

    return () => {
      root.unmount();
      ele.remove();
    };
  },

  hide: () => {
    hidden();
  },
};
