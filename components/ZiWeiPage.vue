<template>
  <div class="page-container">
    <NavBar />
    <div class="main-content">
      <div class="grid-container" v-if="astrolabe">
        <zi-wei-grid :astrolabe="astrolabe" :person-name="personName" />
      </div>
      <div v-else class="no-data-prompt">
        请先在首页输入信息生成命盘。
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAstrolabeStore } from '../src/stores/astrolabeStore';
import NavBar from './NavBar.vue';
import AppFooter from './Footer.vue';
import ZiWeiGrid from './ZiWeiGrid.vue';

const store = useAstrolabeStore();
const astrolabe = computed(() => store.astrolabe);
const personName = computed(() => store.personName);
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #E48FA0;
  position: relative;
  overflow: hidden;
}

.page-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/星轨.svg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.2;
  z-index: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  position: relative;
  z-index: 1;
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}

.no-data-prompt {
  color: white;
  font-size: 24px;
}
</style> 