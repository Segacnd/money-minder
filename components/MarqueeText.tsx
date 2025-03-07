import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Text } from 'react-native';
import { ThemedText } from './ThemedText';

interface MarqueeTextProps {
  text: string;
  speed?: number;
  containerWidth?: number;
  style?: any;
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  speed = 50,
  containerWidth = 200,
  style,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = React.useState(0);

  useEffect(() => {
    if (textWidth > 0) {
      const duration = (textWidth * 1000) / speed;

      Animated.loop(
        Animated.timing(scrollX, {
          toValue: -textWidth,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [textWidth, text, speed]);

  const fullText = text + "   •   " + text;

  return (
    <View style={[styles.visibleContainer, { width: containerWidth }]}>
      <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [{ translateX: scrollX }],
            },
          ]}
        >
          <Text
            style={{ opacity: 0, position: 'absolute' }}
            onLayout={(event) => {
              setTextWidth(event.nativeEvent.layout.width);
            }}
          >
            {text}
          </Text>
          <ThemedText style={[styles.text, style]}>
            {fullText}
          </ThemedText>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  visibleContainer: {
    overflow: 'hidden',
    height: 20,
  },
  animationContainer: {
    flexDirection: 'row',
    position: 'relative',
    height: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
  },
  text: {
    flexShrink: 0,
    height: '100%',
    lineHeight: 20,
  },
}); 