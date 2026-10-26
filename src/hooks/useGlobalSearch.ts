import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLazyGlobalSearchQuery } from '../store/api/homeApi';
import {
  SearchCategory,
  CategoryPagingState,
  CategoryDataState,
  TYPE_MAPPING,
  SearchItem,
  SearchMeta,
} from '../types/home.type';

export const useGlobalSearch = () => {
  const [triggerSearch] = useLazyGlobalSearchQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<SearchCategory>('all');

  const [categoryData, setCategoryData] = useState<CategoryDataState>({
    tasks: [],
    user_stories: [],
    projects: [],
    members: [],
    sprints: [],
  });

  const [metaData, setMetaData] = useState<SearchMeta | undefined>(undefined);

  const [categoryPaging, setCategoryPaging] = useState<
    Record<SearchCategory, CategoryPagingState>
  >({
    all: { page: 1, has_next: false, total: 0 },
    tasks: { page: 1, has_next: false, total: 0 },
    user_stories: { page: 1, has_next: false, total: 0 },
    projects: { page: 1, has_next: false, total: 0 },
    members: { page: 1, has_next: false, total: 0 },
    sprints: { page: 1, has_next: false, total: 0 },
  });

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isPaginatingRef = useRef(false);
  const initialSearchRequestIdRef = useRef(0);

  // Debounce search query changes
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Initial search: called whenever debounced search query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setCategoryData({
        tasks: [],
        user_stories: [],
        projects: [],
        members: [],
        sprints: [],
      });
      setMetaData(undefined);
      setCategoryPaging({
        all: { page: 1, has_next: false, total: 0 },
        tasks: { page: 1, has_next: false, total: 0 },
        user_stories: { page: 1, has_next: false, total: 0 },
        projects: { page: 1, has_next: false, total: 0 },
        members: { page: 1, has_next: false, total: 0 },
        sprints: { page: 1, has_next: false, total: 0 },
      });
      setIsInitialLoading(false);
      return;
    }

    const requestId = ++initialSearchRequestIdRef.current;
    setIsInitialLoading(true);

    triggerSearch({
      query: trimmed,
      category: 'all',
      page: 1,
      page_size: 10,
    })
      .unwrap()
      .then(res => {
        if (requestId !== initialSearchRequestIdRef.current) return;

        const p = res.pagination || res.meta?.pagination;

        setCategoryData({
          tasks: (res.data?.tasks || []).map(i => ({
            ...i,
            type: i.type || 'task',
          })),
          user_stories: (res.data?.user_stories || []).map(i => ({
            ...i,
            type: i.type || 'user_story',
          })),
          projects: (res.data?.projects || []).map(i => ({
            ...i,
            type: i.type || 'project',
          })),
          members: (res.data?.members || []).map(i => ({
            ...i,
            type: i.type || 'member',
          })),
          sprints: (res.data?.sprints || []).map(i => ({
            ...i,
            type: i.type || 'sprint',
          })),
        });

        setMetaData(res.meta);

        setCategoryPaging({
          all: {
            page: 1,
            has_next: Boolean(res.meta?.has_next),
            total: res.meta?.total ?? 0,
          },
          tasks: {
            page: 1,
            has_next: Boolean(p?.tasks?.has_next),
            total: p?.tasks?.total ?? res.meta?.total_tasks ?? 0,
          },
          user_stories: {
            page: 1,
            has_next: Boolean(p?.user_stories?.has_next),
            total: p?.user_stories?.total ?? res.meta?.total_user_stories ?? 0,
          },
          projects: {
            page: 1,
            has_next: Boolean(p?.projects?.has_next),
            total: p?.projects?.total ?? res.meta?.total_projects ?? 0,
          },
          members: {
            page: 1,
            has_next: Boolean(p?.members?.has_next),
            total: p?.members?.total ?? res.meta?.total_members ?? 0,
          },
          sprints: {
            page: 1,
            has_next: Boolean(p?.sprints?.has_next),
            total: p?.sprints?.total ?? res.meta?.total_sprints ?? 0,
          },
        });
      })
      .catch(err => {
        if (requestId !== initialSearchRequestIdRef.current) return;
        console.error('Initial global search error:', err);
      })
      .finally(() => {
        if (requestId === initialSearchRequestIdRef.current) {
          setIsInitialLoading(false);
        }
      });
  }, [debouncedQuery, triggerSearch]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return;

    try {
      setIsRefreshing(true);
      const res = await triggerSearch({
        query: trimmed,
        category: 'all',
        page: 1,
        page_size: 10,
      }).unwrap();

      const p = res.pagination || res.meta?.pagination;

      setCategoryData({
        tasks: (res.data?.tasks || []).map(i => ({
          ...i,
          type: i.type || 'task',
        })),
        user_stories: (res.data?.user_stories || []).map(i => ({
          ...i,
          type: i.type || 'user_story',
        })),
        projects: (res.data?.projects || []).map(i => ({
          ...i,
          type: i.type || 'project',
        })),
        members: (res.data?.members || []).map(i => ({
          ...i,
          type: i.type || 'member',
        })),
        sprints: (res.data?.sprints || []).map(i => ({
          ...i,
          type: i.type || 'sprint',
        })),
      });

      setMetaData(res.meta);

      setCategoryPaging({
        all: {
          page: 1,
          has_next: Boolean(res.meta?.has_next),
          total: res.meta?.total ?? 0,
        },
        tasks: {
          page: 1,
          has_next: Boolean(p?.tasks?.has_next),
          total: p?.tasks?.total ?? res.meta?.total_tasks ?? 0,
        },
        user_stories: {
          page: 1,
          has_next: Boolean(p?.user_stories?.has_next),
          total: p?.user_stories?.total ?? res.meta?.total_user_stories ?? 0,
        },
        projects: {
          page: 1,
          has_next: Boolean(p?.projects?.has_next),
          total: p?.projects?.total ?? res.meta?.total_projects ?? 0,
        },
        members: {
          page: 1,
          has_next: Boolean(p?.members?.has_next),
          total: p?.members?.total ?? res.meta?.total_members ?? 0,
        },
        sprints: {
          page: 1,
          has_next: Boolean(p?.sprints?.has_next),
          total: p?.sprints?.total ?? res.meta?.total_sprints ?? 0,
        },
      });
    } catch (error) {
      console.error('Refresh search error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [debouncedQuery, triggerSearch]);

  // Current category pagination state
  const currentCategoryPagination = useMemo(() => {
    return categoryPaging[selectedCategory];
  }, [categoryPaging, selectedCategory]);

  // Dynamic Category Options with counts from categoryPaging
  const categoryOptions = useMemo(() => {
    const getCount = (cat: SearchCategory): number | undefined => {
      if (!debouncedQuery) return undefined;
      return categoryPaging[cat]?.total;
    };

    const categories: { label: string; value: SearchCategory }[] = [
      { label: 'All', value: 'all' },
      { label: 'Tasks', value: 'tasks' },
      { label: 'User Stories', value: 'user_stories' },
      { label: 'Projects', value: 'projects' },
      { label: 'Members', value: 'members' },
      { label: 'Sprints', value: 'sprints' },
    ];

    return categories.map(opt => {
      const count = getCount(opt.value);
      return {
        label: count !== undefined ? `${opt.label} (${count})` : opt.label,
        value: opt.value,
      };
    });
  }, [debouncedQuery, categoryPaging]);

  // Active display items based on selected category
  const filteredResults = useMemo(() => {
    if (!debouncedQuery) return [];

    if (selectedCategory === 'all') {
      const allCategories: (keyof typeof TYPE_MAPPING)[] = [
        'tasks',
        'user_stories',
        'projects',
        'members',
        'sprints',
      ];
      return allCategories.flatMap(cat => {
        const items = categoryData[cat] || [];
        return items.map((item: SearchItem) => ({
          ...item,
          type: item.type || TYPE_MAPPING[cat],
        }));
      });
    }

    const items =
      categoryData[selectedCategory as keyof CategoryDataState] || [];
    return items.map((item: SearchItem) => ({
      ...item,
      type:
        item.type ||
        TYPE_MAPPING[selectedCategory as keyof typeof TYPE_MAPPING],
    }));
  }, [categoryData, selectedCategory, debouncedQuery]);

  // Load next page: called when reaching before the last 5 items
  const handleLoadMore = useCallback(async () => {
    if (isPaginatingRef.current || isInitialLoading) return;
    if (!debouncedQuery) return;

    const currentPaging = categoryPaging[selectedCategory];
    if (!currentPaging?.has_next) return;

    const nextPage = currentPaging.page + 1;

    try {
      isPaginatingRef.current = true;
      setIsPaginating(true);

      const res = await triggerSearch({
        query: debouncedQuery,
        category: selectedCategory,
        page: nextPage,
        page_size: 10,
      }).unwrap();

      const p = res.pagination || res.meta?.pagination;

      if (selectedCategory === 'all') {
        const categories = [
          'tasks',
          'user_stories',
          'projects',
          'members',
          'sprints',
        ] as const;

        setCategoryData((prev: CategoryDataState) => {
          const updated = { ...prev };
          categories.forEach(cat => {
            const incoming = res.data?.[cat] || [];
            if (incoming.length > 0) {
              const existingIds = new Set(
                updated[cat].map((i: SearchItem) => i.id),
              );
              const unique = incoming.filter(
                (i: SearchItem) => !existingIds.has(i.id),
              );
              updated[cat] = [
                ...updated[cat],
                ...unique.map((i: SearchItem) => ({
                  ...i,
                  type: i.type || TYPE_MAPPING[cat],
                })),
              ];
            }
          });
          return updated;
        });

        setCategoryPaging(prev => ({
          ...prev,
          all: {
            page: nextPage,
            has_next: Boolean(res.meta?.has_next),
            total: res.meta?.total ?? prev.all.total,
          },
        }));
      } else {
        const catKey = selectedCategory as keyof CategoryDataState;
        const incoming = (res.data as any)?.[catKey] || [];
        setCategoryData((prev: CategoryDataState) => {
          const existingList = prev[catKey] || [];
          const existingIds = new Set(
            existingList.map((i: SearchItem) => i.id),
          );
          const unique = incoming.filter(
            (i: SearchItem) => !existingIds.has(i.id),
          );
          return {
            ...prev,
            [catKey]: [
              ...existingList,
              ...unique.map((i: SearchItem) => ({
                ...i,
                type: i.type || TYPE_MAPPING[catKey],
              })),
            ],
          };
        });

        const catHasNext =
          p && (p as any)[catKey]?.has_next !== undefined
            ? Boolean((p as any)[catKey]?.has_next)
            : Boolean(res.meta?.has_next);

        const catTotal =
          (p && (p as any)[catKey]?.total) ?? currentPaging.total;

        setCategoryPaging(prev => ({
          ...prev,
          [selectedCategory]: {
            page: nextPage,
            has_next: catHasNext,
            total: catTotal,
          },
        }));
      }
    } catch (error) {
      console.error('Pagination search failed:', error);
    } finally {
      isPaginatingRef.current = false;
      setIsPaginating(false);
    }
  }, [
    isInitialLoading,
    debouncedQuery,
    categoryPaging,
    selectedCategory,
    triggerSearch,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    selectedCategory,
    setSelectedCategory,
    categoryData,
    metaData,
    categoryPaging,
    currentCategoryPagination,
    categoryOptions,
    filteredResults,
    isInitialLoading,
    isPaginating,
    isRefreshing,
    handleRefresh,
    handleLoadMore,
  };
};
