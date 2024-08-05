import MarkdownComponent from '@/components/MarkdownComp';
import styles from './index.module.less';

interface IQuestionItemProps {
  text: string;
}

export default function QuestionItem(props: IQuestionItemProps) {
  const { text } = props;
  return (
    <div className={styles.questionItem}>
      <MarkdownComponent
        text={text}
        markdownFontSize="qianwen"
        disableRenderHtml
      />
    </div>
  );
}
