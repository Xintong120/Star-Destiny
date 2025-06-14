<template>
  <div>
  <!-- 添加顶层v-if条件，防止在astrolabe未初始化完成前渲染 -->
  <div v-if="isAstrolabeReady" class="ziwei-content">
  <!-- 紫微斗数命盘网格容器 -->
  <div class="ziwei-grid">
    <!-- 重构：使用 ZiWeiPalaceDisplay 组件循环渲染 -->
    <ZiWeiPalaceDisplay
      v-for="(palaceIdx, i) in palaceDisplayIndex"
      :key="i"
      :display-index="i + 1"
      :palace-data="palaces[palaceIdx]"
      :horoscope-names="getHoroscopeNames(palaceIdx)"
      :palace-classes="{
        'active': selectedPalaceIndex === palaceIdx,
        'opposite': oppositePalaceIndex === palaceIdx,
        'surrounded': surroundedPalaceIndices.includes(palaceIdx),
        'horoscope-surrounded': horoscopeSurroundedPalaceIndices.includes(palaceIdx),
        'horoscope-life-palace': horoscopeLifePalaceIndex === palaceIdx,
        'body-palace': palaces[palaceIdx]?.isBodyPalace,
        [currentHoroscopeType]: horoscopeSurroundedPalaceIndices.includes(palaceIdx)
      }"
      :horoscope-stars="getHoroscopeStars(palaceIdx)"
      :yearly-decorative-stars="getYearlyDecorativeStars(palaceIdx)"
      :get-star-mutagen-type="getStarMutagenType"
      @palace-click="selectPalace(palaceIdx)"
    />
    
    <!-- 中央信息区域，显示生肖、命主、身主、五行局等 -->
    <div class="center-info">
      <div class="info-header">
        <span class="gender-icon" :class="{'male': props.astrolabe.gender === '男', 'female': props.astrolabe.gender !== '男'}">
          {{ props.astrolabe.gender === '男' ? '♂' : '♀' }}
        </span>
        <span class="person-name">{{ props.personName || '匿名' }}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">生日(阳历)</span>
        <span class="info-value">{{ props.astrolabe.solarDate }}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">生日(阴历)</span>
        <span class="info-value">{{ props.astrolabe.lunarDate }}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">时辰</span>
        <span class="info-value">{{ timeInfo }}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">生日(四柱)</span>
        <span class="info-value">{{ props.astrolabe.chineseDate }}</span>
      </div>
      
      <div class="info-grid">
        <div class="info-cell">
          <span class="info-label">生肖</span>
          <span class="info-value">{{ props.astrolabe.zodiac }}</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">星座</span>
          <span class="info-value">{{ zodiacSign }}</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">年龄</span>
          <span class="info-value">{{ nominalAge }}(虚岁)</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">五行局</span>
          <span class="info-value">{{ props.astrolabe.fiveElementsClass }}</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">命宫</span>
          <span class="info-value">{{ lifePalaceBranch }}</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">身宫</span>
          <span class="info-value">{{ bodyPalaceBranch }}</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">命主</span>
          <span class="info-value">{{ props.astrolabe.soul }}</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">身主</span>
          <span class="info-value">{{ props.astrolabe.body }}</span>
        </div>
      </div>
      
      <!-- 添加控制按钮 -->
      <div class="control-buttons">
        <button class="toggle-button" @click="toggleShowDecadalScope">
          {{ showDecadalScope ? '隐藏大限宫位' : '显示大限宫位' }}
        </button>
        <button class="toggle-button" @click="toggleShowYearlyScope">
          {{ showYearlyScope ? '隐藏流年宫位' : '显示流年宫位' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 大限流年流月流日流时 -->
   <ZiWeiHoroscope :astrolabe="props.astrolabe" :personName="props.personName" ref="fortuneRef" @updateHoroscope="handleHoroscopeUpdate" />
  </div>
  <div v-else class="loading-container">
    <div class="loading-message">正在加载紫微斗数命盘...</div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, toRef } from 'vue';
import type { IFunctionalAstrolabe } from '../src/astro/FunctionalAstrolabe'
import ZiWeiHoroscope from './ZiWeiHoroscope.vue'; // 导入ZiWeiHoroscope组件
import { useHoroscopeStore } from '../src/stores/horoscopeStore';
import { usePalaceCalculations } from '../src/composables/usePalaceCalculations';
import ZiWeiPalaceDisplay from './ZiWeiPalaceDisplay.vue';

// 添加一个标志，确保只有astrolabe完全初始化后才渲染组件
const isAstrolabeReady = ref(false);

// 添加引用，用于访问ZiWeiHoroscope组件的方法
const fortuneRef = ref<InstanceType<typeof ZiWeiHoroscope> | null>(null);

// 使用Pinia store
const horoscopeStore = useHoroscopeStore();

const props = defineProps<{
  astrolabe: IFunctionalAstrolabe;
  personName?: string;
  showDecadalScope?: boolean;
}>();

// palaceDisplayIndex[i] 表示第i个格子对应palaces数组的哪个下标（即哪个宫位）
// palaceDisplayIndex[0] 对应寅宫，1对应卯宫，2对应辰宫，...，11对应丑宫
const palaceDisplayIndex = [3, 4, 5, 6, 2, 7, 1, 8, 0, 11, 10, 9];
// palaces数组，包含12个本命宫位对象，每个对象包含名称、天干地支、星曜等
// const palaces = props.astrolabe.palaces; // 已移至Composable

// 当前选中的宫位索引
const selectedPalaceIndex = ref<number | null>(null);

// === 重构：使用 usePalaceCalculations Composable ===
const astrolabeRef = toRef(props, 'astrolabe');
const {
  palaces,
  oppositePalaceIndex,
  surroundedPalaceIndices,
  zodiacSign,
  nominalAge,
  lifePalaceBranch,
  bodyPalaceBranch,
  timeInfo,
} = usePalaceCalculations(astrolabeRef, selectedPalaceIndex);
// === 重构结束 ===


// 选择宫位
function selectPalace(index: number) {
  if (selectedPalaceIndex.value === index) {
    // 再次点击同一宫位，取消选择
    selectedPalaceIndex.value = null;
  } else {
    selectedPalaceIndex.value = index;
  }
}

// --------------------------------------------------
// 以下计算逻辑已被迁移到 usePalaceCalculations.ts 中
// --------------------------------------------------

// 计算对宫索引
// const oppositePalaceIndex = computed<number | null>(...);

// 计算三方四正宫位索引（官禄位和财帛位）
// const surroundedPalaceIndices = computed<number[]>(...);

// 获取星座
// function getZodiacSign() { ... }

// 获取命宫信息
// function getLifePalace() { ... }

// 获取身宫信息
// function getBodyPalace() { ... }

// 获取时间信息
// function getTimeInfo() { ... }

// 计算虚岁
// const nominalAge = computed(...);

// --------------------------------------------------
// 迁移结束
// --------------------------------------------------


// 设置运限日期的方法，委托给ZiWeiHoroscope组件
function setFortuneDate(dateStr: string) {
  if (fortuneRef.value) {
    fortuneRef.value.setFortuneDate(dateStr);
  }
}

// 刷新运限信息的方法，委托给ZiWeiHoroscope组件
function refreshHoroscopeInfo() {
  if (fortuneRef.value) {
    fortuneRef.value.refreshHoroscopeInfo();
  }
}

// 组件挂载后，获取并打印身宫信息和神煞信息
onMounted(() => {
  console.log('=== 组件挂载 ===');
  
  // 检查props.astrolabe是否存在
  if (!props.astrolabe) {
    console.error('星盘对象不存在');
    return;
  }
  
  // 打印基本信息
  try {
    console.log('阳历:', props.astrolabe.solarDate);
    console.log('农历:', props.astrolabe.lunarDate);
    console.log('四柱:', props.astrolabe.chineseDate);
  } catch (error) {
    console.error('读取基本信息出错:', error);
  }
  
  // 身宫信息
  try {
    console.log('身宫地支:', props.astrolabe.earthlyBranchOfBodyPalace);
    
    const bodyPalace = props.astrolabe.palace('身宫');
    console.log('身宫对象:', bodyPalace);
    
    const bodyPalaceByLoop = props.astrolabe.palaces.find(palace => palace.isBodyPalace);
    console.log('通过遍历找到的身宫:', bodyPalaceByLoop);
  } catch (error) {
    console.error('获取身宫信息出错:', error);
  }
  
  // 打印本命宫位索引和名称
  try {
    console.log('本命宫位索引和名称:');
    palaces.value.forEach((palace, index) => {
      if (palace && palace.name) {
        console.log(`  索引${index}: ${palace.name} (${palace.heavenlyStem}${palace.earthlyBranch})`);
      }
    });
    
    // 打印palaceDisplayIndex数组
    console.log('palaceDisplayIndex数组:', palaceDisplayIndex);
    console.log('palaceDisplayIndex数组与宫位名称对应关系:');
    palaceDisplayIndex.forEach((palaceIdx, i) => {
      if (palaces[palaceIdx] && palaces[palaceIdx].name) {
        console.log(`  显示位置${i+1}: 索引=${palaceIdx}, 名称=${palaces[palaceIdx].name}`);
      }
    });
    
    // 获取命宫索引
    const lifePalace = props.astrolabe.palace('命宫');
    const lifePalaceIndex = palaces.value.findIndex(p => p.name === '命宫');
    console.log('命宫索引:', lifePalaceIndex);
    console.log('命宫对象:', lifePalace);
  } catch (error) {
    console.error('获取本命宫位索引出错:', error);
  }
  
  // 打印神煞信息
  try {
    const lifePalace = props.astrolabe.palace('命宫');
    if (lifePalace) {
      console.log('命宫的长生12神:', lifePalace.changsheng12);
      console.log('命宫的博士12神:', lifePalace.boshi12);
      console.log('命宫的流年将前12神:', lifePalace.jiangqian12);
      console.log('命宫的流年岁前12神:', lifePalace.suiqian12);
    }
    
    // 遍历所有宫位，检查神煞信息
    if (props.astrolabe.palaces && Array.isArray(props.astrolabe.palaces)) {
      palaces.value.forEach((palace, index) => {
        if (palace && palace.name) {
          console.log(`${palace.name}宫(${index})的神煞:`, {
            changsheng12: palace.changsheng12,
            boshi12: palace.boshi12
          });
        }
      });
    }
  } catch (error) {
    console.error('获取神煞信息出错:', error);
  }
  
  console.log('=== 组件挂载完成 ===');
});

// 监听astrolabe属性变化，确保组件只有在准备好后才渲染
watch(() => props.astrolabe, (newAstrolabe) => {
  if (newAstrolabe) {
    try {
      // 测试astrolabe是否可用，通过调用一些基本方法
      const test = newAstrolabe.horoscope();
      console.log('测试astrolabe对象:', test ? '成功' : '失败');
      
      // 延迟设置准备好状态，确保所有数据已加载
      setTimeout(() => {
        isAstrolabeReady.value = true;
        console.log('astrolabe准备就绪');
      }, 500);
    } catch (error) {
      console.error('astrolabe初始化失败:', error);
      isAstrolabeReady.value = false;
    }
  } else {
    isAstrolabeReady.value = false;
  }
}, { immediate: true });

// 导出方法供父组件使用
defineExpose({
  setFortuneDate,
  refreshHoroscopeInfo,
  toggleShowDecadalScope,
  toggleShowYearlyScope
});

// 当前运限信息
const currentHoroscope = ref<any[]>([]);

// 运限三方四正索引
const horoscopeSurroundedPalaceIndices = ref<number[]>([]);

// 运限命宫索引
const horoscopeLifePalaceIndex = ref<number | null>(null);

// 当前运限的12宫位名称
const horoscopePalaceNames = ref<string[]>([]);

// 多级运限的宫位名称，按类型保存
const horoscopePalaceNamesByType = ref<Record<string, string[]>>({
  decadal: [],
  yearly: [],
  monthly: [],
  daily: [],
  hourly: []
});

// 控制大限宫位名称显示
const showDecadalScope = ref(props.showDecadalScope ?? false);
const showYearlyScope = ref(false);

// 切换大限宫位名称显示
function toggleShowDecadalScope() {
  showDecadalScope.value = !showDecadalScope.value;
}

// 切换流年宫位名称显示
function toggleShowYearlyScope() {
  showYearlyScope.value = !showYearlyScope.value;
}

const correctedDecadalLifePalaceIndex = computed(() => {
  const selectedDecadeIndexValue = horoscopeStore.selectedDecadeIndex;
  
  if (selectedDecadeIndexValue === null || selectedDecadeIndexValue === undefined) {
    return null;
  }

  const lifePalaceOriginalIndex = palaces.value.findIndex(p => p.name === '命宫');
  if (lifePalaceOriginalIndex === -1) {
    return null;
  }
  
  const gender = props.astrolabe.gender;
  const yearGan = props.astrolabe.chineseDate?.split(' ')[0]?.charAt(0) || '';
  const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);

  // 核心规则：阳男阴女为顺行 (Shun Xing), 阴男阳女为逆行 (Ni Xing).
  const isShunXing = (gender === '男' && isYangGan) || (gender === '女' && !isYangGan);
  
  const stepDirection = isShunXing ? 1 : -1;
  const totalStep = selectedDecadeIndexValue * stepDirection;
  
  return (lifePalaceOriginalIndex + totalStep + 12) % 12;
});

const correctedYearlyLifePalaceIndex = computed(() => {
  const yearlyHoroscope = horoscopeStore.horoscopeHistory.find(h => h.type === 'yearly');
  return yearlyHoroscope ? yearlyHoroscope.lifePalaceIndex : null;
});

const correctedDecadalPalaceNames = computed(() => {
  const lifePalaceIdx = correctedDecadalLifePalaceIndex.value;

  if (lifePalaceIdx === null) {
    return [];
  }

  // 1. Create a map from the original palace name to its index.
  // This captures the unique physical layout of the current natal chart.
  const originalPalaceNameToIndex: Record<string, number> = {};
  const originalIndexToPalaceName: Record<number, string> = {};
  palaces.value.forEach((p, i) => {
    const nameKey = p.name.replace('宫', '');
    originalPalaceNameToIndex[nameKey] = i;
    originalIndexToPalaceName[i] = p.name;
  });

  const gender = props.astrolabe.gender;
  const yearGan = props.astrolabe.chineseDate?.split(' ')[0]?.charAt(0) || '';
  const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);

  // 核心规则：阳男阴女为顺行 (Shun Xing), 阴男阳女为逆行 (Ni Xing).
  const isShunXing = (gender === '男' && isYangGan) || (gender === '女' && !isYangGan);

  const STANDARD_PALACE_NAMES = [
    '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
    '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'
  ];

  const result = new Array<string>(12);

  for (let i = 0; i < 12; i++) { // i is the physical palace index (e.g. 寅=0, 卯=1, ...)
    // Calculate the "distance" from the current physical palace (i) to the decadal life palace.
    // 顺行 (isShunXing) 在图表上是顺时针，对应宫位数组索引增加.
    const distance = isShunXing
      ? (i - lifePalaceIdx + 12) % 12 // 顺行：目标宫位i - 大限命宫
      : (lifePalaceIdx - i + 12) % 12; // 逆行：大限命宫 - 目标宫位i

    // Find which original palace name corresponds to this distance from the original life palace.
    const originalLifePalaceIndex = originalPalaceNameToIndex['命'];
    if (originalLifePalaceIndex === undefined) {
      result[i] = "未知"; // Fallback
      continue;
    }

    const targetOriginalIndex = isShunXing
      ? (originalLifePalaceIndex + distance + 12) % 12 // 顺行：本命命宫 + 距离
      : (originalLifePalaceIndex - distance + 12) % 12; // 逆行：本命命宫 - 距离

    result[i] = originalIndexToPalaceName[targetOriginalIndex] || '未知';
  }

  return result;
});

const correctedYearlyPalaceNames = computed(() => {
  const lifePalaceIdx = correctedYearlyLifePalaceIndex.value;

  if (lifePalaceIdx === null || lifePalaceIdx === undefined) {
    return [];
  }

  // 1. Create a map from the original palace name to its index.
  // This captures the unique physical layout of the current natal chart.
  const originalPalaceNameToIndex: Record<string, number> = {};
  const originalIndexToPalaceName: Record<number, string> = {};
  palaces.value.forEach((p, i) => {
    const nameKey = p.name.replace('宫', '');
    originalPalaceNameToIndex[nameKey] = i;
    originalIndexToPalaceName[i] = p.name;
  });

  // 2. Yearly palaces are always ShunXing (clockwise on chart, index increase).
  const isShunXing = true;

  const result = new Array<string>(12);
  const originalLifePalaceIndex = originalPalaceNameToIndex['命'];

  if (originalLifePalaceIndex === undefined) {
    console.error("Could not find natal Life Palace ('命宫') index.");
    return [];
  }

  for (let i = 0; i < 12; i++) { // i is the physical palace index
    // 3. Calculate the "distance" from the current physical palace (i) to the yearly life palace.
    const distance = isShunXing
      ? (i - lifePalaceIdx + 12) % 12
      : (lifePalaceIdx - i + 12) % 12;

    // 4. Find which original palace name corresponds to this distance from the original life palace.
    const targetOriginalIndex = isShunXing
      ? (originalLifePalaceIndex + distance + 12) % 12
      : (originalLifePalaceIndex - distance + 12) % 12;

    result[i] = originalIndexToPalaceName[targetOriginalIndex] || '未知';
  }

  return result;
});

// 新增：用于存储所有层级的命宫索引和类型
const allHoroscopeLifePalace = ref<Array<{ type: string; index: number }>>([]);

// 添加调试函数，用于打印大限四化星和流曜星的计算过程
function debugDecadalStarsCalculation() {
  console.log('===== 调试大限四化星和流曜星计算过程 =====');
  
  if (!currentHoroscope.value || currentHoroscope.value.length === 0) {
    console.log('当前没有大限数据');
    return;
  }
  
  // 查找大限数据
  const decadalData = currentHoroscope.value.find(item => item.type === 'decadal');
  if (!decadalData) {
    console.log('未找到大限数据');
    return;
  }
  
  console.log('大限天干地支:', decadalData.data.heavenlyStem, decadalData.data.earthlyBranch);
  console.log('大限命宫索引:', decadalData.lifePalaceIndex);
  
  // 打印原始选择的大限天干地支
  if (decadalData.data.originalHeavenlyStem && decadalData.data.originalEarthlyBranch) {
    console.log('原始选择的大限天干地支:', decadalData.data.originalHeavenlyStem, decadalData.data.originalEarthlyBranch);
    console.log('注意: 四化星将使用原始选择的大限天干');
  }
  
  // 获取性别和年干
  const gender = props.astrolabe.gender;
  const yearGan = props.astrolabe.chineseDate?.split(' ')[0]?.charAt(0) || '';
  
  // 判断年干阴阳
  const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);
  const isYinGan = ['乙', '丁', '己', '辛', '癸'].includes(yearGan);
  
  // 判断排列方向
  const isReverse = (gender === '男' && isYinGan) || (gender === '女' && isYangGan);
  const isClockwise = !isReverse;
  
  console.log(`大限排列方向: 性别=${gender}, 年干=${yearGan}, 阳干=${isYangGan}, 阴干=${isYinGan}, 顺时针=${isClockwise}`);
  
  // 打印四化星信息
  console.log('大限四化星信息:');
  if (Array.isArray(decadalData.data.mutagen)) {
    console.log('  四化星数组:', decadalData.data.mutagen);
    console.log('  禄化:', decadalData.data.mutagen[0]);
    console.log('  权化:', decadalData.data.mutagen[1]);
    console.log('  科化:', decadalData.data.mutagen[2]);
    console.log('  忌化:', decadalData.data.mutagen[3]);
  } else if (typeof decadalData.data.mutagen === 'object') {
    console.log('  四化星对象:', decadalData.data.mutagen);
  }
  
  // 打印流曜星信息
  console.log('大限流曜星信息:');
  if (Array.isArray(decadalData.data.stars)) {
    console.log(`  流曜星数组长度: ${decadalData.data.stars.length}`);
    
    // 打印每个地支的流曜星
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    for (let i = 0; i < branches.length && i < decadalData.data.stars.length; i++) {
      const stars = decadalData.data.stars[i];
      if (stars && stars.length > 0) {
        console.log(`  ${branches[i]}宫流曜星:`, stars);
      }
    }
  } else if (typeof decadalData.data.stars === 'object') {
    console.log('  流曜星对象:', Object.keys(decadalData.data.stars));
  }
  
  // 检查每个宫位的四化星和流曜星
  console.log('各宫位四化星和流曜星:');
  for (let i = 0; i < palaces.value.length; i++) {
    const palace = palaces.value[i];
    if (!palace) continue;
    
    // 收集该宫位所有星曜
    const majorStars = palace.majorStars || [];
    const minorStars = palace.minorStars || [];
    const allStars = [...majorStars, ...minorStars];
    
    // 检查每个星曜是否有四化
    const mutagens = allStars
      .map(star => ({
        name: star.name,
        mutagen: getStarMutagenType(star.name)
      }))
      .filter(item => item.mutagen);
    
    const stars = getHoroscopeStars(i);
    
    if (mutagens.length > 0 || stars.length > 0) {
      console.log(`  宫位${i+1}(${palace.name}, ${palace.earthlyBranch}):`);
      if (mutagens.length > 0) {
        mutagens.forEach(item => {
          console.log(`    星曜${item.name}的四化: ${item.mutagen}`);
        });
      }
      if (stars.length > 0) {
        console.log(`    流曜星: ${stars.map(s => s.name).join(', ')}`);
      }
    }
  }
  
  console.log('===== 调试结束 =====');
}

// 在handleHoroscopeUpdate函数中调用调试函数
function handleHoroscopeUpdate(horoscopeData: any) {
  console.log('===== 接收到运限信息更新 =====');
  console.log('运限数据类型:', Array.isArray(horoscopeData) ? '数组' : typeof horoscopeData);
  
  // 清除所有运限相关状态
  allHoroscopeLifePalace.value = [];
  horoscopeSurroundedPalaceIndices.value = [];
  horoscopeLifePalaceIndex.value = null;
  
  // 清除所有运限宫位名称
  horoscopePalaceNamesByType.value = {
    decadal: [],
    yearly: [],
    monthly: [],
    daily: [],
    hourly: []
  };
  
  currentHoroscope.value = [];
  
  if (!horoscopeData || !Array.isArray(horoscopeData) || horoscopeData.length === 0) {
    console.log('运限数据为空或格式不正确，不进行处理');
    return;
  }

  // 新增：流月命宫计算逻辑 (新规则)
  const monthlyHoroscope = horoscopeData.find(item => item.type === 'monthly');
  if (monthlyHoroscope) {
    const selectedMonthIndex = horoscopeStore.selectedMonthIndex;

    // 确保流年宫位名称已计算，并且用户已选择某个月份
    if (
        correctedYearlyPalaceNames.value.length === 12 &&
        selectedMonthIndex !== null && selectedMonthIndex !== undefined
    ) {
        // 规则1: 查看命盘中寅宫(iztro中固定索引为0)内是哪一个人事宫
        const yinPalaceNatalName = palaces.value[0]?.name;

        if (yinPalaceNatalName) {
            // 规则2: 在流年命盘中找到该同名宫位 (e.g. 流年子女宫)
            const yearlyPalaceTargetIndex = correctedYearlyPalaceNames.value.findIndex(
                (name) => name === yinPalaceNatalName
            );

            if (yearlyPalaceTargetIndex !== -1) {
                // 规则3: 在该宫位起正月，然后以顺时针方向依次排列
                const monthOffset = selectedMonthIndex; // 0 for 正月, 1 for 二月...
                // 因为 palaces 数组本身是顺时针(寅->卯->...)，所以直接相加即可
                const newMonthlyLifePalaceIndex = (yearlyPalaceTargetIndex + monthOffset) % 12;

                console.log(`流月命宫(新规则): 寅宫本名=${yinPalaceNatalName}, 流年 ${yinPalaceNatalName} 位于索引=${yearlyPalaceTargetIndex}, 选中月份=${selectedMonthIndex + 1}, 新命宫索引=${newMonthlyLifePalaceIndex}`);
                
                // 更新流月数据中的命宫索引
                monthlyHoroscope.lifePalaceIndex = newMonthlyLifePalaceIndex;
            }
        }
    }
  }
  
  // 直接从 horoscopeData 更新状态，不再进行复杂的重新计算
  horoscopeData.forEach((horoscopeItem) => {
    const { type, lifePalaceIndex, data, surroundedPalaces } = horoscopeItem;

    if (!type || lifePalaceIndex === undefined || !data) {
      console.warn('跳过不完整的运限数据:', horoscopeItem);
                    return;
                  }

    console.log(`处理运限项: 类型=${type}, 命宫索引=${lifePalaceIndex}`);

    // 新增：打印四化星数据以供调试
    if (data.mutagen) {
      console.log(`运限 ${type} 的四化星:`, data.mutagen);
    } else {
      console.log(`运限 ${type} 未提供四化星数据。`);
    }

    // 保存宫位名称 (如果存在)
    if (data.palaceNames && Array.isArray(data.palaceNames)) {
      console.log(`保存 ${type} 宫位名称:`, data.palaceNames);
      horoscopePalaceNamesByType.value[type] = data.palaceNames;
    }

    // 更新命宫高亮 (以最后一个或最精确的为准)
    horoscopeLifePalaceIndex.value = lifePalaceIndex;

    // 更新三方四正
    if (surroundedPalaces) {
      updateHoroscopeSurroundedPalaces(surroundedPalaces);
        }
        
        // 添加到当前运限数据
        currentHoroscope.value.push(horoscopeItem);
  });
  
  console.log('===== 更新后的运限状态 =====');
  console.log('命宫索引:', horoscopeLifePalaceIndex.value);
  console.log('运限类型:', currentHoroscopeType.value);
  console.log('宫位名称:', horoscopePalaceNamesByType.value);
  console.log('三方四正索引:', horoscopeSurroundedPalaceIndices.value);
  console.log('当前运限数据长度:', currentHoroscope.value.length);
  console.log('===============================');
}

// 新增：获取宫位的所有运限名称
function getHoroscopeNames(palaceIndex: number): Array<{ name: string, type: string }> {
  try {
    const palaceNamesResult: Array<{ name: string, type: string }> = [];

    // 大限宫位名称
    if (showDecadalScope.value && correctedDecadalPalaceNames.value.length === 12) {
      const isLifePalace = palaceIndex === correctedDecadalLifePalaceIndex.value;
      if (isLifePalace) {
        palaceNamesResult.push({ type: 'decadal', name: '大限命宫' });
      } else {
        const decadalName = correctedDecadalPalaceNames.value[palaceIndex];
        if (decadalName) {
          const simpleName = decadalName.replace('宫', '');
          palaceNamesResult.push({ type: 'decadal', name: `大${simpleName}` });
        }
      }
    }
    
    // 流年宫位名称
    if (showYearlyScope.value && correctedYearlyPalaceNames.value.length === 12) {
      const isLifePalace = palaceIndex === correctedYearlyLifePalaceIndex.value;
      if (isLifePalace) {
        palaceNamesResult.push({ type: 'yearly', name: '流年命宫' });
      } else {
        const yearlyName = correctedYearlyPalaceNames.value[palaceIndex];
        if (yearlyName) {
          const simpleName = yearlyName.replace('宫', '');
          // 在紫微斗数中，流年宫位通常简称为"流X"，例如流年财帛宫简称为"流财"
          palaceNamesResult.push({ type: 'yearly', name: `流${simpleName}` });
        }
      }
    }

    // 流月命宫
    const monthlyHoroscopeItem = currentHoroscope.value.find(item => item.type === 'monthly');
    if (monthlyHoroscopeItem && palaceIndex === monthlyHoroscopeItem.lifePalaceIndex) {
      palaceNamesResult.push({ type: 'monthly', name: '流月命宫' });
    }

    return palaceNamesResult;
  } catch (error) {
    console.error('获取运限宫位名称出错:', error);
    return [];
  }
}

// 获取星曜的四化类型（禄、权、科、忌）
const getStarMutagenType = (starName: string): { mutagen: string, horoscopeType: string } | null => {
  if (currentHoroscope.value && currentHoroscope.value.length > 0) {
    const mutagenTypes = ['禄', '权', '科', '忌'];

    // 优先检查流年四化
    const yearlyHoroscope = currentHoroscope.value.find(h => h.type === 'yearly');
    if (yearlyHoroscope && yearlyHoroscope.data?.mutagen && Array.isArray(yearlyHoroscope.data.mutagen)) {
      const starIndex = yearlyHoroscope.data.mutagen.indexOf(starName);
      if (starIndex !== -1) {
        return { mutagen: mutagenTypes[starIndex], horoscopeType: 'yearly' };
      }
    }

    // 然后检查大限四化
    const decadalHoroscope = currentHoroscope.value.find(h => h.type === 'decadal');
    if (decadalHoroscope && decadalHoroscope.data?.mutagen && Array.isArray(decadalHoroscope.data.mutagen)) {
      const starIndex = decadalHoroscope.data.mutagen.indexOf(starName);
          if (starIndex !== -1) {
        return { mutagen: mutagenTypes[starIndex], horoscopeType: 'decadal' };
      }
    }
  }

  // 默认返回生年四化
  const nativeMutagens = (props.astrolabe as any)?.mutagen;
  if (nativeMutagens && Array.isArray(nativeMutagens)) {
          const mutagenTypes = ['禄', '权', '科', '忌'];
    const starIndex = nativeMutagens.indexOf(starName);
          if (starIndex !== -1) {
      return { mutagen: mutagenTypes[starIndex], horoscopeType: 'native' };
          }
  }
  
  return null;
};

// 获取宫位对应的运限四化星
function getHoroscopeMutagen(palaceIndex: number): string | null {
  // 该函数已被移除，改为在getStarMutagenType中处理四化显示
  return null;
}



// 更新运限三方四正索引
function updateHoroscopeSurroundedPalaces(surroundedPalaces: any) {
  if (!surroundedPalaces) return;
  
  try {
    console.log('===== 更新运限三方四正 =====');
    console.log('数据类型:', typeof surroundedPalaces);
    // 避免JSON序列化可能包含循环引用的对象
    // console.log('数据内容:', JSON.stringify(surroundedPalaces, null, 2));
    
    const indices: number[] = [];
    
    // 检查surroundedPalaces是否为FunctionalSurpalaces2对象
    if (surroundedPalaces.target && surroundedPalaces.opposite && 
        surroundedPalaces.wealth && surroundedPalaces.career) {
      
      console.log('处理FunctionalSurpalaces2对象');
      
      // 提取各宫位的信息
      const targetInfo = extractPalaceInfo(surroundedPalaces.target);
      const oppositeInfo = extractPalaceInfo(surroundedPalaces.opposite);
      const wealthInfo = extractPalaceInfo(surroundedPalaces.wealth);
      const careerInfo = extractPalaceInfo(surroundedPalaces.career);
      
      console.log('提取的宫位信息:', {
        target: targetInfo,
        opposite: oppositeInfo,
        wealth: wealthInfo,
        career: careerInfo
      });
      
      // 查找对应的宫位索引
      if (targetInfo) {
        const targetIndex = findPalaceIndex(targetInfo);
        if (targetIndex !== -1) {
          indices.push(targetIndex);
          console.log('找到本宫索引:', targetIndex);
        }
      }
      
      if (oppositeInfo) {
        const oppositeIndex = findPalaceIndex(oppositeInfo);
        if (oppositeIndex !== -1) {
          indices.push(oppositeIndex);
          console.log('找到对宫索引:', oppositeIndex);
        }
      }
      
      if (wealthInfo) {
        const wealthIndex = findPalaceIndex(wealthInfo);
        if (wealthIndex !== -1) {
          indices.push(wealthIndex);
          console.log('找到财帛位索引:', wealthIndex);
        }
      }
      
      if (careerInfo) {
        const careerIndex = findPalaceIndex(careerInfo);
        if (careerIndex !== -1) {
          indices.push(careerIndex);
          console.log('找到官禄位索引:', careerIndex);
        }
      }
    } else {
      // 处理其他类型的三方四正数据
      console.log('处理其他类型的三方四正数据');
      
      // 如果是对象形式，尝试直接获取索引
      if (typeof surroundedPalaces === 'object') {
        // 尝试获取target、opposite、wealth、career属性
        const keys = ['target', 'opposite', 'wealth', 'career'];
        
        for (const key of keys) {
          try {
            if (surroundedPalaces[key] && typeof surroundedPalaces[key] === 'object') {
              const info = extractPalaceInfo(surroundedPalaces[key]);
              if (info) {
                const index = findPalaceIndex(info);
                if (index !== -1) {
                  indices.push(index);
                  console.log(`找到${key}索引:`, index);
                }
              }
            } else if (typeof surroundedPalaces[key] === 'number') {
              // 如果直接是索引数字
              const index = surroundedPalaces[key];
              if (index >= 0 && index < 12) {
                indices.push(index);
                console.log(`找到${key}索引(数字):`, index);
              }
            }
          } catch (error) {
            console.error(`处理${key}属性时出错:`, error);
          }
        }
      }
    }
    
    // 去重
    const uniqueIndices = Array.from(new Set(indices));
    horoscopeSurroundedPalaceIndices.value = uniqueIndices;
    
    console.log('运限三方四正索引计算结果:', uniqueIndices);
    
    // 打印每个索引对应的宫位信息，帮助调试
    console.log('运限三方四正宫位详情:');
    uniqueIndices.forEach(idx => {
      if (palaces.value[idx]) {
        console.log(`  索引${idx}: ${palaces.value[idx].name}宫 (${palaces.value[idx].heavenlyStem}${palaces.value[idx].earthlyBranch})`);
        // 查找该索引在palaceDisplayIndex中的位置，即对应的格子位置
        const displayPos = palaceDisplayIndex.indexOf(idx);
        console.log(`  在命盘上的位置: 第${displayPos + 1}格 (${displayPos >= 0 ? '可见' : '不可见'})`);
      } else {
        console.log(`  索引${idx}: 无效宫位`);
      }
    });
    
    console.log('===========================');
  } catch (error) {
    console.error('更新运限三方四正索引出错:', error);
  }
}

// 提取宫位信息
function extractPalaceInfo(palace: any): { name?: string, earthlyBranch?: string, heavenlyStem?: string, index?: number } | null {
  if (!palace) return null;
  
  try {
    const info: { name?: string, earthlyBranch?: string, heavenlyStem?: string, index?: number } = {};
    
    // 尝试获取宫位名称
    if (palace.name) {
      info.name = palace.name;
    }
    
    // 尝试获取地支
    if (palace.earthlyBranch) {
      info.earthlyBranch = palace.earthlyBranch;
    }
    
    // 尝试获取天干
    if (palace.heavenlyStem) {
      info.heavenlyStem = palace.heavenlyStem;
    }
    
    // 尝试获取索引
    if (typeof palace.index === 'number') {
      info.index = palace.index;
    }
    
    return Object.keys(info).length > 0 ? info : null;
  } catch (error) {
    console.error('提取宫位信息出错:', error);
    return null;
  }
}

// 查找宫位索引
function findPalaceIndex(palaceInfo: { name?: string, earthlyBranch?: string, heavenlyStem?: string, index?: number }): number {
  try {
    // 如果有索引，直接使用
    if (typeof palaceInfo.index === 'number' && palaceInfo.index >= 0 && palaceInfo.index < 12) {
      return palaceInfo.index;
    }
    
    // 如果有天干地支，尝试匹配
    if (palaceInfo.earthlyBranch && palaceInfo.heavenlyStem) {
      const index = palaces.value.findIndex(p => 
        p.earthlyBranch === palaceInfo.earthlyBranch && 
        p.heavenlyStem === palaceInfo.heavenlyStem
      );
      
      if (index !== -1) {
        return index;
      }
    }
    
    // 如果只有地支，尝试匹配
    if (palaceInfo.earthlyBranch) {
      const index = palaces.value.findIndex(p => p.earthlyBranch === palaceInfo.earthlyBranch);
      
      if (index !== -1) {
        return index;
      }
    }
    
    // 如果有宫位名称，尝试匹配
    if (palaceInfo.name) {
      const index = palaces.value.findIndex(p => p.name === palaceInfo.name);
      
      if (index !== -1) {
        return index;
      }
    }
    
    return -1;
  } catch (error) {
    console.error('查找宫位索引出错:', error);
    return -1;
  }
}

// 获取特定宫位的运限宫位名称
function getHoroscopePalaceName(palaceIndex: number): { type: 'decadal' | 'yearly'; name: string } | null {
  // 优先显示流年，因为它的层级更细
  if (showYearlyScope.value && correctedYearlyPalaceNames.value.length > 0 && correctedYearlyPalaceNames.value[palaceIndex]) {
    return { type: 'yearly', name: correctedYearlyPalaceNames.value[palaceIndex] };
  }

  if (showDecadalScope.value && correctedDecadalPalaceNames.value.length > 0 && correctedDecadalPalaceNames.value[palaceIndex]) {
    return { type: 'decadal', name: correctedDecadalPalaceNames.value[palaceIndex] };
  }

  return null;
}

// 获取大限宫位名称
function getDecadalPalaceName(palaceIndex: number, i: number): string {
  try {
    // 如果没有大限宫位名称数据，则返回空字符串
    if (!horoscopePalaceNamesByType.value.decadal || 
        horoscopePalaceNamesByType.value.decadal.length === 0) {
      console.log(`获取大限宫位名称: 缺少大限宫位名称数据`);
      return '';
    }
    
    // 如果未选择大限命宫索引，则不显示大限宫位名称
    if (horoscopeLifePalaceIndex.value === null || horoscopeLifePalaceIndex.value === undefined) {
      console.log(`获取大限宫位名称: 未选择大限`);
      return '';
    }

    // 获取当前选中的大限索引
    const selectedDecadeIndex = horoscopeStore.selectedDecadeIndex;
    if (selectedDecadeIndex === null || selectedDecadeIndex === undefined) {
      console.log(`获取大限宫位名称: 未选择大限索引`);
      return '';
    }
    
    // 记录详细日志，帮助诊断问题
    console.log(`获取大限宫位名称(宫位${i+1}):
      当前宫位索引(palaceIndex): ${palaceIndex}
      当前宫位名称: ${palaces[palaceIndex]?.name || '未知'}
      显示索引(i): ${i}
      大限命宫索引: ${horoscopeLifePalaceIndex.value}
      选中大限索引: ${selectedDecadeIndex}
      大限宫位名称数组: ${JSON.stringify(horoscopePalaceNamesByType.value.decadal)}
    `);
    
    // 确保宫位索引在有效范围内
    if (palaceIndex >= 0 && palaceIndex < horoscopePalaceNamesByType.value.decadal.length) {
      // 直接从horoscopePalaceNamesByType.value.decadal数组获取名称
      // 该数组已在updateHoroscopeInfo函数中正确设置，考虑了大限索引和顺/逆时针方向
      const decadalName = horoscopePalaceNamesByType.value.decadal[palaceIndex];
      
      if (decadalName) {
        // 简化显示，只显示宫位名称，不加"宫"字
        console.log(`宫位${i+1}(索引=${palaceIndex})的大限宫位名称: ${decadalName}`);
        return decadalName.replace('宫', '');
      } else {
        console.log(`宫位${i+1}(索引=${palaceIndex})没有对应的大限宫位名称`);
      }
    } else {
      console.log(`宫位索引${palaceIndex}超出大限宫位名称数组范围(0-${horoscopePalaceNamesByType.value.decadal.length - 1})`);
    }
    
    return '';
  } catch (error) {
    console.error('获取大限宫位名称出错:', error);
    return '';
  }
}

// 获取宫位对应的运限流曜星
function getHoroscopeStars(palaceIndex: number): Array<{ name: string, horoscopeType: string }> {
  const stars: Array<{ name: string, horoscopeType: string }> = [];

  if (!currentHoroscope.value || currentHoroscope.value.length === 0) {
    return stars;
  }

  // 运限数据按 decadal, yearly, monthly ... 的顺序处理，后面的会覆盖前面的
    for (const horoscopeItem of currentHoroscope.value) {
    if (!horoscopeItem || !horoscopeItem.data || !horoscopeItem.type) {
      continue;
    }

    const { type: horoscopeType, lifePalaceIndex } = horoscopeItem;
    const { heavenlyStem, earthlyBranch } = horoscopeItem.data;

    if (!heavenlyStem || !earthlyBranch) {
      continue;
          }

          const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const palaceBranch = palaces.value[palaceIndex].earthlyBranch;
    const palaceBranchIndex = branches.indexOf(palaceBranch);

    // 处理大限流曜
    if (horoscopeType === 'decadal') {
      const decadalLifePalaceBranch = palaces.value[lifePalaceIndex].earthlyBranch;
      const decadalLifePalaceBranchIndex = branches.indexOf(decadalLifePalaceBranch);

      const addDecadalStar = (starName: string, branchName: string) => {
        if (palaceBranch === branchName) {
          stars.push({ name: `运${starName}`, horoscopeType: 'decadal' });
        }
      };

      // 大限禄存、羊、陀
            const luCunBranch = { '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳', '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子' }[heavenlyStem];
            if (luCunBranch) {
        addDecadalStar('禄', luCunBranch);
              const luCunIndex = branches.indexOf(luCunBranch);
        if (branches[(luCunIndex + 1) % 12] === palaceBranch) stars.push({ name: '运羊', horoscopeType: 'decadal' });
        if (branches[(luCunIndex + 11) % 12] === palaceBranch) stars.push({ name: '运陀', horoscopeType: 'decadal' });
      }

      // 大限魁钺
      const kuiYueBranch = {
              '甲': { kui: '丑', yue: '未' }, '戊': { kui: '丑', yue: '未' }, '庚': { kui: '丑', yue: '未' },
              '乙': { kui: '子', yue: '申' }, '己': { kui: '子', yue: '申' },
              '丙': { kui: '亥', yue: '酉' }, '丁': { kui: '亥', yue: '酉' },
        '辛': { kui: '寅', yue: '午' },
        '壬': { kui: '卯', yue: '巳' }, '癸': { kui: '卯', yue: '巳' }
            }[heavenlyStem];
      if (kuiYueBranch) {
        addDecadalStar('魁', kuiYueBranch.kui);
        addDecadalStar('钺', kuiYueBranch.yue);
      }
      
      // 大限昌曲
      const changQuBranch = {
        '甲': { chang: '巳', qu: '酉' }, '乙': { chang: '午', qu: '申' },
        '丙': { chang: '申', qu: '午' }, '戊': { chang: '申', qu: '午' },
        '丁': { chang: '酉', qu: '巳' }, '己': { chang: '酉', qu: '巳' },
        '庚': { chang: '亥', qu: '卯' },
        '辛': { chang: '子', qu: '寅' },
        '壬': { chang: '寅', qu: '子' },
        '癸': { chang: '卯', qu: '亥' }
      }[heavenlyStem];
      if (changQuBranch) {
        addDecadalStar('昌', changQuBranch.chang);
        addDecadalStar('曲', changQuBranch.qu);
      }

      // 大限天马、红鸾、天喜 (以大限命宫地支为准)
      const tianMaBranch = { '寅': '申', '午': '申', '戌': '申', '申': '寅', '子': '寅', '辰': '寅', '亥': '巳', '卯': '巳', '未': '巳' }[decadalLifePalaceBranch];
      if (tianMaBranch) addDecadalStar('马', tianMaBranch);

      const hongLuanIndex = (12 - branches.indexOf('卯') + decadalLifePalaceBranchIndex) % 12;
      if (hongLuanIndex === palaceBranchIndex) stars.push({ name: '运鸾', horoscopeType: 'decadal' });

                  const tianXiIndex = (hongLuanIndex + 6) % 12;
      if (tianXiIndex === palaceBranchIndex) stars.push({ name: '运喜', horoscopeType: 'decadal' });
    }

    // 处理流年流曜 (太岁、晦气、丧门、贯索、官符、小耗、大耗、龙德、白虎、天德、吊客、病符)
    if (horoscopeType === 'yearly') {
      const yearlyLifePalaceBranch = palaces.value[lifePalaceIndex].earthlyBranch;
      const yearlyLifePalaceBranchIndex = branches.indexOf(yearlyLifePalaceBranch);
      
      // 流禄、流羊、流陀
      const luCunBranch = { '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳', '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子' }[heavenlyStem];
      if (luCunBranch) {
        if (luCunBranch === palaceBranch) stars.push({ name: '流禄', horoscopeType: 'yearly' });
        const luCunIndex = branches.indexOf(luCunBranch);
        if (branches[(luCunIndex + 1) % 12] === palaceBranch) stars.push({ name: '流羊', horoscopeType: 'yearly' });
        if (branches[(luCunIndex + 11) % 12] === palaceBranch) stars.push({ name: '流陀', horoscopeType: 'yearly' });
      }
      
      // 流魁、流钺
      const kuiYueBranch = {
        '甲': { kui: '丑', yue: '未' }, '戊': { kui: '丑', yue: '未' }, '庚': { kui: '丑', yue: '未' },
        '乙': { kui: '子', yue: '申' }, '己': { kui: '子', yue: '申' },
        '丙': { kui: '亥', yue: '酉' }, '丁': { kui: '亥', yue: '酉' },
        '辛': { kui: '寅', yue: '午' },
        '壬': { kui: '卯', yue: '巳' }, '癸': { kui: '卯', yue: '巳' }
      }[heavenlyStem];
      if (kuiYueBranch) {
        if (kuiYueBranch.kui === palaceBranch) stars.push({ name: '流魁', horoscopeType: 'yearly' });
        if (kuiYueBranch.yue === palaceBranch) stars.push({ name: '流钺', horoscopeType: 'yearly' });
      }
      
      // 流昌、流曲
      const changQuBranch = {
        '甲': { chang: '巳', qu: '酉' }, '乙': { chang: '午', qu: '申' },
        '丙': { chang: '申', qu: '午' }, '戊': { chang: '申', qu: '午' },
        '丁': { chang: '酉', qu: '巳' }, '己': { chang: '酉', qu: '巳' },
        '庚': { chang: '亥', qu: '卯' },
        '辛': { chang: '子', qu: '寅' },
        '壬': { chang: '寅', qu: '子' },
        '癸': { chang: '卯', qu: '亥' }
      }[heavenlyStem];
      if (changQuBranch) {
        if (changQuBranch.chang === palaceBranch) stars.push({ name: '流昌', horoscopeType: 'yearly' });
        if (changQuBranch.qu === palaceBranch) stars.push({ name: '流曲', horoscopeType: 'yearly' });
      }

      // 流马、流鸾、流喜 (以流年命宫地支为准)
      const tianMaBranch = {
        '寅': '申', '午': '申', '戌': '申',
        '申': '寅', '子': '寅', '辰': '寅',
        '巳': '亥', '酉': '亥', '丑': '亥',
        '亥': '巳', '卯': '巳', '未': '巳'
      }[yearlyLifePalaceBranch];
      if (tianMaBranch && tianMaBranch === palaceBranch) {
        stars.push({ name: '流马', horoscopeType: 'yearly' });
      }

      const maoIndex = branches.indexOf('卯');
      const hongLuanIndex = (maoIndex - yearlyLifePalaceBranchIndex + 12) % 12;
      if (hongLuanIndex === palaceBranchIndex) {
        stars.push({ name: '流鸾', horoscopeType: 'yearly' });
      }

      const tianXiIndex = (hongLuanIndex + 6) % 12;
      if (tianXiIndex === palaceBranchIndex) {
        stars.push({ name: '流喜', horoscopeType: 'yearly' });
      }
    }
  }

  // 去重，因为可能会有多个运限数据
  const uniqueStars: Array<{ name: string, horoscopeType: string }> = [];
  const starNames = new Set<string>();
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i];
    if (!starNames.has(star.name)) {
      uniqueStars.unshift(star);
      starNames.add(star.name);
    }
  }

  return uniqueStars;
}

// 新增：获取流年神煞 (将前12神, 岁前12神)
function getYearlyDecorativeStars(palaceIndex: number): { jiangqian?: string; suiqian?: string } {
  const yearlyHoroscope = currentHoroscope.value.find(h => h.type === 'yearly');

  if (!yearlyHoroscope || !yearlyHoroscope.data || !yearlyHoroscope.data.yearlyDecStar) {
    return {};
  }

  const { jiangqian12, suiqian12 } = yearlyHoroscope.data.yearlyDecStar;
  
  if (!Array.isArray(jiangqian12) || !Array.isArray(suiqian12)) {
    return {};
  }

  // 神煞数组以寅宫为起点
  const yearlyStarBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const targetBranch = palaces.value[palaceIndex]?.earthlyBranch;

  if (!targetBranch) {
    return {};
  }

  const starIndex = yearlyStarBranches.indexOf(targetBranch);

  if (starIndex === -1) {
    return {};
  }

  const result: { jiangqian?: string; suiqian?: string } = {};
  if (jiangqian12[starIndex]) {
    result.jiangqian = jiangqian12[starIndex];
  }
  if (suiqian12[starIndex]) {
    result.suiqian = suiqian12[starIndex];
  }
  return result;
}

const currentHoroscopeType = computed(() => {
  if (currentHoroscope.value.length === 0) {
    return '';
  }
  // The last item in the array is the most specific/current horoscope type.
  return currentHoroscope.value[currentHoroscope.value.length - 1].type;
});
</script>

<style scoped>
.ziwei-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 0.125rem; /* 2px -> 0.125rem */
  width: 50rem; /* 900px -> 90vmin for responsiveness */
  height: 50rem; /* 900px -> 90vmin for responsiveness */
  position: relative;
  top:-85px;
  left:150px;

  margin: 1rem auto; /* Center the grid instead of fixed positioning */
  flex-shrink: 0; /* Prevent grid from shrinking in flex container */
}

.palace {
  border: 1px solid #ccc;
  background: #FFFFFB;
  opacity: 0.9;
  display: flex;
  flex-direction: column;
  border: 2px solid #888;
  font-size: 1rem; /* 16px -> 1rem */
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem; /* Add some padding */
  box-sizing: border-box; /* Ensure padding is included in size */
}

/* 选中宫位样式 - 灰色背景 */
.palace.active {
  background: #D5D5D5;
  color: white;
  border: thick double #72AEC5;
  z-index: 2;
}


/* 对宫样式 - 蓝色边框 */
.palace.opposite {
  background-color:#F8F19A;
  border: thick double #72AEC5;
}

/* 三方四正样式 - 黄色背景 */
.palace.surrounded {
  background-color: #FCF9D4;
  border: thick double #72AEC5;
}



/* 身宫标识 */
.body-palace-indicator {
  position: absolute;
  top: 80px;
  right: 4px;
  font-size: 12px;
  color: red;
  font-weight: bold;
  background-color: white;
  border: 1px solid red;
  padding: 1px 4px;
  border-radius: 4px;
}


/* 长生12神样式 */
.decorative-star.changsheng {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #9C27B0; /* 紫色 */
  background-color: #F3E5F5; /* 淡紫色背景 */
  padding: 1px 1px; /* 调整padding */
  border-radius: 3px;
  border: 1px solid #CE93D8;
  position: absolute;
  bottom: 45px; /* 放在天干地支上方 */
  right: 5px; /* 与天干地支同一列 */
  min-width: 10px; /* 设置最小宽度 */
  text-align: center; /* 文本居中 */
  line-height: 18px; /* 与天干地支的行高一致 */
  height: 18px; /* 设置高度与天干地支一致 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 一个字的长生12神样式 */
.decorative-star.changsheng:not([data-length="2"]) {
  padding: 1px 4px;
  min-width: 12px;
}

/* 两个字的长生12神样式 */
.decorative-star.changsheng[data-length="2"] {
  padding: 1px 1px;
  min-width: 20px;
}

/* 博士12神样式 */
.decorative-star.boshi {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #FF5722; /* 橙色 */
  background-color: #FBE9E7; /* 淡橙色背景 */
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px solid #FFAB91;
  margin-top: 2px;
  top: 190px;
  right: 180px;
}

/* 中央信息区样式 */
.center-info {
  grid-column: 2/4;
  grid-row: 2/4;
  background: #FFFFFB;
  opacity: 0.9;
  display: flex;
  flex-direction: column;
  border: 2px solid #888;
  font-size: 16px;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
}

/* 信息区头部 */
.info-header {
  display: flex;
  align-items: center;
  padding: 0.625rem; /* 10px -> 0.625rem */
  border-bottom: 1px solid #eee;
  background-color: rgba(255, 235, 238, 0.3);
}

.gender-icon {
  font-size: 1.25rem; /* 20px -> 1.25rem */
  margin-right: 0.625rem; /* 10px -> 0.625rem */
}

.gender-icon.male {
  color: #2196F3; /* 蓝色 */
}

.gender-icon.female {
  color: #E91E63; /* 粉色 */
}

.person-name {
  font-weight: bold;
  font-size: 1.125rem; /* 18px -> 1.125rem */
}

/* 信息行 */
.info-row {
  display: flex;
  padding: 0.5rem 0.9375rem; /* 8px 15px -> 0.5rem 0.9375rem */
  border-bottom: 1px solid #eee;
}

.info-label {
  min-width: 6.25rem; /* 100px -> 6.25rem */
  color: #666;
}

.info-value {
  flex: 1;
  color: #333;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.3125rem; /* 5px -> 0.3125rem */
  padding: 0.625rem; /* 10px -> 0.625rem */
  flex: 1; /* Allow grid to take remaining space */
}

.info-cell {
  display: flex;
  padding: 0.25rem; /* 8px -> 0.5rem, reduced for smaller area */
  font-size: 0.875rem; /* Reduce font size slightly for grid */
}

.info-cell .info-label {
  min-width: 3.75rem; /* 60px -> 3.75rem */
  color: #666;
}

.info-cell .info-value {
  flex: 1;
  color: #333;
}

.palace-title {
  font-weight: bold;
  color: #7b3f00;
}

.palace-meta {
  font-size: 11px;
  color: #555;
}

.palace-index {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 0.625rem; /* 10px -> 0.625rem */
  color: red;
  font-weight: bold;
}

.palace-name {
  font-size: 1.125rem; /* 18px -> 1.125rem */
  color: red;
  position: absolute;
  bottom: 0.25rem; /* 4px -> 0.25rem */
  right: 6.25rem; /* 100px -> 6.25rem */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.decadal-palace-name {
  display: inline-block;
  margin-left: 0.25rem; /* 4px -> 0.25rem */
  font-size: 0.6875rem; /* 11px -> 0.6875rem */
  color: #673AB7; /* 紫色，与大限边框颜色相同 */
  background-color: rgba(103, 58, 183, 0.1); /* 淡紫色背景 */
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px dashed #673AB7;
  font-weight: bold;
  vertical-align: middle;
}

.palace-hb {
  font-size: 1.125rem; /* 18px -> 1.125rem */
  color: black;
  margin-bottom: 0.125rem; /* 2px -> 0.125rem */
  position: absolute;
  bottom: 0.25rem; /* 4px -> 0.25rem */
  right: 0.25rem; /* 4px -> 0.25rem */
  /* 右下角位置 */
  writing-mode: vertical-rl;
  /* 实现竖向显示文本 */
  text-orientation: upright;
  /* 使字符保持正向显示 */
}

.star-container {
  position: absolute;
  top: 1.25rem; /* 20px -> 1.25rem */
  left: 0.3125rem; /* 5px -> 0.3125rem */
  right: 0.3125rem; /* 5px -> 0.3125rem */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 主星和辅星区域 */
.main-minor-stars {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 2px;
}

/* 杂曜容器 */
.adjective-stars-container {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0;
  max-width: 60%; /* 控制最大宽度 */
  justify-content: flex-end; /* 右对齐 */
}

/* 两行杂曜的情况 */
.adjective-stars-container.two-rows {
  top: -0.625rem; /* -10px -> -0.625rem */
}

.star-item {
  display: flex;
  flex-direction: column; /* 垂直排列星名和状态 */
  align-items: center; /* 居中对齐 */
  position: relative; /* 添加相对定位 */
}

/* 主星样式 */
.major-star {
  color: #d32f2f; /* 红色 */
  font-weight: bold;
  font-size: 1.0625rem; /* 17px -> 1.0625rem */
}

/* 辅星样式 */
.minor-star {
  color: #1976d2; /* 蓝色 */
  font-size: 0.9375rem; /* 15px -> 0.9375rem */
}

/* 杂曜样式 */
.adjective-star {
  color: #388e3c; /* 绿色 */
  font-size: 0.875rem; /* 14px -> 0.875rem */
  margin: 0 1px; /* 添加一点左右间距 */
}

.star-name {
  writing-mode: vertical-rl; /* 竖直方向显示，从右到左 */
  text-orientation: upright; /* 字符保持正向 */
  height: 2.5rem; /* 40px -> 2.5rem */
}

.star-state {
  font-size: 0.625rem; /* 10px -> 0.625rem */
}

.star-mutagen {
  font-size: 0.625rem; /* 10px -> 0.625rem */
  font-weight: bold;
  color: white;
  background-color: red;
  border-radius: 2px;
  padding: 2px;
}

/* 新增运限样式 */
.fortune-section {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #FFFFFB;
  overflow: hidden;
}

/* 新增加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 25rem; /* 400px -> 25rem */
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 0.5rem; /* 8px -> 0.5rem */
}

.loading-message {
  font-size: 1.125rem; /* 18px -> 1.125rem */
  color: #72AEC5;
  padding: 1.25rem; /* 20px -> 1.25rem */
  text-align: center;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 调整整体内容样式 */
.ziwei-content {
  position: relative;
  width: 100%;
  display: flex;
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
  justify-content: center; /* Center items */
  align-items: flex-start;
  gap: 2rem;
  /* min-height: 600px; */ /* 确保有足够的高度 */
  /* top:-55px; */ /* Removed fixed positioning */
}

/* 运限星曜样式 */
.horoscope-stars-container {
  position: absolute;
  bottom: 1.875rem; /* 30px -> 1.875rem */
  left: 0.3125rem; /* 5px -> 0.3125rem */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2px;
}

.horoscope-mutagen {
  font-size: 0.75rem; /* 12px -> 0.75rem */
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 3px;
  margin-right: 4px;
}

.horoscope-star {
  font-size: 0.75rem; /* 12px -> 0.75rem */
  padding: 2px 4px;
  border-radius: 3px;
  margin-right: 2px;
}

/* 大限样式 */
.horoscope-mutagen.decadal,
.horoscope-star.decadal,
.horoscope-comment.decadal {
  color: #ffffff;
  background-color: #673AB7;
  border: 1px solid #512DA8;
}

/* 流年样式 */
.horoscope-mutagen.yearly,
.horoscope-star.yearly,
.horoscope-comment.yearly {
  color: #ffffff;
  background-color: #F44336;
  border: 1px solid #D32F2F;
}

/* 流月样式 */
.horoscope-mutagen.monthly,
.horoscope-star.monthly,
.horoscope-comment.monthly {
  color: #ffffff;
  background-color: #2196F3;
  border: 1px solid #1976D2;
}

/* 流日样式 */
.horoscope-mutagen.daily,
.horoscope-star.daily,
.horoscope-comment.daily {
  color: #ffffff;
  background-color: #4CAF50;
  border: 1px solid #388E3C;
}

/* 流时样式 */
.horoscope-mutagen.hourly,
.horoscope-star.hourly,
.horoscope-comment.hourly {
  color: #ffffff;
  background-color: #9C27B0;
  border: 1px solid #7B1FA2;
}



/* 控制按钮样式 */
.control-buttons {
  display: flex;
  justify-content: center;
  margin-top: -0.625rem; /* -10px -> -0.625rem */
  gap: 0.75rem; /* 12px -> 0.75rem */
  position: relative; /* 添加相对定位以确保 z-index 生效 */
  z-index: 2; /* 确保按钮在信息网格之上，防止被遮挡 */
}

.toggle-button {
  padding: 0.5rem 1.125rem; /* 8px 18px -> 0.5rem 1.125rem */
  font-size: 0.875rem; /* 14px -> 0.875rem */
  font-weight: 500; /* 字体稍微加粗 */
  color: white;
  background-color: #72AEC5; /* 基准颜色不变 */
  border: none;
  border-radius: 0.375rem; /* 6px -> 0.375rem */
  cursor: pointer;
  transition: all 0.2s ease-in-out; /* 平滑过渡效果 */
  box-shadow: 0 2px 5px rgba(114, 174, 197, 0.3); /* 使用主色的半透明阴影，增加立体感 */
}

.toggle-button:hover {
  /* background-color保持不变 */
  transform: translateY(-2px); /* 悬停时按钮轻微上浮 */
  box-shadow: 0 4px 10px rgba(114, 174, 197, 0.5); /* 悬停时阴影加深 */
}

.toggle-button:active {
  transform: translateY(0); /* 点击时恢复位置 */
  box-shadow: 0 1px 3px rgba(114, 174, 197, 0.2); /* 点击时阴影变浅，模拟按压效果 */
}
</style>