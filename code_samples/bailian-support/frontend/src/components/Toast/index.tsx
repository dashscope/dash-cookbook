import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { render } from 'react-dom';

import { TOAST_ICONS_MAP } from '@/libs/constant';

import IconFont from '../IconFont';

import pcStyles from './index.module.less';
import mStyles from '../../mComponents/Toast.module.less';
import { isMobile } from '@/libs/utils';
const styles = isMobile() ? mStyles : pcStyles;

interface IToastProps {
  message: string;
  type?: 'warning' | 'success' | 'error' | 'loading';
  duration?: number;
  center?: boolean;
}

export function Toast(props: IToastProps) {
  const { type = 'success', duration = 2000, center } = props;
  const timer = useRef(null as NodeJS.Timeout | null);
  const animateTimer = useRef(null as NodeJS.Timeout | null);
  const [visible, setVisible] = useState(true);
  const isChatPage = document.querySelector('#chat-layout-container');

  useEffect(() => {
    clearTimer();
    if (!visible) return;
    timer.current = setTimeout(() => {
      setVisible(false);
      clearTimer();
    }, duration);

    return () => {
      clearTimer();
    };
  }, []);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (animateTimer.current) {
      clearTimeout(animateTimer.current);
      animateTimer.current = null;
    }
  };

  if (!visible) return null;
  return (
    <div
      className={classnames(styles.toast, {
        [styles.centerInChat]: isChatPage && !center,
      })}
    >
      <IconFont
        className={classnames(styles.icon, styles[type])}
        type={TOAST_ICONS_MAP[type]}
      />
      {props.message}
    </div>
  );
}

let ele = null as HTMLDivElement | null;

export default {
  show: (props: IToastProps) => {
    if (!ele) {
      ele =
        document.querySelector('div[role=alert-toast]') ||
        document.createElement('div');
    }

    ele.setAttribute('role', 'alert-toast');
    document.body.appendChild(ele);
    render(<Toast key={new Date().valueOf()} {...props} />, ele);
  },
};
