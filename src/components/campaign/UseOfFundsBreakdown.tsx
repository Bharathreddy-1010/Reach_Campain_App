import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Shield, HelpCircle, RefreshCcw } from 'lucide-react-native';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../theme';
import { ReachCalculator } from '../../services/reachCalculator';
import { APP_CONFIG } from '../../constants';

interface UseOfFundsBreakdownProps {
  goalAmount: number;
}

export const UseOfFundsBreakdown: React.FC<UseOfFundsBreakdownProps> = ({
  goalAmount,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = ReachCalculator.calculate(goalAmount);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.headerRow}
      >
        <View style={styles.headerLeft}>
          <Shield size={18} color={colors.primary} />
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Use of Funds & Distribution Policies</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Transparent 85 / 10 / 5 budget allocation
            </Text>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {/* Visual Bar representation */}
      <View style={styles.barContainer}>
        <View style={[styles.barSegment, { flex: 85, backgroundColor: colors.accent }]} />
        <View style={[styles.barSegment, { flex: 10, backgroundColor: '#F59E0B' }]} />
        <View style={[styles.barSegment, { flex: 5, backgroundColor: colors.textMuted }]} />
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            85% Ads ({ReachCalculator.formatCurrency(metrics.directAdSpend)})
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            10% Ops ({ReachCalculator.formatCurrency(metrics.platformFee)})
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
            5% Fees ({ReachCalculator.formatCurrency(metrics.processingFee)})
          </Text>
        </View>
      </View>

      {isExpanded && (
        <View style={[styles.expandedContent, { borderTopColor: colors.borderLight }]}>
          <View style={styles.policyItem}>
            <Text style={[styles.policyTitle, { color: colors.textPrimary }]}>85% Direct Media & Ad Placements</Text>
            <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
              Allocated directly to purchasing digital ad placements (Meta, verified publisher networks) targeted exclusively to the intended audience parameters.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <Text style={[styles.policyTitle, { color: colors.textPrimary }]}>10% Platform Compliance & Fact-Checking</Text>
            <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
              Covers human editorial verification of primary citations, ad creative design assistance, policy compliance, and post-campaign transparency reporting.
            </Text>
          </View>

          <View style={styles.policyItem}>
            <Text style={[styles.policyTitle, { color: colors.textPrimary }]}>5% Payment & Bank Processing</Text>
            <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
              Covers domestic gateway processing, GST compliance, receipt generation, and fraud screening.
            </Text>
          </View>

          <View style={[styles.disclaimerBox, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.disclaimerHeader}>
              <RefreshCcw size={14} color={colors.textPrimary} />
              <Text style={[styles.disclaimerHeadText, { color: colors.textPrimary }]}>Unspent Funds & Refund Policy</Text>
            </View>
            <Text style={[styles.disclaimerBody, { color: colors.textSecondary }]}>
              {APP_CONFIG.disclaimers.refundPolicy} Any unspent advertising budget after distribution completes is credited to the campaign creator’s reserve or returned to backers pro-rata.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    ...Shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  title: {
    ...Typography.sectionTitle,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  barContainer: {
    height: 8,
    borderRadius: Radii.full,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  barSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  policyItem: {
    marginBottom: 6,
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  policyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  disclaimerBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: 6,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  disclaimerHeadText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  disclaimerBody: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
