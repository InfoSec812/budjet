/* tslint:disable */
/* eslint-disable */
import { boot } from 'quasar/wrappers';
import VueChartkick from 'vue-chartkick';
import 'chartkick/chart.js'
import { Chart } from 'chart.js';

export default boot(({ app }) => {
  app.use(VueChartkick.use(Chart));
});
