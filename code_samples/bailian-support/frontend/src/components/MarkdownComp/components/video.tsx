import { omit } from 'lodash';

export default (props) => {
  return <video src={props.url} {...omit(props, 'url', 'node')} width="100%" />;
};
