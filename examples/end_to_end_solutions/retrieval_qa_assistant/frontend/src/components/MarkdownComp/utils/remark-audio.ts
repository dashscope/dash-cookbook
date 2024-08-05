import { visit } from 'unist-util-visit';

export default (options) => {
  return (ast) => {
    visit(ast, 'inlineCode', (node) => {
      const { value } = node;
      const matches = value.match(/^audio:?\s(.*)+$/);
      if (matches) {
        const url = matches[1].trim();

        node.type = 'html';
        node.value = renderAudioTag(url, options);
      }
    });
  };
};

interface AudioOptions {
  preload?: 'none' | 'metadata' | 'auto' | '';
  muted?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  width?: number;
}

const renderAudioTag = (url, options: AudioOptions = {}) => {
  const audioNode = `
		<audio
			src=${url}
			preload="${options.preload}"
			${options.muted ? 'muted' : ''}
			${options.autoplay ? 'autoplay' : ''}
			${options.loop ? 'loop' : ''}
			${options.controls ? 'controls' : ''}
      width="${options.width ?? ''}"
		></audio>
	`;

  return audioNode;
};
