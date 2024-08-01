/* eslint-disable react/display-name */
import classNames from "classnames";
import { useRef } from "react";
import { CardCut } from "../CardCut";

import styles from "./index.module.less";

interface ButtonProps {
  type?: "default" | "primary" | "link" | "border" | "border-special";
  size?: "large" | "small" | "default";
  className?: string;
  disabled?: boolean;
  href?: string;
  icon?: any;
  triangleWidth?: number;
  themeColor?: string;
  [attr: string]: any;
}

export default (props: ButtonProps) => {
  const {
    type = "default",
    className,
    disabled,
    themeColor,
    size = "default",
    children,
    href,
    icon,
    triangleWidth,
    ...restProps
  } = props;

  const buttonRef = useRef(null as HTMLButtonElement | null);

  const classes = classNames(styles.btn, className, {
    [`${styles[type]}`]: type,
    [`${styles[size]}`]: size,
    [styles["disabled"]]: disabled,
  });

  if (props.themeColor === "white") {
    return (
      <CardCut
        className={classNames(styles.btn, styles.whiteBtn, className, {
          [`${styles[type]}`]: type,
          [`${styles[size]}`]: size,
        })}
      >
        <button
          className={styles.btn}
          ref={buttonRef}
          disabled={disabled}
          {...restProps}
        >
          {children}
          {icon && <span className={styles.iconWrap}>{icon}</span>}
        </button>
      </CardCut>
    );
  }

  if (type === "border-special") {
    return (
      <CardCut
        className={classNames(styles.btn, className, {
          [`${styles[type]}`]: type,
          [`${styles[size]}`]: size,
        })}
      >
        <button
          className={styles.btn}
          ref={buttonRef}
          disabled={disabled}
          {...restProps}
        >
          {children}
          {icon && <span className={styles.iconWrap}>{icon}</span>}
        </button>
      </CardCut>
    );
  }

  if (type === "link" && href) {
    return (
      <a className={classes} href={href} {...restProps}>
        {children} {icon}
      </a>
    );
  } else {
    return (
      <button
        ref={buttonRef}
        className={classes}
        disabled={disabled}
        {...restProps}
      >
        {children}
        {icon && <span className={styles.iconWrap}>{icon}</span>}
      </button>
    );
  }
};
