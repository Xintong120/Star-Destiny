<template>
  <div>
  <!-- 添加顶层v-if条件，防止在astrolabe未初始化完成前渲染 -->
  <div v-if="isAstrolabeReady" class="ziwei-content">
  <!-- 紫微斗数命盘网格容器 -->
  <div class="ziwei-grid">
    <!-- 遍历12个宫位，palaceDisplayIndex[i] 表示第i个格子对应palaces数组的哪个下标（即哪个宫位）
         palaceDisplayIndex[0] 对应寅宫，1对应卯宫，2对应辰宫，...，11对应丑宫 -->
    <div v-for="(palaceIdx, i) in palaceDisplayIndex" :key="i" 
         class="palace" 
         :class="[
           {'active': selectedPalaceIndex === palaceIdx,
            'opposite': oppositePalaceIndex === palaceIdx,
            'surrounded': surroundedPalaceIndices.includes(palaceIdx),
            'horoscope-surrounded': horoscopeSurroundedPalaceIndices.includes(palaceIdx),
            'horoscope-life-palace': horoscopeLifePalaceIndex === palaceIdx,
            'body-palace': palaces[palaceIdx] && palaces[palaceIdx].isBodyPalace
           },
           horoscopeSurroundedPalaceIndices.includes(palaceIdx) ? currentHoroscopeType : ''
         ]"
         @click="selectPalace(palaceIdx)">
      <!-- 宫位序号（1~12，格子顺序） -->
      <div class="palace-index">{{ i + 1 }}</div>
      <!-- 宫位名称（如：命宫、兄弟宫等） -->
      <div class="palace-name">
        <!-- palaces[palaceIdx] 取出当前格子对应的宫位对象，name为宫位名称 -->
        {{ palaces[palaceIdx] && palaces[palaceIdx].name ? palaces[palaceIdx].name : '' }}
      </div>
      <!-- 身宫标识 -->
      <div v-if="palaces[palaceIdx] && palaces[palaceIdx].isBodyPalace" class="body-palace-indicator">
        身宫
      </div>
      <!-- 多层级命宫标识，遍历所有层级命宫，保留所有上级运限命宫 -->
      <template v-for="item in allHoroscopeLifePalace">
        <div
          v-if="item.index === palaceIdx"
          :key="item.type"
          class="horoscope-life-palace-indicator"
          :class="item.type"
        >
          {{ item.type === 'decadal' ? '大限命宫' :
             item.type === 'yearly' ? '流年命宫' :
             item.type === 'monthly' ? '流月命宫' :
             item.type === 'daily' ? '流日命宫' :
             item.type === 'hourly' ? '流时命宫' : '命宫' }}
        </div>
      </template>
      <!-- 天干地支显示 -->
      <div class="palace-hb">
        <span v-if="palaces[palaceIdx]">
          {{ palaces[palaceIdx].heavenlyStem }}{{ palaces[palaceIdx].earthlyBranch }}
        </span>
      </div>
      <!-- 星曜列表，分开渲染主星、辅星和杂曜 -->
      <div class="star-container" v-if="palaces[palaceIdx] && (
        palaces[palaceIdx].majorStars.length || palaces[palaceIdx].minorStars.length || palaces[palaceIdx].adjectiveStars.length
      )">
        <!-- 主星和辅星区域 -->
        <div class="main-minor-stars">
          <!-- 主星显示 -->
          <div
            v-for="star in palaces[palaceIdx].majorStars"
            :key="star.name + star.type + star.scope" 
            class="star-item major-star">
            <span class="star-name">{{ star.name }}</span>
            <span class="star-state">{{ star.brightness }}</span>
            <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
            <!-- 添加四化标识 -->
            <span class="sihua-badge" v-if="getStarMutagenType(star.name)" :data-type="getStarMutagenType(star.name)">{{ getStarMutagenType(star.name) }}</span>
          </div>
          
          <!-- 辅星显示 -->
          <div
            v-for="star in palaces[palaceIdx].minorStars"
            :key="star.name + star.type + star.scope" 
            class="star-item minor-star">
            <span class="star-name">{{ star.name }}</span>
            <span class="star-state">{{ star.brightness }}</span>
            <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
            <!-- 添加四化标识 -->
            <span class="sihua-badge" v-if="getStarMutagenType(star.name)" :data-type="getStarMutagenType(star.name)">{{ getStarMutagenType(star.name) }}</span>
          </div>
        </div>
        
        <!-- 杂曜区域 -->
        <div class="adjective-stars-container" 
             :class="{ 'two-rows': palaces[palaceIdx].adjectiveStars.length > 5 }">
          <div
            v-for="star in palaces[palaceIdx].adjectiveStars"
            :key="star.name + star.type + star.scope" 
            class="star-item adjective-star">
            <span class="star-name">{{ star.name }}</span>
            <span class="star-state">{{ star.brightness }}</span>
            <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
            <!-- 添加四化标识 -->
            <span class="sihua-badge" v-if="getStarMutagenType(star.name)" :data-type="getStarMutagenType(star.name)">{{ getStarMutagenType(star.name) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 神煞区域 - 长生12神和博士12神 -->
      <div class="decorative-stars-container" v-if="palaces[palaceIdx]">
        <!-- 长生12神 -->
        <div v-if="palaces[palaceIdx].changsheng12" class="decorative-star changsheng" :data-length="palaces[palaceIdx].changsheng12.length">
          {{ palaces[palaceIdx].changsheng12 }}
        </div>
        <!-- 博士12神 -->
        <div v-if="palaces[palaceIdx].boshi12" class="decorative-star boshi">
          {{ palaces[palaceIdx].boshi12 }}
        </div>
      </div>

      <!-- 运限星曜区域（恢复为只显示当前层级） -->
      <div class="horoscope-stars-container" v-if="palaces[palaceIdx] && currentHoroscope">
        <!-- 流年/流月/流日/流时四化星 -->
        <div v-if="getHoroscopeMutagen(palaceIdx)" class="horoscope-mutagen" :class="currentHoroscopeType">
          {{ getHoroscopeMutagen(palaceIdx) }}
        </div>
        <!-- 流年/流月/流日/流时流曜星 -->
        <div v-for="star in getHoroscopeStars(palaceIdx)" :key="star.name + '-' + (star.horoscopeType || '')"
             class="horoscope-star" :class="star.horoscopeType">
          {{ star.name }}
        </div>
      </div>

      <!--
        palaceDisplayIndex[i] 与地支宫位的对应关系：
        palaceDisplayIndex[0] 对应寅宫，1对应卯宫，2对应辰宫，...，11对应丑宫。
        这样每个格子内容与天干地支、星曜完全对应。
      -->
    </div>
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
        <span class="info-value">{{ getTimeInfo() }}</span>
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
          <span class="info-value">{{ getZodiacSign() }}</span>
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
          <span class="info-value">{{ getLifePalace() }}</span>
        </div>
        
        <div class="info-cell">
          <span class="info-label">身宫</span>
          <span class="info-value">{{ getBodyPalace() }}</span>
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
import { ref, computed, onMounted, watch } from 'vue';
import type { IFunctionalAstrolabe } from '../src/astro/FunctionalAstrolabe'
import ZiWeiHoroscope from './ZiWeiHoroscope.vue'; // 导入ZiWeiHoroscope组件

// 添加一个标志，确保只有astrolabe完全初始化后才渲染组件
const isAstrolabeReady = ref(false);

// 添加引用，用于访问ZiWeiHoroscope组件的方法
const fortuneRef = ref<InstanceType<typeof ZiWeiHoroscope> | null>(null);

const props = defineProps<{ 
  astrolabe: IFunctionalAstrolabe,
  personName?: string 
}>()

// palaceDisplayIndex[i] 表示第i个格子对应palaces数组的哪个下标（即哪个宫位）
// palaceDisplayIndex[0] 对应寅宫，1对应卯宫，2对应辰宫，...，11对应丑宫
const palaceDisplayIndex = [3, 4, 5, 6, 2, 7, 1, 8, 0, 11, 10, 9];
// palaces数组，包含12个宫位对象，每个对象包含名称、天干地支、星曜等
const palaces = props.astrolabe.palaces;

// 当前选中的宫位索引
const selectedPalaceIndex = ref<number | null>(null);

// 计算对宫索引
const oppositePalaceIndex = computed<number | null>(() => {
  if (selectedPalaceIndex.value === null) return null;
  
  try {
    // 直接使用地支计算对宫
    // 对宫地支相差6个位置（如寅对申，卯对酉等）
    const selectedPalace = palaces[selectedPalaceIndex.value];
    if (!selectedPalace) return null;
    
    const earthlyBranchArray = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    const earthlyBranchIndex = earthlyBranchArray.indexOf(selectedPalace.earthlyBranch);
    
    if (earthlyBranchIndex !== -1) {
      const oppositeEarthlyBranch = earthlyBranchArray[(earthlyBranchIndex + 6) % 12];
      // 在palaces数组中找到对应地支的宫位
      const oppositeIndex = palaces.findIndex(p => p.earthlyBranch === oppositeEarthlyBranch);
      
      console.log('对宫计算:', {
        当前宫位: selectedPalaceIndex.value,
        当前地支: selectedPalace.earthlyBranch,
        对宫地支: oppositeEarthlyBranch,
        对宫索引: oppositeIndex
      });
      
      return oppositeIndex !== -1 ? oppositeIndex : null;
    }
  } catch (error) {
    console.error("获取对宫出错:", error);
  }
  
  return null;
});

// 计算三方四正宫位索引（官禄位和财帛位）
const surroundedPalaceIndices = computed<number[]>(() => {
  if (selectedPalaceIndex.value === null) return [];
  
  try {
    // 使用iztro库的surroundedPalaces方法获取三方四正
    const surroundedPalaces = props.astrolabe.surroundedPalaces(selectedPalaceIndex.value);
    if (!surroundedPalaces) return [];
    
    const indices: number[] = [];
    
    // 添加官禄位（career）
    if (surroundedPalaces.career) {
      const careerIndex = palaces.findIndex(p => 
        p.earthlyBranch === surroundedPalaces.career.earthlyBranch && 
        p.heavenlyStem === surroundedPalaces.career.heavenlyStem
      );
      if (careerIndex !== -1) indices.push(careerIndex);
    }
    
    // 添加财帛位（wealth）
    if (surroundedPalaces.wealth) {
      const wealthIndex = palaces.findIndex(p => 
        p.earthlyBranch === surroundedPalaces.wealth.earthlyBranch && 
        p.heavenlyStem === surroundedPalaces.wealth.heavenlyStem
      );
      if (wealthIndex !== -1) indices.push(wealthIndex);
    }
    
    return indices;
  } catch (error) {
    console.error("获取三方四正出错:", error);
    return [];
  }
});

// 选择宫位
function selectPalace(index: number) {
  if (selectedPalaceIndex.value === index) {
    // 再次点击同一宫位，取消选择
    selectedPalaceIndex.value = null;
  } else {
    selectedPalaceIndex.value = index;
  }
}

// 获取星座
function getZodiacSign() {
  // 简单的星座计算，根据阳历日期
  if (!props.astrolabe.solarDate) return '';
  
  const [year, month, day] = props.astrolabe.solarDate.split('-').map(Number);
  const monthDay = month * 100 + day; // 将月和日组合成一个数字，如8月16日为816
  
  if ((monthDay >= 321 && monthDay <= 419)) return '白羊座';
  if ((monthDay >= 420 && monthDay <= 520)) return '金牛座';
  if ((monthDay >= 521 && monthDay <= 621)) return '双子座';
  if ((monthDay >= 622 && monthDay <= 722)) return '巨蟹座';
  if ((monthDay >= 723 && monthDay <= 822)) return '狮子座';
  if ((monthDay >= 823 && monthDay <= 922)) return '处女座';
  if ((monthDay >= 923 && monthDay <= 1023)) return '天秤座';
  if ((monthDay >= 1024 && monthDay <= 1122)) return '天蝎座';
  if ((monthDay >= 1123 && monthDay <= 1221)) return '射手座';
  if ((monthDay >= 1222 || monthDay <= 119)) return '摩羯座';
  if ((monthDay >= 120 && monthDay <= 218)) return '水瓶座';
  if ((monthDay >= 219 && monthDay <= 320)) return '双鱼座';
  
  return '';
}

// 获取命宫信息
function getLifePalace() {
  const lifePalace = props.astrolabe.palace('命宫');
  return lifePalace ? lifePalace.earthlyBranch : '';
}

// 获取身宫信息
function getBodyPalace() {
  const bodyPalace = props.astrolabe.palaces.find(palace => palace.isBodyPalace);
  return bodyPalace ? bodyPalace.earthlyBranch : '';
}

// 获取时间信息
function getTimeInfo() {
  // 时辰名称数组
  const times = ['早子时(0-1)', '丑时(1-3)', '寅时(3-5)', '卯时(5-7)', '辰时(7-9)', '巳时(9-11)', 
                '午时(11-13)', '未时(13-15)', '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)', '晚子时(23-0)'];
  
  // 从四柱中获取时柱信息
  const chineseDateParts = props.astrolabe.chineseDate.split(' ');
  
  // 四柱格式为"年柱 月柱 日柱 时柱"，取第四部分作为时柱
  const timeColumn = chineseDateParts.length > 3 ? chineseDateParts[3] : '';
  
  // 提取时柱地支
  const timeBranch = timeColumn.length >= 1 ? timeColumn.charAt(1) : '';
  
  // 地支对应的时辰索引
  const branchToTimeIndex = {
    '子': [0, 12], // 早子时或晚子时，默认显示为子时
    '丑': [1],
    '寅': [2],
    '卯': [3],
    '辰': [4],
    '巳': [5],
    '午': [6],
    '未': [7],
    '申': [8],
    '酉': [9],
    '戌': [10],
    '亥': [11]
  };
  
  // 根据地支获取时辰名称
  if (timeBranch && branchToTimeIndex[timeBranch]) {
    const timeIndices = branchToTimeIndex[timeBranch];
    // 如果是子时，默认显示子时(23-1)
    return times[timeIndices[0]];
  }
  
  return timeColumn; // 如果无法匹配，则返回原始时柱
}

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

// 计算虚岁
const nominalAge = computed(() => {
  try {
    // 从horoscope方法获取年龄信息
    const horoscope = props.astrolabe.horoscope();
    if (horoscope && horoscope.age && horoscope.age.nominalAge) {
      return horoscope.age.nominalAge;
    }
    
    // 如果上面的方法失败，尝试根据日期计算
    if (props.astrolabe.solarDate) {
      const birthYear = parseInt(props.astrolabe.solarDate.split('-')[0]);
      if (!isNaN(birthYear)) {
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear + 1; // 虚岁计算
      }
    }
    return '';
  } catch (error) {
    console.error('计算虚岁出错:', error);
    return '';
  }
});

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
      props.astrolabe.palaces.forEach((palace, index) => {
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
  refreshHoroscopeInfo
});

// 当前运限信息
const currentHoroscope = ref<any[]>([]);
const currentHoroscopeType = ref<string>('');

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

// 新增：用于存储所有层级的命宫索引和类型
const allHoroscopeLifePalace = ref<Array<{type: string, index: number}>>([]);

// 修改 handleHoroscopeUpdate，收集所有层级命宫
function handleHoroscopeUpdate(horoscopeData: any) {
  console.log('接收到运限信息更新:', horoscopeData);
  // ...原有清理代码...
  allHoroscopeLifePalace.value = [];
  // 清除所有运限宫位名称
  if (!horoscopeData) {
    horoscopePalaceNamesByType.value = {
      decadal: [],
      yearly: [],
      monthly: [],
      daily: [],
      hourly: []
    };
    currentHoroscope.value = [];
    currentHoroscopeType.value = '';
    return;
  }
  if (Array.isArray(horoscopeData)) {
    // 收集所有层级的命宫索引和类型
    horoscopeData.forEach(item => {
      if (item.lifePalaceIndex !== undefined && item.type) {
        allHoroscopeLifePalace.value.push({ type: item.type, index: item.lifePalaceIndex });
      }
    });
    // ...原有代码...
  } else if (horoscopeData && horoscopeData.lifePalaceIndex !== undefined && horoscopeData.type) {
    allHoroscopeLifePalace.value.push({ type: horoscopeData.type, index: horoscopeData.lifePalaceIndex });
    // ...原有代码...
  }
  // ...原有代码...
}

// 获取运限宫位名称（返回数组，包含类型和值）
function getHoroscopePalaceNames(palaceIndex: number): Array<{type: string, value: string}> {
  try {
    // 如果没有运限信息，返回空数组
    if (!currentHoroscopeType.value) {
      return [];
    }
    
    // 创建一个数组，存储所有需要显示的宫位名称
    const palaceNames: Array<{type: string, value: string}> = [];
    
    // 遍历所有已保存的运限类型
    for (const [type, names] of Object.entries(horoscopePalaceNamesByType.value)) {
      // 如果该运限类型有宫位名称数据
      if (names && names.length > 0) {
        // 获取该宫位在地支顺序中的索引
        // palaceDisplayIndex[i] 表示第i个格子对应palaces数组的哪个下标
        // 我们需要找到当前宫位(palaceIndex)在palaceDisplayIndex中的位置
        const displayIndex = palaceDisplayIndex.indexOf(palaceIndex);
        
        // 如果找到了该宫位的显示索引
        if (displayIndex !== -1) {
          // 根据显示索引获取对应的运限宫位名称
          // 注意：地支顺序是寅卯辰巳午未申酉戌亥子丑，对应的索引是0,1,2,3,4,5,6,7,8,9,10,11
          // 而iztro返回的宫位名称顺序可能不同，我们需要根据不同的运限类型进行调整
          let adjustedIndex;
          
          // 根据运限类型和地支索引计算宫位索引
          switch (type) {
            case 'decadal':
              // 大限宫位顺序: 官禄,仆役,迁移,疾厄,财帛,子女,夫妻,兄弟,命宫,父母,福德,田宅
              // 对应地支索引: 寅卯辰巳午未申酉戌亥子丑 (0-11)
              // 命宫在索引8的位置，对应地支戌(8)
              adjustedIndex = (displayIndex + 8) % 12;
              break;
            case 'yearly':
              // 流年宫位顺序: 田宅,官禄,仆役,迁移,疾厄,财帛,子女,夫妻,兄弟,命宫,父母,福德
              // 命宫在索引9的位置，对应地支亥(9)
              adjustedIndex = (displayIndex + 9) % 12;
              break;
            case 'monthly':
              // 流月宫位顺序: 兄弟,命宫,父母,福德,田宅,官禄,仆役,迁移,疾厄,财帛,子女,夫妻
              // 命宫在索引1的位置，对应地支卯(1)
              adjustedIndex = (displayIndex + 1) % 12;
              break;
            case 'daily':
            case 'hourly':
              // 流日/流时宫位顺序: 仆役,迁移,疾厄,财帛,子女,夫妻,兄弟,命宫,父母,福德,田宅,官禄
              // 命宫在索引7的位置，对应地支酉(7)
              adjustedIndex = (displayIndex + 7) % 12;
              break;
            default:
              adjustedIndex = displayIndex;
          }
          
          // 确保索引在有效范围内
          adjustedIndex = (adjustedIndex + 12) % 12;
          
          // 获取该索引对应的宫位名称
          const palaceName = names[adjustedIndex];
          
          if (palaceName) {
            // 根据运限类型添加前缀
            let prefix = '';
            switch (type) {
              case 'decadal':
                prefix = '大';
                break;
              case 'yearly':
                prefix = '年';
                break;
              case 'monthly':
                prefix = '月';
                break;
              case 'daily':
                prefix = '日';
                break;
              case 'hourly':
                prefix = '时';
                break;
              default:
                prefix = '';
            }
            
            // 简化宫位名称（去掉"宫"字）
            const simpleName = palaceName.replace('宫', '');
            
            // 跳过特定的运限宫位名称
            // 年迁移、月仆役、日仆役、时仆役
            if ((type === 'yearly' && simpleName === '迁移') ||
                (type === 'monthly' && simpleName === '仆役') ||
                (type === 'daily' && simpleName === '仆役') ||
                (type === 'hourly' && simpleName === '仆役')) {
              continue;
            }
            
            // 添加到结果数组
            palaceNames.push({ type, value: prefix + simpleName });
          }
        }
      }
    }
    
    return palaceNames;
  } catch (error) {
    console.error('获取运限宫位名称出错:', error);
    return [];
  }
}

// 获取星曜的四化类型（禄、权、科、忌）
function getStarMutagenType(starName: string): string | null {
  if (!currentHoroscope.value || currentHoroscope.value.length === 0) {
    return null;
  }
  
  try {
    // 遍历所有运限层级，查找四化星
    for (const horoscopeItem of currentHoroscope.value) {
      if (horoscopeItem && horoscopeItem.data && horoscopeItem.data.mutagen) {
        // 如果四化星是数组形式
        if (Array.isArray(horoscopeItem.data.mutagen)) {
          const mutagenArray = horoscopeItem.data.mutagen;
          // 四化星顺序：禄、权、科、忌
          if (mutagenArray[0] === starName) return '禄';
          if (mutagenArray[1] === starName) return '权';
          if (mutagenArray[2] === starName) return '科';
          if (mutagenArray[3] === starName) return '忌';
        }
      }
    }
  } catch (error) {
    console.error('获取星曜四化类型出错:', error);
  }
  
  return null;
}

// 获取宫位对应的运限四化星
function getHoroscopeMutagen(palaceIndex: number): string | null {
  if (!currentHoroscope.value || currentHoroscope.value.length === 0) {
    return null;
  }
  
  try {
    // 获取宫位的地支
    const palace = palaces[palaceIndex];
    if (!palace) return null;
    
    const earthlyBranch = palace.earthlyBranch;
    
    // 遍历所有运限层级，查找四化星
    for (const horoscopeItem of currentHoroscope.value) {
      if (horoscopeItem && horoscopeItem.data && horoscopeItem.data.mutagen) {
        // 如果四化星是数组形式
        if (Array.isArray(horoscopeItem.data.mutagen)) {
          // 暂不处理数组形式的四化星
          continue;
        } else {
          // 如果是对象，检查该宫位是否有四化星
          for (const [key, value] of Object.entries(horoscopeItem.data.mutagen)) {
            if (value === earthlyBranch) {
              return key; // 返回四化星名称
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('获取运限四化星出错:', error);
  }
  
  return null;
}

// 获取宫位对应的运限流耀星
function getHoroscopeStars(palaceIndex: number): Array<{name: string, type?: string, horoscopeType?: string}> {
  if (!currentHoroscope.value || currentHoroscope.value.length === 0) {
    return [];
  }
  
  try {
    // 获取宫位的地支
    const palace = palaces[palaceIndex];
    if (!palace) return [];
    
    const earthlyBranch = palace.earthlyBranch;
    const result: Array<{name: string, type?: string, horoscopeType?: string}> = [];
    
    // 遍历所有运限层级，收集流耀星
    for (const horoscopeItem of currentHoroscope.value) {
      if (horoscopeItem && horoscopeItem.data && horoscopeItem.data.stars) {
        const horoscopeType = horoscopeItem.type || '';
        
        // 检查stars是否为数组
        if (Array.isArray(horoscopeItem.data.stars)) {
          // 如果是数组，找到对应索引的元素
          if (horoscopeItem.data.palaceNames) {
            const palaceIndex = horoscopeItem.data.palaceNames.indexOf(palace.name);
            if (palaceIndex !== -1 && palaceIndex < horoscopeItem.data.stars.length) {
              const stars = horoscopeItem.data.stars[palaceIndex] || [];
              stars.forEach(star => {
                if (typeof star === 'string') {
                  result.push({ name: star, horoscopeType });
                } else if (star && star.name) {
                  result.push({ name: star.name, type: star.type, horoscopeType });
                }
              });
            }
          }
        } else if (typeof horoscopeItem.data.stars === 'object') {
          // 如果是对象，查找该宫位对应地支的流耀星
          const stars = horoscopeItem.data.stars[earthlyBranch] || [];
          stars.forEach(star => {
            if (typeof star === 'string') {
              result.push({ name: star, horoscopeType });
            } else if (star && star.name) {
              result.push({ name: star.name, type: star.type, horoscopeType });
            }
          });
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('获取运限流耀星出错:', error);
  }
  
  return [];
}

// 更新运限三方四正索引
function updateHoroscopeSurroundedPalaces(surroundedPalaces: any) {
  if (!surroundedPalaces) return;
  
  try {
    console.log('更新运限三方四正，数据类型:', typeof surroundedPalaces, surroundedPalaces);
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
      // 原有的处理逻辑
      // ... existing code ...
    }
    
    // 去重
    const uniqueIndices = [...new Set(indices)];
    horoscopeSurroundedPalaceIndices.value = uniqueIndices;
    console.log('运限三方四正索引:', horoscopeSurroundedPalaceIndices.value);
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
      const index = palaces.findIndex(p => 
        p.earthlyBranch === palaceInfo.earthlyBranch && 
        p.heavenlyStem === palaceInfo.heavenlyStem
      );
      
      if (index !== -1) {
        return index;
      }
    }
    
    // 如果只有地支，尝试匹配
    if (palaceInfo.earthlyBranch) {
      const index = palaces.findIndex(p => p.earthlyBranch === palaceInfo.earthlyBranch);
      
      if (index !== -1) {
        return index;
      }
    }
    
    // 如果有宫位名称，尝试匹配
    if (palaceInfo.name) {
      const index = palaces.findIndex(p => p.name === palaceInfo.name);
      
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
</script>

<style scoped>
.ziwei-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 2px;
  width: 900px;
  height: 900px;
  position: relative;
  left: 175px;/* 放在右侧，不与horoscope重叠 */
}

.palace {
  border: 1px solid #ccc;
  background: #FFFFFB;
  opacity: 0.9;
  font-size: 12px;
  padding: 2px;
  min-height: 80px;
  position: relative;
  cursor: pointer; /* 添加鼠标指针样式 */
  transition: all 0.3s ease; /* 添加过渡效果 */
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

/* 运限三方四正样式 */
.palace.horoscope-surrounded {
  background-color: rgba(255, 193, 7, 0.3); /* 淡黄色背景 */
  border: 2px dashed #FFC107; /* 黄色虚线边框 */
  z-index: 1;
}

/* 不同运限类型的三方四正样式 */
.palace.horoscope-surrounded.decadal {
  border-color: #673AB7; /* 紫色边框 */
  background-color: rgba(103, 58, 183, 0.1); /* 淡紫色背景 */
}

.palace.horoscope-surrounded.yearly {
  border-color: #F44336; /* 红色边框 */
  background-color: rgba(244, 67, 54, 0.1); /* 淡红色背景 */
}

.palace.horoscope-surrounded.monthly {
  border-color: #2196F3; /* 蓝色边框 */
  background-color: rgba(33, 150, 243, 0.1); /* 淡蓝色背景 */
}

.palace.horoscope-surrounded.daily {
  border-color: #4CAF50; /* 绿色边框 */
  background-color: rgba(76, 175, 80, 0.1); /* 淡绿色背景 */
}

.palace.horoscope-surrounded.hourly {
  border-color: #9C27B0; /* 紫色边框 */
  background-color: rgba(156, 39, 176, 0.1); /* 淡紫色背景 */
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
  padding: 10px;
  border-bottom: 1px solid #eee;
  background-color: rgba(255, 235, 238, 0.3);
}

.gender-icon {
  font-size: 20px;
  margin-right: 10px;
}

.gender-icon.male {
  color: #2196F3; /* 蓝色 */
}

.gender-icon.female {
  color: #E91E63; /* 粉色 */
}

.person-name {
  font-weight: bold;
  font-size: 18px;
}

/* 信息行 */
.info-row {
  display: flex;
  padding: 8px 15px;
  border-bottom: 1px solid #eee;
}

.info-label {
  min-width: 100px;
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
  grid-gap: 5px;
  padding: 10px;
}

.info-cell {
  display: flex;
  padding: 8px;
}

.info-cell .info-label {
  min-width: 60px;
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
  font-size: 10px;
  color: red;
  font-weight: bold;
}

.palace-name {
  font-size: 18px;
  color: red;
  position: absolute;
  bottom:4px;
  right:100px;
}

.palace-hb {
  font-size: 18px;
  color: black;
  margin-bottom: 2px;
  position: absolute;
  bottom: 4px;
  right: 4px;
  /* 右下角位置 */
  writing-mode: vertical-rl;
  /* 实现竖向显示文本 */
  text-orientation: upright;
  /* 使字符保持正向显示 */
}

.star-container {
  position: absolute;
  top: 20px;
  left: 5px;
  right: 5px;
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
  top: -10px; /* 向上移动一点 */
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
  font-size: 17px;
}

/* 辅星样式 */
.minor-star {
  color: #1976d2; /* 蓝色 */
  font-size: 15px;
}

/* 杂曜样式 */
.adjective-star {
  color: #388e3c; /* 绿色 */
  font-size: 14px;
  margin: 0 1px; /* 添加一点左右间距 */
}

.star-name {
  writing-mode: vertical-rl; /* 竖直方向显示，从右到左 */
  text-orientation: upright; /* 字符保持正向 */
  height: 40px; /* 控制高度 */
}

.star-state {
  font-size: 10px;
}

.star-mutagen {
  font-size: 10px;
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
  height: 400px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
}

.loading-message {
  font-size: 18px;
  color: #72AEC5;
  padding: 20px;
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
  height: 100%;
  min-height: 600px; /* 确保有足够的高度 */
  top:-55px;
}

/* 运限星曜样式 */
.horoscope-stars-container {
  position: absolute;
  bottom: 30px;
  left: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2px;
}

.horoscope-mutagen {
  font-size: 12px;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 3px;
  margin-right: 4px;
}

.horoscope-star {
  font-size: 12px;
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

/* 四化标识样式 */
.sihua-badge {
  position: absolute;
  right: -5px;
  top: -5px;
  font-size: 10px;
  font-weight: bold;
  padding: 1px 3px;
  border-radius: 50%;
  background-color: gold;
  color: #333;
  z-index: 10;
}

/* 四化颜色 */
.sihua-badge[data-type="禄"] {
  background-color: #FFD700; /* 金色 */
}

.sihua-badge[data-type="权"] {
  background-color: #FF4500; /* 红色 */
}

.sihua-badge[data-type="科"] {
  background-color: #32CD32; /* 绿色 */
}

.sihua-badge[data-type="忌"] {
  background-color: #4B0082; /* 紫色 */
  color: white;
}

/* 运限命宫标识样式 */
.horoscope-life-palace-indicator {
  position: absolute;
  top: 40px;
  left: 4px;
  font-size: 10px;
  font-weight: bold;
  background-color: white;
  padding: 1px 4px;
  border-radius: 4px;
  z-index: 10;
}

/* 不同运限类型的命宫标识样式 */
.horoscope-life-palace-indicator.decadal {
  color: #673AB7;
  border: 1px solid #673AB7;
}

.horoscope-life-palace-indicator.yearly {
  color: #F44336;
  border: 1px solid #F44336;
}

.horoscope-life-palace-indicator.monthly {
  color: #2196F3;
  border: 1px solid #2196F3;
}

.horoscope-life-palace-indicator.daily {
  color: #4CAF50;
  border: 1px solid #4CAF50;
}

.horoscope-life-palace-indicator.hourly {
  color: #9C27B0;
  border: 1px solid #9C27B0;
}

/* 运限命宫宫位样式 */
.palace.horoscope-life-palace {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 不同运限类型的命宫宫位样式 */
.palace.horoscope-life-palace.decadal {
  border: 2px dashed #673AB7;
}

.palace.horoscope-life-palace.yearly {
  border: 2px dashed #F44336;
}

.palace.horoscope-life-palace.monthly {
  border: 2px dashed #2196F3;
}

.palace.horoscope-life-palace.daily {
  border: 2px dashed #4CAF50;
}

.palace.horoscope-life-palace.hourly {
  border: 2px dashed #9C27B0;
}
</style>