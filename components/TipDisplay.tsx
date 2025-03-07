import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { ThemedText } from './ThemedText';

interface TipDisplayProps {
  tips: string[];
  intervalDuration?: number;
  style?: any;
}

export const TipDisplay: React.FC<TipDisplayProps> = ({
  tips,
  intervalDuration = 5000,
  style,
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [nextTipIndex, setNextTipIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Подготавливаем следующий индекс
      const next = currentTipIndex === tips.length - 1 ? 0 : currentTipIndex + 1;
      setNextTipIndex(next);

      // Анимация затухания текущего текста
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // После затухания меняем текущий индекс
        setCurrentTipIndex(next);
        // Анимация появления нового текста
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [tips.length, intervalDuration, currentTipIndex]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ThemedText style={[styles.text, style]} numberOfLines={1}>
        {tips[currentTipIndex]}
      </ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  text: {
    textAlign: 'left',
    fontSize: 13,
    opacity: 0.7,
  },
}); 