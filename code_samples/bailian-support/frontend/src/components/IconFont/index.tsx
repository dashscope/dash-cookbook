import { createFromIconfontCN } from '@ant-design/icons';
import { IconFontProps } from '@ant-design/icons/lib/components/IconFont';
import * as IconFontJs from '@/assets/iconfont.js';

const CIcon = createFromIconfontCN({
  scriptUrl: IconFontJs,
});

export default function IconFont(props: IconFontProps) {
  const { type, ...rest } = props;

  return <CIcon type={type} {...rest} />;
}
