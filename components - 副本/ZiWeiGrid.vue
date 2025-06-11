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
      <!-- 本命宫位名称（如：命宫、兄弟宫等） -->
      <div class="palace-name">
        <!-- palaces[palaceIdx] 取出当前格子对应的宫位对象，name为宫位名称 -->
        {{ palaces[palaceIdx] && palaces[palaceIdx].name ? palaces[palaceIdx].name : '' }}
        
        <!-- 显示大限宫位名称 -->
        <span v-if="showDecadalScope && getDecadalPalaceName(palaceIdx, i)" class="decadal-palace-name">
          <!-- 基于本命宫位名称获取对应的大限宫位名称 -->
          {{ getDecadalPalaceName(palaceIdx, i) }}
        </span>
      </div>
      <!-- 身宫标识 -->
      <div v-if="palaces[palaceIdx] && palaces[palaceIdx].isBodyPalace" class="body-palace-indicator">
        身宫
      </div>
      
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
        <!-- 移除流年/流月/流日/流时四化星显示元素 -->
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
      
      <!-- 添加控制按钮 -->
      <div class="control-buttons">
        <button class="toggle-button" @click="toggleShowDecadalScope">
          {{ showDecadalScope ? '隐藏大限宫位' : '显示大限宫位' }}
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
import { ref, computed, onMounted, watch } from 'vue';
import type { IFunctionalAstrolabe } from '../src/astro/FunctionalAstrolabe'
import ZiWeiHoroscope from './ZiWeiHoroscope.vue'; // 导入ZiWeiHoroscope组件
import { useHoroscopeStore } from '../src/stores/horoscopeStore';

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
  
  // 打印本命宫位索引和名称
  try {
    console.log('本命宫位索引和名称:');
    palaces.forEach((palace, index) => {
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
    const lifePalaceIndex = props.astrolabe.palaces.findIndex(p => p.name === '命宫');
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
  refreshHoroscopeInfo,
  toggleShowDecadalScope
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

// 控制大限宫位名称显示
const showDecadalScope = ref<boolean>(true);

// 切换大限宫位名称显示
function toggleShowDecadalScope() {
  showDecadalScope.value = !showDecadalScope.value;
  console.log(`大限宫位名称显示: ${showDecadalScope.value ? '开启' : '关闭'}`);
}

// 新增：用于存储所有层级的命宫索引和类型
const allHoroscopeLifePalace = ref<Array<{type: string, index: number}>>([]);

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
  for (let i = 0; i < palaces.length; i++) {
    const palace = palaces[i];
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
  currentHoroscopeType.value = '';
  
  if (!horoscopeData) {
    console.log('运限数据为空，不进行处理');
    return;
  }
  
  if (Array.isArray(horoscopeData)) {
    console.log(`运限数组长度: ${horoscopeData.length}`);
    
    // 收集所有层级的命宫索引和类型
    horoscopeData.forEach((horoscopeItem, index) => {
      try {
        console.log(`处理第${index+1}个运限项：类型=${horoscopeItem.type}, 命宫索引=${horoscopeItem.lifePalaceIndex}`);
        
        // 打印运限项的完整数据（小心循环引用）
        try {
          console.log(`运限项${index+1}完整数据:`, JSON.stringify(horoscopeItem, null, 2));
        } catch (error) {
          console.log(`运限项${index+1}数据无法序列化:`, error.message);
        }
        
        // 打印本命宫位索引和名称
        console.log('本命宫位索引和名称:');
        palaces.forEach((palace, i) => {
          if (palace) {
            console.log(`  索引${i}: ${palace.name} (${palace.heavenlyStem}${palace.earthlyBranch})`);
          }
        });
        
        // 添加命宫索引
        if (horoscopeItem.type === 'decadal') {
          console.log(`添加${horoscopeItem.type}命宫索引: ${horoscopeItem.lifePalaceIndex}`);
          allHoroscopeLifePalace.value.push({
            type: horoscopeItem.type,
            index: horoscopeItem.lifePalaceIndex
          });
          
          // 设置当前运限命宫索引和类型
          console.log(`设置当前运限命宫索引: ${horoscopeItem.lifePalaceIndex}, 类型: ${horoscopeItem.type}`);
          horoscopeLifePalaceIndex.value = horoscopeItem.lifePalaceIndex;
          currentHoroscopeType.value = horoscopeItem.type;
          
          // 更新运限三方四正
          console.log(`更新运限三方四正，数据类型: ${typeof horoscopeItem.surroundedPalaces}`);
          if (horoscopeItem.surroundedPalaces) {
            updateHoroscopeSurroundedPalaces(horoscopeItem.surroundedPalaces);
          }
          
          // 保存宫位名称
          if (horoscopeItem.data && horoscopeItem.data.palaceNames) {
            console.log(`保存${horoscopeItem.type}宫位名称:`, horoscopeItem.data.palaceNames);
            
            // 获取大限索引
            const selectedDecadeIndex = horoscopeStore.selectedDecadeIndex;
            console.log(`当前大限索引: ${selectedDecadeIndex}`);
            
            if (horoscopeItem.type === 'decadal' && horoscopeItem.lifePalaceIndex !== undefined) {
              const adjustedPalaceNames: string[] = new Array(12).fill('');

              // 检查是否为第一个大限
              if (selectedDecadeIndex === 0) {
                // 第一个大限, 宫位名称与本命宫位名称一致
                console.log('设置第一个大限宫位名称，与本命宫位名称一一对应');
                for (let i = 0; i < palaces.length; i++) {
                  const palace = palaces[i];
                  if (palace && palace.name) {
                    const adjustedName = palace.name.endsWith('宫') ? palace.name : `${palace.name}宫`;
                    adjustedPalaceNames[i] = adjustedName;
                  }
                }
              } else {
                // 后续大限, 根据大限命宫位置重新排布宫位名称
                console.log('设置后续大限宫位名称，根据规则计算大限命宫位置');
                
                // 1. 找到本命命宫的索引
                const natalLifePalaceIndex = palaces.findIndex(p => p.name === '命宫');
                if (natalLifePalaceIndex === -1) {
                  console.error('错误：无法在本命盘中找到命宫');
                  return; // 无法继续则退出
                }

                // 2. 根据性别和年干确定大限移动方向
                const gender = props.astrolabe.gender;
                const yearGan = props.astrolabe.chineseDate?.split(' ')[0]?.charAt(0) || '';
                const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);
                // 阳男阴女顺行
                const isClockwise = (gender === '男' && isYangGan) || (gender === '女' && !isYangGan);
                console.log(`大限移动方向: ${isClockwise ? '顺时针 (->父母宫)' : '逆时针 (->兄弟宫)'}`);

                // 3. 计算当前大限命宫的索引
                // 顺时针（父母宫方向）是索引-1，逆时针（兄弟宫方向）是索引+1
                const directionStep = isClockwise ? -1 : 1;
                // selectedDecadeIndex 从0开始，所以第二个大限（索引1）移动1步，以此类推
                if (selectedDecadeIndex !== null) {
                  const decadalLifePalaceIndex = (natalLifePalaceIndex + (selectedDecadeIndex * directionStep) + 12) % 12;
                  console.log(`本命命宫索引: ${natalLifePalaceIndex}, 大限序号: ${selectedDecadeIndex}, 计算出的大限命宫索引: ${decadalLifePalaceIndex}`);
          
                  // 4. 以计算出的大限命宫为基准，为所有宫位命名
                  const standardPalaceOrder = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];
                  for (let i = 0; i < 12; i++) {
                    // 计算当前本命宫位(i)相对于新大限命宫的偏移量
                    const offset = (i - decadalLifePalaceIndex + 12) % 12;
                    // 根据偏移量从标准顺序中获取名称
                    const palaceName = standardPalaceOrder[offset];
                    adjustedPalaceNames[i] = palaceName.endsWith('宫') ? palaceName : `${palaceName}宫`;
                  }
                }
              }
              
              console.log('调整后的大限宫位名称数组:', adjustedPalaceNames);
              horoscopePalaceNamesByType.value.decadal = adjustedPalaceNames;
            } else {
              // 非大限运限的处理逻辑
              horoscopePalaceNamesByType.value[horoscopeItem.type] = horoscopeItem.data.palaceNames;
            }
          }
        }
        
        // 添加到当前运限数据
        currentHoroscope.value.push(horoscopeItem);
      } catch (error) {
        console.error(`处理第${index+1}个运限项时出错:`, error);
      }
    });
    
    // 调用调试函数
    setTimeout(() => {
      try {
        debugDecadalStarsCalculation();
      } catch (error) {
        console.error('调试函数执行出错:', error);
      }
    }, 1000);
  }
  
  console.log('===== 更新后的运限状态 =====');
  console.log('命宫索引:', horoscopeLifePalaceIndex.value);
  console.log('运限类型:', currentHoroscopeType.value);
  console.log('宫位名称:', horoscopePalaceNamesByType.value);
  console.log('三方四正索引:', horoscopeSurroundedPalaceIndices.value);
  console.log('所有命宫:', allHoroscopeLifePalace.value);
  console.log('当前运限数据长度:', currentHoroscope.value.length);
  
  // 打印大限宫位名称信息
  if (currentHoroscopeType.value === 'decadal') {
    console.log('大限宫位名称信息:');
    console.log('  宫位名称数组:', horoscopePalaceNamesByType.value.decadal);
    console.log('  命宫索引:', horoscopeLifePalaceIndex.value);
    
    const decadalLifePalaceIndex = horoscopeLifePalaceIndex.value;
    if (decadalLifePalaceIndex !== null && horoscopePalaceNamesByType.value.decadal.length > 0) {
      console.log('  命宫宫位名称:', horoscopePalaceNamesByType.value.decadal[decadalLifePalaceIndex]);
      
      // 获取命宫地支和天干
      const lifePalace = palaces[decadalLifePalaceIndex];
      if (lifePalace) {
        console.log('  命宫地支:', lifePalace.earthlyBranch);
        console.log('  命宫天干:', lifePalace.heavenlyStem);
      }
      
      // 打印palaceDisplayIndex数组
      console.log('  palaceDisplayIndex数组:', palaceDisplayIndex);
      
      // 查找命宫在palaceDisplayIndex中的位置
      const lifePalaceDisplayIndex = palaceDisplayIndex.findIndex(index => index === decadalLifePalaceIndex);
      if (lifePalaceDisplayIndex !== -1) {
        console.log('  命宫在palaceDisplayIndex中的位置:', lifePalaceDisplayIndex);
      }
    }
  }
  
  // 打印每个宫位的大限宫位名称
  for (let i = 0; i < palaceDisplayIndex.length; i++) {
    const palaceIndex = palaceDisplayIndex[i];
    const palace = palaces[palaceIndex];
    if (palace) {
      const decadalPalaceName = getDecadalPalaceName(palaceIndex, horoscopeLifePalaceIndex.value || 0);
      console.log(`  宫位${i+1}(索引=${palaceIndex})的大限宫位名称: ${decadalPalaceName}`);
    }
  }
  
  console.log('===============================');
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
  // 如果没有选择任何运限，则只显示本命四化
  if (!currentHoroscope.value || currentHoroscope.value.length === 0) {
    const mutagens = (props.astrolabe as any).mutagen;
    if (mutagens) {
      if (mutagens[0] === starName) return '禄';
      if (mutagens[1] === starName) return '权';
      if (mutagens[2] === starName) return '科';
      if (mutagens[3] === starName) return '忌';
    }
    return null;
  }
  
  // 如果选择了运限，则只显示运限四化
  try {
    for (const horoscopeItem of currentHoroscope.value) {
      if (horoscopeItem && horoscopeItem.data) {
        // 大限四化优先
        if (horoscopeItem.type === 'decadal') {
          let heavenlyStem = '';
          if (horoscopeItem.data.originalHeavenlyStem) {
            heavenlyStem = horoscopeItem.data.originalHeavenlyStem;
          } else if (horoscopeItem.data.heavenlyStem) {
            heavenlyStem = horoscopeItem.data.heavenlyStem;
          } else {
            continue; // 如果没有天干信息，则跳过
          }
          
          let mutagenStars: string[] = [];
          switch(heavenlyStem) {
            case '甲': mutagenStars = ['廉贞', '破军', '武曲', '太阳']; break;
            case '乙': mutagenStars = ['天机', '天梁', '紫微', '太阴']; break;
            case '丙': mutagenStars = ['天同', '天机', '文昌', '廉贞']; break;
            case '丁': mutagenStars = ['太阴', '天同', '天机', '巨门']; break;
            case '戊': mutagenStars = ['贪狼', '太阴', '右弼', '天机']; break;
            case '己': mutagenStars = ['武曲', '贪狼', '天梁', '文曲']; break;
            case '庚': mutagenStars = ['太阳', '武曲', '太阴', '天同']; break;
            case '辛': mutagenStars = ['巨门', '太阳', '文曲', '文昌']; break;
            case '壬': mutagenStars = ['天梁', '紫微', '左辅', '武曲']; break;
            case '癸': mutagenStars = ['破军', '巨门', '太阴', '贪狼']; break;
          }
          
          const mutagenTypes = ['禄', '权', '科', '忌'];
          const starIndex = mutagenStars.indexOf(starName);
          if (starIndex !== -1) {
            return mutagenTypes[starIndex]; // 找到大限四化，立即返回
          }
        }

        // 这里可以添加对流年、流月等其他运限四化的处理
        // ...
      }
    }
  } catch (error) {
    console.error('获取星曜四化类型出错:', error);
  }
  
  // 如果在所有运限中都没有找到该星的四化，则返回null
  return null;
}

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
    const uniqueIndices = [...new Set(indices)];
    horoscopeSurroundedPalaceIndices.value = uniqueIndices;
    
    console.log('运限三方四正索引计算结果:', uniqueIndices);
    
    // 打印每个索引对应的宫位信息，帮助调试
    console.log('运限三方四正宫位详情:');
    uniqueIndices.forEach(idx => {
      if (palaces[idx]) {
        console.log(`  索引${idx}: ${palaces[idx].name}宫 (${palaces[idx].heavenlyStem}${palaces[idx].earthlyBranch})`);
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

// 获取特定宫位的运限宫位名称
function getHoroscopePalaceName(palaceIndex: number, horoscopeType: string): string {
  try {
    if (!horoscopePalaceNamesByType.value[horoscopeType] || 
        horoscopePalaceNamesByType.value[horoscopeType].length === 0) {
      return '';
    }
    
    // 获取宫位在地支顺序中的索引
    const displayIndex = palaceDisplayIndex.indexOf(palaceIndex);
    if (displayIndex === -1) {
      return '';
    }
    
    // 根据运限类型和地支索引计算宫位索引
    let adjustedIndex;
    
    // 获取性别和年干信息，用于确定大限排列方向
    const gender = props.astrolabe.gender;
    const yearGan = props.astrolabe.chineseDate?.split(' ')[0]?.charAt(0) || '';
    
    // 判断年干阴阳
    const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);
    const isYinGan = ['乙', '丁', '己', '辛', '癸'].includes(yearGan);
    
    // 判断是否逆排
    // 阴男阳女顺排，阳男阴女逆排
    const isReverse = (gender === '男' && isYinGan) || (gender === '女' && isYangGan);
    
    console.log(`大限排列方向计算: 性别=${gender}, 年干=${yearGan}, 阳干=${isYangGan}, 阴干=${isYinGan}, 逆排=${isReverse}`);
    
    switch (horoscopeType) {
      case 'decadal':
        // 大限宫位顺序: 官禄,仆役,迁移,疾厄,财帛,子女,夫妻,兄弟,命宫,父母,福德,田宅
        // 命宫在索引8的位置，对应地支戌(8)
        if (isReverse) {
          // 逆排时，命宫索引不变，但其他宫位索引需要反向计算
          // 计算与命宫的相对位置
          const relativePos = (displayIndex - 8 + 12) % 12;
          // 逆向计算新的相对位置
          const newRelativePos = (12 - relativePos) % 12;
          // 从命宫位置开始计算最终索引
          adjustedIndex = (8 + newRelativePos) % 12;
        } else {
          // 顺排时，直接使用原来的计算方法
          adjustedIndex = (displayIndex + 8) % 12;
        }
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
        return '';
    }
    
    // 确保索引在有效范围内
    adjustedIndex = (adjustedIndex + 12) % 12;
    
    // 获取该索引对应的宫位名称
    const palaceName = horoscopePalaceNamesByType.value[horoscopeType][adjustedIndex];
    
    if (!palaceName) {
      return '';
    }
    
    // 添加前缀
    let prefix = '';
    switch (horoscopeType) {
      case 'decadal':
        prefix = '大限';
        break;
      case 'yearly':
        prefix = '流年';
        break;
      case 'monthly':
        prefix = '流月';
        break;
      case 'daily':
        prefix = '流日';
        break;
      case 'hourly':
        prefix = '流时';
        break;
    }
    
    return `${prefix}${palaceName}`;
  } catch (error) {
    console.error('获取运限宫位名称出错:', error);
    return '';
  }
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
      if (horoscopeItem && horoscopeItem.data) {
        const horoscopeType = horoscopeItem.type || '';

        // 新增：处理由大限天干决定的流曜（禄存、擎羊、陀罗、天魁、天钺）
        if (horoscopeType === 'decadal') {
          let heavenlyStem = '';
          if (horoscopeItem.data.originalHeavenlyStem) {
            heavenlyStem = horoscopeItem.data.originalHeavenlyStem;
          } else if (horoscopeItem.data.heavenlyStem) {
            heavenlyStem = horoscopeItem.data.heavenlyStem;
          }

          let decadalBranch = '';
          if (horoscopeItem.data.originalEarthlyBranch) {
            decadalBranch = horoscopeItem.data.originalEarthlyBranch;
          } else if (horoscopeItem.data.earthlyBranch) {
            decadalBranch = horoscopeItem.data.earthlyBranch;
          }

          const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

          // 基于天干的流曜
          if (heavenlyStem) {
            // 1. 运禄、运羊、运陀
            const luCunBranch = { '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳', '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子' }[heavenlyStem];
            if (luCunBranch) {
              const luCunIndex = branches.indexOf(luCunBranch);
              if (luCunIndex !== -1) {
                  const yangBranch = branches[(luCunIndex + 1) % 12];
                  const luoBranch = branches[(luCunIndex + 11) % 12];
                  if (palace.earthlyBranch === luCunBranch) result.push({ name: '运禄', horoscopeType });
                  if (palace.earthlyBranch === yangBranch) result.push({ name: '运羊', horoscopeType });
                  if (palace.earthlyBranch === luoBranch) result.push({ name: '运陀', horoscopeType });
              }
            }

            // 2. 运魁、运钺
            const kuiYueBranches = {
              '甲': { kui: '丑', yue: '未' }, '戊': { kui: '丑', yue: '未' }, '庚': { kui: '丑', yue: '未' },
              '乙': { kui: '子', yue: '申' }, '己': { kui: '子', yue: '申' },
              '丙': { kui: '亥', yue: '酉' }, '丁': { kui: '亥', yue: '酉' },
              '壬': { kui: '卯', yue: '巳' }, '癸': { kui: '卯', yue: '巳' },
              '辛': { kui: '午', yue: '寅' }
            }[heavenlyStem];
            if (kuiYueBranches) {
              if (palace.earthlyBranch === kuiYueBranches.kui) result.push({ name: '运魁', horoscopeType });
              if (palace.earthlyBranch === kuiYueBranches.yue) result.push({ name: '运钺', horoscopeType });
            }

            // 3. 运昌、运曲
            const changBranch = { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' }[heavenlyStem];
            const quBranch = { '甲': '酉', '乙': '申', '丙': '午', '丁': '巳', '戊': '午', '己': '巳', '庚': '寅', '辛': '卯', '壬': '子', '癸': '亥' }[heavenlyStem];
            if (palace.earthlyBranch === changBranch) result.push({ name: '运昌', horoscopeType });
            if (palace.earthlyBranch === quBranch) result.push({ name: '运曲', horoscopeType });
          }

          // 基于地支的流曜
          if (decadalBranch) {
              // 4. 运马
              const tianMaBranch = { '寅': '申', '午': '申', '戌': '申', '申': '寅', '子': '寅', '辰': '寅', '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳' }[decadalBranch];
              if (palace.earthlyBranch === tianMaBranch) result.push({ name: '运马', horoscopeType });

              // 5. 运鸾、运喜
              const decadalBranchIndex = branches.indexOf(decadalBranch);
              if (decadalBranchIndex !== -1) {
                  const hongLuanIndex = (3 - decadalBranchIndex + 12) % 12;
                  const tianXiIndex = (hongLuanIndex + 6) % 12;
                  if (palace.earthlyBranch === branches[hongLuanIndex]) result.push({ name: '运鸾', horoscopeType });
                  if (palace.earthlyBranch === branches[tianXiIndex]) result.push({ name: '运喜', horoscopeType });
              }
          }
        }
        
        // 原有逻辑：处理随宫而转的流曜（如博士十二神等）和其他运限流曜
        if (horoscopeItem.data.stars) {
          if (horoscopeType === 'decadal' && Array.isArray(horoscopeItem.data.stars)) {
            const gender = props.astrolabe.gender;
            const yearGan = props.astrolabe.chineseDate?.split(' ')[0]?.charAt(0) || '';
            const isYangGan = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);
            const isYinGan = ['乙', '丁', '己', '辛', '癸'].includes(yearGan);
            const isReverse = (gender === '男' && isYinGan) || (gender === '女' && isYangGan);
            const isClockwise = !isReverse;
            const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const earthBranchIndex = branches.indexOf(earthlyBranch);
            if (earthBranchIndex === -1) continue;
            const decadalLifePalaceIndex = horoscopeItem.lifePalaceIndex;
            if (decadalLifePalaceIndex === undefined) continue;
            let selectedDecadeEarthlyBranch = '';
            if (horoscopeItem.data.originalEarthlyBranch) {
              selectedDecadeEarthlyBranch = horoscopeItem.data.originalEarthlyBranch;
            } else if (horoscopeItem.data.earthlyBranch) {
              selectedDecadeEarthlyBranch = horoscopeItem.data.earthlyBranch;
            } else {
              continue;
            }
            const selectedDecadeEarthlyBranchIndex = branches.indexOf(selectedDecadeEarthlyBranch);
            if (selectedDecadeEarthlyBranchIndex === -1) continue;
            let targetIndex = 0;
            if (isClockwise) {
              targetIndex = (earthBranchIndex + 12 - selectedDecadeEarthlyBranchIndex) % 12;
            } else {
              targetIndex = (selectedDecadeEarthlyBranchIndex + 12 - earthBranchIndex) % 12;
            }
            const starsForBranch = horoscopeItem.data.stars[targetIndex];
            if (starsForBranch && Array.isArray(starsForBranch)) {
              for (const star of starsForBranch) {
                if (star && star.name) {
                  result.push({
                    name: star.name,
                    horoscopeType: horoscopeType
                  });
                }
              }
            }
          } else if (Array.isArray(horoscopeItem.data.stars)) {
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
    }
    
    return result;
  } catch (error) {
    console.error('获取运限流耀星时出错:', error);
    return [];
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.decadal-palace-name {
  display: inline-block;
  margin-left: 4px;
  font-size: 11px;
  color: #673AB7; /* 紫色，与大限边框颜色相同 */
  background-color: rgba(103, 58, 183, 0.1); /* 淡紫色背景 */
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px dashed #673AB7;
  font-weight: bold;
  vertical-align: middle;
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

/* 控制按钮样式 */
.control-buttons {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.toggle-button {
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #673AB7;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toggle-button:hover {
  background-color: #512DA8;
}
</style>