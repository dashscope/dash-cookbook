import React from 'react';
import styles from './index.module.less';
import cls from 'classnames';
import { onMobile } from '@/libs/utils';

export function CardCut({
  children,
  className = '',
  onClick = () => {},
}) {
  return (
    <>
      <div
        className={cls(className, {
          [styles.noBoxShadow]: onMobile,
        })}
        onClick={onClick}
      >
        <div className={cls(styles.content)}>{children}</div>
      </div>
    </>
  );
}

export default React.memo(CardCut);
