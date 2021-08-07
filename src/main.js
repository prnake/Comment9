import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import element from "./plugins/element";
import axios from "./plugins/axios";
import store from "./store";
import config from "../config";

Vue.config.productionTip = false;
Vue.prototype.$rootPath = config.rootPath;

new Vue({
  store,
  router,
  i18n,
  element,
  axios,
  render: (h) => h(App),
}).$mount("#app");
