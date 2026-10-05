import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useResponsive } from '../utils/responsive';
import { useTheme } from '../theme/ThemeProvider';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { getSprintsThunk } from '../store/project_store/action/project_thunk';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
} from 'react-native-reanimated';

// ─── Types ────────────────────────────────────────────────────────────────────

type SprintStatus = 'active' | 'planned' | 'completed';

interface Sprint {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  start?: string;
  end?: string;
  status: SprintStatus | string;
}

// ─── Status colour map ────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  SprintStatus,
  {
    bar: string;
    dot: string;
    badgeBg: string;
    badgeText: string;
    legendLabel: string;
  }
> = {
  active: {
    bar: '#D1FAE5',
    dot: '#10B981',
    badgeBg: '#A7F3D0',
    badgeText: '#065F46',
    legendLabel: 'Active Sprint',
  },
  planned: {
    bar: '#E4E4FB',
    dot: '#6366F1',
    badgeBg: '#C7D2FE',
    badgeText: '#3730A3',
    legendLabel: 'Planned Sprint',
  },
  completed: {
    bar: '#E5E7EB',
    dot: '#6B7280',
    badgeBg: '#D1D5DB',
    badgeText: '#374151',
    legendLabel: 'Completed Sprint',
  },
};

const getStatusColors = (status?: string) => {
  const key = (status || '').toLowerCase() as SprintStatus;
  return STATUS_STYLES[key] || STATUS_STYLES.planned;
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

const pad = (n: number) => n.toString().padStart(2, '0');

const toKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseKey = (dateStr: string): Date => {
  if (!dateStr) return new Date(NaN);
  const clean = dateStr.split('T')[0];
  const [y, m, d] = clean.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addMonths = (date: Date, delta: number) => {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  return d;
};

const monthTitle = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const weekdayLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'short' });

const fullDateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const eachDayInRange = (startKey: string, endKey: string): string[] => {
  const start = parseKey(startKey);
  const end = parseKey(endKey);
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(toKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

// Day-of-week: 0 = Sunday, 6 = Saturday
const weekdayFromKey = (key: string) => parseKey(key).getDay();

// ─── Skeleton components ──────────────────────────────────────────────────────

const SkeletonBox = ({
  width,
  height,
  borderRadius = 6,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) => {
  const opacity = useSharedValue(0.4);

  // Simple JS-driven pulse
  React.useEffect(() => {
    let ascending = true;
    const id = setInterval(() => {
      if (ascending) {
        opacity.value = Math.min(0.85, opacity.value + 0.06);
        if (opacity.value >= 0.85) ascending = false;
      } else {
        opacity.value = Math.max(0.3, opacity.value - 0.06);
        if (opacity.value <= 0.3) ascending = true;
      }
    }, 60);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
        },
        animStyle,
        style,
      ]}
    />
  );
};

const CalendarSkeleton = ({
  moderateScale,
}: {
  moderateScale: (n: number) => number;
}) => (
  <View style={{ gap: moderateScale(12) }}>
    {/* Month header skeleton */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonBox width={160} height={moderateScale(36)} borderRadius={10} />
      <View style={{ flexDirection: 'row', gap: moderateScale(6) }}>
        <SkeletonBox width={moderateScale(30)} height={moderateScale(30)} borderRadius={8} />
        <SkeletonBox width={moderateScale(60)} height={moderateScale(30)} borderRadius={8} />
        <SkeletonBox width={moderateScale(30)} height={moderateScale(30)} borderRadius={8} />
      </View>
    </View>

    {/* Day-of-week headers */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={`${100 / 7 - 1}%`}
          height={moderateScale(14)}
          borderRadius={4}
          style={{ marginHorizontal: 2 }}
        />
      ))}
    </View>

    {/* 5 weeks of skeleton rows */}
    {Array.from({ length: 5 }).map((_, week) => (
      <View key={week} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {Array.from({ length: 7 }).map((_, day) => (
          <View
            key={day}
            style={{
              flex: 1,
              marginHorizontal: 1,
              gap: moderateScale(4),
            }}
          >
            {/* Day number */}
            <SkeletonBox width={moderateScale(22)} height={moderateScale(14)} borderRadius={4} />
            {/* Occasional sprint bar stub */}
            {(week === 1 && day >= 1 && day <= 5) ||
            (week === 3 && day >= 2 && day <= 6) ? (
              <SkeletonBox
                width="100%"
                height={moderateScale(18)}
                borderRadius={week === 1 && day === 1 ? 10 : week === 1 && day === 5 ? 10 : 0}
              />
            ) : (
              <View style={{ height: moderateScale(18) }} />
            )}
          </View>
        ))}
      </View>
    ))}
  </View>
);

// ─── DayBarInfo ───────────────────────────────────────────────────────────────

interface DayBarInfo {
  sprint: Sprint;
  /** True only on the sprint's real first day */
  isRealStart: boolean;
  /** True only on the sprint's real last day */
  isRealEnd: boolean;
  /**
   * Visual left cap: shown when this day is the real start OR when it falls
   * on a Monday (first visible position in a new calendar row).
   */
  isVisualStart: boolean;
  /**
   * Visual right cap: shown when this day is the real end OR when it falls
   * on a Sunday (last visible position in its calendar row).
   */
  isVisualEnd: boolean;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CalendarScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { hp, wp, moderateScale } = useResponsive();
  const { colors } = useTheme();

  const { project, sprints = [], loading } = useAppSelector(
    (state: RootState) => state?.projects || {},
  );

  // The project whose sprints are currently displayed
  const [calendarProjectId, setCalendarProjectId] = useState<string>(
    project?.id || '',
  );
  const [calendarProjectName, setCalendarProjectName] = useState<string>(
    project?.name || '',
  );
  const [projectSheetVisible, setProjectSheetVisible] = useState(false);

  const styles = useMemo(
    () => createStyles(colors, moderateScale, hp, wp),
    [colors, moderateScale, hp, wp],
  );

  const isTablet = wp(100) >= 768;

  const today = useMemo(() => new Date(), []);
  const todayKey = toKey(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.getMonth());

  // ── Fetch sprints when the screen focuses or calendarProjectId changes ────────
  useFocusEffect(
    useCallback(() => {
      const pid = calendarProjectId || project?.id || '';
      if (!pid) return;
      dispatch(getSprintsThunk({ project_id: pid }));
    }, [dispatch, calendarProjectId, project?.id]),
  );

  // ── Handle project selection from the bottom sheet ─────────────────────────
  const handleSelectProject = useCallback(
    (id: string, name: string) => {
      setCalendarProjectId(id);
      setCalendarProjectName(name);
      setProjectSheetVisible(false);
      dispatch(getSprintsThunk({ project_id: id }));
    },
    [dispatch],
  );

  // ── Build the per-day bar map with visual caps ─────────────────────────────
  const sprintsByDate = useMemo(() => {
    const map: Record<string, DayBarInfo> = {};

    (sprints as Sprint[]).forEach(sprint => {
      const startStr = sprint.start_date || sprint.start;
      const endStr = sprint.end_date || sprint.end;
      if (!startStr || !endStr) return;

      const days = eachDayInRange(startStr, endStr);
      days.forEach((key, idx) => {
        const isRealStart = idx === 0;
        const isRealEnd = idx === days.length - 1;
        const weekday = weekdayFromKey(key); // 0=Sun, 1=Mon, …, 6=Sat

        // Visual start cap: real start OR first day of a new row (Monday, weekday===1)
        const isVisualStart = isRealStart || weekday === 1;
        // Visual end cap: real end OR last day of a row (Sunday, weekday===0)
        const isVisualEnd = isRealEnd || weekday === 0;

        map[key] = { sprint, isRealStart, isRealEnd, isVisualStart, isVisualEnd };
      });
    });

    return map;
  }, [sprints]);

  const todaysBar = sprintsByDate[todayKey];

  const upcomingThisMonth = useMemo(() => {
    return (sprints as Sprint[])
      .filter(s => {
        const startStr = s.start_date || s.start;
        if (!startStr) return false;
        const start = parseKey(startStr);
        return (
          !isNaN(start.getTime()) &&
          start.getMonth() === currentMonth.getMonth() &&
          start.getFullYear() === currentMonth.getFullYear()
        );
      })
      .sort((a, b) => {
        const sa = a.start_date || a.start || '';
        const sb = b.start_date || b.start || '';
        return sa < sb ? -1 : 1;
      });
  }, [sprints, currentMonth]);

  const goToMonth = useCallback((delta: number) => {
    setCurrentMonth(prev => addMonths(prev, delta));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  // ── Day cell renderer ──────────────────────────────────────────────────────
  const renderDay = useCallback(
    ({ date, state }: { date?: DateData; state?: string }) => {
      if (!date) return <View style={styles.dayCell} />;

      const info = sprintsByDate[date.dateString];
      const isToday = date.dateString === todayKey;
      const isDisabled = state === 'disabled';
      const statusColors = info ? getStatusColors(info.sprint.status) : null;

      return (
        <View style={styles.dayCell}>
          {/* ── Sprint bar (or transparent placeholder to keep row height) ── */}
          {info && statusColors ? (
            <View
              style={[
                styles.sprintBar,
                { backgroundColor: statusColors.bar },
                info.isVisualStart && !info.isVisualEnd && styles.sprintBarRoundLeft,
                info.isVisualEnd && !info.isVisualStart && styles.sprintBarRoundRight,
                info.isVisualStart && info.isVisualEnd && styles.sprintBarRoundBoth,
                !info.isVisualStart && !info.isVisualEnd && styles.sprintBarMiddle,
              ]}
            >
              {/* Sprint name + dot — only on visual start days */}
              {info.isVisualStart && (
                <View style={styles.sprintBarStartContent}>
                  {!info.isRealStart && (
                    <Text style={[styles.continuedMark, { color: statusColors.dot }]}>
                      ‹
                    </Text>
                  )}
                  <View style={[styles.sprintDot, { backgroundColor: statusColors.dot }]} />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.sprintName, { color: statusColors.dot }]}
                  >
                    {info.sprint.name}
                  </Text>
                </View>
              )}

              {/* Status badge — only on visual end days */}
              {info.isVisualEnd && (
                <View style={[styles.statusBadge, { backgroundColor: statusColors.badgeBg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColors.badgeText }]}>
                    {info.isRealEnd
                      ? String(info.sprint.status).toUpperCase()
                      : '›'}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.sprintBarPlaceholder} />
          )}

          {/* ── Day number — floats above the bar ── */}
          <View style={styles.dayNumberWrap} pointerEvents="none">
            {isToday ? (
              <View style={styles.todayCircle}>
                <Text style={styles.todayText}>{date.day}</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.dayText,
                  { color: isDisabled ? colors.textOnPrimaryMuted : colors.text },
                ]}
              >
                {date.day}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [sprintsByDate, todayKey, colors, styles],
  );

  // ── Calendar card ──────────────────────────────────────────────────────────
  const calendarCard = (
    <View style={styles.card}>
      {/* ── Top row: month picker + project selector ─────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.monthPill}
          onPress={() => {
            setSelectedYear(currentMonth.getFullYear());
            setSelectedMonth(currentMonth.getMonth());
            setShowMonthPicker(true);
          }}
        >
          <Text style={styles.monthPillText}>{monthTitle(currentMonth)}</Text>
          <Ionicons name="chevron-down" size={moderateScale(14)} color={colors.text} />
        </TouchableOpacity>

        {/* ── Project selector button ─────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.projectPill}
          onPress={() => setProjectSheetVisible(true)}
        >
          <Ionicons
            name="folder-outline"
            size={moderateScale(14)}
            color={colors.primary}
            style={{ marginRight: moderateScale(4) }}
          />
          <Text
            style={styles.projectPillText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {calendarProjectName || project?.name || 'Select Project'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={moderateScale(12)}
            color={colors.primary}
            style={{ marginLeft: moderateScale(4) }}
          />
        </TouchableOpacity>
      </View>

      {/* ── Navigation row (tablet: inline above, phone: below) ──────────── */}
      {isTablet ? (
        <View style={[styles.headerNavGroup, { marginTop: moderateScale(8) }]}>
          <TouchableOpacity style={styles.navButton} onPress={() => goToMonth(-1)}>
            <Ionicons name="chevron-back" size={moderateScale(16)} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => goToMonth(1)}>
            <Ionicons name="chevron-forward" size={moderateScale(16)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.headerNavGroup, { marginTop: moderateScale(10), alignSelf: 'flex-start' }]}>
          <TouchableOpacity style={styles.navButton} onPress={() => goToMonth(-1)}>
            <Ionicons name="chevron-back" size={moderateScale(16)} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => goToMonth(1)}>
            <Ionicons name="chevron-forward" size={moderateScale(16)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.subLabel}>View and manage your project schedule</Text>

      {/* ── Calendar or skeleton ─────────────────────────────────────────── */}
      {loading && sprints.length === 0 ? (
        <View style={{ marginTop: moderateScale(8) }}>
          <CalendarSkeleton moderateScale={moderateScale} />
        </View>
      ) : (
        <Calendar
          key={monthTitle(currentMonth)}
          current={toKey(currentMonth)}
          hideArrows
          hideExtraDays={false}
          firstDay={0}
          renderHeader={() => null}
          dayComponent={renderDay as any}
          onMonthChange={(m: DateData) => {
            setCurrentMonth(new Date(m.year, m.month - 1, 1));
          }}
          theme={
            {
              calendarBackground: 'transparent',
              textSectionTitleColor: colors.textSecondary,
              textDayFontSize: moderateScale(13),
              textMonthFontSize: moderateScale(16),
              /**
               * stylesheet.calendar.main overrides the week-row and day-cell
               * containers that react-native-calendars renders internally.
               *
               * Default week uses justifyContent:'space-around' which adds
               * automatic gaps between every cell — that is exactly why bars
               * appear as disconnected squares.  Switching to 'space-between'
               * (no outer gap) + alignItems:'stretch' on dayContainer lets
               * our bar View fill 100 % of the available cell width so
               * adjacent bars touch with no gap at all.
               */
              'stylesheet.calendar.main': {
                week: {
                  marginTop: 0,
                  marginBottom: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
                dayContainer: {
                  flex: 1,
                  alignItems: 'stretch',
                  overflow: 'hidden',
                },
                emptyDayContainer: {
                  flex: 1,
                },
              },
              'stylesheet.calendar.header': {
                week: {
                  marginTop: moderateScale(6),
                  marginBottom: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
                dayHeader: {
                  flex: 1,
                  textAlign: 'center',
                  fontSize: moderateScale(12),
                  color: colors.textSecondary,
                  fontWeight: '600',
                },
              },
            } as any
          }
          style={styles.calendar}
        />
      )}

      {/* ── Month / year picker modal ─────────────────────────────────────── */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMonthPicker(false)}>
          <Pressable
            style={[styles.monthPickerContainer, { backgroundColor: colors.background }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>
                Select month
              </Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={moderateScale(22)} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.pickerSectionTitle, { color: colors.textSecondary }]}>
              YEAR
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yearList}
            >
              {Array.from(
                { length: 30 },
                (_, i) => currentMonth.getFullYear() - 5 + i,
              ).map(year => {
                const sel = year === selectedYear;
                return (
                  <TouchableOpacity
                    key={year}
                    activeOpacity={0.7}
                    style={[styles.yearItem, sel && { backgroundColor: colors.primary }]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[styles.yearText, { color: sel ? colors.white : colors.text }]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.pickerSectionTitle, { color: colors.textSecondary }]}>
              MONTH
            </Text>
            <View style={styles.monthGrid}>
              {[
                'January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December',
              ].map((month, index) => {
                const sel = index === selectedMonth;
                return (
                  <TouchableOpacity
                    key={month}
                    activeOpacity={0.7}
                    style={[styles.monthItem, sel && { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setSelectedMonth(index);
                      setCurrentMonth(new Date(selectedYear, index, 1));
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text style={[styles.monthItemText, { color: sel ? colors.white : colors.text }]}>
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>LEGEND:</Text>
        {(Object.keys(STATUS_STYLES) as SprintStatus[]).map(status => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_STYLES[status].dot }]} />
            <Text style={styles.legendText}>{STATUS_STYLES[status].legendLabel}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Sidebar (upcoming + today) ─────────────────────────────────────────────
  const sidebar = (
    <View style={isTablet ? styles.sidebarTablet : styles.sidebarStacked}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming This Month</Text>
        {loading && sprints.length === 0 ? (
          <View style={{ gap: moderateScale(8) }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: moderateScale(10),
                  padding: moderateScale(10),
                  gap: moderateScale(10),
                }}
              >
                <SkeletonBox width={moderateScale(44)} height={moderateScale(44)} borderRadius={8} />
                <View style={{ flex: 1, gap: moderateScale(6) }}>
                  <SkeletonBox width="70%" height={moderateScale(12)} />
                  <SkeletonBox width="40%" height={moderateScale(10)} />
                </View>
              </View>
            ))}
          </View>
        ) : upcomingThisMonth.length === 0 ? (
          <Text style={styles.emptyText}>No sprints scheduled this month.</Text>
        ) : (
          upcomingThisMonth.map(sprint => {
            const startStr = sprint.start_date || sprint.start || '';
            const startDate = parseKey(startStr);
            const sc = getStatusColors(sprint.status);
            return (
              <View key={sprint.id} style={styles.upcomingRow}>
                <View style={styles.upcomingDateBlock}>
                  <Text style={styles.upcomingWeekday}>{weekdayLabel(startDate)}</Text>
                  <Text style={[styles.upcomingDay, { color: sc.dot }]}>
                    {pad(startDate.getDate())}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingName}>{sprint.name}</Text>
                  <View style={[styles.tinyBadge, { backgroundColor: sc.badgeBg, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.tinyBadgeText, { color: sc.badgeText }]}>
                      {sprint.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.todayDateText}>{fullDateLabel(today)}</Text>
        {loading && sprints.length === 0 ? (
          <SkeletonBox width="100%" height={moderateScale(40)} borderRadius={8} />
        ) : todaysBar ? (
          <View
            style={[
              styles.todaySprintRow,
              { backgroundColor: getStatusColors(todaysBar.sprint.status).bar },
            ]}
          >
            <Text
              style={[
                styles.todaySprintText,
                { color: getStatusColors(todaysBar.sprint.status).badgeText },
              ]}
            >
              {todaysBar.sprint.name}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No sprint scheduled today.</Text>
        )}
      </View>
    </View>
  );

  // ── Root render ─────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <Text style={styles.subtitle}>
        Plan, track and manage your project schedule.
      </Text>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <View style={isTablet ? styles.tabletLayout : undefined}>
        <View style={isTablet ? { flex: 1, marginRight: moderateScale(16) } : undefined}>
          {calendarCard}
        </View>
        {sidebar}
      </View>

      {/* ── Project selector bottom sheet ─────────────────────────────────── */}
      <ProjectListBottomSheet
        visible={projectSheetVisible}
        onDismiss={() => setProjectSheetVisible(false)}
        title="Select Project"
        mode="projects"
        onSelectProject={handleSelectProject}
      />
    </ScrollView>
  );
};

export default CalendarScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (
  colors: any,
  moderateScale: (n: number) => number,
  hp: (n: number) => number,
  wp: (n: number) => number,
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
      marginTop: moderateScale(30),
    },
    screenContent: {
      padding: moderateScale(20),
      paddingBottom: hp(4),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: '800',
      color: colors.text,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(4),
    },
    backButton: {
      width: moderateScale(40),
      height: moderateScale(40),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: moderateScale(6),
    },
    subtitle: {
      fontSize: moderateScale(13),
      color: colors.textSecondary,
      marginTop: moderateScale(2),
      marginBottom: moderateScale(16),
    },
    tabletLayout: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: moderateScale(16),
      padding: moderateScale(16),
      marginBottom: moderateScale(16),
      borderWidth: 1,
      borderColor: colors.border,
    },
    // ── Header ──
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: moderateScale(8),
    },
    monthPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: moderateScale(10),
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(8),
      gap: moderateScale(4),
    },
    monthPillText: {
      fontWeight: '700',
      fontSize: moderateScale(15),
      color: colors.text,
    },
    projectPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: moderateScale(10),
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(7),
      maxWidth: moderateScale(160),
      backgroundColor: `${colors.primary}12`,
    },
    projectPillText: {
      fontSize: moderateScale(13),
      fontWeight: '600',
      color: colors.primary,
      flexShrink: 1,
    },
    headerNavGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(6),
    },
    navButton: {
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayButton: {
      paddingHorizontal: moderateScale(10),
      height: moderateScale(30),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayButtonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: moderateScale(13),
    },
    subLabel: {
      fontSize: moderateScale(12),
      color: colors.textSecondary,
      marginTop: moderateScale(8),
      marginBottom: moderateScale(4),
    },
    calendar: {
      marginTop: moderateScale(4),
    },
    // ── Day cell ──
    dayCell: {
      flex: 1,
      // tall enough to show day number + sprint bar comfortably
      minHeight: hp(8),
      // MUST be 'stretch' so the bar View fills the full cell width.
      // The library default is 'center' which is why bars appear as small squares.
      alignItems: 'stretch',
      overflow: 'hidden',
    },
    // Day number floats in the top-left corner above the bar
    dayNumberWrap: {
      position: 'absolute',
      top: moderateScale(4),
      left: moderateScale(4),
      zIndex: 2,
    },
    dayText: {
      fontSize: moderateScale(12),
      fontWeight: '500',
    },
    todayCircle: {
      width: moderateScale(22),
      height: moderateScale(22),
      borderRadius: moderateScale(12),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayText: {
      fontSize: moderateScale(12),
      color: colors.white,
      fontWeight: '700',
    },
    // ── Sprint bar ──
    // Zero margin so adjacent cells' bars touch with no gap.
    // Height fills the full cell so the day number (which is absolutely
    // positioned) sits on top of the coloured background.
    sprintBar: {
      // Fill full cell height — day number overlays via position:absolute
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',        // label/badge sit at the bottom
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(4),
      paddingBottom: moderateScale(4),
      marginHorizontal: 0,           // zero — no bleed needed with space-between week row
      borderRadius: 0,
    },
    sprintBarRoundLeft: {
      borderTopLeftRadius: moderateScale(8),
      borderBottomLeftRadius: moderateScale(8),
    },
    sprintBarRoundRight: {
      borderTopRightRadius: moderateScale(8),
      borderBottomRightRadius: moderateScale(8),
    },
    sprintBarRoundBoth: {
      borderRadius: moderateScale(8),
    },
    sprintBarMiddle: {
      borderRadius: 0,
    },
    sprintBarPlaceholder: {
      flex: 1,
    },
    sprintBarStartContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      overflow: 'hidden',
    },
    continuedMark: {
      fontSize: moderateScale(11),
      fontWeight: '700',
      marginRight: moderateScale(1),
    },
    sprintDot: {
      width: moderateScale(5),
      height: moderateScale(5),
      borderRadius: moderateScale(2.5),
      marginRight: moderateScale(3),
      flexShrink: 0,
    },
    sprintName: {
      fontSize: moderateScale(10),
      fontWeight: '700',
      flexShrink: 1,
    },
    statusBadge: {
      paddingHorizontal: moderateScale(4),
      paddingVertical: moderateScale(1),
      borderRadius: moderateScale(4),
      flexShrink: 0,
    },
    statusBadgeText: {
      fontSize: moderateScale(8),
      fontWeight: '700',
    },
    // ── Legend ──
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginTop: moderateScale(12),
      paddingTop: moderateScale(12),
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendLabel: {
      fontSize: moderateScale(11),
      color: colors.textSecondary,
      fontWeight: '600',
      marginRight: moderateScale(12),
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: moderateScale(16),
      marginVertical: moderateScale(2),
    },
    legendDot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      marginRight: moderateScale(5),
    },
    legendText: {
      fontSize: moderateScale(12),
      color: colors.text,
    },
    // ── Sidebar ──
    sidebarTablet: { width: wp(22) },
    sidebarStacked: { marginTop: 0 },
    cardTitle: {
      fontSize: moderateScale(15),
      fontWeight: '700',
      color: colors.text,
      marginBottom: moderateScale(10),
    },
    emptyText: {
      fontSize: moderateScale(12),
      color: colors.textSecondary,
    },
    upcomingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.itemDivider,
      borderRadius: moderateScale(10),
      padding: moderateScale(10),
      marginBottom: moderateScale(8),
    },
    upcomingDateBlock: {
      width: moderateScale(44),
      alignItems: 'center',
      marginRight: moderateScale(10),
    },
    upcomingWeekday: {
      fontSize: moderateScale(10),
      color: colors.textSecondary,
    },
    upcomingDay: {
      fontSize: moderateScale(18),
      fontWeight: '800',
    },
    upcomingName: {
      fontSize: moderateScale(13),
      fontWeight: '600',
      color: colors.text,
      marginBottom: moderateScale(4),
    },
    tinyBadge: {
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(2),
      borderRadius: moderateScale(5),
    },
    tinyBadgeText: {
      fontSize: moderateScale(10),
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    todayDateText: {
      fontSize: moderateScale(12),
      color: colors.textSecondary,
      marginBottom: moderateScale(10),
    },
    todaySprintRow: {
      borderRadius: moderateScale(8),
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(10),
    },
    todaySprintText: {
      fontSize: moderateScale(13),
      fontWeight: '700',
    },
    // ── Modals ──
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    monthPickerContainer: {
      width: '100%',
      maxWidth: moderateScale(420),
      borderRadius: moderateScale(16),
      padding: moderateScale(20),
    },
    pickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: moderateScale(20),
    },
    pickerTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
    },
    pickerSectionTitle: {
      fontSize: moderateScale(11),
      fontWeight: '600',
      letterSpacing: 0.8,
      marginBottom: moderateScale(10),
    },
    yearList: {
      gap: moderateScale(8),
      paddingBottom: moderateScale(20),
    },
    yearItem: {
      minWidth: moderateScale(64),
      height: moderateScale(38),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: moderateScale(12),
    },
    yearText: {
      fontSize: moderateScale(14),
      fontWeight: '500',
    },
    monthGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: moderateScale(10),
    },
    monthItem: {
      width: '22%',
      height: moderateScale(42),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthItemText: {
      fontSize: moderateScale(13),
      fontWeight: '500',
    },
  });
