import { useMemo } from 'react';
import classNames, { Argument } from 'classnames';

function addPrefix(pre: string, className: string | string[]): string {
  if (!pre || !className) {
    return '';
  }

  if (Array.isArray(className)) {
    return classNames(
      className.filter((name) => !!name).map((name) => `${pre}-${name}`)
    );
  }
  return `${pre}-${className}`;
}

export interface useClassNamesReturn {
  /**
   * `red` => `{prefix} {prefix}-red`
   * @param classes
   * @returns
   */
  withClassPrefix: (...classes: Argument[]) => string;

  /**
   * `red` => `{prefix}-red`
   * @param classes
   * @returns
   */
  addPrefix: (...classes: Argument[]) => string;

  merge: typeof classNames;
}

export function useClassNames(prefix: string): useClassNamesReturn {
  return useMemo(() => {
    const addComponentPrefix: useClassNamesReturn['addPrefix'] = (
      ...classes
    ) => {
      const mergedClassNames = classes.length
        ? classNames(...classes)
            .split(' ')
            .map((item) => addPrefix(prefix, item))
        : [];

      return mergedClassNames.filter(Boolean).join(' ');
    };
    return {
      addPrefix: addComponentPrefix,
      withClassPrefix(...classes: Argument[]) {
        const mergedClassNames = addComponentPrefix(classes);
        return mergedClassNames ? `${prefix} ${mergedClassNames}` : prefix;
      },
      merge: classNames,
    };
  }, [prefix]);
}

export default useClassNames;
