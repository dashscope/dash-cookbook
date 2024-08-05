import IconFont from '@/components/IconFont';
import cls from 'classnames';
import React from 'react';
import styles from './index.module.less';
import store from '@/store';

export interface ChatHeaderProps {
  className?: string;
  style?: React.CSSProperties;
  addEvent?: () => void;
  logoClick?: () => void;
  showFeedback?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  className,
  style,
  addEvent,
  logoClick,
}) => {
  const [appState] = store.useModel("app");
  return (
    <>
      <div className={cls(styles.head, className)} style={style}>
        <img
          onClick={() => {
            logoClick && logoClick();
          }}
          className={styles.logo}
          src={appState.pageConfig.headerLogo}
        />
        <div className={styles.right}>
          {addEvent && (
            <div className={styles.but}>
              <IconFont type="icon-xinzeng_default" onClick={addEvent} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
