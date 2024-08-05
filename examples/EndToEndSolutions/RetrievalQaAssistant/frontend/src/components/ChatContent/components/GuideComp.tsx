import { useEffect, useState, useCallback } from 'react';
import { Col, Row } from 'antd';
import cls from 'classnames';
import styles from '../index.module.less';
import _, { throttle } from 'lodash';
import { FormattedMessage } from 'react-intl';
import store from '@/store';

interface IProps {
  onClick: (recommendItem: any) => void;
}
interface IGuide {
  contentData: string;
  iconUrl: string;
  showData: string;
  title: string;
}

function RecommendItemComp(props: {
  index: number;
  recommendItem: any;
  clickRecommend: (val: any) => void;
}) {
  const { recommendItem, clickRecommend, index } = props;

  return (
    <div
      onClick={() => {
        clickRecommend(recommendItem);
      }}
      key={index}
      className={styles.recommendItem}
    >
      <div className={cls('flexCon')}>
        <img draggable={false} src={recommendItem.iconUrl} alt="" />
        <span className={styles.title}>{recommendItem.title}</span>
      </div>
      <div className={cls('ellipsis-single', styles.desc)}>
        {recommendItem.showData}
      </div>
    </div>
  );
}

export default function GuideComp(props: IProps) {
  const MINIMUM_HEIGHT = 1080;
  const [appState] = store.useModel("app");
  const [showCount, setShowCount] = useState(
    window.innerHeight >= MINIMUM_HEIGHT ? 6 : 4,
  );

  const handleWindowResize = useCallback(() => {
    setShowCount(window.innerHeight >= MINIMUM_HEIGHT ? 6 : 4);
  }, [showCount, setShowCount, appState.pageConfig.textRecommends]);

  useEffect(() => {
    const _handler = throttle(handleWindowResize, 30);
    window.addEventListener('resize', _handler);
    return () => {
      window.removeEventListener('resize', _handler);
    };
  }, [handleWindowResize]);

  const clickRecommend = (recommendItem: any) => {
    props.onClick(recommendItem);
  };

  return (
    <div className={styles.guideComp}>
      <img className={styles.logo} src={appState.pageConfig.content.logo} alt="" />
      <div className={styles.title}>{appState.pageConfig.content.guideText}</div>
      <div className={styles.desc}>
        <FormattedMessage id="guideText" />
      </div>
      <div className={styles.prompt}>
        <FormattedMessage id="guideDesc" />
      </div>
      <div className={styles.recommends}>
        <Row gutter={[8, 8]} className={styles.recommendList}>
          {appState.pageConfig.textRecommends.slice(0, showCount).map((item, index) => (
            <Col span={12} key={index}>
              <RecommendItemComp
                recommendItem={item}
                index={index}
                key={index}
                clickRecommend={clickRecommend}
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
