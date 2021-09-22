import Vue from "vue";
import VueI18n from "vue-i18n";
import enLocale from "element-ui/lib/locale/lang/en";
import zh_CNLocale from "element-ui/lib/locale/lang/zh-CN";
import zh_TWLocale from "element-ui/lib/locale/lang/zh-TW";
import jaLocale from "element-ui/lib/locale/lang/ja";
import Cookies from "js-cookie"

Vue.use(VueI18n);

export default new VueI18n({
  locale: Cookies.get('language') || process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: {
    en: { ...require("./langs/en"), ...enLocale },
    zh_CN: { ...require("./langs/zh_CN"), ...zh_CNLocale },
    zh_TW: { ...require("./langs/zh_TW"), ...zh_TWLocale },
    ja: { ...require("./langs/ja"), ...jaLocale }
  },
});
