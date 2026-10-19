import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award, CheckCircle, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react-native';
import { CampaignReport } from '../../types';
import { Colors, Radii, Shadows, Spacing, Typography, useTheme } from '../../theme';
import { ReachCalculator } from '../../services/reachCalculator';

interface ReportViewerProps {
  report: CampaignReport;
  campaignTitle: string;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  campaignTitle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <ShieldCheck size={18} color={colors.success} />
          <Text style={[styles.headerBadge, { color: colors.success }]}>
            {report.status === 'completed' ? 'Post-Distribution Transparency Report' : 'Interim Distribution Report'}
          </Text>
        </View>
        <Text style={[styles.reportDate, { color: colors.textMuted }]}>Generated {report.generatedDate}</Text>
      </View>

      <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
        Official audit report of digital distribution spend and audience delivery for "{campaignTitle}".
      </Text>

      {/* Main Delivery Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricItem, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderLight }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Impressions Delivered</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {ReachCalculator.formatNumber(report.impressionsDelivered)}
          </Text>
          <Text style={[styles.metricNote, { color: colors.textMuted }]}>Verified ad displays</Text>
        </View>

        <View style={[styles.metricItem, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderLight }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Unique People Reached</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {ReachCalculator.formatNumber(report.uniquePeopleReached)}
          </Text>
          <Text style={[styles.metricNote, { color: colors.textMuted }]}>Deduplicated audience</Text>
        </View>

        <View style={[styles.metricItem, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderLight }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Engaged Clicks</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {ReachCalculator.formatNumber(report.clickThroughs)}
          </Text>
          <Text style={[styles.metricNote, { color: colors.textMuted }]}>CTR: ~{((report.clickThroughs / report.impressionsDelivered) * 100).toFixed(2)}%</Text>
        </View>

        <View style={[styles.metricItem, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderLight }]}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Average Cost / View</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{report.avgCostPerImpression}</Text>
          <Text style={[styles.metricNote, { color: colors.textMuted }]}>Effective CPM: ₹100</Text>
        </View>
      </View>

      {/* Financial Accounting */}
      <View style={[styles.financialSection, { borderTopColor: colors.borderLight }]}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Financial Audit & Fund Reconciliation</Text>
        <View style={styles.financeRow}>
          <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Total Community Funds Raised:</Text>
          <Text style={[styles.financeValue, { color: colors.textPrimary }]}>{ReachCalculator.formatCurrency(report.fundsRaised)}</Text>
        </View>
        <View style={styles.financeRow}>
          <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Direct Ad Spend Deployed (85%):</Text>
          <Text style={[styles.financeValue, { color: colors.textPrimary }]}>{ReachCalculator.formatCurrency(report.adSpendActual)}</Text>
        </View>
        <View style={styles.financeRow}>
          <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Platform Review & Ad Ops (10%):</Text>
          <Text style={[styles.financeValue, { color: colors.textPrimary }]}>{ReachCalculator.formatCurrency(report.platformOpsActual)}</Text>
        </View>
        <View style={styles.financeRow}>
          <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Payment Processing & GST (5%):</Text>
          <Text style={[styles.financeValue, { color: colors.textPrimary }]}>{ReachCalculator.formatCurrency(report.paymentProcessingActual)}</Text>
        </View>
      </View>

      {/* Channel Breakdown */}
      {report.channelsSummary && report.channelsSummary.length > 0 && (
        <View style={[styles.channelSection, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Channel Performance</Text>
          {report.channelsSummary.map((ch, idx) => (
            <View key={idx} style={styles.channelRow}>
              <Text style={[styles.channelName, { color: colors.textPrimary }]}>{ch.channel}</Text>
              <Text style={[styles.channelMetrics, { color: colors.textSecondary }]}>
                {ReachCalculator.formatNumber(ch.impressions)} views • {ReachCalculator.formatCurrency(ch.spend)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {report.moderationNotes && (
        <View style={[styles.notesBox, { backgroundColor: colors.surfaceHighlight }]}>
          <Text style={[styles.notesTitle, { color: colors.textPrimary }]}>Auditor & Delivery Notes:</Text>
          <Text style={[styles.notesBody, { color: colors.textSecondary }]}>{report.moderationNotes}</Text>
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
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  headerBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  reportDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: 130,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricNote: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  financialSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  financeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  financeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  channelSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: 12,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  channelName: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  channelMetrics: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notesBox: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radii.md,
    padding: 10,
    marginTop: 6,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  notesBody: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});
