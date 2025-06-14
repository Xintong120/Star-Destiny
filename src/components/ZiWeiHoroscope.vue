<template>
  <div class="horoscope-container">
    <!-- 大限计算方法选择器 -->
    <div class="method-selector">
      <h3>大限计算方法</h3>
      <el-radio-group v-model="decadalMethod" @change="onMethodChange">
        <el-radio :label="1">方法一: 出生年+起运年龄-2</el-radio>
        <el-radio :label="2">方法二: 出生年+起运年龄-1</el-radio>
        <el-radio :label="3">方法三: 出生年+起运年龄</el-radio>
      </el-radio-group>
    </div>

    <!-- 大限选择区域 -->
    <div class="decade-selector">
      <h3>大限选择</h3>
      <div class="decade-list">
        <div
          v-for="(decade, index) in props.astrolabe.decadal()"
          :key="`decade-${index}`"
          class="decade-item"
          :class="{ 'selected': horoscopeStore.selectedDecadeIndex === index }"
          @click="selectDecade(index)"
        >
          {{ decade.range[0] }}-{{ decade.range[1] }}岁 {{ decade.heavenlyStem }}{{ decade.earthlyBranch }}运
        </div>
      </div>
    </div>

    <!-- 流年选择区域 -->
    <div v-if="horoscopeStore.selectedDecadeIndex !== null" class="year-selector">
      <h3>流年选择</h3>
      <div class="year-list">
        <div
          v-for="(year, index) in yearsList"
          :key="`year-${index}`"
          class="year-item"
          :class="{ 'selected': horoscopeStore.selectedYearIndex === index }"
          @click="selectYear(year, index)"
        >
          {{ year }}年
        </div>
      </div>
    </div>

    <!-- 流月天干地支显示区域 -->
    <div v-if="horoscopeStore.selectedYearIndex !== null" class="month-info">
      <h3>流月选择 ({{ selectedYearData.year }}年)</h3>
      
      <!-- 当没有流月数据时显示加载提示 -->
      <div v-if="!monthlyGanZhiList.length" class="loading-months">
        <p>正在计算月干支数据...</p>
      </div>

      <div v-else class="month-grid">
        <div 
          v-for="month in monthlyGanZhiList" 
          :key="`month-${month.index}`" 
          class="month-cell"
          :class="{ 'selected': horoscopeStore.selectedMonthIndex === month.index }"
          @click="selectMonth(month.index)"
        >
          <div class="month-title">{{ month.name }}</div>
          <div class="month-value">
            {{ month.heavenlyStem && month.earthlyBranch ? month.heavenlyStem + month.earthlyBranch : '--' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录区域 -->
    <div v-if="horoscopeStore.horoscopeHistory.length > 0" class="history-container">
      <div
        v-for="(item, index) in horoscopeStore.horoscopeHistory"
        :key="`history-${index}`"
        class="history-item"
      >
        {{ item.comment }}
      </div>
    </div>

    <!-- 命盘网格 -->
    <div class="grid-container" :class="{ 'focused': focusedPalaceName }">
      <div
        v-for="(palace, index) in palaces"
        :key="palace.name"
        :class="['palace', `palace-${index}`]"
        :style="{ gridArea: `palace-${index}` }"
        @mouseover="focusOnPalace(palace.name)"
        @mouseleave="focusOnPalace('')"
      >
        <div class="palace-name" :class="{ 'horoscope-life-palace': horoscopeLifePalaceIndex === index }">
          <div class="heavenly-stem-earthly-branch">
            {{ palace.heavenlyStem }}{{ palace.earthlyBranch }}
          </div>
          {{ getHoroscopeNames(index) }}
        </div>
        <div class="stars-grid">
          <div class="stars-container major-stars">
            <span
              v-for="star in palace.majorStars"
              :key="star.name"
              class="star-name"
              :class="[star.type, star.brightness, star.mutagen]"
              @click.stop="handleStarClick(star)"
            >
              {{ star.name }}
              <span v-if="star.brightness" class="brightness">{{ star.brightness }}</span>
              <span
                v-if="getStarMutagenType(star)"
                class="sihua-badge"
                :class="[getStarMutagenType(star).mutagen, getStarMutagenType(star).horoscopeType]"
              >
                {{ getStarMutagenType(star).mutagen }}
              </span>
            </span>
          </div>
          <div class="stars-container minor-stars">
            <span
              v-for="star in palace.minorStars"
              :key="star.name"
              class="star-name"
              :class="[star.type, star.brightness, star.mutagen]"
              @click.stop="handleStarClick(star)"
            >
              {{ star.name }}
              <span
                v-if="getStarMutagenType(star)"
                class="sihua-badge"
                :class="[getStarMutagenType(star).mutagen, getStarMutagenType(star).horoscopeType]"
              >
                {{ getStarMutagenType(star).mutagen }}
              </span>
            </span>
          </div>
          <div class="stars-container adjective-stars">
            <span
              v-for="star in palace.adjectiveStars"
              :key="star.name"
              class="star-name"
              :class="[star.type]"
              @click.stop="handleStarClick(star)"
            >
              {{ star.name }}
            </span>
          </div>
        </div>
        <div class="bottom-info">
          <div class="horoscope-stars-left">
            <span
              v-for="star in getHoroscopeStars(index, 'decadal')"
              :key="star.name"
              class="star-name decadal"
              @click.stop="handleStarClick(star)"
            >
              {{ star.name }}
            </span>
          </div>
          <div class="horoscope-stars-right">
            <span
              v-for="star in getHoroscopeStars(index, 'yearly')"
              :key="star.name"
              class="star-name yearly"
              @click.stop="handleStarClick(star)"
            >
              {{ star.name }}
            </span>
          </div>
          <div class="age-info">{{ palace.ages[0] }} - {{ palace.ages[1] }}</div>
          <div class="decadal-info">{{ palace.decadal.range[0] }}-{{ palace.decadal.range[1] }}</div>
        </div>
      </div>
      <div class="center-info">
        <div class="info-row">
          <span class="label">姓名：</span>
          <span class="value">{{ props.astrolabe.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">性别：</span>
          <span class="value">{{ props.astrolabe.gender }}</span>
        </div>
        <div class="info-row">
          <span class="label">阳历：</span>
          <span class="value">{{ props.astrolabe.solarDate }}</span>
        </div>
        <div class="info-row">
          <span class="label">农历：</span>
          <span class="value">{{ props.astrolabe.lunarDate }}</span>
        </div>
        <div class="info-row">
          <span class="label">五行局：</span>
          <span class="value">{{ props.astrolabe.fiveElementsClass }}</span>
        </div>
        <div class="info-row">
          <span class="label">命主：</span>
          <span class="value">{{ props.astrolabe.soulMaster }}</span>
        </div>
        <div classs="info-row">
          <span class="label">身主：</span>
          <span class="value">{{ props.astrolabe.bodyMaster }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed, watch } from 'vue';
import { useHoroscopeStore } from '../stores/horoscopeStore';
import { ElMessage } from 'element-plus';
import { HoroscopeAdapter } from '../services/HoroscopeAdapter';
import HoroscopeCalculator from '../astro/HoroscopeCalculator';
import { MonthlyGanZhiService } from '../services/MonthlyGanZhiService';
import { calculateMonthlyGanZhi } from '../utils/monthGanZhiCalculator';

// 添加这行代码，确认导入是否正确
console.log('MonthlyGanZhiService导入检查:', !!MonthlyGanZhiService);
console.log('月干支计算工具导入检查:', !!calculateMonthlyGanZhi);

const props = defineProps({
  astrolabe: {
    type: Object,
    required: true
  }
});

// 定义事件
const emit = defineEmits(['updateHoroscope']);

const horoscopeStore = useHoroscopeStore();
const decadalMethod = ref(HoroscopeAdapter.getDecadalYearMethod());

// 年份列表
const yearsList = ref([]);

// 选中年份的数据
const selectedYearData = reactive({
  year: null,
  index: null
});

// 流月干支数据
const monthlyGanZhiList = ref([]);

// 天干地支数组
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 切换大限计算方法
const onMethodChange = (value) => {
  HoroscopeAdapter.setDecadalYearMethod(value);
  ElMessage({
    message: `已切换到大限计算方法${value}`,
    type: 'success',
    duration: 2000
  });
  
  // 如果已经选择了大限，则重新计算
  if (horoscopeStore.selectedDecadeIndex !== null) {
    const allDecades = props.astrolabe.decadal();
    horoscopeStore.selectDecade(
      horoscopeStore.selectedDecadeIndex,
      props.astrolabe,
      allDecades
    );
    updateYearsList();
  }
};

// 更新年份列表
const updateYearsList = () => {
  if (horoscopeStore.selectedDecadeIndex === null) {
    yearsList.value = [];
    return;
  }
  
  // 如果horoscopeHistory中有大限信息且包含startYear，则使用它
  if (horoscopeStore.horoscopeHistory.length > 0 && 
      horoscopeStore.horoscopeHistory[0].data && 
      horoscopeStore.horoscopeHistory[0].data.startYear) {
    const startYear = horoscopeStore.horoscopeHistory[0].data.startYear;
    
    // 创建10年的年份数组
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(startYear + i);
    }
    
    yearsList.value = years;
    return;
  }
  
  // 如果没有历史记录，则使用传统计算方式
  const allDecades = props.astrolabe.decadal();
  const selectedDecade = allDecades[horoscopeStore.selectedDecadeIndex];
  
  // 解析出生年份
  const birthYear = parseInt(props.astrolabe.solarDate.split('-')[0]);
  // 使用大限的起始年龄
  const startAge = selectedDecade.range[0];
  
  // 根据当前选择的计算方法计算大限起始年份
  let startYear;
  switch(HoroscopeAdapter.getDecadalYearMethod()) {
    case 2:
      startYear = birthYear + startAge - 1;
      break;
    case 3:
      startYear = birthYear + startAge;
      break;
    case 1:
    default:
      startYear = birthYear + startAge - 2;
      break;
  }
  
  console.log(`流年计算: 出生年=${birthYear}, 起始年龄=${startAge}, 起始年份=${startYear}`);
  
  // 创建10年的年份数组
  const years = [];
  for (let i = 0; i < 10; i++) {
    years.push(startYear + i);
  }
  
  yearsList.value = years;
};

// 选择大限
const selectDecade = (index) => {
  const allDecades = props.astrolabe.decadal();
  horoscopeStore.selectDecade(index, props.astrolabe, allDecades);
  updateYearsList();
  
  // 清除流月数据
  monthlyGanZhiList.value = [];
  selectedYearData.year = null;
  selectedYearData.index = null;
  
  // 发送事件通知父组件更新运限信息
  emit('updateHoroscope', horoscopeStore.horoscopeHistory);
};

// 调试函数：打印流月数据
const debugMonthlyData = () => {
  console.log('=== 流月数据调试信息 ===');
  console.log('流月数据数组长度:', monthlyGanZhiList.value.length);
  
  if (monthlyGanZhiList.value && monthlyGanZhiList.value.length > 0) {
    console.log('流月数据详情:');
    monthlyGanZhiList.value.forEach((month, index) => {
      console.log(`${index+1}. ${month.name}: 天干=${month.heavenlyStem || '无'}, 地支=${month.earthlyBranch || '无'}`);
    });
  } else {
    console.log('流月数据为空');
  }
  
  if (horoscopeStore.selectedHoroscopeInfo && horoscopeStore.selectedHoroscopeInfo.monthly) {
    console.log('horoscopeStore中的流月数据:');
    const monthlyData = horoscopeStore.selectedHoroscopeInfo.monthly;
    
    if (typeof monthlyData === 'object' && !Array.isArray(monthlyData)) {
      Object.keys(monthlyData).forEach(key => {
        const value = monthlyData[key];
        console.log(`${key}月: 天干=${value.heavenlyStem || '无'}, 地支=${value.earthlyBranch || '无'}`);
      });
    } else {
      console.log('horoscopeStore中的流月数据格式不正确:', monthlyData);
    }
  } else {
    console.log('horoscopeStore中没有流月数据');
  }
  
  console.log('=== 流月数据调试信息结束 ===');
};

// 选择流年
const selectYear = (year, index) => {
  console.log('选择流年: 索引=' + index + ', 年份=' + year);
  
  // 更新选中年份数据
  selectedYearData.year = year;
  selectedYearData.index = index;
  
  // 更新store状态
  horoscopeStore.selectYear(year, index, props.astrolabe);
  
  // 获取流年运限信息
  const yearInfo = horoscopeStore.selectedHoroscopeInfo;
  if (yearInfo && yearInfo.monthly) {
    console.log('获取到流月信息:', yearInfo.monthly);
    
    // 检查流月数据结构
    if (typeof yearInfo.monthly === 'object' && !Array.isArray(yearInfo.monthly)) {
      console.log('流月数据是对象类型，尝试转换为数组');
      
      // 将对象转换为数组
      const monthsArray = [];
      const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
      
      for (let i = 0; i < 12; i++) {
        // 使用内置方法计算天干地支
        const yearIndex = (year - 1864) % 60;
        const yearGanIndex = yearIndex % 10;
        const monthGanIndex = (yearGanIndex * 2 + i + 1) % 10;
        const monthZhiIndex = (i + 2) % 12;
        
        const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        
        const gan = TIAN_GAN[monthGanIndex >= 0 ? monthGanIndex % 10 : (monthGanIndex + 10) % 10];
        const zhi = DI_ZHI[monthZhiIndex >= 0 ? monthZhiIndex % 12 : (monthZhiIndex + 12) % 12];
        
        monthsArray.push({
          index: i,
          name: monthNames[i],
          heavenlyStem: gan,
          earthlyBranch: zhi,
          palaceNames: [],
          mutagen: {},
          stars: {}
        });
        
        console.log(`计算${year}年${monthNames[i]}: ${gan}${zhi}`);
      }
      
      // 设置流月数据数组
      monthlyGanZhiList.value = monthsArray;
      
      console.log('成功转换流月数据为数组，长度:', monthlyGanZhiList.value.length);
    } else if (Array.isArray(yearInfo.monthly)) {
      console.log('流月数据已经是数组类型');
      monthlyGanZhiList.value = yearInfo.monthly;
    } else {
      console.error('无法识别的流月数据类型');
      // 使用备用方法
      generateMonthlyGanZhi(year);
    }
  } else {
    console.log('未获取到流月信息，使用备用方法');
    // 使用备用方法
    generateMonthlyGanZhi(year);
  }
  
  // 发送事件通知父组件更新运限信息
  emit('updateHoroscope', horoscopeStore.horoscopeHistory);
};

// 计算流月干支的独立函数
const generateMonthlyGanZhi = (year) => {
  // 避免无效的年份
  if (!year) {
    console.log('年份无效，跳过计算');
    monthlyGanZhiList.value = [];
    return;
  }
  
  console.log('=== 开始计算流月干支(备用方法) ===');
  console.log('年份:', year);
  
  try {
    // 直接使用内置方法计算流月干支
    const monthsArray = [];
    const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    for (let i = 0; i < 12; i++) {
      // 使用内置方法计算天干地支
      const yearIndex = (year - 1864) % 60;
      const yearGanIndex = yearIndex % 10;
      const monthGanIndex = (yearGanIndex * 2 + i + 1) % 10;
      const monthZhiIndex = (i + 2) % 12;
      
      const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      const gan = TIAN_GAN[monthGanIndex >= 0 ? monthGanIndex % 10 : (monthGanIndex + 10) % 10];
      const zhi = DI_ZHI[monthZhiIndex >= 0 ? monthZhiIndex % 12 : (monthZhiIndex + 12) % 12];
      
      monthsArray.push({
        index: i,
        name: monthNames[i],
        heavenlyStem: gan,
        earthlyBranch: zhi,
        palaceNames: [],
        mutagen: {},
        stars: {}
      });
      
      console.log(`计算${year}年${monthNames[i]}: ${gan}${zhi}`);
    }
    
    // 设置流月数据数组
    monthlyGanZhiList.value = monthsArray;
    
    console.log('成功计算流月干支，长度:', monthlyGanZhiList.value.length);
  } catch (error) {
    console.error('计算流月干支出错:', error);
    monthlyGanZhiList.value = [];
  }
};

// 选择流月
const selectMonth = (monthIndex) => {
  if (selectedYearData.year === null) {
    ElMessage.warning('请先选择流年');
    return;
  }
  
  console.log('=== 选择流月 ===');
  console.log('月份索引:', monthIndex);
  console.log('流月数据数组长度:', monthlyGanZhiList.value.length);
  
  // 获取选中月份的详细信息
  const selectedMonth = monthlyGanZhiList.value.find(month => month.index === monthIndex);
  
  if (selectedMonth) {
    console.log('找到选中的月份:', selectedMonth);
    console.log('选择流月:', selectedMonth.name);
    console.log('流月天干地支:', `${selectedMonth.heavenlyStem || '无'}${selectedMonth.earthlyBranch || '无'}`);
    console.log('流月天干:', selectedMonth.heavenlyStem || '无');
    console.log('流月地支:', selectedMonth.earthlyBranch || '无');
    
    // 检查并显示宫位和星曜信息
    if (selectedMonth.palaceNames && selectedMonth.palaceNames.length > 0) {
      console.log('流月宫位名称:', selectedMonth.palaceNames.join(', '));
    } else {
      console.log('流月没有宫位信息');
    }
    
    if (selectedMonth.mutagen && Object.keys(selectedMonth.mutagen).length > 0) {
      console.log('流月变异信息:', selectedMonth.mutagen);
    } else {
      console.log('流月没有变异信息');
    }
    
    if (selectedMonth.stars && Object.keys(selectedMonth.stars).length > 0) {
      console.log('流月星曜信息:', selectedMonth.stars);
    } else {
      console.log('流月没有星曜信息');
    }
  } else {
    console.error('未找到索引为', monthIndex, '的月份信息');
    console.log('所有月份索引:', monthlyGanZhiList.value.map(m => m.index));
    return;
  }
  
  // 更新store中的流月选择状态
  horoscopeStore.selectMonth(selectedYearData.year, monthIndex, props.astrolabe);
  
  // 发送事件通知父组件更新运限信息
  emit('updateHoroscope', horoscopeStore.horoscopeHistory);
};

// 监听年份变化，更新流月数据
watch(() => selectedYearData.year, (newYear) => {
  if (newYear) {
    console.log('监听到年份变化，重新计算流月干支:', newYear);
    generateMonthlyGanZhi(newYear);
  } else {
    // 如果年份为空，清空月干支数据
    monthlyGanZhiList.value = [];
  }
});

// 监听大限选择变化
watch(() => horoscopeStore.selectedDecadeIndex, (newVal) => {
  if (newVal !== null) {
    updateYearsList();
  } else {
    yearsList.value = [];
    selectedYearData.year = null;
    selectedYearData.index = null;
    monthlyGanZhiList.value = [];
  }
});

// 组件挂载时
onMounted(() => {
  console.log('=== 流月天干地支组件挂载 ===');
  
  // 如果命盘ID与上次查看的命盘ID相同，则恢复之前的选择状态
  if (props.astrolabe.solarDate === horoscopeStore.lastViewedAstrolabeId) {
    console.log('恢复上次查看的状态');
    
    // 恢复大限选择
    if (horoscopeStore.selectedDecadeIndex !== null) {
      // 重新加载大限数据
      const allDecades = props.astrolabe.decadal();
      horoscopeStore.selectDecade(
        horoscopeStore.selectedDecadeIndex,
        props.astrolabe,
        allDecades
      );
      
      updateYearsList();
      
      // 恢复流年选择
      if (horoscopeStore.selectedYearIndex !== null && horoscopeStore.selectedYear !== null) {
        // 更新选中年份数据
        selectedYearData.year = horoscopeStore.selectedYear;
        selectedYearData.index = horoscopeStore.selectedYearIndex;
        
        console.log('恢复流年选择:', horoscopeStore.selectedYear);
        
        // 计算流月干支
        console.log('开始计算流月干支');
        try {
          const allMonthsData = HoroscopeAdapter.calculateAllMonthsForYear(props.astrolabe, horoscopeStore.selectedYear);
          monthlyGanZhiList.value = allMonthsData;
          
          console.log('恢复流月数据成功，长度:', monthlyGanZhiList.value.length);
          if (monthlyGanZhiList.value.length > 0) {
            console.log('第一个月天干地支:', `${monthlyGanZhiList.value[0].heavenlyStem || '无'}${monthlyGanZhiList.value[0].earthlyBranch || '无'}`);
          }
        } catch (error) {
          console.error('恢复流月数据失败:', error);
          generateMonthlyGanZhi(horoscopeStore.selectedYear);
        }
        
        // 恢复流年选择状态
        horoscopeStore.selectYear(
          horoscopeStore.selectedYear,
          horoscopeStore.selectedYearIndex,
          props.astrolabe
        );
        
        // 恢复流月选择
        if (horoscopeStore.selectedMonthIndex !== null) {
          console.log('恢复流月选择:', horoscopeStore.selectedMonthIndex);
          horoscopeStore.selectMonth(
            horoscopeStore.selectedYear,
            horoscopeStore.selectedMonthIndex,
            props.astrolabe
          );
        }
      }
      
      // 显示状态恢复成功提示
      ElMessage({
        message: '已恢复上次查看的运限状态',
        type: 'success',
        duration: 2000
      });
    } else {
      // 不同的命盘，清除之前的选择状态
      horoscopeStore.clearSelection();
    }
  }
  
  console.log('=== 流月天干地支组件挂载完成 ===');
});

// 点击星耀，显示详细信息
const handleStarClick = (star) => {
  showStarNotification(star);
};

// 获取星耀的四化类型
const getStarMutagenType = (star) => {
  // 优先判断运限四化
  const currentHoroscope = horoscopeStore.horoscopeHistory[horoscopeStore.horoscopeHistory.length - 1];

  if (currentHoroscope) {
    const mutagenStar = currentHoroscope.data?.mutagen?.find(m => m.name === star.name);
    if (mutagenStar) {
      return { mutagen: mutagenStar.mutagen, horoscopeType: currentHoroscope.type };
    }
  }

  // 如果没有运限四化，再判断生年四化
  if (star.mutagen) {
    return { mutagen: star.mutagen, horoscopeType: 'native' };
  }

  return null;
};
</script>

<style>
.horoscope-container {
  padding: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
}

.method-selector,
.decade-selector,
.year-selector,
.month-selector,
.month-info {
  margin-bottom: 1.25rem;
}

.decade-list,
.year-list,
.month-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.decade-item,
.year-item,
.month-item {
  padding: 0.5rem 1rem;
  border: 1px solid #dcdfe6;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s;
}

.decade-item:hover,
.year-item:hover,
.month-item:hover {
  background-color: #f5f7fa;
}

.decade-item.selected,
.year-item.selected,
.month-item.selected {
  background-color: #409eff;
  color: white;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  margin-top: 0.625rem;
}

.month-cell {
  border: 1px solid #dcdfe6;
  border-radius: 0.5rem;
  padding: 0.75rem;
  text-align: center;
  transition: all 0.3s;
  background-color: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.month-cell:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  background-color: #f1f5ff;
}

.month-cell.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.month-title {
  font-weight: bold;
  margin-bottom: 0.3125rem;
  color: #409eff;
  font-size: 0.875rem;
  border-bottom: 1px dashed #e0e0e0;
  padding-bottom: 0.25rem;
}

.month-cell.selected .month-title {
  color: #409eff;
  font-weight: bold;
}

.month-value {
  color: #303133;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.25rem 0;
}

.month-cell.selected .month-value {
  color: #409eff;
  font-weight: bold;
}

.month-palaces {
  margin-top: 0.3125rem;
  padding: 0.25rem;
  background-color: #f8f8f8;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.palace-title {
  font-weight: bold;
  margin-bottom: 2px;
  color: #409eff;
  font-size: 0.75rem;
}

.palace-value {
  color: #303133;
  font-size: 0.75rem;
}

.month-stars {
  margin-top: 0.3125rem;
  padding: 0.25rem;
  background-color: #f8f8f8;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.debug-month-info {
  margin-top: 3px;
  padding: 2px;
  background-color: #f0f7ff;
  border-radius: 3px;
  font-size: 0.625rem;
  color: #666;
  display: flex;
  justify-content: space-between;
}

.debug-month-info small {
  margin: 0 2px;
}

.star-title {
  font-weight: bold;
  margin-bottom: 2px;
  color: #409eff;
  font-size: 0.75rem;
}

.star-value {
  color: #303133;
  font-size: 0.75rem;
}

.month-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-top: 0.625rem;
}

.month-item {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dcdfe6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f9f9f9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.month-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.month-item.selected {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.debug-info {
  margin-bottom: 0.9375rem;
  padding: 0.625rem;
  background-color: #f8f8f8;
  border: 1px dashed #ccc;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #666;
}

.debug-info p {
  margin: 0.3125rem 0;
}

.history-container {
  margin-top: 1.25rem;
  padding: 0.625rem;
  border: 1px solid #ebeef5;
  border-radius: 0.25rem;
  background-color: #f5f7fa;
}

.history-item {
  padding: 0.3125rem 0;
  border-bottom: 1px dashed #ebeef5;
}

.history-item:last-child {
  border-bottom: none;
}

.loading-months {
  padding: 1.25rem;
  text-align: center;
  color: #909399;
  background-color: #f8f8f8;
  border-radius: 0.25rem;
  margin: 0.625rem 0;
}

.debug-month-grid-info {
  margin-bottom: 0.9375rem;
  padding: 0.625rem;
  background-color: #f0f7ff;
  border: 1px dashed #409eff;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #666;
  width: 100%;
}

.debug-month-grid-info p {
  margin: 0.3125rem 0;
}

@media (max-width: 768px) {
  .month-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .month-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 