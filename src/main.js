import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import element from "./plugins/element";
import axios from "./plugins/axios";
import clipboard from "./plugins/clipboard";
import remotescript from "./plugins/remotescript";

Vue.config.productionTip = false;
Vue.prototype.$rootPath = window.location.pathname.replace(/\/$/, "");

Vue.config.ignoredElements = [/^yt-/];

new Vue({
  router,
  i18n,
  element,
  axios,
  clipboard,
  remotescript,
  render: (h) => h(App),
}).$mount("#app");
