<template>
  <div class="horoscope-fortune-container">
    <!-- 使用原生表格 -->
    <table class="horoscope-table">
      <thead>
        <tr>
          <th class="table-header">大限</th>
          <th class="table-header">流年</th>
          <th class="table-header">流月</th>
          <th class="table-header">流日</th>
          <th class="table-header">流时</th>
        </tr>
      </thead>
      <tbody>
        <!-- 使用多行表格，每行显示一个索引的数据 -->
        <tr v-for="i in 30" :key="i" class="table-row-container">
          <!-- 大限列：永远可点 -->
          <td class="table-cell">
            <div v-if="i-1 < (safeAllDecades as Decade[]).length" 
                 class="table-row" 
                 :class="{
                   'active': selectedDecadeIndex === i-1,
                   'is-current': isCurrentDecade((safeAllDecades as Decade[])[i-1])
                 }"
                 @click="selectDecade(i-1)">
              <div class="row-age">{{ (safeAllDecades as Decade[])[i-1].range[0] }}-{{ (safeAllDecades as Decade[])[i-1].range[1] }}岁</div>
              <div class="row-value">{{ (safeAllDecades as Decade[])[i-1].heavenlyStem }}{{ (safeAllDecades as Decade[])[i-1].earthlyBranch }}</div>
            </div>
          </td>
          
          <!-- 流年列：只有选了大限才渲染 -->
          <td class="table-cell">
            <div v-if="selectedDecadeIndex !== null && i-1 < (safeSelectedDecadeYears as YearInfo[]).length"
                 class="table-row"
                 :class="{'active': selectedYearIndex === i-1}"
                 @click="selectYear(i-1, getActualYear(safeSelectedDecade, i-1))">
              <div class="row-age">{{ Number(getActualYear(safeSelectedDecade, i-1)) - 1 }}年</div>
              <div class="row-value">{{ (safeSelectedDecadeYears as YearInfo[])[i-1].heavenlyStem }}{{ (safeSelectedDecadeYears as YearInfo[])[i-1].earthlyBranch }}</div>
            </div>
          </td>
          
          <!-- 流月列：只有选了大限和流年才渲染 -->
          <td class="table-cell">
            <div v-if="selectedDecadeIndex !== null && selectedYearIndex !== null && i-1 < months.length"
                 class="table-row"
                 :class="{'active': selectedMonthIndex === i-1}"
                 @click="selectMonth(i-1)">
              <div class="row-age">{{ months[i-1] }}</div>
              <div class="row-value" v-if="yearHoroscopeInfo && yearHoroscopeInfo.monthly && yearHoroscopeInfo.monthly[i-1]">
                {{ yearHoroscopeInfo.monthly[i-1].heavenlyStem || '' }}{{ yearHoroscopeInfo.monthly[i-1].earthlyBranch || '' }}
              </div>
              <div class="row-value" v-else>--</div>
            </div>
          </td>
          
          <!-- 流日列：只有选了大限、流年、流月才渲染 -->
          <td class="table-cell">
            <div v-if="selectedDecadeIndex !== null && selectedYearIndex !== null && selectedMonthIndex !== null && i-1 < days.length"
                 class="table-row"
                 :class="{'active': selectedDayIndex === i-1}"
                 @click="selectDay(i-1)">
              <div class="row-age">{{ days[i-1] }}</div>
              <div class="row-value" v-if="horoscopeInfo && horoscopeInfo.daily && horoscopeInfo.daily[i-1]">
                {{ horoscopeInfo.daily[i-1].heavenlyStem || '' }}{{ horoscopeInfo.daily[i-1].earthlyBranch || '' }}
              </div>
              <div class="row-value" v-else>--</div>
            </div>
          </td>
          
          <!-- 流时列：只有选了大限、流年、流月、流日才渲染 -->
          <td class="table-cell">
            <div v-if="selectedDecadeIndex !== null && selectedYearIndex !== null && selectedMonthIndex !== null && selectedDayIndex !== null && i-1 < times.length"
                 class="table-row"
                 :class="{'active': selectedHourIndex === i-1}"
                 @click="selectHour(i-1)">
              <div class="row-age">{{ times[i-1] }}</div>
              <div class="row-value" v-if="horoscopeInfo && horoscopeInfo.hourly && horoscopeInfo.hourly[i-1]">
                {{ horoscopeInfo.hourly[i-1].heavenlyStem || '' }}{{ horoscopeInfo.hourly[i-1].earthlyBranch || '' }}
              </div>
              <div class="row-value" v-else>--</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { IFunctionalAstrolabe } from '../src/astro/FunctionalAstrolabe';

// 定义宫位接口
interface IPalace {
  decadal?: {
    range: [number, number];
    heavenlyStem: string;
    earthlyBranch: string;
  };
  [key: string]: any;
}

// 定义大限和流年的类型
interface Decade {
  range: [number, number];
  heavenlyStem: string;
  earthlyBranch: string;
}

interface YearInfo {
  age: number;
  heavenlyStem: string;
  earthlyBranch: string;
}

// 定义horoscope的类型
interface HoroscopeInfo {
  solarDate?: string;
  lunarDate?: string;
  decadal?: {
    heavenlyStem: string;
    earthlyBranch: string;
    range: [number, number];
    index: number;
  };
  age?: {
    nominalAge: number;
    index: number;
  };
  yearly?: {
    heavenlyStem: string;
    earthlyBranch: string;
    index: number;
  };
  monthly?: Array<{
    heavenlyStem: string;
    earthlyBranch: string;
  }>;
  daily?: Array<{
    heavenlyStem: string;
    earthlyBranch: string;
  }>;
  hourly?: Array<{
    heavenlyStem: string;
    earthlyBranch: string;
  }>;
}

const props = defineProps<{ 
  astrolabe: IFunctionalAstrolabe,
  personName?: string 
}>();

// 月份和日期数组
const months = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const days = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', 
              '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
              '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
const times = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

// 当前选中的大限索引
const selectedDecadeIndex = ref<number | null>(null);

// 当前选中的流年索引
const selectedYearIndex = ref<number | null>(null);

// 当前选中的流月索引
const selectedMonthIndex = ref<number | null>(null);

// 当前选中的流日索引
const selectedDayIndex = ref<number | null>(null);

// 当前选中的流时索引
const selectedHourIndex = ref<number | null>(null);

// 当前选中的年份
const selectedYear = ref<string | null>(null);

// 当前选中的运限信息
const selectedHoroscopeInfo = ref<any>(null);

// 当前选中的运限信息历史记录
const horoscopeHistory = ref<any[]>([]);

// 获取当前日期，用于计算虚岁
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();
const currentDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

// 运限信息
const horoscopeInfo = ref<HoroscopeInfo>({});

// 选中年份的运限信息
const yearHoroscopeInfo = ref<HoroscopeInfo>({});

// 定义事件
const emit = defineEmits(['updateHoroscope']);

// 获取三方四正信息
function getSurroundedPalaces(scope: string) {
  if (!props.astrolabe || !selectedHoroscopeInfo.value) return null;
  
  try {
    // 输出调试信息
    console.log(`尝试获取${scope}三方四正，horoscope对象:`, selectedHoroscopeInfo.value);
    
    // 使用命宫作为参考宫位获取三方四正
    // 首先获取命宫名称
    const lifePalace = props.astrolabe.palace('命宫');
    if (!lifePalace) {
      console.error('获取命宫失败');
      return null;
    }
    
    console.log('命宫信息:', lifePalace);
    
    // 根据不同的scope调整参数
    let surroundedPalaces;
    
    try {
      // 直接使用scope参数调用surroundPalaces方法
      if (scope === 'yearly' && selectedHoroscopeInfo.value.yearly) {
        // 获取流年地支索引
        const yearlyIndex = selectedHoroscopeInfo.value.yearly.index;
        console.log('流年索引:', yearlyIndex);
        
        // 直接使用索引获取三方四正
        if (typeof yearlyIndex === 'number') {
          surroundedPalaces = props.astrolabe.surroundedPalaces(yearlyIndex);
          console.log(`获取流年三方四正(索引方法):`, surroundedPalaces);
        }
      } else if (scope === 'monthly' && selectedHoroscopeInfo.value.monthly) {
        // 获取流月地支索引
        const monthlyIndex = selectedHoroscopeInfo.value.monthly.index;
        console.log('流月索引:', monthlyIndex);
        
        // 直接使用索引获取三方四正
        if (typeof monthlyIndex === 'number') {
          surroundedPalaces = props.astrolabe.surroundedPalaces(monthlyIndex);
          console.log(`获取流月三方四正(索引方法):`, surroundedPalaces);
        }
      } else {
        // 其他情况尝试使用scope参数
        surroundedPalaces = selectedHoroscopeInfo.value.surroundPalaces('命宫', scope);
        console.log(`获取${scope}三方四正(方法1):`, surroundedPalaces);
      }
    } catch (error) {
      console.error(`方法1获取${scope}三方四正出错:`, error);
      
      // 尝试备用方法
      try {
        // 如果是流年，尝试使用yearly作为scope
        if (scope === 'yearly' && selectedHoroscopeInfo.value.yearly) {
          const yearlyIndex = selectedHoroscopeInfo.value.yearly.index;
          if (typeof yearlyIndex === 'number') {
            surroundedPalaces = props.astrolabe.surroundedPalaces(yearlyIndex);
            console.log(`获取流年三方四正(方法2):`, surroundedPalaces);
          }
        }
        // 如果是流月，尝试使用monthly作为scope
        else if (scope === 'monthly' && selectedHoroscopeInfo.value.monthly) {
          const monthlyIndex = selectedHoroscopeInfo.value.monthly.index;
          if (typeof monthlyIndex === 'number') {
            surroundedPalaces = props.astrolabe.surroundedPalaces(monthlyIndex);
            console.log(`获取流月三方四正(方法2):`, surroundedPalaces);
          }
        }
        // 如果是流日，尝试使用daily作为scope
        else if (scope === 'daily' && selectedHoroscopeInfo.value.daily) {
          const dailyIndex = selectedHoroscopeInfo.value.daily.index;
          if (typeof dailyIndex === 'number') {
            surroundedPalaces = props.astrolabe.surroundedPalaces(dailyIndex);
            console.log(`获取流日三方四正(方法2):`, surroundedPalaces);
          }
        }
        // 如果是流时，尝试使用hourly作为scope
        else if (scope === 'hourly' && selectedHoroscopeInfo.value.hourly) {
          const hourlyIndex = selectedHoroscopeInfo.value.hourly.index;
          if (typeof hourlyIndex === 'number') {
            surroundedPalaces = props.astrolabe.surroundedPalaces(hourlyIndex);
            console.log(`获取流时三方四正(方法2):`, surroundedPalaces);
          }
        }
      } catch (backupError) {
        console.error(`方法2获取${scope}三方四正出错:`, backupError);
      }
    }
    
    // 如果获取失败，尝试第三种方法
    if (!surroundedPalaces) {
      try {
        // 直接从astrolabe获取三方四正
        if (scope === 'yearly' && selectedHoroscopeInfo.value.yearly) {
          const yearlyIndex = selectedHoroscopeInfo.value.yearly.index;
          if (typeof yearlyIndex === 'number') {
            surroundedPalaces = {
              target: palaces.value[yearlyIndex],
              opposite: palaces.value[(yearlyIndex + 6) % 12],
              wealth: palaces.value[(yearlyIndex + 3) % 12],
              career: palaces.value[(yearlyIndex + 9) % 12]
            };
            console.log(`获取流年三方四正(方法3):`, surroundedPalaces);
          }
        }
        else if (scope === 'monthly' && selectedHoroscopeInfo.value.monthly) {
          const monthlyIndex = selectedHoroscopeInfo.value.monthly.index;
          if (typeof monthlyIndex === 'number') {
            surroundedPalaces = {
              target: palaces.value[monthlyIndex],
              opposite: palaces.value[(monthlyIndex + 6) % 12],
              wealth: palaces.value[(monthlyIndex + 3) % 12],
              career: palaces.value[(monthlyIndex + 9) % 12]
            };
            console.log(`获取流月三方四正(方法3):`, surroundedPalaces);
          }
        }
      } catch (thirdError) {
        console.error(`方法3获取${scope}三方四正出错:`, thirdError);
      }
    }
    
    return surroundedPalaces;
  } catch (error) {
    console.error(`获取${scope}三方四正出错:`, error);
    return null;
  }
}

// 添加获取宫位数组
const palaces = computed(() => {
  return props.astrolabe ? props.astrolabe.palaces : [];
});

// 选择大限
function selectDecade(index: number) {
  if (selectedDecadeIndex.value === index) {
    selectedDecadeIndex.value = null;
    selectedYearIndex.value = null; // 清除选中的流年
    selectedMonthIndex.value = null; // 清除选中的流月
    selectedDayIndex.value = null; // 清除选中的流日
    selectedHourIndex.value = null; // 清除选中的流时
    selectedYear.value = null; // 清除选中的年份
    
    // 清空历史记录
    horoscopeHistory.value = [];
    
    // 通知父组件清除运限信息
    emit('updateHoroscope', null);
  } else {
    selectedDecadeIndex.value = index;
    selectedYearIndex.value = null; // 清除选中的流年
    selectedMonthIndex.value = null; // 清除选中的流月
    selectedDayIndex.value = null; // 清除选中的流日
    selectedHourIndex.value = null; // 清除选中的流时
    selectedYear.value = null; // 清除选中的年份
    
    // 清空历史记录
    horoscopeHistory.value = [];
    
    // 获取选中大限的信息
    const selectedDecade = safeAllDecades.value[index];
    console.log('选中大限:', selectedDecade);
    
    // 调用horoscope方法获取大限运限信息
    try {
      if (props.astrolabe) {
        // 获取大限中间年份，用于计算大限运限
        const decadeStartAge = selectedDecade.range[0];
        const decadeEndAge = selectedDecade.range[1];
        const middleAge = Math.floor((decadeStartAge + decadeEndAge) / 2);
        
        // 获取出生年份
        let birthYear = 0;
        try {
          if (props.astrolabe && props.astrolabe.solarDate) {
            birthYear = parseInt(props.astrolabe.solarDate.split('-')[0]);
          }
        } catch (error) {
          console.error('解析出生年份出错:', error);
        }
        
        // 计算大限中间年份的实际年份
        const decadeMiddleYear = birthYear + middleAge - 1; // 虚岁转换为实际年份
        const targetDate = `${decadeMiddleYear}-1-1`;
        
        console.log('计算大限运限，目标日期:', targetDate);
        
        // 调用horoscope方法获取大限运限信息
        const horoscopeResult = props.astrolabe.horoscope(targetDate);
        console.log('获取到大限运限信息:', horoscopeResult);
        
        // 保存运限信息
        selectedHoroscopeInfo.value = horoscopeResult;
        
        // 获取三方四正
        const surroundedPalaces = getSurroundedPalaces('decadal');
        
        // 获取大限命宫位置
        const decadalPalaceNames = horoscopeResult.decadal?.palaceNames || [];
        const decadalLifePalaceIndex = decadalPalaceNames.indexOf('命宫');
        console.log('大限命宫位置索引:', decadalLifePalaceIndex);
        
        // 获取大限流曜和四化
        const decadalStars = horoscopeResult.decadal?.stars || [];
        const decadalMutagen = horoscopeResult.decadal?.mutagen || [];
        console.log('大限流曜:', decadalStars);
        console.log('大限四化:', decadalMutagen);
        
        // 创建大限运限信息对象
        const decadalInfo = {
          type: 'decadal',
          data: horoscopeResult.decadal, // 大限信息
          fullData: horoscopeResult,
          decadeIndex: index,
          // 添加大限的注释信息，用于显示
          comment: `${selectedDecade.range[0]}-${selectedDecade.range[1]}岁 ${selectedDecade.heavenlyStem}${selectedDecade.earthlyBranch}运`,
          // 添加三方四正信息
          surroundedPalaces: surroundedPalaces,
          // 添加命宫位置
          lifePalaceIndex: decadalLifePalaceIndex
        };
        
        // 添加到历史记录
        horoscopeHistory.value = [decadalInfo];
        
        // 通知父组件更新运限信息，传递所有历史记录
        emit('updateHoroscope', horoscopeHistory.value);
      }
    } catch (error) {
      console.error('获取大限运限信息出错:', error);
    }
  }
}

// 选择流年
function selectYear(index: number, year: string) {
  if (selectedYearIndex.value === index) {
    selectedYearIndex.value = null;
    selectedMonthIndex.value = null; // 清除选中的流月
    selectedDayIndex.value = null; // 清除选中的流日
    selectedHourIndex.value = null; // 清除选中的流时
    selectedYear.value = null; // 清除选中的年份
    
    // 如果有大限信息，保留大限信息
    if (horoscopeHistory.value.length > 0) {
      horoscopeHistory.value = horoscopeHistory.value.slice(0, 1); // 只保留大限信息
      emit('updateHoroscope', horoscopeHistory.value);
    } else {
      // 清除流年相关的运限信息
      yearHoroscopeInfo.value = {};
      selectedHoroscopeInfo.value = null;
      // 通知父组件清除运限信息
      emit('updateHoroscope', null);
    }
  } else {
    selectedYearIndex.value = index;
    selectedMonthIndex.value = null; // 清除选中的流月
    selectedDayIndex.value = null; // 清除选中的流日
    selectedHourIndex.value = null; // 清除选中的流时
    selectedYear.value = year; // 设置选中的年份
    
    // 获取选中年份的运限信息
    updateYearHoroscope(year);
    
    // 通知父组件更新运限信息
    try {
      if (props.astrolabe) {
        // 构造选中年份的日期字符串（使用该年的1月1日）
        const yearDate = `${year}-1-1`;
        // 调用astrolabe.horoscope方法获取选中年份的运限信息
        const horoscopeResult = props.astrolabe.horoscope(yearDate);
        console.log('获取到流年运限信息:', horoscopeResult);
        selectedHoroscopeInfo.value = horoscopeResult;
        
        // 获取三方四正
        const surroundedPalaces = getSurroundedPalaces('yearly');
        
        // 获取流年命宫位置
        const yearlyPalaceNames = horoscopeResult.yearly?.palaceNames || [];
        const yearlyLifePalaceIndex = yearlyPalaceNames.indexOf('命宫');
        console.log('流年命宫位置索引:', yearlyLifePalaceIndex);
        
        // 获取流年流曜和四化
        const yearlyStars = horoscopeResult.yearly?.stars || [];
        const yearlyMutagen = horoscopeResult.yearly?.mutagen || [];
        console.log('流年流曜:', yearlyStars);
        console.log('流年四化:', yearlyMutagen);
        
        // 创建流年运限信息对象
        const yearlyInfo = {
          type: 'yearly',
          data: horoscopeResult.yearly,
          fullData: horoscopeResult,
          comment: `${year}年 ${horoscopeResult.yearly.heavenlyStem}${horoscopeResult.yearly.earthlyBranch}运`,
          // 添加三方四正信息
          surroundedPalaces: surroundedPalaces,
          // 添加命宫位置
          lifePalaceIndex: yearlyLifePalaceIndex
        };
        
        // 更新历史记录，保留大限信息（如果有），添加流年信息
        if (horoscopeHistory.value.length > 0) {
          horoscopeHistory.value = horoscopeHistory.value.slice(0, 1); // 保留大限信息
          horoscopeHistory.value.push(yearlyInfo); // 添加流年信息
        } else {
          horoscopeHistory.value = [yearlyInfo]; // 只有流年信息
        }
        
        // 通知父组件更新运限信息，传递所有历史记录
        emit('updateHoroscope', horoscopeHistory.value);
      }
    } catch (error) {
      console.error('获取流年运限信息出错:', error);
    }
  }
}

// 选择流月
function selectMonth(index: number) {
  if (selectedMonthIndex.value === index) {
    selectedMonthIndex.value = null;
    selectedDayIndex.value = null; // 清除选中的流日
    selectedHourIndex.value = null; // 清除选中的流时
    
    // 如果有流年信息，保留大限和流年信息
    if (horoscopeHistory.value.length > 1) {
      horoscopeHistory.value = horoscopeHistory.value.slice(0, 2); // 保留大限和流年信息
      emit('updateHoroscope', horoscopeHistory.value);
    } else if (horoscopeHistory.value.length > 0) {
      emit('updateHoroscope', horoscopeHistory.value); // 只有大限信息
    } else {
      emit('updateHoroscope', null);
    }
  } else {
    selectedMonthIndex.value = index;
    selectedDayIndex.value = null; // 清除选中的流日
    selectedHourIndex.value = null; // 清除选中的流时
    
    // 如果已经有选中的年份和运限信息
    if (selectedYear.value && selectedHoroscopeInfo.value && selectedHoroscopeInfo.value.monthly) {
      console.log('选中流月:', months[index], index);
      
      // 修正：确保正确访问monthly数据
      const monthlyData = selectedHoroscopeInfo.value.monthly;
      console.log('流月数据:', monthlyData);
      
      // 获取三方四正
      const surroundedPalaces = getSurroundedPalaces('monthly');
      
      // 获取流月命宫位置
      const monthlyPalaceNames = monthlyData.palaceNames || [];
      const monthlyLifePalaceIndex = monthlyPalaceNames.indexOf('命宫');
      console.log('流月命宫位置索引:', monthlyLifePalaceIndex);
      
      // 获取流月四化（流月没有流曜）
      const monthlyMutagen = monthlyData.mutagen || [];
      console.log('流月四化:', monthlyMutagen);
      
      // 创建流月运限信息对象
      const monthlyInfo = {
        type: 'monthly',
        data: monthlyData,
        fullData: selectedHoroscopeInfo.value,
        monthIndex: index,
        comment: `${months[index]} ${monthlyData.heavenlyStem}${monthlyData.earthlyBranch}运`,
        // 添加三方四正信息
        surroundedPalaces: surroundedPalaces,
        // 添加命宫位置
        lifePalaceIndex: monthlyLifePalaceIndex
      };
      
      // 更新历史记录，保留大限和流年信息（如果有），添加流月信息
      if (horoscopeHistory.value.length > 1) {
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 2); // 保留大限和流年信息
        horoscopeHistory.value.push(monthlyInfo); // 添加流月信息
      } else if (horoscopeHistory.value.length > 0) {
        horoscopeHistory.value.push(monthlyInfo); // 添加流月信息，已有大限或流年信息
      } else {
        horoscopeHistory.value = [monthlyInfo]; // 只有流月信息
      }
      
      // 通知父组件更新运限信息，传递所有历史记录
      emit('updateHoroscope', horoscopeHistory.value);
    }
  }
}

// 选择流日
function selectDay(index: number) {
  if (selectedDayIndex.value === index) {
    selectedDayIndex.value = null;
    selectedHourIndex.value = null; // 清除选中的流时
    
    // 如果有流月信息，保留大限、流年和流月信息
    if (horoscopeHistory.value.length > 2) {
      horoscopeHistory.value = horoscopeHistory.value.slice(0, 3); // 保留大限、流年和流月信息
      emit('updateHoroscope', horoscopeHistory.value);
    } else if (horoscopeHistory.value.length > 0) {
      emit('updateHoroscope', horoscopeHistory.value); // 保留现有信息
    } else {
      emit('updateHoroscope', null);
    }
  } else {
    selectedDayIndex.value = index;
    selectedHourIndex.value = null; // 清除选中的流时
    
    // 如果已经有选中的年份和运限信息
    if (selectedHoroscopeInfo.value && selectedHoroscopeInfo.value.daily) {
      console.log('选中流日:', days[index], index);
      
      // 修正：确保正确访问daily数据
      const dailyData = selectedHoroscopeInfo.value.daily;
      console.log('流日数据:', dailyData);
      
      // 获取三方四正
      const surroundedPalaces = getSurroundedPalaces('daily');
      
      // 获取流日命宫位置
      const dailyPalaceNames = dailyData.palaceNames || [];
      const dailyLifePalaceIndex = dailyPalaceNames.indexOf('命宫');
      console.log('流日命宫位置索引:', dailyLifePalaceIndex);
      
      // 获取流日四化（流日没有流曜）
      const dailyMutagen = dailyData.mutagen || [];
      console.log('流日四化:', dailyMutagen);
      
      // 创建流日运限信息对象
      const dailyInfo = {
        type: 'daily',
        data: dailyData,
        fullData: selectedHoroscopeInfo.value,
        dayIndex: index,
        comment: `${days[index]} ${dailyData.heavenlyStem}${dailyData.earthlyBranch}运`,
        // 添加三方四正信息
        surroundedPalaces: surroundedPalaces,
        // 添加命宫位置
        lifePalaceIndex: dailyLifePalaceIndex
      };
      
      // 更新历史记录，保留大限、流年和流月信息（如果有），添加流日信息
      if (horoscopeHistory.value.length > 2) {
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 3); // 保留大限、流年和流月信息
        horoscopeHistory.value.push(dailyInfo); // 添加流日信息
      } else if (horoscopeHistory.value.length > 0) {
        horoscopeHistory.value.push(dailyInfo); // 添加流日信息，已有其他信息
      } else {
        horoscopeHistory.value = [dailyInfo]; // 只有流日信息
      }
      
      // 通知父组件更新运限信息，传递所有历史记录
      emit('updateHoroscope', horoscopeHistory.value);
    }
  }
}

// 选择流时
function selectHour(index: number) {
  if (selectedHourIndex.value === index) {
    selectedHourIndex.value = null;
    
    // 如果有流日信息，保留大限、流年、流月和流日信息
    if (horoscopeHistory.value.length > 3) {
      horoscopeHistory.value = horoscopeHistory.value.slice(0, 4); // 保留大限、流年、流月和流日信息
      emit('updateHoroscope', horoscopeHistory.value);
    } else if (horoscopeHistory.value.length > 0) {
      emit('updateHoroscope', horoscopeHistory.value); // 保留现有信息
    } else {
      emit('updateHoroscope', null);
    }
  } else {
    selectedHourIndex.value = index;
    
    // 如果已经有选中的年份和运限信息
    if (selectedHoroscopeInfo.value && selectedHoroscopeInfo.value.hourly) {
      console.log('选中流时:', times[index], index);
      
      // 修正：确保正确访问hourly数据
      const hourlyData = selectedHoroscopeInfo.value.hourly;
      console.log('流时数据:', hourlyData);
      
      // 获取三方四正
      const surroundedPalaces = getSurroundedPalaces('hourly');
      
      // 获取流时命宫位置
      const hourlyPalaceNames = hourlyData.palaceNames || [];
      const hourlyLifePalaceIndex = hourlyPalaceNames.indexOf('命宫');
      console.log('流时命宫位置索引:', hourlyLifePalaceIndex);
      
      // 获取流时四化（流时没有流曜）
      const hourlyMutagen = hourlyData.mutagen || [];
      console.log('流时四化:', hourlyMutagen);
      
      // 创建流时运限信息对象
      const hourlyInfo = {
        type: 'hourly',
        data: hourlyData,
        fullData: selectedHoroscopeInfo.value,
        hourIndex: index,
        comment: `${times[index]} ${hourlyData.heavenlyStem}${hourlyData.earthlyBranch}运`,
        // 添加三方四正信息
        surroundedPalaces: surroundedPalaces,
        // 添加命宫位置
        lifePalaceIndex: hourlyLifePalaceIndex
      };
      
      // 更新历史记录，保留大限、流年、流月和流日信息（如果有），添加流时信息
      if (horoscopeHistory.value.length > 3) {
        horoscopeHistory.value = horoscopeHistory.value.slice(0, 4); // 保留大限、流年、流月和流日信息
        horoscopeHistory.value.push(hourlyInfo); // 添加流时信息
      } else if (horoscopeHistory.value.length > 0) {
        horoscopeHistory.value.push(hourlyInfo); // 添加流时信息，已有其他信息
      } else {
        horoscopeHistory.value = [hourlyInfo]; // 只有流时信息
      }
      
      // 通知父组件更新运限信息，传递所有历史记录
      emit('updateHoroscope', horoscopeHistory.value);
    }
  }
}

// 更新运限信息
function updateHoroscope() {
  console.log('更新运限信息，日期:', currentDateStr);
  // 获取当前日期的运限信息
  if (props.astrolabe) {
    try {
      // 调用astrolabe.horoscope方法获取当前日期的运限信息
      // 包括流年、流月、流日、流时等数据
      const result = props.astrolabe.horoscope(currentDateStr);
      console.log('获取到运限信息:', result);
      horoscopeInfo.value = result as unknown as HoroscopeInfo;
    } catch (error) {
      console.error('获取运限信息出错:', error);
    }
  }
}

// 更新选中年份的运限信息
function updateYearHoroscope(year: string) {
  console.log('更新选中年份运限信息，年份:', year);
  if (props.astrolabe && year) {
    try {
      // 构造选中年份的日期字符串（使用该年的1月1日）
      const yearDate = `${year}-1-1`;
      // 调用astrolabe.horoscope方法获取选中年份的运限信息
      const result = props.astrolabe.horoscope(yearDate);
      console.log('获取到选中年份运限信息:', result);
      yearHoroscopeInfo.value = result as unknown as HoroscopeInfo;
      selectedHoroscopeInfo.value = result;
    } catch (error) {
      console.error('获取选中年份运限信息出错:', error);
    }
  }
}

// 修改allDecades计算属性，直接使用从宫位获取的大限信息
const allDecades = computed<Decade[]>(() => {
  try {
    // 直接从宫位获取大限信息
    const palaceDecadalRanges = getDecadalRangesFromPalaces();
    if (palaceDecadalRanges.length > 0) {
      console.log('大限计算: 直接使用从宫位获取的大限信息');
      return palaceDecadalRanges;
    }
    
    // 如果仍然没有大限数据，提供默认值
    console.log('计算后大限数组为空，使用默认值');
    return getDefaultDecades();
  } catch (error) {
    console.error('计算大限出错:', error);
    return getDefaultDecades();
  }
});

// 安全访问allDecades，确保永远不会出现undefined
const safeAllDecades = computed(() => {
  const decades = allDecades.value;
  if (!decades || !Array.isArray(decades) || decades.length === 0) {
    return getDefaultDecades();
  }
  return decades;
});

// 当前选中的大限 - 更安全的版本，永远不返回null
const selectedDecade = computed(() => {
  // 如果没有选中的大限索引，或者大限数组为空，返回null
  if (selectedDecadeIndex.value === null || !safeAllDecades.value || safeAllDecades.value.length === 0) {
    return null;
  }
  
  // 如果索引越界，返回null
  if (selectedDecadeIndex.value < 0 || selectedDecadeIndex.value >= safeAllDecades.value.length) {
    return null;
  }
  
  // 返回选中的大限
  return safeAllDecades.value[selectedDecadeIndex.value];
});

// 安全访问selectedDecade，确保永远不会出现undefined
const safeSelectedDecade = computed(() => {
  const decade = selectedDecade.value;
  if (!decade) {
    return {
      range: [0, 9] as [number, number],
      heavenlyStem: '甲',
      earthlyBranch: '子'
    } as Decade;
  }
  return decade;
});

// 计算选中大限的10个流年 - 更安全的版本
const selectedDecadeYears = computed<YearInfo[]>(() => {
  // 如果没有选中的大限，返回空数组
  if (!selectedDecade.value) {
    return getDefaultYears(0);
  }
  
  try {
    // 始终生成10个流年，确保大限周期完整
    const years: YearInfo[] = [];
    
    // 获取选中大限的年龄范围
    const decadeStartAge = selectedDecade.value.range[0];
    
    // 获取出生年份
    let birthYear = 0;
    try {
      if (props.astrolabe && props.astrolabe.solarDate) {
        birthYear = parseInt(props.astrolabe.solarDate.split('-')[0]);
      }
    } catch (error) {
      console.error('解析出生年份出错:', error);
    }
    
    if (isNaN(birthYear) || birthYear === 0) {
      console.error('无法获取有效的出生年份');
      return getDefaultYears(decadeStartAge);
    }
    
    // 计算大限开始的实际年份
    const decadeStartYear = birthYear + decadeStartAge - 1; // 虚岁转换为实际年份
    
    // 获取天干地支循环
    const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // 根据年份计算天干地支
    for (let i = 0; i < 10; i++) { // 确保生成10个流年
      const year = decadeStartYear + i;
      const age = decadeStartAge + i;
      
      // 计算天干地支
      // 天干 = (年份 - 4) % 10
      // 地支 = (年份 - 4) % 12
      const hsIndex = (year - 4) % 10;
      const ebIndex = (year - 4) % 12;
      
      years.push({
        age: age,
        heavenlyStem: heavenlyStems[hsIndex],
        earthlyBranch: earthlyBranches[ebIndex]
      });
    }
    
    return years;
  } catch (error) {
    console.error('计算流年出错:', error);
    return getDefaultYears(selectedDecade.value ? selectedDecade.value.range[0] : 0);
  }
});

// 安全访问selectedDecadeYears，确保永远不会出现undefined
const safeSelectedDecadeYears = computed(() => {
  const years = selectedDecadeYears.value;
  if (!years || !Array.isArray(years) || years.length === 0) {
    return getDefaultYears(safeSelectedDecade.value.range[0]);
  }
  return years;
});

// 提供默认的大限数据
function getDefaultDecades(): Decade[] {
  const decades: Decade[] = [];
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  for (let i = 0; i < 10; i++) {
    decades.push({
      range: [i * 10, i * 10 + 9] as [number, number],
      heavenlyStem: heavenlyStems[i % 10],
      earthlyBranch: earthlyBranches[i % 12]
    });
  }
  
  return decades;
}

// 提供默认的流年数据
function getDefaultYears(startAge: number): YearInfo[] {
  const years: YearInfo[] = [];
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  for (let i = 0; i < 10; i++) {
    years.push({
      age: startAge + i,
      heavenlyStem: heavenlyStems[i % 10],
      earthlyBranch: earthlyBranches[i % 12]
    });
  }
  
  return years;
}

// 修复getActualYear方法，直接根据年龄计算年份
function getActualYear(decade: Decade, yearIndex: number): string {
  try {
    // 确保astrolabe和solarDate存在
    if (!props.astrolabe || !props.astrolabe.solarDate) {
      return '未知';
    }
    
    const birthYear = parseInt(props.astrolabe.solarDate.split('-')[0]);
    if (isNaN(birthYear)) {
      return '未知';
    }
    
    // 确保decade.range存在
    if (!decade || !decade.range) {
      return '未知';
    }
    
    // 直接根据出生年份和大限起始年龄计算实际年份
    const ageInYear = decade.range[0] + yearIndex;
    return (birthYear + ageInYear - 1).toString(); // 虚岁转换为实际年份
  } catch (error) {
    console.error('计算实际年份出错:', error);
    return '未知';
  }
}

// 添加一个新的辅助函数，用于从宫位获取大限范围信息
function getDecadalRangesFromPalaces(): Array<{range: [number, number], heavenlyStem: string, earthlyBranch: string}> {
  try {
    if (!props.astrolabe || !props.astrolabe.palaces) {
      console.error('星盘对象或宫位不存在');
      return [];
    }
    
    const ranges: Array<{range: [number, number], heavenlyStem: string, earthlyBranch: string}> = [];
    
    // 遍历所有宫位，获取大限信息
    props.astrolabe.palaces.forEach((palace, index) => {
      if (palace && palace.decadal && palace.decadal.range && 
          Array.isArray(palace.decadal.range) && palace.decadal.range.length === 2) {
        ranges.push({
          range: palace.decadal.range as [number, number],
          heavenlyStem: palace.decadal.heavenlyStem || '',
          earthlyBranch: palace.decadal.earthlyBranch || ''
        });
      }
    });
    
    // 按年龄范围排序
    ranges.sort((a, b) => a.range[0] - b.range[0]);
    
    return ranges;
  } catch (error) {
    console.error('获取宫位大限信息出错:', error);
    return [];
  }
}

// 添加判断当前大限的方法
function isCurrentDecade(decade: Decade): boolean {
  if (!horoscopeInfo.value || !horoscopeInfo.value.age || !decade.range) {
    return false;
  }
  
  const currentAge = horoscopeInfo.value.age.nominalAge;
  return currentAge >= decade.range[0] && currentAge <= decade.range[1];
}

// 组件挂载时初始化
onMounted(() => {
  console.log('=== 运限组件挂载 ===');
  
  if (!props.astrolabe) {
    console.error('星盘对象不存在');
    return;
  }
  
  // 初始化运限信息
  updateHoroscope();
  
  // 自动选择当前大限
  setTimeout(() => {
    try {
      // 获取当前虚岁
      const currentAge = horoscopeInfo.value?.age?.nominalAge || 0;
      console.log('当前虚岁:', currentAge);
      
      // 查找匹配当前年龄的大限
      if (safeAllDecades.value && safeAllDecades.value.length > 0) {
        const matchingIndex = safeAllDecades.value.findIndex(decade => 
          decade.range && currentAge >= decade.range[0] && currentAge <= decade.range[1]);
        
        if (matchingIndex !== -1) {
          console.log('自动选择当前年龄的大限:', matchingIndex);
          selectedDecadeIndex.value = matchingIndex;
        }
      }
    } catch (error) {
      console.error('自动选择大限出错:', error);
    }
  }, 800);
  
  console.log('=== 运限组件挂载完成 ===');
});

// 设置运限日期
function setFortuneDate(dateStr: string) {
  console.log('设置运限日期:', dateStr);
  if (dateStr && props.astrolabe) {
    try {
      // 调用astrolabe.horoscope方法获取指定日期的运限信息
      const result = props.astrolabe.horoscope(dateStr);
      console.log('获取到指定日期运限信息:', result);
      horoscopeInfo.value = result as unknown as HoroscopeInfo;
      selectedHoroscopeInfo.value = result;
    } catch (error) {
      console.error('获取指定日期运限信息出错:', error);
    }
  }
}

// 刷新运限信息
function refreshHoroscopeInfo() {
  console.log('刷新运限信息');
  updateHoroscope();
}

// 计算每一级是否可选
const canSelectYear = computed(() => selectedDecadeIndex !== null);
const canSelectMonth = computed(() => selectedDecadeIndex !== null && selectedYearIndex !== null);
const canSelectDay = computed(() => selectedDecadeIndex !== null && selectedYearIndex !== null && selectedMonthIndex !== null);
const canSelectHour = computed(() => selectedDecadeIndex !== null && selectedYearIndex !== null && selectedMonthIndex !== null && selectedDayIndex !== null);

// 导出方法供父组件使用
defineExpose({
  updateHoroscope,
  selectedMonthIndex,
  setFortuneDate,
  refreshHoroscopeInfo
});
</script>

<style scoped>
.horoscope-fortune-container {
  position: absolute;
  left: -200px;
  top: 0px;
  width: 340px;
  height: 870px;
  z-index: 100;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid #e0e0e0;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 表格样式 */
.horoscope-table {
  border-collapse: separate;
  border-radius: 8px;
  width: 100%;
  background-color: #fff;
  font-size: 12px;
  table-layout: fixed;
  display: block;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.horoscope-table thead {
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 10;
}

.horoscope-table tbody {
  display: block;
  width: 100%;
  overflow-y: auto;
}

.horoscope-table tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.table-header {
  background-color: #72AEC5;
  color: white;
  padding: 5px 2px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #ccc;
  width: 55px;
}

.table-cell {
  vertical-align: top;
  border: 1px solid #ccc;
  padding: 0;
  width: 50px;
  max-width: 50px;
  max-height: none !important;
}

.table-row-container {
  height: 40px;
}

/* 表格行样式 */
.table-row {
  display: flex;
  flex-direction: column;
  padding: 3px 2px;
  cursor: pointer;
  align-items: center;
  height: 40px;
  transition: all 0.3s ease;
}

.table-row > div {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
}

.row-age {
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
}

.row-value {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.table-row.active {
  background-color: #E3F2FD;
  border-left: 3px solid #2196F3;
}

.table-row.is-current {
  background-color: #FFF9C4;
  border-left: 3px solid #FFC107;
  font-weight: bold;
}

.table-row.disabled {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
}

/* 确保表格在小屏幕上也能正常显示 */
@media (max-width: 768px) {
  .horoscope-fortune-container {
    width: 280px;
  }
  
  .table-row {
    height: 35px;
  }
}
</style> 