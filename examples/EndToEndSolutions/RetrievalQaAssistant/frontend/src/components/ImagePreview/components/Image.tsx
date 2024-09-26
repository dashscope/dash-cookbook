import * as React from 'react';
import { createContext, useRef, useState } from 'react';
import { useInViewport } from 'ahooks';
import { message } from 'antd';
import cn from 'classnames';
import type { IDialogPropTypes } from 'rc-dialog/lib/IDialogPropTypes';
import { getOffset } from 'rc-util/lib/Dom/css';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import type { GetContainer } from 'rc-util/lib/PortalWrapper';

import useClassNames from '@/hooks/useClassNames';
import { isMobile } from '@/libs/utils';

import IconFont from '@/components/IconFont';

import { placeholderImg } from '@/libs/constant';
import type { PreviewProps } from './Preview';
import Preview from './Preview';
import PreviewGroup, { context, icons } from './PreviewGroup';
import { ITaskType } from '../types';

import '../index.less';
import { FormattedMessage } from 'react-intl';

export const RootContext = createContext<any>({ downloadable: false });
export interface ImagePreviewType
  extends Omit<
    IDialogPropTypes,
    | 'mask'
    | 'visible'
    | 'closable'
    | 'prefixCls'
    | 'onClose'
    | 'afterClose'
    | 'wrapClassName'
  > {
  src?: string;
  visible?: boolean;
  onVisibleChange?: (
    value: boolean,
    prevValue: boolean,
    currentIndex?: number
  ) => void;
  getContainer?: GetContainer | false;
  mask?: React.ReactNode;
  maskClassName?: string;
  icons?: PreviewProps['icons'];
  scaleStep?: number;
}

let uuid = 0;

export interface ImageProps
  extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    'placeholder' | 'onClick'
  > {
  // Original
  src?: string;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  prefixCls?: string;
  previewPrefixCls?: string;
  placeholder?: React.ReactNode;
  fallback?: string;
  rootClassName?: string;
  placeholderImgUrl?: string;
  preview?: boolean | ImagePreviewType;
  taskResult?: any;
  updata?: any;
  freshList?: any;
  taskType?: ITaskType;
  /**
   * @deprecated since version 3.2.1
   */
  onPreviewClose?: (value: boolean, prevValue: boolean) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  showLikeBtn?: boolean;
  task?: any;
  width?: number;
  height?: number;
  // hideSkeleton?: boolean;
  // setImageLoadedCnt?: React.Dispatch<React.SetStateAction<number>>;
  // setHideSkeleton?: React.Dispatch<React.SetStateAction<boolean>>;
  Appraise?: React.ReactDOM;
  addtionalOptions?: {
    downloadable?: boolean;
  };
}

interface CompoundedComponent<P> extends React.FC<P> {
  PreviewGroup: typeof PreviewGroup;
}

type ImageStatus = 'normal' | 'error' | 'loading';

const ImageInternal: CompoundedComponent<ImageProps> = ({
  src: imgSrc,
  alt,
  onPreviewClose: onInitialPreviewClose,
  prefixCls = 'rc-image',
  previewPrefixCls = `${prefixCls}-preview`,
  placeholder,
  fallback,
  width,
  height,
  style,
  preview = true,
  className,
  onClick,
  onError,
  wrapperClassName,
  wrapperStyle,
  rootClassName,

  // Img
  crossOrigin,
  decoding,
  loading,
  referrerPolicy,
  sizes,
  srcSet,
  useMap,
  draggable,
  taskResult,
  updata,
  freshList,
  placeholderImgUrl,
  taskType,
  task,
  Appraise,
  addtionalOptions,
  ...otherProps
}) => {
  const isCustomPlaceholder = placeholder && placeholder !== true;
  const containerRef = useRef(null);
  const [hideSkeleton, setHideSkeleton] = useState<boolean>(false);
  const [inViewport] = useInViewport(containerRef); // 判断组件是否在视口内
  const {
    src: previewSrc,
    visible: previewVisible = undefined,
    onVisibleChange: onPreviewVisibleChange = onInitialPreviewClose,
    getContainer: getPreviewContainer = undefined,
    mask: previewMask,
    maskClassName,
    scaleStep,
    ...dialogProps
  }: ImagePreviewType = typeof preview === 'object' ? preview : {};
  const src = previewSrc ?? imgSrc;
  const isControlled = previewVisible !== undefined;
  const [isShowPreview, setShowPreview] = useMergedState(!!previewVisible, {
    value: previewVisible,
    onChange: onPreviewVisibleChange,
  });
  const [status, setStatus] = useState<ImageStatus>(
    isCustomPlaceholder ? 'loading' : 'normal'
  );
  const [blur, setBlur] = useState(false);
  const [mousePosition, setMousePosition] = useState<null | {
    x: number;
    y: number;
  }>(null);
  const {
    isPreviewGroup,
    setCurrent,
    setShowPreview: setGroupShowPreview,
    setMousePosition: setGroupMousePosition,
    registerImage,
  } = React.useContext(context);
  const [currentId] = React.useState<number>(() => {
    uuid += 1;
    return uuid;
  });
  const canPreview = !!preview;
  const [bizImgUrls, setBizImgUrls] = useState({
    showImg: imgSrc, // 默认先加载模糊图
    placeholderImg: placeholderImg, // 占位图，一个小方块
  });
  const isInViewPortLoaded = React.useRef(false);
  const isError = status === 'error';
  const [hovered, setHovered] = useState(false);
  const mouseHoveringRef = useRef<boolean>(false);
  const feedBackFormOpenRef = useRef<boolean>(false);
  const { addPrefix } = useClassNames(
    `custom-markdown${isMobile() ? '-mobile' : ''}`
  );

  const onPreview: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isControlled) {
      const { left, top } = getOffset(e.target);

      if (isPreviewGroup) {
        setCurrent(currentId);
        setGroupMousePosition({
          x: left,
          y: top,
        });
      } else {
        setMousePosition({
          x: left,
          y: top,
        });
      }
    }

    if (isPreviewGroup) {
      setGroupShowPreview(true);
    } else {
      setShowPreview(true);
    }

    onClick?.(e);
  };

  const onPreviewClose = (e: React.SyntheticEvent<Element>) => {
    e.stopPropagation();
    setShowPreview(false);
    if (!isControlled) {
      setMousePosition(null);
    }
  };

  // Keep order start
  // Resolve https://github.com/ant-design/ant-design/issues/28881
  // Only need unRegister when component unMount
  React.useEffect(() => {
    if (!src) return;
    const unRegister = registerImage(currentId, src);
    return unRegister;
  }, []);

  React.useEffect(() => {
    if (!src) return;
    registerImage(currentId, src, canPreview);
  }, [src, canPreview]);

  const wrapperClass = cn(
    prefixCls,
    addPrefix('rcImg'),
    wrapperClassName,
    hideSkeleton ? undefined : addPrefix('notAllowed'),
    hovered ? addPrefix('hovered') : undefined,
    rootClassName,
    {
      [`${prefixCls}-error`]: isError,
    }
  );

  // setTimeout(() => {
  //   setShowPreview(false);
  // },6000);

  const mergedSrc = isError && fallback ? fallback : src;
  const imgCommonProps = {
    crossOrigin,
    decoding,
    draggable,
    loading,
    referrerPolicy,
    sizes,
    srcSet,
    useMap,
    onError,
    alt,
    className: cn(
      `${prefixCls}-img`,
      {
        [`${prefixCls}-img-placeholder`]: status === 'loading',
      },
      className
    ),
    style: {
      height,
      ...style,
    },
  };

  const currentImgUrl = bizImgUrls.showImg;
  // inViewport || isInViewPortLoaded.current
  //   ? bizImgUrls.showImg
  //   : placeholderImg;
  return (
    <RootContext.Provider value={addtionalOptions || {}}>
      <div
        {...otherProps}
        ref={containerRef}
        className={`${wrapperClass}`}
        onClick={async (event) => {
          if (isError) return;
          canPreview ? onPreview(event) : onClick?.(event);
        }}
        onMouseLeave={() => {
          mouseHoveringRef.current = false;
          // setBlur(false);
          if (feedBackFormOpenRef.current) {
            return;
          }
          setHovered(false);
        }}
        onMouseEnter={() => {
          mouseHoveringRef.current = true;
          setBlur(true);
          setHovered(true);
        }}
        style={{
          width: width ? width : 'auto',
          height: height ? height : 'auto',
          ...wrapperStyle,
        }}
      >
        {isError ? (
          <div className={`${prefixCls}-errorPic`} style={{ height: '100%' }}>
            <img src={placeholderImg} alt="" />
            <div className={addPrefix('con')}>
              <IconFont type="icon-tupianzoudiu" />
              <span><FormattedMessage id="imageLoadErr"/></span>
            </div>
          </div>
        ) : (
          <>
            <img
              {...imgCommonProps}
              style={{}}
              onContextMenu={(event) => event.preventDefault()}
              src={currentImgUrl}
              onError={(e) => {
                console.log('onError', e);
                setStatus('error');
              }}
              onLoad={(e) => {
                if (currentImgUrl === imgSrc) {
                  // 转为清晰图后，将图片状态置为normal
                  setStatus('normal');
                  return;
                }
              }}
              onDragStart={(event: React.DragEvent<HTMLImageElement>) => {
                if (
                  (inViewport || isInViewPortLoaded.current) &&
                  bizImgUrls.showImg
                ) {
                  event.dataTransfer.setData(
                    'text/plain',
                    JSON.stringify({
                      imgUrl: bizImgUrls.showImg,
                      taskId: taskResult.taskId,
                      ossPath: taskResult.ossPath,
                    })
                  );
                  return;
                }
                message.error('拖拽目标图片无法加载');
              }}
            />
          </>
        )}

        {status === 'loading' && (
          <div aria-hidden="true" className={`${prefixCls}-placeholder`}>
            <img src={bizImgUrls.placeholderImg} alt="" />
          </div>
        )}

        {/* Preview Click Mask */}
        {/* {previewMask && canPreview && ( */}
        {isError ? null : (
          <>
            <div
              className={cn(`${prefixCls}-mask`, maskClassName)}
              style={{
                display:
                  imgCommonProps.style?.display === 'none' ? 'none' : undefined,
              }}
            >
              {previewMask}
            </div>
            {/* <ImageOperate downloadUrl={currentImgUrl} /> */}
          </>
        )}
      </div>
      {!isPreviewGroup && canPreview && (
        <Preview
          aria-hidden={!isShowPreview}
          visible={isShowPreview}
          prefixCls={previewPrefixCls}
          onClose={onPreviewClose}
          mousePosition={mousePosition}
          src={mergedSrc}
          alt={alt}
          getContainer={getPreviewContainer}
          icons={icons}
          scaleStep={scaleStep}
          rootClassName={rootClassName}
          taskResult={taskResult}
          {...dialogProps}
        />
      )}
    </RootContext.Provider>
  );
};

ImageInternal.PreviewGroup = PreviewGroup;

ImageInternal.displayName = 'Image';

export default ImageInternal;
