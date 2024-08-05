import React from 'react';
import cls from 'classnames';
import styles from './index.module.less';
import store from '@/store';

export interface ChatHeaderProps {
  onLogoClick?: () => void;
  className?: string;
  showExtra?: boolean;
  style?: React.CSSProperties;
  subTitle?: React.ReactNode;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  subTitle,
  onLogoClick,
  className,
  style,
}) => {
  const [appState] = store.useModel("app");
  return (
    <div className={cls(styles.head, styles.newHead, className)} style={style}>
      <div className={styles.logo}>
        <img
          src={appState.pageConfig.headerLogo}
          alt=""
          onClick={() => {
            if (onLogoClick) {
              onLogoClick();
            } else {
              location.hrefTo('/');
            }
          }}
        />
        {subTitle && (
          <div className={cls('second-text', styles.logoText)}>{subTitle}</div>
        )}
      </div>
    </div>
  );
};
