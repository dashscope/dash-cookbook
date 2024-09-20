
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/*jshint esversion: 6 */
import Vue from 'vue';
import App from './App';
import VueMaterial from 'vue-material';
import VueMarkdown from 'vue-markdown'
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
import router from './router';

Vue.config.productionTip = false;
Vue.use(VueMaterial);
Vue.component("vue-markdown",  VueMarkdown);

if(process.env.NODE_ENV === 'production') {
  Vue.prototype.$protocol = window.location.protocol;
  Vue.prototype.$host = window.location.host;
} else {
  Vue.prototype.$protocol = "http:";
  Vue.prototype.$host = "127.0.0.1:5000";
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
