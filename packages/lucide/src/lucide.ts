import replaceElement from './replaceElement';
import * as iconAndAliases from './iconsAndAliases';

/**
 * Replaces all elements with matching nameAttr with the defined icons
 * @param {{ icons?: object, nameAttr?: string, attrs?: object }} options
 */
const createIcons = ({ icons = {}, nameAttr = 'data-lucide', attrs = {} } = {}) => {
  if (!Object.values(icons).length) {
    throw new Error(
      "Lucide: Please provide an icons object.\nIf you want to use all the icons you can import it like:\n `import { createIcons, icons } from 'lucide';\nlucide.createIcons({icons});`",
    );
  }

  if (Object.values(icons).length > 400) {
    console.warn(
      'Lucide: You are trying to load more than 400 icons. Please import only the icons you need. This will reduce the bundle size and improve performance.',
    )
  }

  if (typeof document === 'undefined') {
    throw new Error('`createIcons()` only works in a browser environment.');
  }

  const elementsToReplace = document.querySelectorAll(`[${nameAttr}]`);

  Array.from(elementsToReplace).forEach((element) =>
    replaceElement(element, { nameAttr, icons, attrs }),
  );

  /** @todo: remove this block in v1.0 */
  if (nameAttr === 'data-lucide') {
    const deprecatedElements = document.querySelectorAll('[icon-name]');
    if (deprecatedElements.length > 0) {
      console.warn('[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide');
      Array.from(deprecatedElements).forEach((element) =>
        replaceElement(element, { nameAttr: 'icon-name', icons, attrs }),
      );
    }
  }
};

export { createIcons };

/*
  Create Element function export.
*/
export { default as createElement } from './createElement';

/*
 Icons exports.
*/
export { iconAndAliases as icons };
export * from './icons';
