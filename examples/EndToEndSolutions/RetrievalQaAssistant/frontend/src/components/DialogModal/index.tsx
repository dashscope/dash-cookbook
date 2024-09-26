import classnames from "classnames";
import ReactDOM from "react-dom/client";
import IconFont from "../IconFont";
import { isMobile } from "../../libs/utils";

import pcStyles from "./index.module.less";
import mStyles from "../../mComponents/DialogModal.module.less";
console.log('onMobile',isMobile())
const styles = isMobile() ? mStyles : pcStyles;

interface IProps {
  visible: boolean;
  children?: JSX.Element;
  contentClassName?: string;
  onCancel?: () => void;
  title?: string;
  disabledMaskClose?: boolean;
  showCancelBtn?: boolean;
}

const hidden = () => {
  const rootEle = document.body.querySelector(
    "#ice-container"
  ) as HTMLDivElement;
  if (rootEle) rootEle.style.filter = "blur(0px)";
  if (document.querySelector("div[role=alert-biz-modal]")) {
    document.body.removeChild(
      document.querySelector("div[role=alert-biz-modal]") as HTMLDivElement
    );
  }
};

export function DialogModal(props: IProps) {
  const { title, disabledMaskClose,contentClassName } = props;
  return (
    <div
      className={classnames(styles.modal, { [styles.hidden]: !props.visible })}
    >
      <div
        onClick={() => {
          if (disabledMaskClose) return;
          hidden();
        }}
        className={styles.mask}
      />
      <div className={classnames(styles.modalCon, contentClassName)}>
        {title && (
          <div className={styles.title}>
            {title}
            {props.onCancel && (
              <IconFont
                onClick={props.onCancel}
                className={styles.closeIcon}
                type="icon-guanbi"
              />
            )}
          </div>
        )}
        {
          props.showCancelBtn && (
            <IconFont
              onClick={props.onCancel}
              className={classnames(styles.hiddenIcon)}
              type="icon-guanbi"
            />
          )
        }
        {props.children}
      </div>
    </div>
  );
}

export default {
  show: (props: any) => {
    if (document.querySelector("div[role=alert-biz-modal]")) {
      document.body.removeChild(
        document.querySelector("div[role=alert-biz-modal]") as HTMLDivElement
      );
    }

    const ele = document.createElement("div");

    ele.setAttribute("role", "alert-biz-modal");
    document.body.appendChild(ele);
    const rootEle = document.body.querySelector(
      "#ice-container"
    ) as HTMLDivElement;
    if (rootEle) rootEle.style.filter = "blur(20px)";
    ReactDOM.createRoot(ele).render(
      <DialogModal key={new Date().valueOf()} {...props} />
    );
  },

  hide: () => {
    hidden();
  },
};
