const config = require("./config");
module.exports = {
  publicPath: config.rootPath,
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "langs",
      enableInSFC: true,
    },
  },
};
