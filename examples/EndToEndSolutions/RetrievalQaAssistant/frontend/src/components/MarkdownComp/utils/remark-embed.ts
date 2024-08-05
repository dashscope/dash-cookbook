import { visit } from 'unist-util-visit';

export default (options) => {
  return (ast) => {
    visit(ast, 'inlineCode', (node) => {
      const { value } = node;
      const matches = value.match(/^embed:?\s(.*)+$/);
      if (matches) {
        const [url, _search] = matches[1].trim().split('?');
        const search = new URLSearchParams(decodeURI(_search));
        const name = search.get('name') ?? '';
        const size = search.get('size') || 0;
        const type = search.get('type') ?? '';

        node.type = 'html';
        node.value = renderEmbedTag(url, options, {
          name,
          size: Number(size),
          type,
        });
      }
    });
  };
};

interface EmbedOptions {
  width?: number;
  height?: number;
  type?: string;
}

interface EmbedProps {
  name: string;
  size: number;
  /* MIMEType */
  type: string;
}

const renderEmbedTag = (src, options: EmbedOptions = {}, props: EmbedProps) => {
  const embedNode = `<embed
			src=${src}
      ${options.width ? `width=${options.width}` : ''}
      ${options.height ? `height=${options.height}` : ''}
      ${props.type ? `type=${props.type}` : ''}
      ${props.name ? `name=${props.name}` : ''}
      ${props.size ? `size=${props.size}` : ''}
		></embed>`;

  return embedNode;
};
