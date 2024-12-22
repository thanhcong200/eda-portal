import { prefixPluginTranslations } from './utils/prefixPluginTranslations';
import TodoCard from './components/TodoCard';
import { PuzzlePiece } from '@strapi/icons';

const name = 'pages';

/** @type import('@strapi/strapi/admin').PluginDefinition */
export default {
  register(app) {
    app.registerPlugin({
      id: 'pages',
      name,
    });

   app.addMenuLink({
     to: '/plugins/custom-impact',
     icon: PuzzlePiece,
     intlLabel: {
       id: 'custom-impact.label',
       defaultMessage: 'Custom Impact', // Ensure this is provided
     },
     Component: async () => import('./components/CustomImpact.jsx'),
     permissions: [],
   });
   
  },

  bootstrap(app) {
    // app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
    //   name: 'my-plugin-my-compo',
    //   Component: TodoCard,
    // });
  },

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, name),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );
    return Promise.resolve(importedTrads);
  },
};
