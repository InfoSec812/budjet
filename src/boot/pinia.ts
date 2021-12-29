import axios from 'axios';
import { createPinia } from 'pinia';
import { boot } from 'quasar/wrappers';
import { Configuration } from 'src/sdk';
import { APIPlugin } from 'src/stores/APIPlugin';

export default boot(async ({ app }) => {
  let apiConfig: Configuration | undefined = undefined;

  try {
    // Attempt to load environment information if available.
    const res = await axios.get('/env/environment.json');
    if (
      'basePath' in (res.data as Configuration)
      || 'apiKey' in (res.data as Configuration)
      || 'username' in (res.data as Configuration)
      || 'password' in (res.data as Configuration)
      || 'accessToken' in (res.data as Configuration)
      || 'baseOptions' in (res.data as Configuration)
      || 'formDataCtor' in (res.data as Configuration)
    ) {
      apiConfig = res.data as Configuration;
    }
  } catch (err) {
    // If no environment config is available, use defaults appropriate for dev environment.
    apiConfig = undefined;
  }
  const pinia = createPinia();

  pinia.use((context) => {
    if (apiConfig instanceof Configuration) {
      context.options.apiConfig = apiConfig;
    }
    return APIPlugin(context);
  });

  app.use(pinia);
});
