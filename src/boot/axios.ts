import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import { Configuration } from 'src/sdk';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $axios: AxiosInstance
    axiosConfig: Configuration
  }
}

export default boot(async ({ app }) => {
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
      app.config.globalProperties.axiosConfig = res.data as Configuration;
    }
  } catch (err) {
    // If no environment config is available, use defaults appropriate for dev environment.
    const loc = window.location;
    app.config.globalProperties.axiosConfig = {
      basePath: `${loc.protocol}://${loc.hostname}:7080`,
    };
  }
});
