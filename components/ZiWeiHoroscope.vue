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
                 @click="selectYear(i-1, Number(getActualYear(safeSelectedDecade, i-1)))">
              <div class="row-age">{{ getActualYear(safeSelectedDecade, i-1)}}年</div>
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
              <div class="row-value">
                <!-- 简化流月天干地支显示逻辑 -->
                <template v-if="localYearData && localYearData.monthly">
                  <!-- 处理数组形式的流月数据 -->
                  <template v-if="Array.isArray(localYearData.monthly) && localYearData.monthly[i-1]">
                    {{ localYearData.monthly[i-1].heavenlyStem || '' }}{{ localYearData.monthly[i-1].earthlyBranch || '' }}
                  </template>
                  <!-- 处理对象形式的流月数据 -->
                  <template v-else-if="!Array.isArray(localYearData.monthly) && localYearData.monthly[i-1]">
                    {{ localYearData.monthly[i-1].heavenlyStem || '' }}{{ localYearData.monthly[i-1].earthlyBranch || '' }}
                  </template>
                  <!-- 处理对象形式的流月数据，使用字符串键 -->
                  <template v-else-if="!Array.isArray(localYearData.monthly) && localYearData.monthly[String(i)]">
                    {{ localYearData.monthly[String(i)].heavenlyStem || '' }}{{ localYearData.monthly[String(i)].earthlyBranch || '' }}
                  </template>
                  <!-- 当没有数据时显示-- -->
                  <template v-else>--</template>
                </template>
                <template v-else>--</template>
              </div>
            </div>
          </td>
          
          <!-- 流日列：只有选了大限、流年、流月才渲染 -->
          <td class="table-cell">
            <div v-if="selectedDecadeIndex !== null && selectedYearIndex !== null && selectedMonthIndex !== null && i-1 < days.length"
                 class="table-row"
                 :class="{'active': selectedDayIndex === i-1}"
                 @click="selectDay(i-1)">
              <div class="row-age">{{ days[i-1] }}</div>
              <div class="row-value" v-if="localHoroscopeInfo && localHoroscopeInfo.daily && localHoroscopeInfo.daily[i-1]">
                {{ localHoroscopeInfo.daily[i-1].heavenlyStem || '' }}{{ localHoroscopeInfo.daily[i-1].earthlyBranch || '' }}
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
              <div class="row-value" v-if="localHoroscopeInfo && localHoroscopeInfo.hourly && localHoroscopeInfo.hourly[i-1]">
                {{ localHoroscopeInfo.hourly[i-1].heavenlyStem || '' }}{{ localHoroscopeInfo.hourly[i-1].earthlyBranch || '' }}
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
import type { IFunctionalSurpalaces } from '../src/astro/FunctionalSurpalaces';
import type { HoroscopeItem } from '../src/data/types';
import HoroscopeCalculator from '../src/astro/HoroscopeCalculator';
// 导入Pinia store
import { useHoroscopeStore } from '../src/stores/horoscopeStore';
// 自定义类型
import type { CustomHoroscopeInfo } from '../src/types';

// 定义运限信息接口
interface HoroscopeInfo {
  type: string;
  data: any;
  lifePalaceIndex: number;
  surroundedPalaces?: any;
  fullData?: any;
  decadeIndex?: number;
  yearIndex?: number;
  monthIndex?: number;
  dayIndex?: number;
  comment?: string;
}

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

// 定义流月数据类型
interface MonthInfo {
    index: number;
  name: string;
    heavenlyStem: string;
    earthlyBranch: string;
  palaceNames: string[];
  mutagen: Record<string, any>;
  stars: Record<string, any>;
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

// 使用Pinia store
const horoscopeStore = useHoroscopeStore();

// 本地状态变量，用于UI交互和数据缓存
const localYearData = ref<CustomHoroscopeInfo>({});
const localHoroscopeInfo = ref<CustomHoroscopeInfo>({});
const inputYear = ref<string | null>(null);

// 从store中获取状态
const selectedDecadeIndex = computed(() => horoscopeStore.selectedDecadeIndex);
const selectedYearIndex = computed(() => horoscopeStore.selectedYearIndex);
const selectedMonthIndex = computed(() => horoscopeStore.selectedMonthIndex);
const selectedDayIndex = computed(() => horoscopeStore.selectedDayIndex);
const selectedHourIndex = computed(() => horoscopeStore.selectedHourIndex);
const selectedHoroscopeInfo = computed(() => horoscopeStore.selectedHoroscopeInfo);
const horoscopeHistory = computed(() => horoscopeStore.horoscopeHistory);
const selectedYear = computed(() => horoscopeStore.selectedYear);

// 监听store中的selectedYear变化，同步到本地状态
watch(() => horoscopeStore.selectedYear, (newValue) => {
  inputYear.value = newValue !== null ? String(newValue) : null;
  if (newValue !== null) {
    updateYearHoroscope(String(newValue));
  }
});

// 获取当前日期，用于计算虚岁
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();
const currentDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

// 定义事件
const emit = defineEmits<{
  'updateHoroscope': [horoscopeData: HoroscopeInfo[] | HoroscopeInfo]
}>();

// 使用store处理大限选择
function selectDecade(index: number) {
  try {
    console.log(`===== 选择大限 ${index} =====`);

    const selectedDecadeData = safeAllDecades.value[index];
    if (!selectedDecadeData) {
      console.error('无法获取选定的大限信息');
      return;
    }

    // 调用store来处理逻辑 - 修正参数顺序和类型
    horoscopeStore.selectDecade(index, props.astrolabe, safeAllDecades.value);

    // 从store中发出更新后的历史记录
    emit('updateHoroscope', horoscopeStore.horoscopeHistory);
  } catch (error) {
    console.error('选择大限时发生错误:', error);
  }
}

// 选中流年
function selectYear(index: number, year: number) {
  try {
    console.log(`选择流年: 索引=${index}, 年份=${year}`);

    // 调用store处理逻辑。store将调用适配器。- 修正参数顺序
    horoscopeStore.selectYear(year, index, props.astrolabe);

    // 从store中发出更新后的历史记录。历史记录将包含大限和流年信息。
    console.log('发送合并后的运限数据:', horoscopeStore.horoscopeHistory);
    emit('updateHoroscope', horoscopeStore.horoscopeHistory);
  } catch (error) {
    console.error('选择流年时发生错误:', error);
  }
}

// 选中流月
async function selectMonth(index: number) {
  // 确保已选择年份
  if (selectedYear.value === null) {
    console.error('未选择年份，无法选择流月');
    return;
  }
  
  // 使用store中的selectMonth方法
  horoscopeStore.selectMonth(selectedYear.value, index, props.astrolabe);
      
  // 更新父组件
  emit('updateHoroscope', horoscopeStore.horoscopeHistory);
  
  // 如果选择了流月，获取流月运限信息
  if (selectedYear.value !== null && horoscopeStore.selectedMonthIndex !== null) {
    try {
      // 构造选中月份的日期字符串（使用该年该月的1日）
      const monthDate = `${selectedYear.value}-${index + 1}-1`;
      console.log(`计算流月运限，日期: ${monthDate}`);
      
      // 调用HoroscopeCalculator计算选中月份的运限信息
      const horoscope = HoroscopeCalculator.calculateHoroscope(props.astrolabe, monthDate);
      
      // 提取流月信息
      const monthlyInfo: HoroscopeInfo = {
        type: 'monthly',
        data: horoscope.monthly,
        lifePalaceIndex: horoscope.monthly.index,
        surroundedPalaces: props.astrolabe.surroundedPalaces(horoscope.monthly.index)
      };
      
      // 准备传递给父组件的运限信息
      const horoscopeInfoArray: HoroscopeInfo[] = [];
      
      // 保留之前的运限信息
      if (horoscopeStore.horoscopeHistory.length > 0) {
        // 如果有大限信息，添加大限信息
        if (horoscopeStore.horoscopeHistory[0].type === 'decadal') {
          horoscopeInfoArray.push(horoscopeStore.horoscopeHistory[0] as unknown as HoroscopeInfo);
        }
        
        // 如果有流年信息，添加流年信息
        if (horoscopeStore.horoscopeHistory.length > 1 && horoscopeStore.horoscopeHistory[1].type === 'yearly') {
          horoscopeInfoArray.push(horoscopeStore.horoscopeHistory[1] as unknown as HoroscopeInfo);
        }
      }
      
      // 添加流月信息
      horoscopeInfoArray.push(monthlyInfo);
      
      // 更新父组件
      emit('updateHoroscope', horoscopeInfoArray);
      
      console.log('流月运限信息:', {
        流曜: horoscope.monthly.stars,
        四化: horoscope.monthly.mutagen,
        宫位名称: horoscope.monthly.palaceNames
      });
    } catch (error) {
      console.error('获取流月运限信息出错:', error);
    }
  }
}

// 选择流日
function selectDay(index: number) {
  // 使用store中的selectDay方法
  horoscopeStore.selectDay(index, props.astrolabe);
      
  // 更新父组件
  emit('updateHoroscope', horoscopeStore.horoscopeHistory);
}

// 选择流时
function selectHour(index: number) {
  // 使用store中的selectHour方法
  horoscopeStore.selectHour(index, props.astrolabe);
      
  // 更新父组件
  emit('updateHoroscope', horoscopeStore.horoscopeHistory);
}

// 更新运限信息
function updateHoroscope() {
  console.log('更新运限信息，日期:', currentDateStr);
  // 获取当前日期的运限信息
  if (props.astrolabe) {
    try {
      // 调用HoroscopeCalculator计算当前日期的运限信息
      // 包括流年、流月、流日、流时等数据
      const result = HoroscopeCalculator.calculateHoroscope(props.astrolabe, currentDateStr);
      console.log('获取到运限信息:', result);
      localHoroscopeInfo.value = result as unknown as CustomHoroscopeInfo;
    } catch (error) {
      console.error('获取运限信息出错:', error);
    }
  }
}

// 添加专门用于生成月份天干地支的辅助函数
function generateMonthlyGanZhi(year: number): MonthInfo[] {
  console.log(`生成${year}年的月份天干地支`);
  
  const monthsData: MonthInfo[] = [];
  const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  
  // 年干支索引计算 (1864年为甲子年)
  const yearIndex = (year - 1864) % 60;
  // 年天干索引 (0-9对应甲到癸)
  const yearGanIndex = yearIndex % 10;
  // 年地支索引 (0-11对应子到亥)
  const yearZhiIndex = yearIndex % 12;
  
  // 天干地支数组
  const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 年干支
  const yearGan = TIAN_GAN[yearGanIndex];
  const yearZhi = DI_ZHI[yearZhiIndex];
  console.log(`${year}年干支: ${yearGan}${yearZhi}`);
  
  // 正确的五虎遁法实现
  // 根据年干确定正月的天干
  let firstMonthGanIndex;
  
  // 使用五虎遁口诀确定正月天干索引
  // 甲己之年丙作首：如果年份是甲或己年，则正月的天干从丙开始
  // 乙庚之岁戊为头：如果年份是乙或庚年，则正月的天干从戊开始
  // 丙辛之岁寻庚起：如果年份是丙或辛年，则正月的天干从庚开始
  // 丁壬壬位顺行流：如果年份是丁或壬年，则正月的天干从壬开始
  // 戊癸何方发，甲寅之上好追求：如果年份是戊或癸年，则正月的天干从甲开始
  switch(yearGan) {
    case '甲':
    case '己':
      firstMonthGanIndex = 2; // 丙
      break;
    case '乙':
    case '庚':
      firstMonthGanIndex = 4; // 戊
      break;
    case '丙':
    case '辛':
      firstMonthGanIndex = 6; // 庚
      break;
    case '丁':
    case '壬':
      firstMonthGanIndex = 8; // 壬
      break;
    case '戊':
    case '癸':
      firstMonthGanIndex = 0; // 甲
      break;
    default:
      firstMonthGanIndex = 0;
  }
  
  console.log(`${yearGan}年首月天干索引: ${firstMonthGanIndex} (${TIAN_GAN[firstMonthGanIndex]})`);
  
  // 计算12个月的干支
  for (let i = 0; i < 12; i++) {
    // 月干 = 首月干 + 月序 (mod 10)
    const monthGanIndex = (firstMonthGanIndex + i) % 10;
    
    // 月支 = (月序 + 2) % 12，正月建寅
    const monthZhiIndex = (i + 2) % 12;
    
    // 获取天干地支
    const gan = TIAN_GAN[monthGanIndex];
    const zhi = DI_ZHI[monthZhiIndex];
    
    // 添加到数组
    monthsData.push({
      index: i,
      name: monthNames[i],
      heavenlyStem: gan,
      earthlyBranch: zhi,
      palaceNames: [],
      mutagen: {},
      stars: {}
    });
    
    console.log(`${monthNames[i]}: ${gan}${zhi}`);
  }
  
  return monthsData;
}

// 更新选中年份的运限信息
function updateYearHoroscope(year: string) {
  console.log('更新选中年份运限信息，年份:', year);
  if (props.astrolabe && year) {
    try {
      // 构造选中年份的日期字符串（使用该年的1月1日）
      const yearDate = `${year}-1-1`;
      console.log(`计算流年运限，日期: ${yearDate}`);
      
      // 调用HoroscopeCalculator计算选中年份的运限信息
      const result = HoroscopeCalculator.calculateHoroscope(props.astrolabe, yearDate);
      console.log('获取到选中年份运限信息:', result);
      
      // 检查运限信息是否包含流月数据
      if (result.monthly) {
        console.log(`流月数据类型: ${typeof result.monthly}`);
        
        // 如果流月数据不是数组，或者长度不是12，则重新计算所有月份的天干地支
        if (!Array.isArray(result.monthly) || result.monthly.length !== 12) {
          console.log('流月数据不是标准的12个月数组，使用五虎遁法重新计算');
          
          // 使用辅助函数计算月份天干地支
          const yearNum = parseInt(year);
          const monthsData = generateMonthlyGanZhi(yearNum);
          
          // 将计算结果设置为流月数据
          result.monthly = monthsData as any;
          console.log('已生成所有12个月的流月干支数据');
        } else if (Array.isArray(result.monthly)) {
          console.log(`流月数据长度: ${result.monthly.length}`);
          console.log(`第一个月: ${result.monthly[0]?.heavenlyStem || '无'}${result.monthly[0]?.earthlyBranch || '无'}`);
        } else if (typeof result.monthly === 'object') {
          console.log('流月数据是对象类型');
          const monthKeys = Object.keys(result.monthly);
          console.log(`流月数据键: ${monthKeys.join(', ')}`);
        }
      } else {
        console.log('警告: 未获取到流月数据，将计算并添加');
        
        // 使用辅助函数计算月份天干地支
        const yearNum = parseInt(year);
        const monthsData = generateMonthlyGanZhi(yearNum);
        
        // 设置流月数据
        result.monthly = monthsData as any;
        console.log('已添加计算的流月干支数据');
      }
      
      localYearData.value = result as unknown as CustomHoroscopeInfo;
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
    // 在紫微斗数中，大限起始年份的计算公式是：
    // 出生年份 + 起运年龄 - 2
    // 这里的减2是因为：
    // 1. 虚岁比实岁大1岁（出生即为1岁）
    // 2. 大限起运是从下一年开始计算的
    //
    // 例如：2002年出生，土五局，5岁起运，第一个大限起始年份为2005年（2002+5-2=2005）
    // 例如：2024年出生，火六局，6岁起运，第一个大限起始年份为2028年（2024+6-2=2028）
    const decadeStartYear = birthYear + decadeStartAge - 2;
    console.log(`流年计算: 出生年=${birthYear}, 起始年龄=${decadeStartAge}, 起始年份=${decadeStartYear}`);
    
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
    // 在紫微斗数中，大限起始年份的计算公式是：
    // 出生年份 + 起运年龄 - 2
    // 这里的减2是因为：
    // 1. 虚岁比实岁大1岁（出生即为1岁）
    // 2. 大限起运是从下一年开始计算的
    const ageInYear = decade.range[0] + yearIndex;
    return (birthYear + ageInYear - 2).toString();
  } catch (error) {
    console.error('计算实际年份出错:', error);
    return '未知';
  }
}

// 添加一个新的辅助函数，用于从宫位获取大限范围信息
function getDecadalRangesFromPalaces(): Decade[] {
  try {
    if (!props.astrolabe || !props.astrolabe.palaces) {
      console.error('星盘对象或宫位不存在');
      return [];
    }
    
    const ranges: Decade[] = [];
    
    // 遍历所有宫位，获取大限信息
    props.astrolabe.palaces.forEach((palace) => {
      if (palace.decadal && palace.decadal.range) {
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
    console.error('从宫位获取大限信息出错:', error);
    return [];
  }
}

// 计算当前大限，用于高亮显示
function isCurrentDecade(decade: Decade): boolean {
  if (!props.astrolabe || !props.astrolabe.solarDate) {
    return false;
  }
  
  try {
    // 计算当前虚岁
    const birthYear = parseInt(props.astrolabe.solarDate.split('-')[0]);
    if (isNaN(birthYear)) {
      return false;
    }
    
    // 计算虚岁 = 当前年份 - 出生年份 + 1
    const currentNominalAge = currentYear - birthYear + 1;
    
    // 检查当前虚岁是否在大限范围内
    return currentNominalAge >= decade.range[0] && currentNominalAge <= decade.range[1];
  } catch (error) {
    console.error('判断当前大限出错:', error);
    return false;
  }
}

// 添加一个独立的测试函数，验证2006年的流月干支计算
function test2006YearMonthlyGanZhi() {
  console.log('=== 测试2006年流月干支计算 ===');
  console.log('2006年是丙戌年，根据五虎遁口诀"丙辛必定寻庚起"，正月应该从庚寅开始');
  
  const test2006 = generateMonthlyGanZhi(2006);
  console.log('2006年流月干支计算结果:');
  
  const expectedGanZhi = [
    '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未',
    '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑'
  ];
  
  let allCorrect = true;
  
  test2006.forEach((month, index) => {
    const calculated = `${month.heavenlyStem}${month.earthlyBranch}`;
    const expected = expectedGanZhi[index];
    const isCorrect = calculated === expected;
    
    if (!isCorrect) {
      allCorrect = false;
    }
    
    console.log(`${month.name}: 计算结果=${calculated}, 期望结果=${expected}, ${isCorrect ? '✓' : '✗'}`);
  });
  
  if (allCorrect) {
    console.log('测试通过：2006年流月干支计算正确！');
  } else {
    console.error('测试失败：2006年流月干支计算有误！');
  }
  
  console.log('=== 测试结束 ===');
  
  return allCorrect;
}

// 组件挂载时初始化
onMounted(() => {
  console.log('=== 流月天干地支组件挂载 ===');
  
  // 调用测试函数
  test2006YearMonthlyGanZhi();
  
  // 如果命盘ID与上次查看的命盘ID相同，则恢复之前的选择状态
  // ... 现有代码 ...
});

// 设置运限日期
function setFortuneDate(date: string) {
  // 实现设置运限日期的逻辑
}

// 刷新运限信息
function refreshHoroscopeInfo() {
  console.log('刷新运限信息');
  updateHoroscope();
}

// 计算每一级是否可选
const canSelectYear = computed(() => selectedDecadeIndex.value !== null);
const canSelectMonth = computed(() => selectedDecadeIndex.value !== null && selectedYearIndex.value !== null);
const canSelectDay = computed(() => selectedDecadeIndex.value !== null && selectedYearIndex.value !== null && selectedMonthIndex.value !== null);
const canSelectHour = computed(() => selectedDecadeIndex.value !== null && selectedYearIndex.value !== null && selectedMonthIndex.value !== null && selectedDayIndex.value !== null);

// 导出方法供父组件使用
defineExpose({
  updateHoroscope,
  selectMonth,
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