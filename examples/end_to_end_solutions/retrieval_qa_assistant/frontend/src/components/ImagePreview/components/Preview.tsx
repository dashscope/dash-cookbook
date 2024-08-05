import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Portal from '@rc-component/portal';
import classnames from 'classnames';
import type { DialogProps as IDialogPropTypes } from 'rc-dialog';
import Dialog from 'rc-dialog';
import CSSMotion from 'rc-motion';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import KeyCode from 'rc-util/lib/KeyCode';
import { warning } from 'rc-util/lib/warning';

import useClassNames from '@/hooks/useClassNames';
import { isMobile } from '@/libs/utils';

import IconFont from '@/components/IconFont';

import useImageTransform from '@/hooks/useImageTransform';
import { placeholderImg } from '@/libs/constant';
import getFixScaleEleTransPosition from '../utils/getFixScaleEleTransPosition';
import Operations from './Operations';
import { BASE_SCALE_RATIO, WHEEL_MAX_SCALE_RATIO } from '@/hooks/useImageTransform';
import { context } from './PreviewGroup';

import '../index.less';
import { FormattedMessage } from 'react-intl';

export interface PreviewProps extends Omit<IDialogPropTypes, 'onClose'> {
  onClose?: (e: React.SyntheticEvent<Element>) => void;
  src?: string;
  alt?: string;
  rootClassName?: string;
  icons?: {
    rotateLeft?: React.ReactNode;
    rotateRight?: React.ReactNode;
    zoomIn?: React.ReactNode;
    zoomOut?: React.ReactNode;
    close?: React.ReactNode;
    left?: React.ReactNode;
    right?: React.ReactNode;
    flipX?: React.ReactNode;
    flipY?: React.ReactNode;
  };
  countRender?: (current: number, total: number) => string;
  scaleStep?: number;
  taskResult?: any;
  updata?: any;
}

const ImageComp = forwardRef((props: any, ref: any) => {
  const { prefixCls, changeImageStatus, ...restProps } = props;
  const [imageStatus, setImageStatus] = useState('loading');
  const imgRef = useRef(null as HTMLImageElement | null);
  const { addPrefix } = useClassNames(
    `custom-markdown${isMobile() ? '-mobile' : ''}`
  );
  useImperativeHandle(ref, () => ({
    imgRef,
  }));

  useEffect(() => {
    changeImageStatus(imageStatus);
  }, [imageStatus]);

  useEffect(() => {
    setImageStatus('loading');
  }, [restProps.src]);

  return (
    <div>
      {imageStatus === 'loading' ? (
        <div
          className={`${prefixCls}-img-loading`}
          style={{ width: props.width, height: props.height }}
        >
          <IconFont type="icon-loading" />
        </div>
      ) : null}
      {imageStatus === 'error' ? (
        <div className={`${prefixCls}-img-errorPic`}>
          <img
            src={placeholderImg}
            alt=""
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          />
          <div className={addPrefix('previewCon')}>
            <IconFont type="icon-tupianzoudiu" />
            <span><FormattedMessage id="imageLoadErr"/></span>
          </div>
        </div>
      ) : null}
      <img
        ref={imgRef}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
        className={classnames(
          `${prefixCls}-img`,
          addPrefix('previewImg'),
          imageStatus !== 'normal' ? `${prefixCls}-loading` : ''
        )}
        onLoad={() => {
          setImageStatus('normal');
        }}
        onError={(error) => {
          console.log('error', error);
          setImageStatus('error');
        }}
        {...restProps}
      />
    </div>
  );
});

const Preview: React.FC<PreviewProps> = (props) => {
  const {
    prefixCls,
    src,
    alt,
    onClose,
    visible,
    icons = {},
    rootClassName,
    getContainer,
    countRender,
    scaleStep = 0.5,
    transitionName = 'zoom',
    maskTransitionName = 'fade',
    taskResult,
    updata,
    ...restProps
  } = props;
  const imgRef = useRef<any>();
  const downPositionRef = useRef({
    deltaX: 0,
    deltaY: 0,
    transformX: 0,
    transformY: 0,
  });
  const [isMoving, setMoving] = useState(false);
  const { previewUrls, current, isPreviewGroup, setCurrent } =
    useContext(context);
  const [feedBackVisible, setFeedBackVisible] = useState(false);
  const [imageStatus, setImageStatus] = useState('loading');
  const previewGroupCount = previewUrls.size;
  const previewUrlsKeys = Array.from(previewUrls.keys());
  const currentPreviewIndex = previewUrlsKeys.indexOf(current!);
  const combinationSrc = isPreviewGroup ? previewUrls.get(current!)?.url : src;
  const showLeftOrRightSwitches = isPreviewGroup && previewGroupCount > 1;
  const showOperationsProgress = isPreviewGroup && previewGroupCount >= 1;
  const { transform, resetTransform, updateTransform, dispatchZoomChange } =
    useImageTransform(imgRef.current?.imgRef);
  const { rotate, scale } = transform;
  const wrapClassName = classnames({
    [`${prefixCls}-moving`]: isMoving,
  });
  const { addPrefix } = useClassNames(
    `custom-markdown${isMobile() ? '-mobile' : ''}`
  );

  const onAfterClose = () => {
    resetTransform();
  };

  const onZoomIn = () => {
    dispatchZoomChange(BASE_SCALE_RATIO + scaleStep);
  };

  const onZoomOut = () => {
    dispatchZoomChange(BASE_SCALE_RATIO - scaleStep);
  };

  const onRotateRight = () => {
    // updateTransform({ rotate: rotate + 90 });
    console.log('onRotateRight');
    resetTransform();
  };

  const onRotateLeft = () => {
    updateTransform({ rotate: rotate - 90 });
  };

  const onFlipX = () => {
    updateTransform({ flipX: !transform.flipX });
  };

  const onFlipY = () => {
    updateTransform({ flipY: !transform.flipY });
  };

  const onSwitchLeft: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentPreviewIndex > 0) {
      setCurrent(previewUrlsKeys[currentPreviewIndex - 1]);
    }
  };

  const onSwitchRight: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentPreviewIndex < previewGroupCount - 1) {
      setCurrent(previewUrlsKeys[currentPreviewIndex + 1]);
    }
  };

  const onMouseUp: React.MouseEventHandler<HTMLBodyElement> = () => {
    if (visible && isMoving) {
      setMoving(false);

      /** No need to restore the position when the picture is not moved, So as not to interfere with the click */
      const { transformX, transformY } = downPositionRef.current;
      const hasChangedPosition =
        transform.x !== transformX && transform.y !== transformY;
      if (!hasChangedPosition) {
        return;
      }

      const width = imgRef.current!.imgRef.current!.offsetWidth * scale;
      const height = imgRef.current!.imgRef.current!.offsetHeight * scale;
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { left, top } =
        imgRef.current!.imgRef.current!.getBoundingClientRect();
      const isRotate = rotate % 180 !== 0;
      // eslint-disable-next-line no-unsafe-optional-chaining
      const fixState = getFixScaleEleTransPosition(
        isRotate ? height : width,
        isRotate ? width : height,
        left,
        top
      );

      if (fixState) {
        updateTransform({ ...fixState });
      }
    }
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    // Only allow main button
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    downPositionRef.current = {
      deltaX: event.pageX - transform.x,
      deltaY: event.pageY - transform.y,
      transformX: transform.x,
      transformY: transform.y,
    };
    setMoving(true);
  };

  const onMouseMove: React.MouseEventHandler<HTMLBodyElement> = (event) => {
    if (visible && isMoving) {
      updateTransform({
        x: event.pageX - downPositionRef.current.deltaX,
        y: event.pageY - downPositionRef.current.deltaY,
      });
    }
  };

  const onWheel = (event: React.WheelEvent<HTMLImageElement>) => {
    if (!visible || event.deltaY == 0) return;
    // Scale ratio depends on the deltaY size
    const scaleRatio = Math.abs(event.deltaY / 100);
    // Limit the maximum scale ratio
    const mergedScaleRatio = Math.min(scaleRatio, WHEEL_MAX_SCALE_RATIO);
    // Scale the ratio each time
    let ratio = BASE_SCALE_RATIO + mergedScaleRatio * scaleStep;
    if (event.deltaY > 0) {
      ratio = BASE_SCALE_RATIO / ratio;
    }
    dispatchZoomChange(ratio, event.clientX, event.clientY);
  };

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!visible || !showLeftOrRightSwitches) return;

      if (event.keyCode === KeyCode.LEFT) {
        if (currentPreviewIndex > 0) {
          setCurrent(previewUrlsKeys[currentPreviewIndex - 1]);
        }
      } else if (event.keyCode === KeyCode.RIGHT) {
        if (currentPreviewIndex < previewGroupCount - 1) {
          setCurrent(previewUrlsKeys[currentPreviewIndex + 1]);
        }
      }
    },
    [
      currentPreviewIndex,
      previewGroupCount,
      previewUrlsKeys,
      setCurrent,
      showLeftOrRightSwitches,
      visible,
    ]
  );

  const onDoubleClick = (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    if (visible) {
      if (scale !== 1) {
        updateTransform({ x: 0, y: 0, scale: 1 });
      } else {
        dispatchZoomChange(
          BASE_SCALE_RATIO + scaleStep,
          event.clientX,
          event.clientY
        );
      }
    }
  };

  const onWheelCb = (event) => {
    // console.log('mousewheel',event);
    event.preventDefault();
    // if(event.ctrlKey){
    //   event.preventDefault();
    // }
  };

  useEffect(() => {
    let onTopMouseUpListener;
    let onTopMouseMoveListener;
    let onWheelListener;
    if (!isMobile()) {
      onWheelListener = addEventListener(window, 'wheel', onWheelCb, {
        passive: false,
      });
    }

    const onMouseUpListener = addEventListener(
      window,
      'mouseup',
      onMouseUp,
      false
    );
    const onMouseMoveListener = addEventListener(
      window,
      'mousemove',
      onMouseMove,
      false
    );
    const onKeyDownListener = addEventListener(
      window,
      'keydown',
      onKeyDown,
      false
    );

    try {
      // Resolve if in iframe lost event
      /* istanbul ignore next */
      if (window.top !== window.self) {
        onTopMouseUpListener = addEventListener(
          window.top,
          'mouseup',
          onMouseUp,
          false
        );
        onTopMouseMoveListener = addEventListener(
          window.top,
          'mousemove',
          onMouseMove,
          false
        );
      }
    } catch (error) {
      /* istanbul ignore next */
      warning(false, `[rc-image] ${error}`);
    }

    if (!visible) {
      onWheelListener?.remove();
    }

    return () => {
      onMouseUpListener.remove();
      onMouseMoveListener.remove();
      onKeyDownListener.remove();
      /* istanbul ignore next */
      onTopMouseUpListener?.remove();
      /* istanbul ignore next */
      onTopMouseMoveListener?.remove();
      onWheelListener?.remove();
    };
  }, [visible, isMoving, onKeyDown]);

  // console.log(isMobile() && visible, '>>>visible');s

  return (
    <>
      <Dialog
        transitionName={transitionName}
        maskTransitionName={maskTransitionName}
        closable={false}
        keyboard
        prefixCls={prefixCls}
        onClose={(event) => {
          if (feedBackVisible) {
            return;
          }
          onClose?.(event);
        }}
        visible={visible}
        wrapClassName={wrapClassName}
        rootClassName={rootClassName}
        getContainer={getContainer}
        {...restProps}
        afterClose={onAfterClose}
      >
        <div
          className={classnames(
            `${prefixCls}-img-wrapper`,
            addPrefix('imgWrapper')
          )}
        >
          {isMobile() ? (
            <>
              <Swiper
                onActiveIndexChange={(e) => {
                  setCurrent(previewUrlsKeys[e.realIndex]);
                  resetTransform();
                }}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                activeIndex={previewUrls.get(current!)?.realIndex}
              >
                {previewUrlsKeys.map((item, index) => (
                  <SwiperSlide key={index}>
                    <ImageComp
                      width={props.width}
                      height={props.height}
                      onWheel={onWheel}
                      onMouseDown={onMouseDown}
                      onDoubleClick={onDoubleClick}
                      ref={imgRef}
                      changeImageStatus={setImageStatus}
                      prefixCls={prefixCls}
                      alt={alt}
                      style={{
                        maxHeight:
                          window.innerHeight - (280 / 750) * window.innerWidth,
                        transform:
                          item === current
                            ? `translate3d(${transform.x}px, ${
                                transform.y
                              }px, 0) scale3d(${
                                transform.flipX ? '-' : ''
                              }${scale}, ${
                                transform.flipY ? '-' : ''
                              }${scale}, 1) rotate(${rotate}deg)`
                            : '',
                      }}
                      src={previewUrls.get(item)?.url}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          ) : (
            <>
              <ImageComp
                prefixCls={prefixCls}
                width={props.width}
                height={props.height}
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onDoubleClick={onDoubleClick}
                changeImageStatus={setImageStatus}
                ref={imgRef}
                src={combinationSrc}
                alt={alt}
                style={{
                  transform: `translate3d(${transform.x}px, ${
                    transform.y
                  }px, 0) scale3d(${transform.flipX ? '-' : ''}${scale}, ${
                    transform.flipY ? '-' : ''
                  }${scale}, 1) rotate(${rotate}deg)`,
                }}
              />
            </>
          )}
        </div>
      </Dialog>
      <CSSMotion
        visible={visible && isMobile()}
        motionName={maskTransitionName}
      >
        {({ className, style }) => (
          <Portal open getContainer={getContainer ?? document.body}>
            <div className={classnames(className)} style={style}>
              <div className={addPrefix('count')}>
                {(previewUrls.get(current!)?.realIndex || 0) + 1}/
                {previewUrlsKeys.length}
              </div>
              <div className={addPrefix('page')}>
                {previewUrlsKeys.map((item, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      setCurrent(item);
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={classnames(addPrefix('pageItem'), {
                      [addPrefix('activeItem')]:
                        index === previewUrls.get(current!)?.realIndex,
                    })}
                  />
                ))}
              </div>
            </div>
          </Portal>
        )}
      </CSSMotion>
      <Operations
        visible={visible}
        maskTransitionName={maskTransitionName}
        getContainer={getContainer}
        prefixCls={prefixCls}
        rootClassName={rootClassName}
        icons={icons}
        countRender={countRender}
        showSwitch={!!showLeftOrRightSwitches}
        showProgress={!!showOperationsProgress}
        current={currentPreviewIndex}
        count={previewGroupCount}
        scale={scale}
        onSwitchLeft={onSwitchLeft}
        onSwitchRight={onSwitchRight}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onRotateRight={onRotateRight}
        onRotateLeft={onRotateLeft}
        onFlipX={onFlipX}
        onFlipY={onFlipY}
        onClose={onClose}
        hiddenFeedback={imageStatus === 'error'}
        disabled={imageStatus === 'error'}
        taskResult={taskResult}
        updata={updata}
        feedBackFormVisibleOnChange={setFeedBackVisible}
        combinationSrc={combinationSrc}
      />
    </>
  );
};

export default Preview;
