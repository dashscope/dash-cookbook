import React, { useMemo } from 'react';

import IconFont from '@/components/IconFont';
import useClassNames from '@/hooks/useClassNames';
import { isMobile } from '@/libs/utils';

import './index.less';

export const PdfTag = (props) => {
  const { fileName: _fileName = '' } = props;
  const { addPrefix } = useClassNames(
    `custom-markdown${isMobile() ? '-mobile' : ''}`
  );
  const fileName = useMemo(() => {
    const file_name = _fileName.substring(0, _fileName.lastIndexOf('.'));
    if (file_name?.length > 16) return `${file_name.slice(0, 16)}...`;
    return file_name;
  }, [_fileName]);

  return (
    <span className={addPrefix('pdf-tag-wrap')}>
      <span className={addPrefix('pdf-tag')}>
        <IconFont className={addPrefix('pdf-icon')} type="icon-pdf" />
        <span>
          {fileName}
          <span className={addPrefix('pdf-extension')}>.pdf</span>
        </span>
      </span>
    </span>
  );
};
