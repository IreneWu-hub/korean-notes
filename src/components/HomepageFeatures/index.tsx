import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '系統化課堂筆記',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        整理每堂課的核心文法、句型解析與實用例句，架構清晰便於隨時回顧。
      </>
    ),
  },
  {
    title: '旅遊實用會話',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        聚焦真實情境中的常用對話，從問路、點餐到日常應對，助你自信開口。
      </>
    ),
  },
  {
    title: '隨時隨地複習',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        響應式頁面設計，無論使用電腦、平板或手機，都能輕鬆掌握最新進度。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
