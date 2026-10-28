import React from 'react';
import { SearchItem } from '../../../types/home.type';
import { SearchMemberCard } from './SearchMemberCard';
import { SearchTaskCard } from './SearchTaskCard';
import { SearchUserStoryCard } from './SearchUserStoryCard';
import { SearchProjectCard } from './SearchProjectCard';
import { SearchSprintCard } from './SearchSprintCard';

interface SearchItemCardProps {
  item: SearchItem;
  onPress: (
    item: SearchItem,
    origin?: { x: number; y: number; size: number },
  ) => void;
}

export const SearchItemCard = React.memo<SearchItemCardProps>(
  ({ item, onPress }) => {
    const itemType =
      item.type || (item.email || item.user_name ? 'member' : 'task');

    switch (itemType) {
      case 'member':
        return <SearchMemberCard item={item} onPress={onPress} />;
      case 'task':
        return <SearchTaskCard item={item} onPress={onPress} />;
      case 'user_story':
        return <SearchUserStoryCard item={item} onPress={onPress} />;
      case 'project':
        return <SearchProjectCard item={item} onPress={onPress} />;
      case 'sprint':
        return <SearchSprintCard item={item} onPress={onPress} />;
      default:
        return <SearchTaskCard item={item} onPress={onPress} />;
    }
  },
);
