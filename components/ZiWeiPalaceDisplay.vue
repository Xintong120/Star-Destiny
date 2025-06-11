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
      {{ palaceData?.name ?? '' }}
      <span v-if="decadalName" class="decadal-palace-name">
        {{ decadalName }}
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

    <!-- 运限星曜 -->
    <div class="horoscope-stars-container" v-if="horoscopeStars.length > 0">
      <div v-for="star in horoscopeStars" :key="star.name + '-' + (star.horoscopeType || '')"
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
  decadalName?: string;
  palaceClasses: Record<string, boolean>;
  horoscopeStars: Array<{name: string, type?: string, horoscopeType?: string}>;
  getStarMutagenType: (starName: string) => string | null;
}>();

defineEmits(['palace-click']);
</script>

<style scoped>
/* Copied from ZiWeiGrid.vue */
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

.palace.active {
  background: #D5D5D5;
  color: white;
  border: thick double #72AEC5;
  z-index: 2;
}

.palace.opposite {
  background-color:#F8F19A;
  border: thick double #72AEC5;
}

.palace.surrounded {
  background-color: #FCF9D4;
  border: thick double #72AEC5;
}

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
  color: #673AB7;
  background-color: rgba(103, 58, 183, 0.1);
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
  writing-mode: vertical-rl;
  text-orientation: upright;
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

.main-minor-stars {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 2px;
}

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

.star-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.major-star {
  color: #d32f2f;
  font-weight: bold;
  font-size: 17px;
}

.minor-star {
  color: #1976d2;
  font-size: 15px;
}

.adjective-star {
  color: #388e3c;
  font-size: 14px;
  margin: 0 1px;
}

.star-name {
  writing-mode: vertical-rl;
  text-orientation: upright;
  height: 40px;
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

.horoscope-stars-container {
  position: absolute;
  bottom: 30px;
  left: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2px;
}

.horoscope-star {
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  margin-right: 2px;
}

.horoscope-star.decadal {
  color: #ffffff;
  background-color: #673AB7;
  border: 1px solid #512DA8;
}

.horoscope-star.yearly {
  color: #ffffff;
  background-color: #F44336;
  border: 1px solid #D32F2F;
}

.horoscope-star.monthly {
  color: #ffffff;
  background-color: #2196F3;
  border: 1px solid #1976D2;
}

.horoscope-star.daily {
  color: #ffffff;
  background-color: #4CAF50;
  border: 1px solid #388E3C;
}

.horoscope-star.hourly {
  color: #ffffff;
  background-color: #9C27B0;
  border: 1px solid #7B1FA2;
}

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

.sihua-badge[data-type="禄"] { background-color: #FFD700; }
.sihua-badge[data-type="权"] { background-color: #FF4500; }
.sihua-badge[data-type="科"] { background-color: #32CD32; }
.sihua-badge[data-type="忌"] { background-color: #4B0082; color: white; }

.palace.horoscope-life-palace {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.palace.horoscope-life-palace.decadal { border: 2px dashed #673AB7; }
.palace.horoscope-life-palace.yearly { border: 2px dashed #F44336; }
.palace.horoscope-life-palace.monthly { border: 2px dashed #2196F3; }
.palace.horoscope-life-palace.daily { border: 2px dashed #4CAF50; }
.palace.horoscope-life-palace.hourly { border: 2px dashed #9C27B0; }
</style> 