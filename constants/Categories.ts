import { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

export interface Category {
  name: string;
  icon: MaterialIconName;
  color?: string;
}

/**
 * Предопределенные категории расходов
 */
export const predefinedCategories: Category[] = [
  {
    name: 'Продукты',
    icon: 'shopping-cart',
    color: '#4CAF50', // Зеленый
  },
  {
    name: 'Транспорт',
    icon: 'directions-car',
    color: '#2196F3', // Синий
  },
  {
    name: 'Жильё',
    icon: 'home',
    color: '#9C27B0', // Фиолетовый
  },
  {
    name: 'Развлечения',
    icon: 'movie',
    color: '#FF9800', // Оранжевый
  },
  {
    name: 'Здоровье',
    icon: 'favorite',
    color: '#E91E63', // Розовый
  },
  {
    name: 'Одежда',
    icon: 'shopping-bag',
    color: '#3F51B5', // Индиго
  },
  {
    name: 'Рестораны',
    icon: 'restaurant',
    color: '#F44336', // Красный
  },
  {
    name: 'Путешествия',
    icon: 'flight',
    color: '#00BCD4', // Голубой
  },
  {
    name: 'Связь',
    icon: 'phone',
    color: '#FF5722', // Оранжево-красный
  },
  {
    name: 'Образование',
    icon: 'school',
    color: '#795548', // Коричневый
  },
  {
    name: 'Другое',
    icon: 'label',
    color: '#607D8B', // Серо-синий
  },
]; 