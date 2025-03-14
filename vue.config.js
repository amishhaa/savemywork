module.exports = {
  'transpileDependencies': [
    'vuetify',
    'vue-clamp',
    'resize-detector',
  ],
  devServer: {
    port: 5000, // Specify the port here
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
}
