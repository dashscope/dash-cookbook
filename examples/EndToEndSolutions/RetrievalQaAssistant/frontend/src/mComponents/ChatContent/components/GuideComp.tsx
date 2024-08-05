import { useEffect, useState } from 'react';
import IconFont from '@/components/IconFont';
import cls from 'classnames';
import styles from '../index.module.less';
import { FormattedMessage } from 'react-intl';
import store from '@/store';

interface IProps {
  onClick: (recommendItem: any) => void;
}
interface IPrompt {
  title: string;
  iconUrl: string;
  showData: string;
  contentData?: string;
}

const Items = (props: {
  item: IPrompt;
  onClick: (val: IPrompt) => void;
  cur: string;
}) => {
  const { item, onClick, cur } = props;

  return (
    <div
      className={cls(styles.item, cur === item.title && styles.active)}
      key={item.title}
      onClick={() => {
        onClick(item);
      }}
    >
      <div className={styles.left}>
        <img src={item.iconUrl} className={styles.icon} />
        <div>
          <div
            className={styles.title}
          >
            {item.title}
          </div>
          <div className={styles.desc}>{item.showData}</div>
        </div>
      </div>
      <IconFont type="icon-jinrujiantou_default" className={styles.right} />
    </div>
  );
};

export default (props: IProps) => {
  const [appState] = store.useModel('app');
  const [cur, setCur] = useState('');

  const clickRecommend = (item: IPrompt) => {
    props.onClick(item);
  };
  return (
    <div className={styles.guidePrompt}>
      <div className={styles.head}>
        {appState.pageConfig.content.guideText}，
        <FormattedMessage id="guideDesc" />
      </div>
      {appState.pageConfig.textRecommends?.map((item) => (
        <Items
          item={item}
          onClick={() => {
            clickRecommend(item);
            setCur(item.title);
          }}
          key={item.title}
          cur={cur}
        />
      ))}
    </div>
  );
};
