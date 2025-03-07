import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

export const SegmentedControl = ({ values, selectedIndex, onChange, style }: SegmentedControlProps) => {
  return (
    <ThemedView style={[styles.container, style]}>
      {values.map((value, index) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.segment,
            index === selectedIndex && styles.selectedSegment,
            index === 0 && styles.firstSegment,
            index === values.length - 1 && styles.lastSegment,
          ]}
          onPress={() => onChange(index)}
        >
          <ThemedText style={[
            styles.segmentText,
            index === selectedIndex && styles.selectedSegmentText
          ]}>
            {value}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedSegment: {
    backgroundColor: '#4794eb',
  },
  firstSegment: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastSegment: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentText: {
    fontSize: 14,
  },
  selectedSegmentText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 