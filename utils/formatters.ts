/**
 * Форматирование числа в денежный формат с символом валюты
 * @param amount Числовое значение суммы
 * @param currency Валюта (по умолчанию - рубль)
 * @returns Отформатированная строка с суммой и символом валюты
 */
export function formatCurrency(amount: number, currency: string = 'BYN'): string {
  return `${amount.toFixed(2)} ${currency}`;
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