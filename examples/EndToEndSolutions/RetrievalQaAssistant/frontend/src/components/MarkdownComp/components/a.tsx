import React, { useRef } from 'react';

import { getURLFileExtension } from '@/libs/utils';

import { PdfTag } from '../PdfTag';

export default (props) => {
  if (props.children) {
    if (getURLFileExtension(props.href) === 'pdf') {
      return <PdfTag fileName={props.children[0]} />;
    }
    // const defaultPrefix1 = 'https://';
    // const defaultPrefix2 = 'http://';
    // let newHref = props.href;
    // if (
    //   !newHref.startsWith(defaultPrefix1) &&
    //   !newHref.startsWith(defaultPrefix2)
    // ) {
    //   newHref = 'http://' + props.href;
    // }
    return (
      <a
        target="_blank"
        href={props.href}
        onMouseDown={(e) => e.stopPropagation()}
        rel="noreferrer"
      >
        {props.children[0]}
      </a>
    );
  } else {
    return <>{'[](' + props.href + ')'}</>;
  }
};
