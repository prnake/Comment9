const config = require("./config");
module.exports = {
  publicPath: config.rootPath,
  pluginOptions: {
    i18n: {
      locale: "zh_CN",
      fallbackLocale: "en",
      localeDir: "langs",
      enableInSFC: true,
    },
  },
};
