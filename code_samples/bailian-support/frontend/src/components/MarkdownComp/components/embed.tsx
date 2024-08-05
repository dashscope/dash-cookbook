import React from 'react';
import {
  FileExcelOutlined,
  FileGifOutlined,
  FileImageOutlined,
  FileJpgOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  FileWordOutlined,
  FileZipOutlined,
} from '@ant-design/icons';

import styles from './styles.module.less';

const mimeMap = {
  txt: FileTextOutlined,
  'text/plain': FileTextOutlined,
  xlsx: FileExcelOutlined,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    FileExcelOutlined,
  'application/x-xls': FileExcelOutlined,
  'application/vnd.ms-excel': FileExcelOutlined,
  xls: FileExcelOutlined,
  doc: FileWordOutlined,
  'application/msword': FileWordOutlined,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    FileWordOutlined,
  docx: FileWordOutlined,
  gif: FileGifOutlined,
  'image/gif': FileGifOutlined,
  png: FileImageOutlined,
  'image/png': FileImageOutlined,
  'application/x-png': FileImageOutlined,
  jpg: FileJpgOutlined,
  'image/jpeg': FileJpgOutlined,
  'application/x-jpg': FileJpgOutlined,
  jpeg: FileJpgOutlined,
  pdf: FilePdfOutlined,
  'application/pdf': FilePdfOutlined,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    FilePptOutlined,
  'application/vnd.ms-powerpoint': FilePptOutlined,
  'application/x-ppt': FilePptOutlined,
  ppt: FilePptOutlined,
  pptx: FilePptOutlined,
  zip: FileZipOutlined,
  'application/zip': FileZipOutlined,
};

export function formatBytes(a: number, b = 2) {
  if (!+a) return '0 Bytes';
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
    ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
  }`;
}

export default (props) => {
  const { src, name, type, size } = props;

  const Icon = mimeMap[type] ?? FileUnknownOutlined;
  return (
    <div className={styles['embed-card']}>
      <div className={styles['icon-block']}>
        <Icon />
      </div>
      <div>
        <a href={src}>
          <h4>{name}</h4>
        </a>
        <p>{size == null ? '-' : formatBytes(size)}</p>
      </div>
    </div>
  );
};
