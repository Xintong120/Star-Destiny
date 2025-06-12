<template>
  <div
    class="palace"
    :class="palaceClasses"
    @click="$emit('palace-click')"
  >
    <!-- 宫位序号 -->
    <div class="palace-index">{{ displayIndex }}</div>

    <!-- 本命与大限宫位名称 -->
    <div class="palace-name">
      <!-- 1. 流年宫位名称 (如果存在) -->
      <div v-if="yearlyPalaceName" class="yearly-palace-name-display">
        流年{{ yearlyPalaceName }}
      </div>

      <!-- 2. 大限宫位名称 (如果存在) -->
      <div v-if="decadalPalaceName" class="decadal-palace-name-display">
        大限{{ decadalPalaceName }}
      </div>

      <!-- 3. 本命宫位名称 -->
      <div class="native-palace-name">
        {{ palaceData?.name ?? '' }}
      </div>
      
      <!-- 4. 其他运限宫位名称 (例如流月) -->
      <span
        v-for="horoscope in otherHoroscopeNames"
        :key="horoscope.type"
        class="horoscope-palace-name"
        :class="horoscope.type"
      >
        {{ horoscope.name }}
      </span>
    </div>

    <!-- 身宫标识 -->
    <div v-if="palaceData?.isBodyPalace" class="body-palace-indicator">
      身宫
    </div>

    <!-- 天干地支 -->
    <div class="palace-hb">
      <span v-if="palaceData">
        {{ palaceData.heavenlyStem }}{{ palaceData.earthlyBranch }}
      </span>
    </div>

    <!-- 星曜列表 -->
    <div class="star-container" v-if="palaceData && (palaceData.majorStars.length || palaceData.minorStars.length || palaceData.adjectiveStars.length)">
      <div class="main-minor-stars">
        <div v-for="star in palaceData.majorStars" :key="star.name" class="star-item major-star">
          <span class="star-name">{{ star.name }}</span>
          <span class="star-state">{{ star.brightness }}</span>
          <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
          <span class="sihua-badge" v-if="getStarMutagenType(star.name)" :data-type="getStarMutagenType(star.name)">
            {{ getStarMutagenType(star.name) }}
          </span>
        </div>
        <div v-for="star in palaceData.minorStars" :key="star.name" class="star-item minor-star">
          <span class="star-name">{{ star.name }}</span>
          <span class="star-state">{{ star.brightness }}</span>
          <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
          <span class="sihua-badge" v-if="getStarMutagenType(star.name)" :data-type="getStarMutagenType(star.name)">
            {{ getStarMutagenType(star.name) }}
          </span>
        </div>
      </div>
      <div class="adjective-stars-container" :class="{ 'two-rows': palaceData.adjectiveStars.length > 5 }">
        <div v-for="star in palaceData.adjectiveStars" :key="star.name" class="star-item adjective-star">
          <span class="star-name">{{ star.name }}</span>
          <span class="star-state">{{ star.brightness }}</span>
          <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
          <span class="sihua-badge" v-if="getStarMutagenType(star.name)" :data-type="getStarMutagenType(star.name)">
            {{ getStarMutagenType(star.name) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 神煞 -->
    <div class="decorative-stars-container" v-if="palaceData">
      <div v-if="palaceData.changsheng12" class="decorative-star changsheng" :data-length="palaceData.changsheng12.length">
        {{ palaceData.changsheng12 }}
      </div>
      <div v-if="palaceData.boshi12" class="decorative-star boshi">
        {{ palaceData.boshi12 }}
      </div>
    </div>

    <!-- 流年神煞 -->
    <div class="yearly-decorative-stars-container" v-if="yearlyDecorativeStars && (yearlyDecorativeStars.jiangqian || yearlyDecorativeStars.suiqian)">
      <div v-if="yearlyDecorativeStars.suiqian" class="decorative-star suiqian">
        {{ yearlyDecorativeStars.suiqian }}
      </div>
      <div v-if="yearlyDecorativeStars.jiangqian" class="decorative-star jiangqian">
        {{ yearlyDecorativeStars.jiangqian }}
      </div>
    </div>

    <!-- 运限星曜 -->
    <div class="top-right-stars-wrapper">
      <!-- 流年流曜 -->
      <div class="yearly-horoscope-stars-container" v-if="yearlyHoroscopeStars.length > 0">
        <div v-for="star in yearlyHoroscopeStars" :key="star.name + '-yearly'"
             class="horoscope-star yearly">
          {{ star.name }}
        </div>
      </div>
      <!-- 大限流曜 -->
      <div class="decadal-horoscope-stars-container" v-if="decadalHoroscopeStars.length > 0">
        <div v-for="star in decadalHoroscopeStars" :key="star.name + '-decadal'"
             class="horoscope-star decadal">
          {{ star.name }}
        </div>
      </div>
    </div>

    <!-- 其他运限星曜 (流月/日/时) -->
    <div class="horoscope-stars-container" v-if="otherHoroscopeStars.length > 0">
      <div v-for="star in otherHoroscopeStars" :key="star.name + '-' + (star.horoscopeType || '')"
           class="horoscope-star" :class="star.horoscopeType">
        {{ star.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { IFunctionalAstrolabe } from '../src/astro/FunctionalAstrolabe';

// 从 IFunctionalAstrolabe 推断出单个宫位的确切类型
type PalaceData = IFunctionalAstrolabe['palaces'][number];

const props = defineProps<{
  palaceData?: PalaceData;
  displayIndex: number;
  horoscopeNames?: Array<{ name: string, type: string }>;
  palaceClasses: Record<string, boolean>;
  horoscopeStars: Array<{name: string, type?: string, horoscopeType?: string}>;
  yearlyDecorativeStars?: { jiangqian?: string; suiqian?: string };
  getStarMutagenType: (starName: string) => string | null;
}>();

defineEmits(['palace-click']);

const yearlyPalaceName = computed(() => {
  return props.horoscopeNames?.find(h => h.type === 'yearly')?.name;
});

const decadalPalaceName = computed(() => {
  return props.horoscopeNames?.find(h => h.type === 'decadal')?.name;
});

const otherHoroscopeNames = computed(() => {
  return props.horoscopeNames?.filter(h => h.type !== 'decadal' && h.type !== 'yearly') ?? [];
});

const yearlyHoroscopeStars = computed(() => {
  return props.horoscopeStars.filter(s => s.horoscopeType === 'yearly');
});

const decadalHoroscopeStars = computed(() => {
  return props.horoscopeStars.filter(s => s.horoscopeType === 'decadal');
});

const otherHoroscopeStars = computed(() => {
  return props.horoscopeStars.filter(s => s.horoscopeType !== 'decadal' && s.horoscopeType !== 'yearly');
});
</script>

<style scoped>
/* 宫位基础样式 */
.palace {
  border: 1px solid #ccc;
  background: #FFFFFB;
  opacity: 0.9;
  font-size: 12px;
  padding: 2px;
  min-height: 80px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 选中宫位的激活样式 */
.palace.active {
  background: #D5D5D5;
  color: white;
  border: thick double #72AEC5;
  z-index: 2;
}

/* 对宫高亮样式 */
.palace.opposite {
  background-color:#F8F19A;
  border: thick double #72AEC5;
}

/* 三方四正宫位高亮样式 */
.palace.surrounded {
  background-color: #FCF9D4;
  border: thick double #72AEC5;
}

/* 身宫标识样式 */
.body-palace-indicator {
  position: absolute;
  top: 130px;
  right: 4px;
  font-size: 12px;
  color: red;
  font-weight: bold;
  background-color: white;
  border: 1px solid red;
  padding: 1px 4px;
  border-radius: 4px;
}

/* 长生十二神样式 */
.decorative-star.changsheng {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #9C27B0;
  background-color: #F3E5F5;
  padding: 1px 1px;
  border-radius: 3px;
  border: 1px solid #CE93D8;
  position: absolute;
  bottom: 45px;
  right: 5px;
  min-width: 10px;
  text-align: center;
  line-height: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decorative-star.changsheng:not([data-length="2"]) {
  padding: 1px 4px;
  min-width: 12px;
}

.decorative-star.changsheng[data-length="2"] {
  padding: 1px 1px;
  min-width: 20px;
}

/* 博士十二神样式 */
.decorative-star.boshi {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #FF5722;
  background-color: #FBE9E7;
  padding: 1px 3px;
  border-radius: 3px;
  border: 1px solid #FFAB91;
  margin-top: 2px;
  top: 190px;
  right: 180px;
}

/* 宫位左上角序号样式 */
.palace-index {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 10px;
  color: red;
  font-weight: bold;
}

/* 宫位名称容器 (本命, 大限, 流年等) */
.palace-name {
  position: absolute;
  bottom: 4px;
  right: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

/* 流年宫位名称样式 */
.yearly-palace-name-display {
  color: blue;
  font-size: 16px;
}

/* 大限宫位名称样式 */
.decadal-palace-name-display {
  color: green;
  font-size: 16px;
}

/* 本命宫位名称样式 */
.native-palace-name {
  font-size: 18px;
  color: red;
}

/* 其他运限宫位名称 (如流年) 的通用样式 */
.horoscope-palace-name {
  display: inline-block;
  margin-left: 4px;
  font-size: 11px;
  padding: 1px 3px;
  border-radius: 3px;
  border-style: dashed;
  border-width: 1px;
  font-weight: bold;
  vertical-align: middle;
}

/* 宫位天干地支样式 */
.palace-hb {
  font-size: 18px;
  color: black;
  margin-bottom: 2px;
  position: absolute;
  bottom: 4px;
  right: 4px;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

/* 星曜容器 */
.star-container {
  position: absolute;
  top: 15px;
  left: 5px;
  right: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 主星和辅星容器 */
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
  max-width: 60%;
  justify-content: flex-end;
}

.adjective-stars-container.two-rows {
  top: -10px;
}

/* 星曜项目的通用样式 */
.star-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* 主星样式 */
.major-star {
  color: #d32f2f;
  font-weight: bold;
  font-size: 17px;
}

/* 辅星样式 */
.minor-star {
  color: #1976d2;
  font-size: 15px;
}

/* 杂曜样式 */
.adjective-star {
  color: #388e3c;
  font-size: 14px;
  margin: 0 1px;
}

/* 星名 (垂直排列) */
.star-name {
  writing-mode: vertical-rl;
  text-orientation: upright;
  height: 40px;
}

/* 星曜亮度 (如庙, 旺, 陷) */
.star-state {
  font-size: 10px;
}

/* 星曜的生年四化 (如禄, 权, 科, 忌) */
.star-mutagen {
  font-size: 10px;
  font-weight: bold;
  color: white;
  background-color: red;
  border-radius: 2px;
  padding: 2px;
}

/* 右上角流曜（大限、流年）的父容器 */
.top-right-stars-wrapper {
  position: absolute;
  top: 80px;
  right: 4px;
  display: flex;
  gap: 4px; /* 在大限和流年流曜组之间添加一些间距 */
  align-items: flex-start;
}

/* 大限流曜容器 */
.decadal-horoscope-stars-container {
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap-reverse;
  gap: 2px;
  justify-content: flex-start;
}

/* 流年流曜容器 */
.yearly-horoscope-stars-container {
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap-reverse;
  gap: 2px;
  justify-content: flex-start;
}

/* 运限星曜 (流曜) 容器 (用于流月等) */
.horoscope-stars-container {
  position: absolute;
  bottom: 2px;
  left: 2px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2px;
}

/* 单个运限星曜样式 */
.horoscope-star {
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  margin-right: 2px;
}

/* 流年流曜样式 */
.horoscope-star.yearly {
  color: #ffffff;
  background-color: #2196F3; /* Blue */
  border: 1px solid #1976D2; /* Darker Blue */
  writing-mode: vertical-rl;
  text-orientation: upright;
  padding: 8px 4px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 流月流曜样式 */
.horoscope-star.monthly {
  color: #ffffff;
  background-color: #2196F3;
  border: 1px solid #1976D2;
}

/* 流日流曜样式 */
.horoscope-star.daily {
  color: #ffffff;
  background-color: #4CAF50;
  border: 1px solid #388E3C;
}

/* 流时流曜样式 */
.horoscope-star.hourly {
  color: #ffffff;
  background-color: #9C27B0;
  border: 1px solid #7B1FA2;
}

/* 四化星小角标 (Badge) */
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

/* 不同四化类型的颜色 */
.sihua-badge[data-type="禄"] { background-color: #FFD700; }
.sihua-badge[data-type="权"] { background-color: #FF4500; }
.sihua-badge[data-type="科"] { background-color: #32CD32; }
.sihua-badge[data-type="忌"] { background-color: #4B0082; color: white; }

/* 运限命宫的特殊高亮 */
.palace.horoscope-life-palace {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 不同运限命宫的边框颜色 */
.palace.horoscope-life-palace.decadal { border: 2px dashed #673AB7; }
.palace.horoscope-life-palace.yearly { border: 2px dashed #F44336; }
.palace.horoscope-life-palace.monthly { border: 2px dashed #2196F3; }
.palace.horoscope-life-palace.daily { border: 2px dashed #4CAF50; }
.palace.horoscope-life-palace.hourly { border: 2px dashed #9C27B0; }

/* 大限流曜 (运曜) 样式 */
.horoscope-star.decadal {
  color: #ffffff;
  background-color: #4CAF50; /* Green */
  border: 1px solid #388E3C; /* Darker Green */
  writing-mode: vertical-rl; /* 垂直排列 */
  text-orientation: upright; /* 文字方向保持正向 */
  padding: 8px 4px; /* 调整内边距以适应垂直文本 */
  line-height: 1; /* 调整行高 */
  display: flex; /* 使用flex布局来居中 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

/* 流年神煞容器 (将前, 岁前) */
.yearly-decorative-stars-container {
  position: absolute;
  bottom: 30px; /* 位于底部其他流曜(月/日)的上方 */
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

.decorative-star.jiangqian,
.decorative-star.suiqian {
  font-size: 12px;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid;
  font-weight: bold;
}

.decorative-star.jiangqian {
  color: #4A148C; /* 紫色 */
  background-color: #E1BEE7;
  border-color: #9C27B0;
}

.decorative-star.suiqian {
  color: #004D40; /* 青色 */
  background-color: #B2DFDB;
  border-color: #009688;
}
</style> 