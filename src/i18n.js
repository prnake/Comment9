import Vue from "vue";
import VueI18n from "vue-i18n";
import enLocale from "element-ui/lib/locale/lang/en";
import zh_CNLocale from "element-ui/lib/locale/lang/zh-CN";
import zh_TWLocale from "element-ui/lib/locale/lang/zh-TW";
import jaLocale from "element-ui/lib/locale/lang/ja";

Vue.use(VueI18n);

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: {
    en: Object.assign(require("./langs/en"), enLocale),
    zh_CN: Object.assign(require("./langs/zh_CN"), zh_CNLocale),
    zh_TW: Object.assign(require("./langs/zh_TW"), zh_TWLocale),
    ja: Object.assign(require("./langs/ja"), jaLocale),
  },
});
