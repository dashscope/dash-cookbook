import * as React from 'react';
import { useState } from 'react';
import {
  RotateLeftOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import useMergedState from 'rc-util/lib/hooks/useMergedState';

import useClassNames from '@/hooks/useClassNames';
import { isMobile } from '@/libs/utils';

import IconFont from '@/components/IconFont';

import type { ImagePreviewType } from './Image';
import type { PreviewProps } from './Preview';
import Preview from './Preview';
import { ITaskType } from '../types';

import '../index.less';

export interface PreviewGroupPreview
  extends Omit<ImagePreviewType, 'icons' | 'mask' | 'maskClassName'> {
  /**
   * If Preview the show img index
   * @default 0
   */
  current?: number;
  countRender?: (current: number, total: number) => string;
  onChange?: (current: number, prevCurrent: number) => void;
}

export interface GroupConsumerProps {
  previewPrefixCls?: string;
  icons?: PreviewProps['icons'];
  preview?: boolean | PreviewGroupPreview;
  children?: React.ReactNode;
  taskResult?: any;
  updata?: any;
  taskType?: ITaskType;
}

interface PreviewUrl {
  url: string;
  canPreview: boolean;
}

export interface GroupConsumerValue extends GroupConsumerProps {
  isPreviewGroup?: boolean;
  previewUrls: Map<number, { url: string; realIndex: number }>;
  setPreviewUrls: React.Dispatch<React.SetStateAction<Map<number, PreviewUrl>>>;
  current?: number;
  setCurrent: React.Dispatch<React.SetStateAction<number | undefined>>;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  setMousePosition: React.Dispatch<
    React.SetStateAction<null | { x: number; y: number }>
  >;
  registerImage: (id: number, url: string, canPreview?: boolean) => () => void;
  rootClassName?: string;
}

/* istanbul ignore next */
export const context = React.createContext<GroupConsumerValue>({
  previewUrls: new Map(),
  setPreviewUrls: () => null,
  current: undefined,
  setCurrent: () => null,
  setShowPreview: () => null,
  setMousePosition: () => null,
  registerImage: () => () => null,
  rootClassName: '',
});

const { Provider } = context;

function getSafeIndex(keys: number[], key: number) {
  if (key === undefined) return undefined;
  const index = keys.indexOf(key);
  if (index === -1) return undefined;
  return index;
}

export const icons = {
  rotateLeft: <RotateLeftOutlined />,
  rotateRight: <IconFont type="icon-huanyuan" />,
  zoomIn: <IconFont type="icon-fangda4" />,
  zoomOut: <IconFont type="icon-suoxiao3" />,
  close: (
    <IconFont type={isMobile() ? 'icon-yuanjiao2' : 'icon-quxiao_default'} />
  ),
  left: <IconFont type="icon-xiangzuo" />,
  right: <IconFont type="icon-xiangyou" />,
  flipX: <SwapOutlined />,
  flipY: <SwapOutlined rotate={90} />,
};

const Group: React.FC<GroupConsumerProps> = ({
  previewPrefixCls = 'rc-image-preview',
  children,
  preview,
  taskResult,
  updata,
  taskType,
}) => {
  const {
    visible: previewVisible = undefined,
    onVisibleChange: onPreviewVisibleChange = undefined,
    getContainer = undefined,
    current: currentIndex = 0,
    countRender = undefined,
    onChange = undefined,
    ...dialogProps
  } = typeof preview === 'object' ? preview : {};
  const [previewUrls, setPreviewUrls] = useState<Map<number, PreviewUrl>>(
    new Map()
  );
  const previewUrlsKeys = Array.from(previewUrls.keys());
  const prevCurrent = React.useRef<number | undefined>();
  const [current, setCurrent] = useMergedState<number | undefined>(undefined, {
    onChange: (val, prev) => {
      if (prevCurrent.current !== undefined) {
        onChange?.(
          getSafeIndex(previewUrlsKeys, val as number) as number,
          getSafeIndex(previewUrlsKeys, prev as number) as number
        );
      }
      prevCurrent.current = prev;
    },
  });
  const [isShowPreview, setShowPreview] = useMergedState(!!previewVisible, {
    value: previewVisible,
    onChange: (val, prevVal) => {
      onPreviewVisibleChange?.(
        val,
        prevVal,
        getSafeIndex(previewUrlsKeys, current!)
      );
      prevCurrent.current = val ? current : undefined;
    },
  });

  const [mousePosition, setMousePosition] = useState<null | {
    x: number;
    y: number;
  }>(null);

  const { addPrefix } = useClassNames(
    `custom-markdown${isMobile() ? '-mobile' : ''}`
  );
  const isControlled = previewVisible !== undefined;

  const currentControlledKey = previewUrlsKeys[currentIndex];
  const canPreviewUrls = new Map<number, { url: string; realIndex: number }>(
    Array.from(previewUrls)
      .filter(([, { canPreview }]) => !!canPreview)
      .map(([id, { url }], index) => [id, { url, realIndex: index }])
  );

  const registerImage = (id: number, url: string, canPreview = true) => {
    const unRegister = () => {
      setPreviewUrls((oldPreviewUrls) => {
        const clonePreviewUrls = new Map(oldPreviewUrls);
        const deleteResult = clonePreviewUrls.delete(id);
        return deleteResult ? clonePreviewUrls : oldPreviewUrls;
      });
    };

    setPreviewUrls((oldPreviewUrls) => {
      const map = new Map(oldPreviewUrls);
      return map.set(id, {
        url,
        canPreview,
      });
    });

    return unRegister;
  };

  const onPreviewClose = (e: React.SyntheticEvent<Element>) => {
    // setPreviewUrls(new Map());
    e.stopPropagation();
    setShowPreview(false);
    setMousePosition(null);
  };

  React.useEffect(() => {
    setCurrent(currentControlledKey);
  }, [currentControlledKey]);

  React.useEffect(() => {
    if (!isShowPreview && isControlled) {
      setCurrent(currentControlledKey);
    }
  }, [currentControlledKey, isControlled, isShowPreview]);

  return (
    <Provider
      value={{
        isPreviewGroup: true,
        previewUrls: canPreviewUrls,
        setPreviewUrls,
        current,
        setCurrent,
        setShowPreview,
        setMousePosition,
        registerImage,
      }}
    >
      {children}
      <Preview
        aria-hidden={!isShowPreview}
        visible={isShowPreview}
        prefixCls={previewPrefixCls}
        onClose={onPreviewClose}
        mousePosition={mousePosition}
        src={canPreviewUrls.get(current as number)?.url}
        icons={icons}
        getContainer={getContainer}
        countRender={countRender}
        taskResult={taskResult}
        updata={updata}
        {...dialogProps}
      />
    </Provider>
  );
};

export default Group;
