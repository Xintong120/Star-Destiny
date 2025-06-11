<template>
  <div class="horoscope-test-container">
    <h2>运限选择测试</h2>
    
    <div class="test-controls">
      <button @click="loadAstrolabe">加载命盘</button>
      <div v-if="astrolabe" class="astrolabe-info">
        命盘已加载: {{ astrolabe.solarDate }}
      </div>
    </div>
    
    <div class="test-results" v-if="horoscopeHistory.length">
      <h3>选择结果</h3>
      <div v-for="(item, index) in horoscopeHistory" :key="index" class="history-item">
        <div class="item-type">{{ item.type === 'decadal' ? '大限' : '流年' }}</div>
        <div class="item-comment">{{ item.comment }}</div>
        <div class="item-data">生命宫位置: {{ item.lifePalaceIndex }}</div>
      </div>
    </div>
    
    <!-- 引入紫微运限组件 -->
    <ZiWeiHoroscope 
      v-if="astrolabe"
      :astrolabe="astrolabe"
      @updateHoroscope="handleHoroscopeUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ZiWeiHoroscope from '../../components/ZiWeiHoroscope.vue';
import { IFunctionalAstrolabe } from '../astro/FunctionalAstrolabe';
import { HoroscopeHistoryItem } from '../types';

// 命盘实例
const astrolabe = ref<IFunctionalAstrolabe | null>(null);

// 运限历史记录
const horoscopeHistory = ref<HoroscopeHistoryItem[]>([]);

// 加载命盘
function loadAstrolabe() {
  // 在实际应用中，这里会调用iztro库创建命盘
  // 为了测试，我们模拟一个命盘对象
  const mockAstrolabe = {
    solarDate: '1990-01-01',
    palaces: Array(12).fill(0).map((_, index) => ({
      decadal: {
        range: [index * 10, index * 10 + 9] as [number, number],
        heavenlyStem: '甲',
        earthlyBranch: '子'
      }
    }))
  } as unknown as IFunctionalAstrolabe;
  
  astrolabe.value = mockAstrolabe;
}

// 处理运限更新
function handleHoroscopeUpdate(history: HoroscopeHistoryItem[] | null) {
  console.log('运限更新:', history);
  horoscopeHistory.value = history || [];
}
</script>

<style scoped>
.horoscope-test-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.test-controls {
  margin-bottom: 20px;
}

.astrolabe-info {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.test-results {
  margin-bottom: 20px;
  padding: 15px;
  background: #eef6ff;
  border-radius: 4px;
}

.history-item {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
}

.item-type {
  font-weight: bold;
  margin-bottom: 5px;
}

.item-comment {
  color: #555;
  margin-bottom: 5px;
}
</style> 