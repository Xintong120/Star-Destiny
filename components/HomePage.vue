<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="left-image">
        <div class="beidou-constellation">
          <svg class="constellation-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M133 909.5c0-24.6 169.7-44.5 379-44.5s379 19.9 379 44.5S721.3 954 512 954s-379-19.9-379-44.5z"
              fill="#EDEDEE"></path>
            <path d="M268 436c0-134.8 109.2-244 244-244s244 109.2 244 244-109.2 244-244 244-244-109.2-244-244z"
              fill="#FEEAB8"></path>
            <path
              d="M187.2 533.6l-0.8-2.3-0.4-2.3v-2.3l0.3-2.2 0.7-2.2 1-2 1.3-1.9 1.6-1.7 1.8-1.4 2.1-1.1 2.3-0.8 2.3-0.4h2.3l2.2 0.3 2.2 0.7 2 1 1.9 1.3 1.7 1.6 1.4 1.8 1.1 2.1 100.3 227.5L542 614.4l5.4-122.1 31.9-223.9 0.3-1.5 0.4-1.5 0.6-1.4 0.7-1.3 0.9-1.2 1-1.1 1.1-1 1.2-0.9 1.3-0.8 1.4-0.7 254.5-106.9 4.6-1.1 4.5 0.4 4.2 1.7 3.5 2.9 2.5 4 1.1 4.6-0.4 4.5-1.7 4.2-2.9 3.5-4 2.5-246.8 103.5-30.5 213.5-5.8 129.3-0.1 1.5-0.3 1.4-0.4 1.4-0.6 1.3-0.7 1.3-0.8 1.2-0.9 1.1-1 1-1.1 0.9-1.2 0.8-248.8 147.4-2.3 1.1-2.4 0.7-2.4 0.3-2.4-0.2-2.4-0.5-2.2-0.9-2.1-1.3-1.8-1.6-1.6-2-1.2-2.3-107.1-242.6z"
              fill="#66605A"></path>
            <path class="star star1"
              d="M217.1 472.9c-1.8-1.7-4.5-2.2-6.8-1.2l-25.9 10.2-23.1-15.5c-2.1-1.4-4.7-1.5-6.9-0.2-2.2 1.2-3.4 3.6-3.3 6.1l1.7 27.8-21.9 17.1c-2 1.5-2.9 4.1-2.4 6.5 0.5 2.4 2.4 4.4 4.8 5l26.9 6.9 9.5 26.1c0.9 2.3 3 4 5.4 4.3 2.5 0.3 4.9-0.9 6.2-3l15-23.5 27.8-1c1.1 0 2.1-0.3 3-0.9 1.2-0.7 2.1-1.7 2.7-3 1-2.3 0.7-4.9-0.9-6.8l-17.7-21.5 7.7-26.7c0.8-2.4 0-5-1.8-6.7z"
              fill="#FED572"></path>
            <path class="star star2"
              d="M367.2 747.2c-0.8-2.4-2.8-4.1-5.3-4.5l-27.4-4-12.3-25c-1.1-2.2-3.4-3.7-5.8-3.7s-4.7 1.4-5.8 3.7l-12.3 25-27.4 4c-2.5 0.4-4.5 2.1-5.3 4.5-0.8 2.4-0.1 5 1.7 6.7l19.8 19.5-4.7 27.5c-0.4 2.5 0.6 5 2.6 6.4 2 1.5 4.7 1.7 6.9 0.5l24.5-13 24.5 13c1 0.5 2 0.8 3 0.8 1.4 0 2.7-0.4 3.8-1.3 2-1.5 3-4 2.6-6.4l-4.7-27.5 19.8-19.5c2-1.7 2.6-4.3 1.8-6.7z"
              fill="#FED572"></path>
            <path class="star star3"
              d="M603.5 480.6c-1.2-2.2-3.6-3.5-6.1-3.3l-27.8 1.4-16.9-22.1c-1.5-2-4-2.9-6.5-2.4-2.4 0.5-4.4 2.3-5.1 4.7l-7.3 26.8-26.3 9.2c-2.4 0.8-4 2.9-4.3 5.4-0.3 2.5 0.8 4.9 2.9 6.3l23.3 15.2 0.6 27.8c0.1 2.5 1.5 4.7 3.8 5.8 2.3 1.1 4.9 0.7 6.9-0.8l21.7-17.4 26.7 8c1 0.3 2.1 0.4 3.1 0.2 1.3-0.3 2.6-0.9 3.5-2 1.7-1.8 2.2-4.4 1.3-6.8l-9.9-26 15.8-22.9c1.7-2.3 1.8-4.9 0.6-7.1z"
              fill="#FED572"></path>
            <path class="star star4"
              d="M642.1 251.6c-1.2-2.2-3.6-3.5-6.1-3.3l-27.8 1.4-16.9-22.1c-1.5-2-4-2.9-6.5-2.4-2.4 0.5-4.4 2.3-5.1 4.7l-7.3 26.8-26.3 9.2c-2.4 0.8-4 2.9-4.3 5.4-0.3 2.5 0.8 4.9 2.9 6.3l23.3 15.2 0.6 27.8c0.1 2.5 1.5 4.7 3.8 5.8 2.3 1.1 4.9 0.7 6.9-0.8l21.7-17.4 26.7 8c1 0.3 2.1 0.4 3.1 0.2 1.3-0.3 2.6-0.9 3.5-2 1.7-1.8 2.2-4.4 1.3-6.8l-9.9-26 15.8-22.9c1.7-2.3 1.8-5 0.6-7.1z"
              fill="#FED572"></path>
            <path class="star star5"
              d="M892.7 141c-1.2-2.2-3.6-3.5-6.1-3.3l-27.8 1.4-16.9-22.1c-1.5-2-4-2.9-6.5-2.4-2.4 0.5-4.4 2.3-5.1 4.7l-7.3 26.8-26.3 9.2c-2.4 0.8-4 2.9-4.3 5.4-0.3 2.5 0.8 4.9 2.9 6.3l23.3 15.2 0.6 27.8c0.1 2.5 1.5 4.7 3.8 5.8 2.3 1.1 4.9 0.7 6.9-0.8l21.7-17.4 26.7 8c1 0.3 2.1 0.4 3.1 0.2 1.3-0.3 2.6-0.9 3.5-2 1.7-1.8 2.2-4.4 1.3-6.8l-9.9-26 15.8-22.9c1.7-2.3 1.8-4.9 0.6-7.1z"
              fill="#FED572"></path>
          </svg>
        </div>
      </div>

      <div class="right-content">
        <div class="title-section">
          <h1 class="main-title">
            <span class="gold-text">知命不惧</span>
            <br />
            <span class="black-text">日日自新</span>
          </h1>

          <p class="description">
            星辰虽有其轨，命理可参不可囚；
            <br />
            人生本无定式，照见方能日日新。
          </p>

          <el-button type="primary" class="start-btn" @click="startAnalysis">
            开始分析
          </el-button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <AppFooter />

    <!-- 排盘表单抽屉 -->
    <ZiWeiForm />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import NavBar from './NavBar.vue';
import AppFooter from './Footer.vue';
import ZiWeiForm from './ZiWeiForm.vue';
import { useDrawerStore } from '../src/stores/drawerStore';

const { openDrawer } = useDrawerStore();
const router = useRouter();
const stars = ref([false, false, false, false, false]);
let twinkleInterval: number | null = null;

const startAnalysis = () => {
  openDrawer();
};

const makeStarsTwinkle = () => {
  // 随机选择一颗星星闪烁
  const randomStar = Math.floor(Math.random() * 5);
  stars.value[randomStar] = true;

  // 短暂闪烁后恢复
  setTimeout(() => {
    stars.value[randomStar] = false;
  }, 700);
};

onMounted(() => {
  // 每隔一段时间随机让星星闪烁
  twinkleInterval = window.setInterval(() => {
    makeStarsTwinkle();
  }, 1500);
});

onUnmounted(() => {
  if (twinkleInterval) {
    clearInterval(twinkleInterval);
  }
});
</script>

<style scoped>
.home-container {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: #E48FA0;
  /* 粉色作为主背景，占60% */
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.main-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0 24px;
  margin-top: 10px;
  box-sizing: border-box;
  flex: 1;
  min-height: calc(100vh - 150px); /* 确保主内容区域有足够的高度 */
}

.left-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem; /* 使用 rem 单位 */
}

.beidou-constellation {
  width: 90%; /* 稍微增大宽度占比 */
  max-width: 500px;
  /* height: 400px; 移除固定高度，让SVG保持其宽高比 */
  aspect-ratio: 500 / 400; /* 保持宽高比 */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

.constellation-svg {
  width: 100%;
  height: 100%;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem; /* 使用 rem 单位 */
}

.title-section {
  max-width: 600px;
}

.main-title {
  /* 使用 clamp() 实现响应式字体 */
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.2;
  margin-bottom: 1.25rem; /* 20px -> 1.25rem */
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.gold-text {
  color: #FFFBE5;
  /* 金色 */
}

.black-text {
  color: #66605A;
  /* 黑色作为强调色，占10% */
}

.description {
  /* 使用 clamp() 实现响应式字体 */
  font-size: clamp(1rem, 2.5vw, 1.375rem); /* 22px -> 1.375rem as max */
  color: #66605A;
  /* 深灰色文字，接近黑色 */
  margin-bottom: 1.25rem; /* 20px -> 1.25rem */
  line-height: 1.5;
  letter-spacing: 1px;
}

.start-btn {
  background-color: #72AEC5;
  /* 蓝色按钮 */
  border-color: #72AEC5;
  /* 使用 clamp() 实现响应式字体和内边距 */
  font-size: clamp(1rem, 2.5vw, 1.125rem); /* 18px -> 1.125rem */
  padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1.5rem, 4vw, 2.25rem);
  border-radius: 10px;
  margin-top: 0px;
}

.star {
  transition: filter 0.3s ease;
}

.star.twinkle {
  filter: drop-shadow(0 0 15px #FED572);
  animation: twinkle 0.7s ease;
}

@keyframes twinkle {
  0% {
    filter: drop-shadow(0 0 5px #FED572);
  }

  50% {
    filter: drop-shadow(0 0 15px #FED572);
  }

  100% {
    filter: drop-shadow(0 0 5px #FED572);
  }
}

/* 媒体查询，用于响应式布局 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column; /* 在小屏幕上垂直堆叠 */
    text-align: center; /* 居中文本 */
    margin-top: 2rem;
  }

  .left-image {
    order: 2; /* 将图片区域放在内容下面 */
    margin-top: 2rem;
  }

  .right-content {
    order: 1; /* 将内容区域放在图片上面 */
    align-items: center; /* 水平居中 */
  }

  .beidou-constellation {
    width: 80%;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: clamp(2rem, 8vw, 2.5rem);
  }

  .description {
    font-size: clamp(0.9rem, 4vw, 1rem);
  }

  .start-btn {
    padding: clamp(0.6rem, 3vw, 1rem) clamp(1.2rem, 5vw, 1.8rem);
  }
}
</style>