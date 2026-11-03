import React, { useRef, useEffect } from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText } from '../../../components';
import { useResponsive } from '../../../utils/responsive';
import { SprintFilterBarProps } from '../../../utils/sprintUtil';
import { Radius } from '../../../constants/Radius';

const SprintFilterBar: React.FC<SprintFilterBarProps> = ({
  activeTab,
  onSelectTab,
  isFilterActive,
  onToggleFilter,
  isSearchActive,
  onToggleSearch,
  searchQuery,
  onChangeSearchQuery,
  totalFilteredCount,
  allCount,
  storiesCount,
  storylessCount,
  highPriorityCount,
  colors,
}) => {
  const { moderateScale } = useResponsive();
  const filterScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isFilterActive && activeTab === 'high_priority') {
      setTimeout(() => {
        filterScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isFilterActive, activeTab]);

  return (
    <View style={{ marginTop: moderateScale(22) }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom:
            !isFilterActive && !isSearchActive ? moderateScale(14) : 0,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(8),
          }}
        >
          <AppText
            variant='h2'
            style={{
              fontSize: moderateScale(20),
              fontWeight: '800',
              color: colors.text,
            }}
          >
            User Stories
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleSearch}
            style={{
              width: moderateScale(38),
              height: moderateScale(38),
              borderRadius: moderateScale(19),
              backgroundColor: isSearchActive ? colors.card : 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: moderateScale(8),
            }}
          >
            <Ionicons
              name='search-outline'
              size={moderateScale(18)}
              color={isSearchActive ? colors.text : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleFilter}
            style={{
              width: moderateScale(38),
              height: moderateScale(38),
              borderRadius: moderateScale(19),
              backgroundColor: isFilterActive ? colors.card : 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name='options-outline'
              size={moderateScale(18)}
              color={isFilterActive ? colors.text : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
      {isSearchActive && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: moderateScale(14),
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: moderateScale(10),
            paddingVertical: moderateScale(6),
            marginTop: moderateScale(10),
            marginBottom: !isFilterActive ? moderateScale(14) : 0,
          }}
        >
          <Ionicons
            name='search'
            size={moderateScale(16)}
            color={colors.textSecondary}
            style={{ marginRight: moderateScale(6) }}
          />
          <TextInput
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            placeholder='Search stories by title or key...'
            placeholderTextColor={colors.placeholder}
            style={{
              flex: 1,
              fontSize: moderateScale(13),
              color: colors.text,
              paddingVertical: 0,
            }}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onChangeSearchQuery('')}>
              <Ionicons
                name='close-circle'
                size={moderateScale(16)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      {isFilterActive && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: moderateScale(12),
            marginBottom: moderateScale(14),
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSelectTab('all')}
            style={{
              backgroundColor:
                activeTab === 'all' ? colors.primary : 'transparent',
              borderRadius: moderateScale(18),
              padding: moderateScale(6),
            }}
          >
            <AppText
              variant='caption'
              style={{
                fontSize: moderateScale(12),
                fontWeight: activeTab === 'all' ? '700' : '500',
                color:
                  activeTab === 'all' ? colors.white : colors.textSecondary,
              }}
            >
              All ({allCount})
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSelectTab('stories')}
            style={{
              backgroundColor:
                activeTab === 'stories' ? colors.primary : 'transparent',
              borderRadius: moderateScale(18),
              padding: moderateScale(6),
            }}
          >
            <AppText
              variant='caption'
              style={{
                fontSize: moderateScale(12),
                fontWeight: activeTab === 'stories' ? '700' : '500',
                color:
                  activeTab === 'stories' ? colors.white : colors.textSecondary,
              }}
            >
              Stories ({storiesCount})
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSelectTab('storyless')}
            style={{
              backgroundColor:
                activeTab === 'storyless' ? colors.primary : 'transparent',
              borderRadius: moderateScale(18),
              padding: moderateScale(6),
            }}
          >
            <AppText
              variant='caption'
              style={{
                fontSize: moderateScale(12),
                fontWeight: activeTab === 'storyless' ? '700' : '500',
                color:
                  activeTab === 'storyless'
                    ? colors.white
                    : colors.textSecondary,
              }}
            >
              Storyless Tasks ({storylessCount})
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onSelectTab('high_priority')}
            style={{
              backgroundColor:
                activeTab === 'high_priority' ? colors.primary : 'transparent',
              borderRadius: moderateScale(18),
              padding: moderateScale(6),
            }}
          >
            <AppText
              variant='caption'
              style={{
                fontSize: moderateScale(12),
                fontWeight: activeTab === 'high_priority' ? '700' : '500',
                color:
                  activeTab === 'high_priority'
                    ? colors.white
                    : colors.textSecondary,
              }}
            >
              High priority ({highPriorityCount})
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default React.memo(SprintFilterBar);
