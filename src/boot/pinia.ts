import { createPinia } from 'pinia';
import { boot } from 'quasar/wrappers';
import { Configuration } from 'src/sdk';
import { APIPlugin } from 'src/stores/APIPlugin';

export default boot(({ app }) => {
  const pinia = createPinia();

  pinia.use((context) => {
    if (app.config.globalProperties.axiosConfig instanceof Configuration) {
      context.options.apiConfig = app.config.globalProperties.axiosConfig;
    }
    return APIPlugin(context);
  });

  app.use(pinia);
});
