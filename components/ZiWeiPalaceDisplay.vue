<template>
  <!-- 宫位容器，根据传入的 palaceClasses 动态添加 CSS 类 -->
  <div
    class="palace"
    :class="palaceClasses"
    @click="$emit('palace-click')"
  >
    <!-- 宫位序号 (当前注释掉) -->
    <!-- <div class="palace-index">{{ displayIndex }}</div> -->

    <!-- 宫位名称容器 -->
    <div class="palace-name">
      <!-- 1. 流年宫位名称 (如果存在) -->
      <div v-if="yearlyPalaceName" class="yearly-palace-name-display">
        {{ yearlyPalaceName }}
      </div>

      <!-- 2. 大限宫位名称 (如果存在) -->
      <div v-if="decadalPalaceName" class="decadal-palace-name-display">
        {{ decadalPalaceName }}
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

    <!-- 星曜容器，仅当宫位内有星曜时显示 -->
    <div class="star-container" v-if="palaceData && (palaceData.majorStars.length || palaceData.minorStars.length || palaceData.adjectiveStars.length)">
      <!-- 主星与辅星 -->
      <div class="main-minor-stars">
        <!-- 主星列表 -->
        <div v-for="star in palaceData.majorStars" :key="star.name" class="star-item major-star">
          <span class="star-name" @click.stop="showStarInfo(star)">{{ star.name }}</span>
          <span class="star-state">{{ star.brightness }}</span>
          <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
          <!-- 运限四化标识 -->
          <span class="sihua-badge" v-if="getStarMutagenType(star.name)" 
                :class="getStarMutagenType(star.name)?.horoscopeType"
                :data-type="getStarMutagenType(star.name)?.mutagen">
            {{ getStarMutagenType(star.name)?.mutagen }}
          </span>
        </div>
        <!-- 辅星列表 -->
        <div v-for="star in palaceData.minorStars" :key="star.name" class="star-item minor-star">
          <span class="star-name" @click.stop="showStarInfo(star)">{{ star.name }}</span>
          <span class="star-state">{{ star.brightness }}</span>
          <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
          <!-- 运限四化标识 -->
          <span class="sihua-badge" v-if="getStarMutagenType(star.name)" 
                :class="getStarMutagenType(star.name)?.horoscopeType"
                :data-type="getStarMutagenType(star.name)?.mutagen">
            {{ getStarMutagenType(star.name)?.mutagen }}
          </span>
        </div>
      </div>
      <!-- 杂曜容器，根据杂曜数量动态调整样式 -->
      <div class="adjective-stars-container" :class="{ 'two-rows': palaceData.adjectiveStars.length > 5 }">
        <div v-for="star in palaceData.adjectiveStars" :key="star.name" class="star-item adjective-star">
          <span class="star-name" @click.stop="showStarInfo(star)">{{ star.name }}</span>
          <span class="star-state">{{ star.brightness }}</span>
          <span class="star-mutagen" v-if="star.mutagen">{{ star.mutagen }}</span>
          <!-- 运限四化标识 -->
          <span class="sihua-badge" v-if="getStarMutagenType(star.name)" 
                :class="getStarMutagenType(star.name)?.horoscopeType"
                :data-type="getStarMutagenType(star.name)?.mutagen">
            {{ getStarMutagenType(star.name)?.mutagen }}
          </span>
        </div>
      </div>
    </div>

    <!-- 神煞 (长生十二神, 博士十二神) -->
    <div class="decorative-stars-container" v-if="palaceData">
      <!-- 长生十二神 -->
      <div v-if="palaceData.changsheng12" class="decorative-star changsheng" :data-length="palaceData.changsheng12.length">
        {{ palaceData.changsheng12 }}
      </div>
      <!-- 博士十二神 -->
      <div v-if="palaceData.boshi12" class="decorative-star boshi">
        {{ palaceData.boshi12 }}
      </div>
    </div>

    <!-- 流年神煞 -->
    <div class="yearly-decorative-stars-container" v-if="yearlyDecorativeStars && (yearlyDecorativeStars.jiangqian || yearlyDecorativeStars.suiqian)">
      <!-- 岁前十二神 -->
      <div v-if="yearlyDecorativeStars.suiqian" class="decorative-star suiqian">
        {{ yearlyDecorativeStars.suiqian }}
      </div>
      <!-- 将前十二神 -->
      <div v-if="yearlyDecorativeStars.jiangqian" class="decorative-star jiangqian">
        {{ yearlyDecorativeStars.jiangqian }}
      </div>
    </div>

    <!-- 运限星曜 (流曜) -->
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
import { showStarNotification } from '@/utils/starInfo';

// 从 IFunctionalAstrolabe 推断出单个宫位的确切类型，以获得强类型支持
type PalaceData = IFunctionalAstrolabe['palaces'][number];
// 从宫位数据中推断出星曜的类型
type Star = PalaceData['majorStars'][number];

// 定义组件的 props
const props = defineProps<{
  // 宫位数据对象
  palaceData?: PalaceData;
  // 宫位在星盘中的显示索引
  displayIndex: number;
  // 运限宫位名称数组 (如大限、流年宫位名)
  horoscopeNames?: Array<{ name: string, type: string }>;
  // 动态 CSS 类，用于高亮显示 (如当前、三方、对宫)
  palaceClasses: Record<string, boolean>;
  // 运限星曜 (流曜) 数组
  horoscopeStars: Array<{name: string, type?: string, horoscopeType?: string}>;
  // 流年神煞
  yearlyDecorativeStars?: { jiangqian?: string; suiqian?: string };
  // 一个函数，用于获取星曜的运限四化类型 (禄权科忌)
  getStarMutagenType: (starName: string) => { mutagen: string, horoscopeType: string } | null;
}>();

// 定义组件的 emits
defineEmits(['palace-click']);

/**
 * 显示星曜信息的弹窗
 * @param star 要显示信息的星曜对象
 */
const showStarInfo = (star: Star) => {
  showStarNotification(star);
};

// 计算属性：获取流年宫位名称
const yearlyPalaceName = computed(() => {
  return props.horoscopeNames?.find(h => h.type === 'yearly')?.name;
});

// 计算属性：获取大限宫位名称
const decadalPalaceName = computed(() => {
  return props.horoscopeNames?.find(h => h.type === 'decadal')?.name;
});

// 计算属性：获取除大限和流年外的其他运限宫位名称
const otherHoroscopeNames = computed(() => {
  return props.horoscopeNames?.filter(h => h.type !== 'decadal' && h.type !== 'yearly') ?? [];
});

// 计算属性：过滤出流年流曜
const yearlyHoroscopeStars = computed(() => {
  return props.horoscopeStars.filter(s => s.horoscopeType === 'yearly');
});

// 计算属性：过滤出大限流曜
const decadalHoroscopeStars = computed(() => {
  return props.horoscopeStars.filter(s => s.horoscopeType === 'decadal');
});

// 计算属性：过滤出其他运限的流曜 (如流月、流日)
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
  font-size: 0.75rem; /* 12px */
  padding: 0.125rem; /* 2px */
  min-height: 5rem; /* 80px */
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 选中宫位的激活样式 */
.palace.active {
  background: #D5D5D5;
  color: white;
  border: thick double #72AEC5;
  z-index: 2; /* 确保激活的宫位在最上层 */
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
  top: 7rem; /* 112px */
  right: 0.25rem; /* 4px */
  font-size: 0.875rem; /* 14px */
  color: red;
  font-weight: thin;
  background-color: white;
  border: 0.5px solid red;
  padding: 0.04rem 0.08rem; /* 0.64px 1.28px */
  border-radius: 0.25rem; /* 4px */
}

/* 长生十二神样式 */
.decorative-star.changsheng {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 0.125rem; /* 2px */
  font-size: 0.75rem; /* 12px */
  color: black;
  background-color: white;
  padding: 0.0625rem 0.0625rem; /* 1px 1px */
  border-radius: 0.1875rem; /* 3px */
  border: 2px solid #CE93D8;
  bottom: 2.45rem; /* 39.2px */
  right: 0.3125rem; /* 5px */
  min-width: 0.625rem; /* 10px */
  text-align: center;
  line-height: 1.125rem; /* 18px */
  height: 1.125rem; /* 18px */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 兼容一个字和两个字的长生十二神名称 */
.decorative-star.changsheng:not([data-length="2"]) {
  padding: 0.0625rem 0.25rem; /* 1px 4px */
  min-width: 0.75rem; /* 12px */
}

.decorative-star.changsheng[data-length="2"] {
  padding: 0.0625rem 0.0625rem; /* 1px 1px */
  min-width: 1.25rem; /* 20px */
}

/* 宫位左上角序号样式 (已注释) */
 .palace-index {
  position: absolute;
  top: 0.125rem; /* 2px */
  left: 0.25rem; /* 4px */
  font-size: 0.625rem; /* 10px */
  color: red;
  font-weight: bold;
} 

/* 宫位名称容器 (本命, 大限, 流年等) */
.palace-name {
  position: absolute;
  bottom: 0.25rem; /* 4px */
  right: 3.125rem; /* 50px */
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.3;
}

/* 流年宫位名称样式 */
.yearly-palace-name-display {
  color: rgb(36, 138, 221);
  font-size: 1rem; /* 16px */
  font-weight: thin;
}

/* 大限宫位名称样式 */
.decadal-palace-name-display {
  color: rgb(38, 166, 38);
  font-size: 1rem; /* 16px */
  font-weight: thin;
}

/* 本命宫位名称样式 */
.native-palace-name {
  font-size: 1rem; /* 16px */
  color: rgb(255, 23, 23);
  font-weight: thin;
}

/* 其他运限宫位名称 (如流月) 的通用样式 */
.horoscope-palace-name {
  position: absolute;
  color:black;
  bottom: 0;
  left: -4rem; /* -64px */
  font-size: 0.875rem; /* 14px */
  padding: 0.05rem 0.2rem; /* 0.8px 3.2px */
  border-radius: 0.1875rem; /* 3px */
  border-style: dashed;
  border-width: 1px;
  font-weight: thin;
  white-space: nowrap; /* 防止换行 */
}

/* 宫位天干地支样式 */
.palace-hb {
  font-size: 1rem; /* 16px */
  color: black;
  margin-bottom: 0.125rem; /* 2px */
  position: absolute;
  bottom: 0.25rem; /* 4px */
  right: 0.25rem; /* 4px */
  writing-mode: vertical-rl; /* 垂直从右到左排列 */
  text-orientation: upright; /* 保持字符正立 */
}

/* 星曜容器 */
.star-container {
  position: absolute;
  top: 0.9375rem; /* 15px */
  left: 0.3125rem; /* 5px */
  right: 0.3125rem; /* 5px */
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
  margin-bottom: 0.125rem; /* 2px */
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
  max-width: 60%; /* 限制最大宽度 */
  justify-content: flex-end; /* 靠右对齐 */
}

/* 杂曜多于一行时的样式调整 */
.adjective-stars-container.two-rows {
  top: -0.625rem; /* -10px */
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
  color: #d32f2f; /* 红色 */
  font-weight: thin;
  font-size: 1rem; /* 16px */
}

/* 辅星样式 */
.minor-star {
  color: black;
  font-size: 0.9375rem; /* 15px */
  font-weight: thin;
}

/* 杂曜样式 */
.adjective-star {
  color: grey;
  font-size: 0.875rem; /* 14px */
  margin: 0 0.0625rem; /* 1px */
  font-weight: thin;
  top:0.05rem; /* 0.8px */
}

/* 星名 (垂直排列) */
.star-name {
  writing-mode: vertical-rl;
  text-orientation: upright;
  height: 2.5rem; /* 40px */
}

/* 星曜亮度 (如庙, 旺, 陷) */
.star-state {
  font-size: 0.8125rem; /* 13px */
}

/* 星曜的生年四化 (如禄, 权, 科, 忌) */
.star-mutagen {
  font-size: 0.8125rem; /* 13px */
  font-weight: thin;
  color: white;
  background-color: red;
  border-radius: 2px;
  padding: 0.5px;
}

/* 流年四化标识 */
.sihua-badge.yearly { 
  position: absolute;
  right: 0.3rem; /* 4.8px */
  top: 6.25rem; /* 100px */
  font-size: 0.8125rem; /* 13px */
  font-weight: thin;
  padding: 0.0625rem 0.1875rem; /* 1px 3px */
  background-color: rgb(36, 138, 221); /* 蓝色 */
  color: white;
  border-radius: 2px;
  padding: 0.5px;
}

/* 大限四化标识 */
.sihua-badge.decadal { 
  position: absolute;
  right: 0.3rem; /* 4.8px */
  top: 5rem; /* 80px */
  font-size: 0.8125rem; /* 13px */
  font-weight: thin;
  padding: 0.0625rem 0.1875rem; /* 1px 3px */
  background-color: rgb(38, 166, 38); /* 绿色 */
  color: white;
  border-radius: 2px;
  padding: 0.5px;
}

/* 右上角流曜（大限、流年）的父容器 */
.top-right-stars-wrapper {
  position: absolute;
  top: 5rem; /* 80px */
  right: 0.25rem; /* 4px */
  display: flex;
  gap: 0.25rem; /* 4px */
  align-items: flex-start;
}

/* 大限流曜容器 */
.decadal-horoscope-stars-container {
  display: flex;
  flex-direction: row-reverse; /* 反向排列，使其从右向左 */
  flex-wrap: wrap-reverse;
  gap: 0.125rem; /* 2px */
  justify-content: flex-start;
}

/* 流年流曜容器 */
.yearly-horoscope-stars-container {
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap-reverse;
  gap: 0.125rem; /* 2px */
  justify-content: flex-start;
}

/* 运限星曜 (流曜) 容器 (用于流月等) */
.horoscope-stars-container {
  position: absolute;
  bottom: 0.125rem; /* 2px */
  left: 0.125rem; /* 2px */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.125rem; /* 2px */
}

/* 单个运限星曜样式 */
.horoscope-star {
  font-size: 0.8rem; /* 12.8px */
  padding: 0.125rem 0.125rem; /* 2px 2px */
  border-radius: 0.1875rem; /* 3px */
  margin-right: 0.125rem; /* 2px */
 font-weight: thin;
}

/* 流年流曜样式 */
.horoscope-star.yearly {
  color: rgb(36, 138, 221);
  background-color: white;
  border: 1px solid #1976D2; /* 深蓝色边框 */
  writing-mode: vertical-rl;
  text-orientation: upright;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 大限流曜 (运曜) 样式 */
.horoscope-star.decadal {
  color: rgb(38, 166, 38);
  background-color:white;
  border: 1px solid #388E3C; /* 深绿色边框 */
  writing-mode: vertical-rl; /* 垂直排列 */
  text-orientation: upright; /* 文字方向保持正向 */
  line-height: 1; /* 调整行高 */
  display: flex; /* 使用flex布局来居中 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

/* 博士十二神样式 */
.decorative-star.boshi {
  position: absolute;
  top: 11rem; /* 176px */
  left: 0.3rem; /* 4.8px */
  color: black;
  font-size: 0.8125rem; /* 13px */
  font-weight: thin;
  writing-mode: horizontal-tb; /* 水平排列 */
}

/* 流年神煞容器 (将前, 岁前) */
.yearly-decorative-stars-container {
  position: absolute;
  bottom: 1.2rem; /* 19.2px */
  left: 0.3rem; /* 4.8px */
  display: flex;
  flex-direction: column;
  gap: 0.08rem; /* 1.28px */
  align-items: flex-start;
}

/* 将前和岁前神煞通用样式 */
.decorative-star.jiangqian,
.decorative-star.suiqian {
  font-size: 0.8125rem; /* 13px */
  font-weight: thin;
  color: black; 
}
</style> 