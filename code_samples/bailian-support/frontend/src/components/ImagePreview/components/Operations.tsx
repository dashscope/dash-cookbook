import * as React from 'react';
import Portal from '@rc-component/portal';
import classnames from 'classnames';
import CSSMotion from 'rc-motion';

import useClassNames from '@/hooks/useClassNames';
import { isMobile } from '@/libs/utils';

import BottomOperations from './BottomOperations';
import { RootContext } from './Image';
import type { PreviewProps } from './Preview';
import { MAX_SCALE, MIN_SCALE } from '@/hooks/useImageTransform';
import { ITaskType } from '../types';

import '../index.less';

interface OperationsProps
  extends Pick<
    PreviewProps,
    | 'visible'
    | 'maskTransitionName'
    | 'getContainer'
    | 'prefixCls'
    | 'rootClassName'
    | 'countRender'
    | 'onClose'
  > {
  icons: any;
  showSwitch: boolean;
  showProgress: boolean;
  current: number;
  count: number;
  scale: number;
  onSwitchLeft: React.MouseEventHandler<HTMLDivElement>;
  onSwitchRight: React.MouseEventHandler<HTMLDivElement>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateRight: () => void;
  onRotateLeft: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
  taskResult: any;
  updata: any;
  feedBackFormVisibleOnChange?: (val: boolean) => void;
  hiddenFeedback?: boolean;
  disabled?: boolean;
  taskType?: ITaskType;
  showLikeBtn?: boolean;
  Appraise?: React.ReactDOM;
  combinationSrc?: string;
}

const Operations: React.FC<OperationsProps> = (props) => {
  const {
    visible,
    maskTransitionName,
    getContainer,
    prefixCls,
    rootClassName,
    icons,
    countRender,
    showSwitch,
    hiddenFeedback,
    current,
    count,
    scale,
    onSwitchLeft,
    onSwitchRight,
    onClose,
    onZoomIn,
    onZoomOut,
    onRotateRight,
    taskResult,
    updata,
    taskType,
    Appraise,
    combinationSrc,
  } = props;
  const { addPrefix } = useClassNames(
    `custom-markdown${isMobile() ? '-mobile' : ''}`
  );
  const { rotateRight, zoomIn, zoomOut, close, left, right } = icons;
  const toolClassName = `${prefixCls}-operations-operation`;
  const iconClassName = `${prefixCls}-operations-icon`;
  const tools = [
    isMobile()
      ? null
      : {
          icon: close,
          onClick: onClose,
          type: 'close',
        },
  ].filter((item) => !!item);
  const bottomTools = [
    {
      icon: zoomIn,
      onClick: onZoomIn,
      type: 'zoomIn',
      disabled: scale === MAX_SCALE,
    },
    {
      icon: zoomOut,
      onClick: onZoomOut,
      type: 'zoomOut',
      disabled: scale === MIN_SCALE,
    },
    {
      icon: rotateRight,
      onClick: onRotateRight,
      type: 'rotateRight',
    },
  ];

  const renderOpt = ({ type, onClick, disabled, icon }: any) => {
    return (
      <li
        className={classnames(toolClassName, addPrefix('toolItem'), {
          [`${prefixCls}-operations-operation-${type}`]: true,
          [`${prefixCls}-operations-operation-disabled`]:
            !!disabled ||
            (['zoomIn', 'zoomOut', 'rotateRight'].includes(type) &&
              props.disabled),
        })}
        onClick={onClick}
        key={type}
      >
        {React.isValidElement(icon)
          ? React.cloneElement<{ className?: string }>(
              icon as React.ReactElement,
              {
                className: iconClassName,
              }
            )
          : icon}
      </li>
    );
  };

  const operations = (
    <>
      {showSwitch && !isMobile() && (
        <>
          <div
            className={classnames(`${prefixCls}-switch-left`, {
              [`${prefixCls}-switch-left-disabled`]: current === 0,
            })}
            onClick={onSwitchLeft}
          >
            {left}
          </div>
          <div
            className={classnames(`${prefixCls}-switch-right`, {
              [`${prefixCls}-switch-right-disabled`]: current === count - 1,
            })}
            onClick={onSwitchRight}
          >
            {right}
          </div>
        </>
      )}
      <ul
        className={classnames(`${prefixCls}-operations`, addPrefix('options'))}
      >
        {/* {showProgress && (
          <li className={`${prefixCls}-operations-progress`}>
            {countRender?.(current + 1, count) ?? `${current + 1} / ${count}`}
          </li>
        )} */}
        {tools.map((item, index) => {
          if (Array.isArray(item)) {
            return (
              <div key={index} className={`${prefixCls}-operations-section`}>
                {item.map((vItem) => renderOpt(vItem))}
              </div>
            );
          }
          return renderOpt(item);
        })}
      </ul>
      {hiddenFeedback && Appraise}
      <RootContext.Consumer>
        {({ downloadable }) => (
          <BottomOperations
            downloadUrl={combinationSrc!}
            downloadable={downloadable}
          >
            <div className={`${prefixCls}-operations-section`}>
              {bottomTools.map((vItem) => renderOpt(vItem))}
            </div>
          </BottomOperations>
        )}
      </RootContext.Consumer>
    </>
  );

  return (
    <CSSMotion visible={visible} motionName={maskTransitionName}>
      {({ className, style }) => (
        <Portal open getContainer={getContainer ?? document.body}>
          <div
            className={classnames(
              `${prefixCls}-operations-wrapper`,
              className,
              rootClassName
            )}
            style={style}
          >
            {operations}
          </div>
        </Portal>
      )}
    </CSSMotion>
  );
};

export default Operations;
