/**
 * Форматирование числа в денежный формат
 * @param amount Числовое значение суммы
 * @param currency Валюта (по умолчанию - BYN)
 * @returns Отформатированная строка с суммой (без символа валюты)
 */
export function formatCurrency(amount: number, currency: string = 'BYN'): string {
  // Проверка на NaN и другие некорректные значения
  if (isNaN(amount) || !isFinite(amount)) {
    return '0.00';
  }
  
  // Округляем до 2 знаков после запятой и форматируем
  return Number(amount).toFixed(2);
}

/**
 * Безопасное форматирование любого значения в строку.
 * Гарантирует, что результат всегда будет строкой, даже если входное 
 * значение undefined, null или некорректное.
 * 
 * @param value Любое значение для конвертации в строку
 * @param defaultValue Значение по умолчанию, если входное значение undefined или null
 * @returns Безопасная строка
 */
export function safeString(value: any, defaultValue: string = ''): string {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  try {
    // Если это объект Date
    if (value instanceof Date) {
      return value.toLocaleDateString('ru-RU');
    }
    
    // Если это число
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        return defaultValue;
      }
      return value.toString();
    }
    
    // Если это уже строка
    if (typeof value === 'string') {
      return value;
    }
    
    // Для всех остальных случаев
    return String(value);
  } catch (error) {
    console.error('Ошибка при преобразовании в строку:', error);
    return defaultValue;
  }
}

/**
 * Форматирование даты в строковое представление
 * @param date Объект даты для форматирования
 * @param includeTime Включать ли время в форматирование
 * @returns Отформатированная строка с датой (и временем, если указано)
 */
export function formatDate(date: Date, includeTime: boolean = false): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.getDate() === today.getDate() &&
                 date.getMonth() === today.getMonth() &&
                 date.getFullYear() === today.getFullYear();
  
  const isYesterday = date.getDate() === yesterday.getDate() &&
                     date.getMonth() === yesterday.getMonth() &&
                     date.getFullYear() === yesterday.getFullYear();
  
  let formattedDate = '';
  
  if (isToday) {
    formattedDate = 'Сегодня';
  } else if (isYesterday) {
    formattedDate = 'Вчера';
  } else {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    };
    
    formattedDate = date.toLocaleDateString('ru-RU', options);
  }
  
  if (includeTime) {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    
    formattedDate += ` в ${date.toLocaleTimeString('ru-RU', timeOptions)}`;
  }
  
  return formattedDate;
}

/**
 * Форматирование текущей даты в формат "день месяц, год"
 * @returns Отформатированная строка с текущей датой
 */
export function formatCurrentDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  
  return now.toLocaleDateString('ru-RU', options);
}

/**
 * Преобразование даты в строку для использования в запросах и сравнениях
 * @param date Объект даты
 * @returns Строка в формате "YYYY-MM-DD"
 */
export function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
} 