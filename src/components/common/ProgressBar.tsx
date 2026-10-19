import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Radii, useTheme } from '../../theme';
import { ReachCalculator } from '../../services/reachCalculator';

interface ProgressBarProps {
  current: number;
  target: number;
  showLabels?: boolean;
  barHeight?: number;
  tintColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  showLabels = true,
  barHeight = 6,
  tintColor,
  style,
}) => {
  const { colors } = useTheme();
  const effectiveTint = tintColor || colors.primary;
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
  const barWidthPercent = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={[styles.container, style]}>
      {showLabels && (
        <View style={styles.labelRow}>
          <Text style={[styles.raisedText, { color: colors.textPrimary }]}>
            {ReachCalculator.formatCurrency(current)}{' '}
            <Text style={[styles.goalText, { color: colors.textSecondary }]}>
              raised of {ReachCalculator.formatCurrency(target)}
            </Text>
          </Text>
          <Text style={[styles.percentText, { color: effectiveTint }]}>{percentage}%</Text>
        </View>
      )}
      <View style={[styles.track, { height: barHeight, backgroundColor: colors.surfaceHighlight }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${barWidthPercent}%`,
              backgroundColor: effectiveTint,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  raisedText: {
    fontSize: 14,
    fontWeight: '700',
  },
  goalText: {
    fontSize: 13,
    fontWeight: '400',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    width: '100%',
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.full,
  },
});
