module.exports = {
  publicPath: process.env.BASE_URL,
  pluginOptions: {
    i18n: {
      locale: "zh_CN",
      fallbackLocale: "en",
      localeDir: "langs",
      enableInSFC: true,
    },
  },
};
