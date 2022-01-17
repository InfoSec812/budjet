// FILE: main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, LoadingBar } from 'quasar';
import HighchartsVue from 'highcharts-vue';
import iconSet from 'quasar/icon-set/material-icons';
import '@quasar/extras/material-icons/material-icons.css';

// Import icon libraries; you can choose different ones!
// See: https://quasar.dev/start/vite-plugin#using-quasar
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';

// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css

// Import Quasar css
import 'quasar/src/css/index.sass';

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue';
import router from './router';
import { APIPlugin } from './stores/APIPlugin';
import { Configuration } from './sdk';
import axios from 'axios';


const app = createApp(App);

app.use(Quasar, {
    iconSet: iconSet,
    plugins: {
      Notify,
      LoadingBar,
    }, // import Quasar plugins and add here
    config: {
      notify: {
        position: 'bottom',
        timeout: 5000,
      }, // default set of options for Notify Quasar plugin
      loadingBar: {
        position: 'bottom',
      },
    /*
      brand: {
        // primary: '#e46262',
        // ... or all other brand colors
      },
      notify: {...}, // default set of options for Notify Quasar plugin
      loading: {...}, // default set of options for Loading Quasar plugin
      loadingBar: { ... }, // settings for LoadingBar Quasar plugin
      // ..and many more (check Installation card on each Quasar component/directive/plugin)
    */
    }
})
app.use(() => HighchartsVue);

// Connect Pinia

let apiConfig: Configuration | undefined = undefined;

// Attempt to load environment information if available.
axios.get('/env/environment.json')
  .then((res) => {
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
  })
  .finally(() => {
    const pinia = createPinia();

    pinia.use((context) => {
      if (apiConfig instanceof Configuration) {
        context.options.apiConfig = apiConfig;
      }
      return APIPlugin(context);
    });
    
    app.use(pinia);
    
    // Connect Vue Router
    app.use(router);
    
    // Assumes you have a <div id="app"></div> in your index.html
    app.mount('#app');
  });
