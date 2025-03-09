import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { formatCurrency } from '@/utils/formatters';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

/**
 * Безопасный компонент для отображения текста
 * Автоматически применяет стили темы и гарантирует, что текст правильно обработан
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  children,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Применяем стиль в зависимости от типа
  const textStyle = [
    { color },
    type === 'default' ? styles.default : undefined,
    type === 'title' ? styles.title : undefined,
    type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
    type === 'subtitle' ? styles.subtitle : undefined,
    type === 'link' ? styles.link : undefined,
    style,
  ];

  return (
    <Text style={textStyle} {...rest}>
      {children}
    </Text>
  );
}

/**
 * Компонент для безопасного отображения форматированной валюты
 */
interface CurrencyTextProps {
  amount: number;
  currency?: string;
  style?: any;
}

export function CurrencyText({ amount, currency = 'BYN', style }: CurrencyTextProps) {
  // Предотвращаем ошибки с NaN и другими некорректными значениями
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formattedValue = formatCurrency(safeAmount);
  
  return (
    <Text style={style}>
      {formattedValue} {currency}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
