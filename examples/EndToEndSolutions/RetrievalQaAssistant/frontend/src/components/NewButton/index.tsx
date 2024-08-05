import React from 'react';
import classnames from 'classnames';
import { Button as MButton } from 'antd-mobile';
import { onMobile } from '@/libs/utils';
import mStyles from '../../mComponents/NewButton.module.less';
import pcStyles from './index.module.less';

const styles = onMobile ? mStyles : pcStyles;

export interface NewButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: 'primary' | 'default';
  size?: 'small' | 'middle' | 'large';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const NewButton: React.FC<NewButtonProps> = (props) => {
  const { onClick, type, className, children, disabled, size, ...restProps } =
    props;
  if (onMobile) {
    return (
      <MButton
        className={classnames(className, styles.button, {
          [styles.primary]: type === 'primary',
        })}
        onClick={onClick}
        disabled={disabled}
        {...restProps}
      >
        {children}
      </MButton>
    );
  }
  return (
    <button
      className={classnames(className, styles.button, {
        [styles.primary]: type === 'primary',
        [styles.disabled]: disabled || props.loading,
        [styles.small]: size === 'small',
      })}
      disabled={disabled}
      onClick={(e) => {
          console.log('props.loading',props.loading);
        if (disabled || props.loading) {
          return;
        }
        onClick?.(e);
      }}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default NewButton;
