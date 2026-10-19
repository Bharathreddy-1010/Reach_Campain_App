import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Search, X, Compass } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { CampaignCard } from '../../src/components/campaign/CampaignCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { CampaignRepository } from '../../src/repositories/campaignRepository';
import { Campaign, Category, UserProfile } from '../../src/types';
import { Radii, Shadows, Spacing, Typography, useTheme } from '../../src/theme';
import { CATEGORIES } from '../../src/constants';

type SortOption = 'relevance' | 'newest' | 'funding' | 'reach';

export default function ExploreScreen() {
  const { colors, themeId } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const loadData = async () => {
    const list = await CampaignRepository.getAllCampaigns();
    const profile = await CampaignRepository.getUserProfile();
    setCampaigns(list);
    setUserProfile(profile);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleToggleSave = async (campaignId: string) => {
    await CampaignRepository.toggleSaveCampaign(campaignId);
    const updatedProfile = await CampaignRepository.getUserProfile();
    setUserProfile(updatedProfile);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('relevance');
  };

  // Filter and Sort Logic
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    // Category filter
    if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.creator.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.creator.organization?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'funding':
        result.sort((a, b) => {
          const pctA = a.funding.goal > 0 ? a.funding.raised / a.funding.goal : 0;
          const pctB = b.funding.goal > 0 ? b.funding.raised / b.funding.goal : 0;
          return pctB - pctA;
        });
        break;
      case 'reach':
        result.sort((a, b) => b.funding.goal - a.funding.goal);
        break;
      case 'relevance':
      default:
        // Prioritize active funding campaigns
        result.sort((a, b) => (b.status === 'funding' ? 1 : 0) - (a.status === 'funding' ? 1 : 0));
        break;
    }

    return result;
  }, [campaigns, searchQuery, selectedCategory, sortBy]);

  return (
    <ScreenWrapper scrollable={false}>
      {/* Header & Search Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.screenHeading, { color: colors.textPrimary }]}>Explore Campaigns</Text>
        <Text style={[styles.screenSub, { color: colors.textSecondary }]}>
          Discover community campaigns, inspect citations, and amplify reach.
        </Text>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor:
                themeId === 'glassmorphism'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : colors.background,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: themeId === 'aurora' || themeId === 'glassmorphism' ? 24 : Radii.md,
            },
          ]}
        >
          <Search size={18} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by topic, keyword, creator, or source..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Pills (Warm Clay pill styling) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={[
            styles.categoryContent,
            themeId === 'aurora' && { gap: 10, paddingVertical: 4 },
          ]}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.catChip,
              {
                backgroundColor:
                  selectedCategory === null
                    ? colors.primary
                    : colors.surface,
                borderColor: selectedCategory === null ? colors.primary : colors.border,
                borderWidth: 1,
                borderRadius: themeId === 'aurora' || themeId === 'glassmorphism' ? 22 : Radii.sm,
                paddingHorizontal: 16,
                paddingVertical: 8,
              },
            ]}
          >
            <Text
              style={[
                styles.catChipText,
                {
                  color:
                    selectedCategory === null
                      ? colors.textInverse
                      : colors.textSecondary,
                  fontWeight: selectedCategory === null ? '700' : '500',
                  fontSize: 13,
                },
              ]}
            >
              All Topics
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() =>
                  setSelectedCategory(isSelected ? null : cat)
                }
                style={[
                  styles.catChip,
                  {
                    backgroundColor:
                      isSelected
                        ? colors.primary
                        : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: 1,
                    borderRadius: themeId === 'aurora' || themeId === 'glassmorphism' ? 22 : Radii.sm,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    {
                      color:
                        isSelected
                          ? colors.textInverse
                          : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: 13,
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort & Results Count Bar */}
        <View style={styles.sortBar}>
          <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
            {filteredCampaigns.length}{' '}
            {filteredCampaigns.length === 1 ? 'campaign found' : 'campaigns found'}
          </Text>

          <View style={styles.sortTabs}>
            <TouchableOpacity
              onPress={() => setSortBy('relevance')}
              style={[
                styles.sortBtn,
                sortBy === 'relevance' && {
                  backgroundColor:
                    themeId === 'aurora'
                      ? colors.primary
                      : colors.surfaceSubtle,
                },
                themeId === 'aurora' && { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
              ]}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  {
                    color:
                      sortBy === 'relevance'
                        ? themeId === 'aurora'
                          ? colors.textInverse
                          : colors.primary
                        : colors.textMuted,
                  },
                  sortBy === 'relevance' && { fontWeight: '700' },
                ]}
              >
                Trending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy('newest')}
              style={[
                styles.sortBtn,
                sortBy === 'newest' && {
                  backgroundColor:
                    themeId === 'aurora'
                      ? colors.primary
                      : colors.surfaceSubtle,
                },
                themeId === 'aurora' && { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
              ]}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  {
                    color:
                      sortBy === 'newest'
                        ? themeId === 'aurora'
                          ? colors.textInverse
                          : colors.primary
                        : colors.textMuted,
                  },
                  sortBy === 'newest' && { fontWeight: '700' },
                ]}
              >
                Newest
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy('funding')}
              style={[
                styles.sortBtn,
                sortBy === 'funding' && {
                  backgroundColor:
                    themeId === 'aurora'
                      ? colors.primary
                      : colors.surfaceSubtle,
                },
                themeId === 'aurora' && { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
              ]}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  {
                    color:
                      sortBy === 'funding'
                        ? themeId === 'aurora'
                          ? colors.textInverse
                          : colors.primary
                        : colors.textMuted,
                  },
                  sortBy === 'funding' && { fontWeight: '700' },
                ]}
              >
                % Funded
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Campaigns List */}
      <FlatList
        data={filteredCampaigns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            isSaved={userProfile?.savedCampaignIds.includes(item.id)}
            onToggleSave={handleToggleSave}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Compass size={32} color={colors.textSecondary} />}
            title="No Campaigns Found"
            description={
              searchQuery || selectedCategory
                ? 'Try broadening your search or clearing category filters.'
                : 'No campaigns currently in this view.'
            }
            actionLabel="Reset Search & Filters"
            onAction={clearFilters}
          />
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
  },
  screenSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  categoryScroll: {
    marginHorizontal: -Spacing.lg,
    marginBottom: 10,
  },
  categoryContent: {
    paddingHorizontal: Spacing.lg,
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  resultsCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  sortTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.xs,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 48,
  },
});
