// Конфигурация Metro для Expo
const { getDefaultConfig } = require("expo/metro-config");

// Получаем базовую конфигурацию Metro для текущего проекта
const config = getDefaultConfig(__dirname);

// Добавляем .cjs в список расширений для поддержки CommonJS-модулей
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "cjs"
];

// Настраиваем правильную обработку для react-native-reanimated
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
};

// Отключаем строгий режим модуля для Reanimated, чтобы избежать ошибок импорта
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config; 