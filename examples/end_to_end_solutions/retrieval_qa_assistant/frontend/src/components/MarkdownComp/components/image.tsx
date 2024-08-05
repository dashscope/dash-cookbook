import { useEffect, useState } from 'react';
import Image from '@/components/ImagePreview';

import useClassNames from '@/hooks/useClassNames';
import useConfig from '@/hooks/useConfig';
import { ERROR_IMG } from '@/libs/utils';
import pdfIcon from '@/assets/images/pdf_icon.png';

import styles from './styles.module.less';

const getFileExtension = (url) => {
  if (!url) return;
  url = url.split('?')[0].split('#')[0];
  const regex = /(?:\.([^.]+))?$/;
  return regex.exec(url)?.[1];
};

export default (props: any) => {
  const { src, alt, addtionalOptions } = props;
  const [imgUrl, setImgUrl] = useState(src);
  const [fileType, setFileType] = useState('image');
  const [isError, setIsError] = useState(false);
  const { addPrefix } = useClassNames('custom-markdown-image');

  const { markdown } = useConfig();
  const { image } = markdown ?? {};

  useEffect(() => {
    if (getFileExtension(src)?.toLowerCase() === 'pdf') {
      setFileType('pdf');
    }
    setImgUrl(src);
  }, [src]);

  const renderContent = () => {
    if (fileType === 'pdf') {
      return (
        <span className={styles['pdf-content']}>
          <img
            src={pdfIcon}
            alt=""
          />
          {alt}
        </span>
      );
    }
    return (
      <Image
        className={isError ? addPrefix('errorImg') : styles['img']}
        onError={() => {
          setImgUrl(image?.fallback || ERROR_IMG);
          setIsError(true);
        }}
        src={imgUrl}
        alt={alt}
        addtionalOptions={addtionalOptions}
      />
    );
  };
  return <span className={addPrefix('imageContainer')}>{renderContent()}</span>;
};
