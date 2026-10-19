import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Lock } from 'lucide-react-native';
import { Colors, Radii, Spacing, useTheme } from '../../theme';
import { CreationStep } from '../../types';

interface StepIndicatorProps {
  currentStep: CreationStep;
  onSelectStep?: (step: CreationStep) => void;
  maxAccessibleStep?: CreationStep;
}

const STEPS = [
  { step: 1, label: 'Basics' },
  { step: 2, label: 'Story' },
  { step: 3, label: 'Visuals' },
  { step: 4, label: 'Reach' },
  { step: 5, label: 'Submit' },
] as const;

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onSelectStep,
  maxAccessibleStep = 1,
}) => {
  const { colors, themeId } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            themeId === 'aurora'
              ? 'transparent'
              : themeId === 'glassmorphism'
              ? 'rgba(255, 255, 255, 0.05)'
              : colors.surface,
          borderBottomWidth: themeId === 'aurora' ? 0 : 1,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.stepsRow}>
        {STEPS.map((s, idx) => {
          const isCurrent = s.step === currentStep;
          const isCompleted = s.step < currentStep && s.step <= maxAccessibleStep;
          const isAccessible = s.step <= maxAccessibleStep;

          return (
            <React.Fragment key={s.step}>
              <TouchableOpacity
                disabled={!isAccessible || !onSelectStep}
                onPress={() => onSelectStep && onSelectStep(s.step as CreationStep)}
                style={styles.stepItem}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: isCurrent
                        ? colors.primary
                        : isCompleted
                        ? colors.success
                        : themeId === 'glassmorphism'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : colors.surfaceHighlight,
                      borderColor: isCurrent
                        ? colors.primary
                        : isCompleted
                        ? colors.success
                        : colors.border,
                      borderWidth: 1,
                    },
                    !isAccessible && styles.lockedCircle,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={12} color={colors.textInverse} strokeWidth={3} />
                  ) : !isAccessible ? (
                    <Lock size={10} color={colors.textMuted} strokeWidth={2.4} />
                  ) : (
                    <Text
                      style={[
                        styles.circleText,
                        {
                          color: isCurrent
                            ? colors.textInverse
                            : isAccessible
                            ? colors.textSecondary
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {s.step}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isCurrent
                        ? colors.textPrimary
                        : isCompleted
                        ? colors.textSecondary
                        : colors.textMuted,
                      fontWeight: isCurrent ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>

              {idx < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        s.step < currentStep
                          ? colors.success
                          : colors.borderLight,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    minWidth: 46,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  currentCircle: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  completedCircle: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  lockedCircle: {
    opacity: 0.5,
  },
  circleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  currentCircleText: {
    color: Colors.textInverse,
  },
  lockedCircleText: {
    color: Colors.textMuted,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  currentLabel: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  completedLabel: {
    color: Colors.textSecondary,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.borderLight,
    marginBottom: 16,
    marginHorizontal: 2,
  },
  completedConnector: {
    backgroundColor: Colors.success,
  },
});
