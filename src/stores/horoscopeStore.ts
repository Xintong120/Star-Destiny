import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { IFunctionalAstrolabe } from '../astro/FunctionalAstrolabe';
import { HoroscopeAdapter } from '../services/HoroscopeAdapter';
import type { Decade, HoroscopeHistoryItem } from '../types';

/**
 * 运限状态管理Store
 * 集中管理运限相关的状态和操作
 */
export const useHoroscopeStore = defineStore('horoscope', () => {
  // 状态
  const selectedDecadeIndex = ref<number | null>(null);
  const selectedYearIndex = ref<number | null>(null);
  const selectedMonthIndex = ref<number | null>(null);
  const selectedDayIndex = ref<number | null>(null);
  const selectedHourIndex = ref<number | null>(null);
  const selectedHoroscopeInfo = ref<any>(null);
  const horoscopeHistory = ref<HoroscopeHistoryItem[]>([]);
  const selectedYear = ref<number | null>(null);
  // 添加最近查看的命盘ID
  const lastViewedAstrolabeId = ref<string | null>(null);
  // 保存第一个大限的宫位名称数组，用于后续大限计算参考
  const firstDecadalPalaceNames = ref<string[]>([]);

  // 当前选中的层级
  const currentLevel = computed(() => {
    if (selectedHourIndex.value !== null) return 'hour';
    if (selectedDayIndex.value !== null) return 'day';
    if (selectedMonthIndex.value !== null) return 'month';
    if (selectedYearIndex.value !== null) return 'year';
    if (selectedDecadeIndex.value !== null) return 'decadal';
    return null;
  });

  /**
   * 设置第一个大限的宫位名称数组
   * @param palaceNames 宫位名称数组
   */
  function setFirstDecadalPalaceNames(palaceNames: string[]) {
    firstDecadalPalaceNames.value = [...palaceNames];
  }

  /**
   * 选择大限
   * @param index 大限索引
   * @param astrolabe 命盘实例
   * @param allDecades 所有大限数据
   */
  function selectDecade(
    index: number,
    astrolabe: IFunctionalAstrolabe,
    allDecades: Decade[]
  ) {
    // 保存当前命盘ID
    lastViewedAstrolabeId.value = astrolabe.solarDate;
    
    // 如果点击已选中的大限，则清除选择
    if (selectedDecadeIndex.value === index) {
      clearSelection();
      return;
    }

    // 更新选中状态
    selectedDecadeIndex.value = index;
    selectedYearIndex.value = null;
    selectedMonthIndex.value = null;
    selectedDayIndex.value = null;
    selectedHourIndex.value = null;
    selectedYear.value = null;

    try {
      const selectedDecade = allDecades[index];
      
      // 使用适配器格式化大限数据
      const decadalInfo = HoroscopeAdapter.formatDecadalInfo(
        astrolabe,
        selectedDecade,
        index
      );

      // 更新运限信息
      selectedHoroscopeInfo.value = decadalInfo.fullData;
      horoscopeHistory.value = [decadalInfo];
    } catch (error) {
      console.error('获取大限运限信息出错:', error);
    }
  }

  /**
   * 选择流年
   * @param year 目标年份
   * @param index 流年索引
   * @param astrolabe 命盘实例
   */
  function selectYear(
    year: number,
    index: number,
    astrolabe: IFunctionalAstrolabe
  ) {
    // 保存当前命盘ID
    lastViewedAstrolabeId.value = astrolabe.solarDate;
    
    // 如果点击已选中的流年，则回到只显示大限
    if (selectedYearIndex.value === index) {
      selectedYearIndex.value = null;
      selectedMonthIndex.value = null;
      selectedDayIndex.value = null;
      selectedHourIndex.value = null;
      selectedYear.value = null;
      
      // 如果有大限数据，回退到只显示大限
      if (horoscopeHistory.value.length > 0) {
        horoscopeHistory.value = [horoscopeHistory.value[0]];
      }
      return;
    }

    // 更新选中状态
    selectedYearIndex.value = index;
    selectedMonthIndex.value = null;
    selectedDayIndex.value = null;
    selectedHourIndex.value = null;
    selectedYear.value = year;

    try {
      // 使用适配器格式化流年数据
      const yearInfo = HoroscopeAdapter.formatYearInfo(
        astrolabe,
        year,
        index
      );

      // 更新运限信息
      if (horoscopeHistory.value.length > 0) {
        // 如果有大限数据，保留大限数据，追加流年数据
        horoscopeHistory.value = [horoscopeHistory.value[0], yearInfo];
      } else {
        // 只有流年数据
        horoscopeHistory.value = [yearInfo];
      }

      // 更新当前选中的运限信息
      selectedHoroscopeInfo.value = yearInfo.fullData;
    } catch (error) {
      console.error('获取流年运限信息出错:', error);
    }
  }

  /**
   * 选择流月
   * @param year 目标年份
   * @param monthIndex 月份索引
   * @param astrolabe 命盘实例
   */
  function selectMonth(
    year: number,
    monthIndex: number,
    astrolabe: IFunctionalAstrolabe
  ) {
    // 保存当前命盘ID
    lastViewedAstrolabeId.value = astrolabe.solarDate;
    
    // 确保已选择年份
    if (selectedYear.value === null) {
      console.error('未选择年份，无法选择流月');
      return;
    }

    // 如果点击已选中的流月，则回到只显示大限和流年
    if (selectedMonthIndex.value === monthIndex) {
      selectedMonthIndex.value = null;
      selectedDayIndex.value = null;
      selectedHourIndex.value = null;
      
      // 如果有流年数据，回退到显示大限和流年
      if (horoscopeHistory.value.length > 1) {
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 2);
      }
      return;
    }

    // 更新选中状态
    selectedMonthIndex.value = monthIndex;
    selectedDayIndex.value = null;
    selectedHourIndex.value = null;

    try {
      // 使用适配器格式化流月数据
      const monthInfo = HoroscopeAdapter.formatMonthInfo(
        astrolabe,
        year,
        monthIndex
      );

      // 更新历史记录
      if (horoscopeHistory.value.length > 1) {
        // 如果有大限和流年数据，保留它们并添加流月数据
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 2);
        horoscopeHistory.value.push(monthInfo);
      } else if (horoscopeHistory.value.length > 0) {
        // 如果只有大限或流年数据，添加流月数据
        horoscopeHistory.value.push(monthInfo);
      } else {
        // 如果没有历史数据，只添加流月数据
        horoscopeHistory.value = [monthInfo];
      }

      // 更新当前选中的运限信息
      selectedHoroscopeInfo.value = monthInfo.fullData;
    } catch (error) {
      console.error('获取流月运限信息出错:', error);
    }
  }

  /**
   * 选择流日
   * @param dayIndex 日期索引
   * @param astrolabe 命盘实例
   */
  function selectDay(
    dayIndex: number,
    astrolabe: IFunctionalAstrolabe
  ) {
    // 保存当前命盘ID
    lastViewedAstrolabeId.value = astrolabe.solarDate;
    
    // 确保已选择年份和月份
    if (selectedYear.value === null || selectedMonthIndex.value === null) {
      console.error('未选择年份或月份，无法选择流日');
      return;
    }

    // 如果点击已选中的流日，则回到只显示大限、流年和流月
    if (selectedDayIndex.value === dayIndex) {
      selectedDayIndex.value = null;
      selectedHourIndex.value = null;
      
      // 如果有流月数据，回退到显示大限、流年和流月
      if (horoscopeHistory.value.length > 2) {
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 3);
      }
      return;
    }

    // 更新选中状态
    selectedDayIndex.value = dayIndex;
    selectedHourIndex.value = null;

    try {
      // 这里实现流日数据的格式化和存储逻辑
      // 目前暂时只更新选中状态，后续可以添加流日数据的处理
      
      // 更新当前选中的运限信息 - 实际应用中需要调用适配器的formatDayInfo方法
      // 更新历史记录
      if (horoscopeHistory.value.length > 2) {
        // 保留大限、流年和流月数据
        const dayInfo = {
          type: 'daily',
          data: { dayIndex },
          fullData: selectedHoroscopeInfo.value,
          dayIndex: dayIndex,
          comment: `流日 ${dayIndex + 1}`,
          lifePalaceIndex: -1  // 暂时使用-1，实际应用中应该计算正确的值
        };
        
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 3);
        horoscopeHistory.value.push(dayInfo);
      }
    } catch (error) {
      console.error('处理流日选择出错:', error);
    }
  }

  /**
   * 选择流时
   * @param hourIndex 时辰索引
   * @param astrolabe 命盘实例
   */
  function selectHour(
    hourIndex: number,
    astrolabe: IFunctionalAstrolabe
  ) {
    // 保存当前命盘ID
    lastViewedAstrolabeId.value = astrolabe.solarDate;
    
    // 确保已选择年份、月份和日期
    if (selectedYear.value === null || selectedMonthIndex.value === null || selectedDayIndex.value === null) {
      console.error('未选择年份、月份或日期，无法选择流时');
      return;
    }

    // 如果点击已选中的流时，则回到只显示大限、流年、流月和流日
    if (selectedHourIndex.value === hourIndex) {
      selectedHourIndex.value = null;
      
      // 如果有流日数据，回退到显示大限、流年、流月和流日
      if (horoscopeHistory.value.length > 3) {
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 4);
      }
      return;
    }

    // 更新选中状态
    selectedHourIndex.value = hourIndex;

    try {
      // 这里实现流时数据的格式化和存储逻辑
      // 目前暂时只更新选中状态，后续可以添加流时数据的处理
      
      // 更新当前选中的运限信息 - 实际应用中需要调用适配器的formatHourInfo方法
      // 更新历史记录
      if (horoscopeHistory.value.length > 3) {
        // 保留大限、流年、流月和流日数据
        const hourInfo = {
          type: 'hourly',
          data: { hourIndex },
          fullData: selectedHoroscopeInfo.value,
          hourIndex: hourIndex,
          comment: `流时 ${hourIndex + 1}`,
          lifePalaceIndex: -1  // 暂时使用-1，实际应用中应该计算正确的值
        };
        
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 4);
        horoscopeHistory.value.push(hourInfo);
      }
    } catch (error) {
      console.error('处理流时选择出错:', error);
    }
  }

  /**
   * 清除选择
   */
  function clearSelection() {
    selectedDecadeIndex.value = null;
    selectedYearIndex.value = null;
    selectedMonthIndex.value = null;
    selectedDayIndex.value = null;
    selectedHourIndex.value = null;
    selectedYear.value = null;
    horoscopeHistory.value = [];
    selectedHoroscopeInfo.value = null;
    
    // 清除缓存
    HoroscopeAdapter.clearCache();
  }

  return {
    // 状态
    selectedDecadeIndex,
    selectedYearIndex,
    selectedMonthIndex,
    selectedDayIndex,
    selectedHourIndex,
    selectedHoroscopeInfo,
    horoscopeHistory,
    selectedYear,
    lastViewedAstrolabeId,
    currentLevel,
    firstDecadalPalaceNames,
    
    // 方法
    selectDecade,
    selectYear,
    selectMonth,
    selectDay,
    selectHour,
    clearSelection,
    setFirstDecadalPalaceNames
  };
}, {
  // 持久化配置 - 简单配置即可，Pinia会自动持久化所有状态
  persist: {
    key: 'iztro-horoscope-state'
  }
}); 