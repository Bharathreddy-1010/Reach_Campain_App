import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Eye, Users, Info } from 'lucide-react-native';
import { Colors, Radii, Shadows, useTheme } from '../../theme';
import { ReachCalculator, ReachMetrics } from '../../services/reachCalculator';
import { APP_CONFIG } from '../../constants';

interface ReachMeterProps {
  amount: number;
  ratePer100?: number;
  uniqueRatio?: number;
  showBreakdown?: boolean;
  style?: ViewStyle;
}

export const ReachMeter: React.FC<ReachMeterProps> = ({
  amount,
  ratePer100 = APP_CONFIG.defaultReachRatePer100INR,
  uniqueRatio = APP_CONFIG.uniqueReachRatio,
  showBreakdown = true,
  style,
}) => {
  const { colors } = useTheme();
  const metrics = ReachCalculator.calculate(amount, ratePer100, uniqueRatio);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Eye size={16} color={colors.accent} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Est. Impressions</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {ReachCalculator.formatNumber(metrics.impressions)}
          </Text>
          <Text style={[styles.metricSub, { color: colors.textMuted }]}>Total message views</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Users size={16} color={colors.primary} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Est. People Reached</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {ReachCalculator.formatNumber(metrics.uniquePeople)}
          </Text>
          <Text style={[styles.metricSub, { color: colors.textMuted }]}>Unique individuals (~75%)</Text>
        </View>
      </View>

      {showBreakdown && (
        <View style={[styles.breakdownContainer, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.breakdownTitle, { color: colors.textSecondary }]}>Budget Distribution</Text>
          <View style={styles.allocRow}>
            <View style={styles.allocItem}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.allocText, { color: colors.textSecondary }]}>
                Ad Placements (85%): {ReachCalculator.formatCurrency(metrics.directAdSpend)}
              </Text>
            </View>
            <View style={styles.allocItem}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.allocText, { color: colors.textSecondary }]}>
                Review & Ops (10%): {ReachCalculator.formatCurrency(metrics.platformFee)}
              </Text>
            </View>
            <View style={styles.allocItem}>
              <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
              <Text style={[styles.allocText, { color: colors.textSecondary }]}>
                Processing (5%): {ReachCalculator.formatCurrency(metrics.processingFee)}
              </Text>
            </View>
          </View>

          <View style={[styles.disclaimerRow, { backgroundColor: colors.surfaceSubtle }]}>
            <Info size={13} color={colors.textMuted} style={styles.disclaimerIcon} />
            <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
              Estimate based on platform baseline (~₹100 per 1,000 ad impressions). Distribution begins after platform review. Not a guarantee.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadows.subtle,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  breakdownContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  allocRow: {
    gap: 4,
    marginBottom: 10,
  },
  allocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  allocText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: 8,
    borderRadius: Radii.sm,
    gap: 6,
  },
  disclaimerIcon: {
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
});
