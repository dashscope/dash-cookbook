import classnames from 'classnames';

import IconFont from '@/components/IconFont';

import { onMobile } from '@/libs/utils';
import mStyles from '../../mComponents/Pagination.module.less';
import pcStyles from './index.module.less';
const styles = onMobile ? mStyles : pcStyles;

interface IPaginationProps {
  total?: number;
  current?: number;
  onChange: (curInd: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function Pagination(props: IPaginationProps) {
  const { total = 2, current = 1, onChange } = props;

  const handleChange = (dis: number) => {
    if (props.disabled) return;
    const newCurrent = current + dis;
    if (newCurrent < 1 || newCurrent > total) return;
    onChange?.(current + dis);
  };

  return (
    <div
      className={classnames(styles.pagination, props.className, {
        [styles.disableFunc]: props.disabled,
      })}
    >
      <IconFont
        className={classnames({
          [styles.left]: true,
          [styles.disable]: current === 1,
        })}
        type="icon-yuanjiao3"
        onClick={() => {
          window.qianwenRegenerate = -1;
          handleChange(-1);
        }}
      />
      <div className={styles.text}>
        <span className={styles.currentPage}>{current}</span> / {total}
      </div>
      <IconFont
        className={classnames({
          [styles.right]: true,
          [styles.disable]: current === total,
        })}
        type="icon-yuanjiao8"
        onClick={() => {
          window.qianwenRegenerate = 1;
          handleChange(1);
        }}
      />
    </div>
  );
}
