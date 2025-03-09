/**
 * Функция для группировки элементов коллекции по результату итератора
 * 
 * Аналог функции groupBy из библиотеки lodash
 * 
 * @param collection Коллекция элементов (массив)
 * @param iteratee Функция-итератор или строка (ключ объекта)
 * @returns Объект, где ключи - результаты выполнения итератора, а значения - массивы элементов
 */
export function groupBy<T>(
  collection: T[],
  iteratee: ((item: T) => string | number) | string
): Record<string, T[]> {
  // Проверка на пустую коллекцию
  if (!collection || !Array.isArray(collection) || collection.length === 0) {
    return {};
  }

  // Результирующий объект
  const result: Record<string, T[]> = {};

  // Определяем функцию-итератор
  const getKey = typeof iteratee === 'function'
    ? iteratee
    : (item: T) => {
        // Если iteratee - строка, используем ее как путь к свойству
        return item && typeof item === 'object' && item !== null
          ? String((item as any)[iteratee] ?? 'undefined')
          : 'undefined';
      };

  // Группируем элементы
  for (const item of collection) {
    const key = String(getKey(item));
    
    // Если такого ключа еще нет, создаем для него массив
    if (!result[key]) {
      result[key] = [];
    }
    
    // Добавляем элемент в соответствующую группу
    result[key].push(item);
  }

  return result;
}

/**
 * Пример использования:
 * 
 * const users = [
 *   { name: 'John', age: 25 },
 *   { name: 'Jane', age: 30 },
 *   { name: 'Bob', age: 25 }
 * ];
 * 
 * // Группировка по возрасту через строку-ключ
 * const groupedByAge = groupBy(users, 'age');
 * // Результат:
 * // {
 * //   '25': [{ name: 'John', age: 25 }, { name: 'Bob', age: 25 }],
 * //   '30': [{ name: 'Jane', age: 30 }]
 * // }
 * 
 * // Группировка по функции
 * const groupedByFirstLetter = groupBy(users, (user) => user.name[0]);
 * // Результат:
 * // {
 * //   'J': [{ name: 'John', age: 25 }, { name: 'Jane', age: 30 }],
 * //   'B': [{ name: 'Bob', age: 25 }]
 * // }
 */ 