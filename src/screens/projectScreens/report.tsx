import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { AppText } from '../../components';
import Screen from '../../components/common/ScreenWapper';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  ActiveModalType,
  CHART_DATA_BY_FILTER,
  FEEDBACK_BULLETS,
  getLegendItems,
  StatusKey,
  TIME_FILTER_OPTIONS,
  TimeFilterOption,
  Y_AXIS_TICKS,
} from '../../utils/reportData';
import { ScrollView } from 'react-native';

interface FilterCheckboxProps {
  label: string;
  color: string;
  checked: boolean;
  onToggle: () => void;
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = React.memo(
  ({ label, color, checked, onToggle }) => {
    const { colors } = useTheme();
    const layout = useAuthLayout();
    const moderateScale = layout?.moderateScale || ((size: number) => size);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        className='mb-3 mr-3 flex-row items-center'
      >
        <View
          className='items-center justify-center rounded-md'
          style={{
            width: moderateScale(18),
            height: moderateScale(18),
            backgroundColor: checked ? color : 'transparent',
            borderWidth: checked ? 0 : 1.5,
            borderColor: color,
          }}
        >
          {checked && (
            <Ionicons
              name='checkmark'
              size={moderateScale(12)}
              color={colors?.white}
            />
          )}
        </View>
        <AppText
          variant='body'
          className='ml-2 font-medium'
          style={{ color: colors?.text }}
        >
          {label}
        </AppText>
      </TouchableOpacity>
    );
  },
);

const Report = () => {
  const { colors } = useTheme();
  const layout = useAuthLayout();
  const moderateScale = layout?.moderateScale || ((size: number) => size);

  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [selectedTimeFilter, setSelectedTimeFilter] =
    useState<TimeFilterOption>('All Time');

  const [statuses, setStatuses] = useState<Record<StatusKey, boolean>>({
    toDo: true,
    inProgress: true,
    inReview: true,
    done: true,
  });

  const toggleStatus = useCallback((key: StatusKey) => {
    setStatuses(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const closeModal = useCallback(() => setActiveModal(null), []);

  const activeChartData = CHART_DATA_BY_FILTER[selectedTimeFilter];
  const LEGEND_ITEMS = getLegendItems(colors);
  return (
    <ScrollView
      className='flex-1 p-4 pb-16 pt-6'
      style={{ backgroundColor: colors.surface }}
    >
      <View
        className='mb-4 shadow-sm'
        style={{
          padding: moderateScale(16),
          backgroundColor: colors?.surface,
          borderRadius: moderateScale(16),
          borderWidth: 1,
          borderColor: colors?.border,
        }}
      >
        <AppText
          variant='title'
          className='mb-2 font-bold'
          style={{ color: colors?.text }}
        >
          Requires sprints
        </AppText>
        <AppText
          variant='body'
          style={{
            color: colors?.textSecondary,
            lineHeight: moderateScale(18),
          }}
        >
          To view this report, go to Settings &gt; Features and switch on
          Sprints, then begin a sprint via your backlog.
        </AppText>
      </View>

      <View
        className='mb-4 shadow-sm'
        style={{
          padding: moderateScale(15),
          backgroundColor: colors?.surface,
          borderRadius: moderateScale(16),
          borderWidth: 1,
          borderColor: colors?.border,
        }}
      >
        <AppText
          variant='title'
          className='mb-1 font-bold'
          style={{ color: colors?.text }}
        >
          Cumulative flow diagram
        </AppText>

        <View className='mb-3 flex-row items-center justify-between'>
          <AppText variant='body' color={colors?.textSecondary}>
            Work item count
          </AppText>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveModal('dateFilter')}
            className='flex-row items-center'
          >
            <AppText
              variant='body'
              className='font-medium'
              style={{ color: colors?.textSecondary }}
            >
              {selectedTimeFilter}
            </AppText>
            <Ionicons
              name='chevron-down'
              size={moderateScale(14)}
              color={colors?.textSecondary}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        {/* SVG Chart Container */}
        <View className='my-2 items-center justify-center overflow-hidden'>
          <Svg height='190' width='100%' viewBox='0 0 320 190'>
            {Y_AXIS_TICKS.map((val, index) => {
              const y = 15 + index * 20;
              return (
                <React.Fragment key={val}>
                  <SvgText
                    x='12'
                    y={y + 3}
                    fill='#9CA3AF'
                    fontSize='10'
                    textAnchor='end'
                  >
                    {val}
                  </SvgText>
                  <Line
                    x1='22'
                    y1={y}
                    x2='315'
                    y2={y}
                    stroke='#F3F4F6'
                    strokeWidth='1'
                  />
                </React.Fragment>
              );
            })}

            {statuses.toDo && (
              <Path
                d={activeChartData.toDoPath}
                fill={colors.secondary}
                opacity={0.9}
              />
            )}
            {statuses.inProgress && (
              <Path
                d={activeChartData.inProgressPath}
                fill={colors.primary}
                opacity={0.85}
              />
            )}
            {statuses.inReview && (
              <Path
                d={activeChartData.inReviewPath}
                fill={colors.accentOrange}
                opacity={0.85}
              />
            )}
            {statuses.done && (
              <Path
                d={activeChartData.donePath}
                fill={colors.success}
                opacity={0.9}
              />
            )}

            {activeChartData.xLabels.map(item => (
              <SvgText
                key={item.date}
                x={item.x}
                y='178'
                fill='#9CA3AF'
                fontSize='10'
                textAnchor='middle'
              >
                {item.date}
              </SvgText>
            ))}
          </Svg>
        </View>

        <View className='mt-3 flex-row flex-wrap'>
          {LEGEND_ITEMS.map(({ key, label, color }) => (
            <FilterCheckbox
              key={key}
              label={label}
              color={color}
              checked={statuses[key]}
              onToggle={() => toggleStatus(key)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setActiveModal('feedback')}
        className='items-center justify-center px-4 py-4 shadow-sm'
        style={{
          backgroundColor: colors?.surface,
          borderRadius: moderateScale(12),
          borderWidth: 1,
          borderColor: colors?.border,
        }}
      >
        <AppText
          variant='body'
          className='text-center font-medium'
          style={{ color: colors?.text }}
        >
          Missing something? Share your feedback with us!
        </AppText>
      </TouchableOpacity>

      <Modal
        visible={activeModal !== null}
        transparent
        animationType={activeModal === 'dateFilter' ? 'slide' : 'fade'}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            justifyContent: activeModal === 'feedback' ? 'center' : 'flex-end',
            alignItems: 'center',
          }}
          onPress={closeModal}
        >
          {activeModal === 'dateFilter' && (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: '100%',
                marginTop: 'auto' as const,
                backgroundColor: colors?.surface,
                borderTopLeftRadius: moderateScale(24),
                borderTopRightRadius: moderateScale(24),
                paddingTop: moderateScale(12),
                paddingBottom: moderateScale(50),
              }}
            >
              <View className='mb-4 items-center justify-center'>
                <View
                  className='rounded-full'
                  style={{
                    width: moderateScale(40),
                    height: 4,
                    backgroundColor: colors?.border,
                  }}
                />
              </View>

              <AppText
                variant='bodyLarge'
                className='mb-3 px-6 font-medium'
                style={{ color: colors?.textSecondary }}
              >
                Date Filter
              </AppText>

              {TIME_FILTER_OPTIONS.map(option => {
                const isSelected = selectedTimeFilter === option;
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedTimeFilter(option);
                      closeModal();
                    }}
                    className='px-6 py-3.5'
                    style={{
                      backgroundColor: isSelected
                        ? colors.white
                        : 'transparent',
                    }}
                  >
                    <AppText
                      variant='body'
                      className={isSelected ? 'font-bold' : 'font-medium'}
                      style={{
                        color: isSelected ? colors?.primary : colors?.text,
                      }}
                    >
                      {option}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </TouchableOpacity>
          )}

          {activeModal === 'feedback' && (
            <TouchableOpacity
              activeOpacity={1}
              className='w-11/12 max-w-sm shadow-lg'
              style={{
                padding: moderateScale(20),
                backgroundColor: colors?.surface,
                borderRadius: moderateScale(20),
                borderWidth: 1,
                borderColor: colors?.border,
              }}
            >
              <AppText
                variant='title'
                className='mb-3 text-center font-bold'
                style={{ color: colors?.text }}
              >
                What should we add next?
              </AppText>

              <AppText
                variant='bodyLarge'
                className='mb-2 font-semibold'
                style={{ color: colors?.text }}
              >
                Let us know:
              </AppText>

              <View className='mb-5 pl-1'>
                {FEEDBACK_BULLETS.map((bullet, idx) => (
                  <AppText
                    variant='body'
                    key={idx}
                    className='mb-1'
                    style={{ color: colors?.text }}
                  >
                    {bullet}
                  </AppText>
                ))}
              </View>

              <View className='flex-row items-center justify-end space-x-2'>
                <TouchableOpacity className='px-3 py-2' onPress={closeModal}>
                  <AppText
                    variant='body'
                    className='font-semibold'
                    style={{ color: colors?.primary }}
                  >
                    Dismiss
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity className='px-3 py-2' onPress={closeModal}>
                  <AppText
                    variant='body'
                    className='font-semibold'
                    style={{ color: colors?.primary }}
                  >
                    Give feedback
                  </AppText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

export default React.memo(Report);
