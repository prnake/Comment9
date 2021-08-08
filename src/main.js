import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import element from "./plugins/element";
import axios from "./plugins/axios";
import clipboard from "./plugins/clipboard";
import remotescript from "./plugins/remotescript";
import store from "./store";
import config from "../config";

Vue.config.productionTip = false;
Vue.prototype.$hostUrl = config.host;
Vue.prototype.$rootPath = config.rootPath;

new Vue({
  store,
  router,
  i18n,
  element,
  axios,
  clipboard,
  remotescript,
  render: (h) => h(App),
}).$mount("#app");
