# MoneyMinder - Приложение для управления личными финансами

MoneyMinder - это мобильное приложение для эффективного управления личными финансами, которое помогает вам контролировать расходы, отслеживать бюджет и анализировать свое финансовое поведение.

## Основной функционал

### Отслеживание расходов
- Добавление ежедневных расходов с категориями и описаниями
- История расходов с возможностью фильтрации и сортировки
- Удобный интерфейс для ввода новых расходов

### Планирование бюджета
- Установка месячного дохода и даты зарплаты
- Добавление критических (обязательных) расходов
- Установка целей по накоплениям
- Автоматический расчет дневного лимита расходов
- Отслеживание превышений дневного лимита
- Перенос неиспользованных средств на следующие дни

### Аналитика
- Визуализация расходов по категориям (круговая диаграмма)
- График расходов по времени
- Ключевые метрики вашего финансового поведения
- Статистика по превышениям дневного лимита
- Отслеживание общей суммы сэкономленных средств

### Дополнительные функции
- Детальная история превышений дневного лимита
- Визуальные индикаторы бюджета
- Темная и светлая темы интерфейса
- Ввод сумм с десятичными знаками через запятую

## Чейнджлог

### 2023-03-07
- ✅ **Добавлено**: Перенос неиспользованных средств текущего дня на последующие дни
- ✅ **Добавлено**: Отображение информации о сэкономленных средствах в индикаторе лимита
- ✅ **Добавлено**: Статистика сэкономленных средств в разделе аналитики
- ✅ **Исправлено**: Обработка существующих расходов при создании/обновлении бюджета
- ✅ **Добавлено**: Отслеживание превышений дневного лимита расходов
- ✅ **Добавлено**: История превышений лимита с детальной информацией
- ✅ **Добавлено**: Кнопка "Подробнее" в разделе бюджета для просмотра истории превышений
- ✅ **Добавлено**: Визуализация статистики превышений в разделе аналитики 
- ✅ **Исправлено**: Работа сортировки расходов на всех экранах
- ✅ **Улучшено**: Поддержка ввода десятичных значений с запятой (например, 0,80 или 0,10)

## Начало работы

1. Установите зависимости

   ```bash
   npm install
   ```

2. Запустите приложение

   ```bash
    npx expo start
   ```

## Технологии

- React Native с Expo
- TypeScript
- AsyncStorage для хранения данных
- React Navigation для маршрутизации
- Компоненты визуализации для графиков и диаграмм

## Лицензия

MIT
