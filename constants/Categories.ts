export interface Category {
  name: string;
  icon: string;
  color?: string;
}

/**
 * Предопределенные категории расходов
 */
export const predefinedCategories: Category[] = [
  {
    name: 'Продукты',
    icon: 'cart',
    color: '#4CAF50', // Зеленый
  },
  {
    name: 'Транспорт',
    icon: 'car',
    color: '#2196F3', // Синий
  },
  {
    name: 'Жильё',
    icon: 'house',
    color: '#9C27B0', // Фиолетовый
  },
  {
    name: 'Развлечения',
    icon: 'film',
    color: '#FF9800', // Оранжевый
  },
  {
    name: 'Здоровье',
    icon: 'heart',
    color: '#E91E63', // Розовый
  },
  {
    name: 'Одежда',
    icon: 'bag',
    color: '#3F51B5', // Индиго
  },
  {
    name: 'Рестораны',
    icon: 'fork.knife',
    color: '#F44336', // Красный
  },
  {
    name: 'Путешествия',
    icon: 'airplane',
    color: '#00BCD4', // Голубой
  },
  {
    name: 'Связь',
    icon: 'phone',
    color: '#FF5722', // Оранжево-красный
  },
  {
    name: 'Образование',
    icon: 'book',
    color: '#795548', // Коричневый
  },
  {
    name: 'Другое',
    icon: 'tag',
    color: '#607D8B', // Серо-синий
  },
]; 