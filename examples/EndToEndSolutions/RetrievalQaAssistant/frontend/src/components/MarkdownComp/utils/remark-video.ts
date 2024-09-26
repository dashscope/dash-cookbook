import { visit } from 'unist-util-visit';

export default (options) => {
  return (ast) => {
    visit(ast, 'inlineCode', (node) => {
      const { value } = node;
      const matches = value.match(/^video:?\s(.*)+$/);
      if (matches) {
        const url = matches[1].trim();

        node.type = 'html';
        node.value = renderVideoTag(url, options);
      }
    });
  };
};

interface VideoOptions {
  preload?: 'none' | 'metadata' | 'auto' | '';
  muted?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  width?: number;
}

const renderVideoTag = (url, options: VideoOptions = {}) => {
  const videoNode = `
		<video
			src=${url}
			preload="${options.preload}"
			${options.muted ? 'muted' : ''}
			${options.autoplay ? 'autoplay' : ''}
			${options.loop ? 'loop' : ''}
			${options.controls ? 'controls' : ''}
      ${options.width ? `width=${options.width}` : ''}
		></video>
	`;

  return videoNode;
};
