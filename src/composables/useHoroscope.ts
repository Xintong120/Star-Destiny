import { ref, Ref } from 'vue';
import { IFunctionalAstrolabe } from '../astro/FunctionalAstrolabe';
import { HoroscopeAdapter } from '../services/HoroscopeAdapter';
import { Decade, HoroscopeHistoryItem } from '../types';

/**
 * 运限数据状态管理Hook
 * 封装运限选择、状态更新等逻辑
 */
export function useHoroscope() {
  // 状态
  const selectedDecadeIndex: Ref<number | null> = ref(null);
  const selectedYearIndex: Ref<number | null> = ref(null);
  const selectedMonthIndex: Ref<number | null> = ref(null);
  const selectedHoroscopeInfo: Ref<any> = ref(null);
  const horoscopeHistory: Ref<HoroscopeHistoryItem[]> = ref([]);

  /**
   * 选择大限
   * @param index 大限索引
   * @param astrolabe 命盘实例
   * @param allDecades 所有大限数据
   * @param emit 事件发射函数
   */
  const selectDecade = (
    index: number,
    astrolabe: IFunctionalAstrolabe,
    allDecades: Decade[],
    emit: Function
  ) => {
    // 如果点击已选中的大限，则清除选择
    if (selectedDecadeIndex.value === index) {
      clearSelection(emit);
      return;
    }

    selectedDecadeIndex.value = index;
    selectedYearIndex.value = null;
    selectedMonthIndex.value = null;

    try {
      const selectedDecade = allDecades[index];
      
      // 使用适配器格式化大限数据
      const decadalInfo = HoroscopeAdapter.formatDecadalInfo(
        astrolabe,
        selectedDecade,
        index
      );

      selectedHoroscopeInfo.value = decadalInfo.fullData;
      horoscopeHistory.value = [decadalInfo];
      
      // 通知父组件更新运限数据
      emit('updateHoroscope', horoscopeHistory.value);
    } catch (error) {
      console.error('获取大限运限信息出错:', error);
    }
  };

  /**
   * 选择流年
   * @param year 目标年份
   * @param index 流年索引
   * @param astrolabe 命盘实例
   * @param emit 事件发射函数
   */
  const selectYear = (
    year: number,
    index: number,
    astrolabe: IFunctionalAstrolabe,
    emit: Function
  ) => {
    // 如果点击已选中的流年，则回到只显示大限
    if (selectedYearIndex.value === index) {
      selectedYearIndex.value = null;
      selectedMonthIndex.value = null;
      
      // 如果有大限数据，回退到只显示大限
      if (horoscopeHistory.value.length > 0) {
        horoscopeHistory.value = [horoscopeHistory.value[0]];
        emit('updateHoroscope', horoscopeHistory.value);
      }
      return;
    }

    selectedYearIndex.value = index;
    selectedMonthIndex.value = null;

    try {
      // 使用适配器格式化流年数据
      const yearInfo = HoroscopeAdapter.formatYearInfo(
        astrolabe,
        year,
        index
      );

      // 如果有大限数据，保留大限数据，追加流年数据
      if (horoscopeHistory.value.length > 0) {
        horoscopeHistory.value = [horoscopeHistory.value[0], yearInfo];
      } else {
        horoscopeHistory.value = [yearInfo];
      }

      // 更新当前选中的运限信息
      selectedHoroscopeInfo.value = yearInfo.fullData;
      
      // 通知父组件更新运限数据
      emit('updateHoroscope', horoscopeHistory.value);
    } catch (error) {
      console.error('获取流年运限信息出错:', error);
    }
  };

  /**
   * 选择流月
   * @param year 目标年份
   * @param monthIndex 月份索引
   * @param astrolabe 命盘实例
   * @param emit 事件发射函数
   */
  const selectMonth = (
    year: number,
    monthIndex: number,
    astrolabe: IFunctionalAstrolabe,
    emit: Function
  ) => {
    // 如果点击已选中的流月，则回到只显示大限和流年
    if (selectedMonthIndex.value === monthIndex) {
      selectedMonthIndex.value = null;
      
      // 如果有流年数据，回退到显示大限和流年
      if (horoscopeHistory.value.length > 1) {
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 2);
        emit('updateHoroscope', horoscopeHistory.value);
      }
      return;
    }

    selectedMonthIndex.value = monthIndex;

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
      
      // 通知父组件更新运限数据
      emit('updateHoroscope', horoscopeHistory.value);
    } catch (error) {
      console.error('获取流月运限信息出错:', error);
    }
  };

  /**
   * 清除选择
   * @param emit 事件发射函数
   */
  const clearSelection = (emit: Function) => {
    selectedDecadeIndex.value = null;
    selectedYearIndex.value = null;
    selectedMonthIndex.value = null;
    horoscopeHistory.value = [];
    selectedHoroscopeInfo.value = null;
    emit('updateHoroscope', null);
    
    // 清除缓存
    HoroscopeAdapter.clearCache();
  };

  return {
    // 状态
    selectedDecadeIndex,
    selectedYearIndex,
    selectedMonthIndex,
    selectedHoroscopeInfo,
    horoscopeHistory,
    
    // 方法
    selectDecade,
    selectYear,
    selectMonth,
    clearSelection
  };
} 