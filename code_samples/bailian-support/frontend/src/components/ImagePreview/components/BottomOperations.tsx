import React from 'react';
import { Tooltip } from 'antd';
import cls from 'classnames';

import IconFont from '@/components/IconFont';

import '../index.less';
import { FormattedMessage } from 'react-intl';

interface Iporps {
  downloadUrl: string;
  className?: string;
  children: React.ReactNode;
  downloadable?: boolean;
}

export default ({ downloadUrl, className, children, downloadable }: Iporps) => {
  const prefixCls = 'rc-image-appraise';
  // 去除水印

  return (
    <div className={cls(`${prefixCls}`, className)}>
      {children}

      {downloadable && (
        <div
          className={`${prefixCls}-bothBtn`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className={`${prefixCls}-right`}>
            <Tooltip
              title={<FormattedMessage id="downloadImage" />}
              showArrow={false}
              placement="top"
              arrow={false}
            >
              <a href={downloadUrl} download target="_blank" rel="noreferrer">
                <IconFont
                  type="icon-xiazai1"
                  className={`${prefixCls}-iconfont`}
                />
                <FormattedMessage id="downloadImage" />
              </a>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export const ImageOperate = ({ downloadUrl }) => {
  // 去除水印

  const prefixCls = 'rc-image';
  return (
    <div className={`${prefixCls}-mask-appraise`}>
      <div
        className={`${prefixCls}-mask-but`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Tooltip
          title={<FormattedMessage id="downloadImage" />}
          showArrow={false}
          placement="top"
          arrow={false}
        >
          <a href={downloadUrl} download target="_blank" rel="noreferrer">
            <IconFont
              type="icon-xiazaituxiang"
              className={`${prefixCls}-mask-but-icon`}
            />
          </a>
        </Tooltip>
      </div>
    </div>
  );
};
