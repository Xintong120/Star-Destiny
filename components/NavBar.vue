<template>
  <div class="navbar">
    <div class="left-section">
      <div class="logo-container">
        <svg class="logo-svg" viewBox="150 120 700 700" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M187.2 533.6l-0.8-2.3-0.4-2.3v-2.3l0.3-2.2 0.7-2.2 1-2 1.3-1.9 1.6-1.7 1.8-1.4 2.1-1.1 2.3-0.8 2.3-0.4h2.3l2.2 0.3 2.2 0.7 2 1 1.9 1.3 1.7 1.6 1.4 1.8 1.1 2.1 100.3 227.5L542 614.4l5.4-122.1 31.9-223.9 0.3-1.5 0.4-1.5 0.6-1.4 0.7-1.3 0.9-1.2 1-1.1 1.1-1 1.2-0.9 1.3-0.8 1.4-0.7 254.5-106.9 4.6-1.1 4.5 0.4 4.2 1.7 3.5 2.9 2.5 4 1.1 4.6-0.4 4.5-1.7 4.2-2.9 3.5-4 2.5-246.8 103.5-30.5 213.5-5.8 129.3-0.1 1.5-0.3 1.4-0.4 1.4-0.6 1.3-0.7 1.3-0.8 1.2-0.9 1.1-1 1-1.1 0.9-1.2 0.8-248.8 147.4-2.3 1.1-2.4 0.7-2.4 0.3-2.4-0.2-2.4-0.5-2.2-0.9-2.1-1.3-1.8-1.6-1.6-2-1.2-2.3-107.1-242.6z"
            fill="#66605A"></path>
          <path class="logo-star logo-star1"
            d="M217.1 472.9c-1.8-1.7-4.5-2.2-6.8-1.2l-25.9 10.2-23.1-15.5c-2.1-1.4-4.7-1.5-6.9-0.2-2.2 1.2-3.4 3.6-3.3 6.1l1.7 27.8-21.9 17.1c-2 1.5-2.9 4.1-2.4 6.5 0.5 2.4 2.4 4.4 4.8 5l26.9 6.9 9.5 26.1c0.9 2.3 3 4 5.4 4.3 2.5 0.3 4.9-0.9 6.2-3l15-23.5 27.8-1c1.1 0 2.1-0.3 3-0.9 1.2-0.7 2.1-1.7 2.7-3 1-2.3 0.7-4.9-0.9-6.8l-17.7-21.5 7.7-26.7c0.8-2.4 0-5-1.8-6.7z"
            fill="#FED572"></path>
          <path class="logo-star logo-star2"
            d="M367.2 747.2c-0.8-2.4-2.8-4.1-5.3-4.5l-27.4-4-12.3-25c-1.1-2.2-3.4-3.7-5.8-3.7s-4.7 1.4-5.8 3.7l-12.3 25-27.4 4c-2.5 0.4-4.5 2.1-5.3 4.5-0.8 2.4-0.1 5 1.7 6.7l19.8 19.5-4.7 27.5c-0.4 2.5 0.6 5 2.6 6.4 2 1.5 4.7 1.7 6.9 0.5l24.5-13 24.5 13c1 0.5 2 0.8 3 0.8 1.4 0 2.7-0.4 3.8-1.3 2-1.5 3-4 2.6-6.4l-4.7-27.5 19.8-19.5c2-1.7 2.6-4.3 1.8-6.7z"
            fill="#FED572"></path>
          <path class="logo-star logo-star3"
            d="M603.5 480.6c-1.2-2.2-3.6-3.5-6.1-3.3l-27.8 1.4-16.9-22.1c-1.5-2-4-2.9-6.5-2.4-2.4 0.5-4.4 2.3-5.1 4.7l-7.3 26.8-26.3 9.2c-2.4 0.8-4 2.9-4.3 5.4-0.3 2.5 0.8 4.9 2.9 6.3l23.3 15.2 0.6 27.8c0.1 2.5 1.5 4.7 3.8 5.8 2.3 1.1 4.9 0.7 6.9-0.8l21.7-17.4 26.7 8c1 0.3 2.1 0.4 3.1 0.2 1.3-0.3 2.6-0.9 3.5-2 1.7-1.8 2.2-4.4 1.3-6.8l-9.9-26 15.8-22.9c1.7-2.3 1.8-4.9 0.6-7.1z"
            fill="#FED572"></path>
          <path class="logo-star logo-star4"
            d="M642.1 251.6c-1.2-2.2-3.6-3.5-6.1-3.3l-27.8 1.4-16.9-22.1c-1.5-2-4-2.9-6.5-2.4-2.4 0.5-4.4 2.3-5.1 4.7l-7.3 26.8-26.3 9.2c-2.4 0.8-4 2.9-4.3 5.4-0.3 2.5 0.8 4.9 2.9 6.3l23.3 15.2 0.6 27.8c0.1 2.5 1.5 4.7 3.8 5.8 2.3 1.1 4.9 0.7 6.9-0.8l21.7-17.4 26.7 8c1 0.3 2.1 0.4 3.1 0.2 1.3-0.3 2.6-0.9 3.5-2 1.7-1.8 2.2-4.4 1.3-6.8l-9.9-26 15.8-22.9c1.7-2.3 1.8-5 0.6-7.1z"
            fill="#FED572"></path>
          <path class="logo-star logo-star5"
            d="M892.7 141c-1.2-2.2-3.6-3.5-6.1-3.3l-27.8 1.4-16.9-22.1c-1.5-2-4-2.9-6.5-2.4-2.4 0.5-4.4 2.3-5.1 4.7l-7.3 26.8-26.3 9.2c-2.4 0.8-4 2.9-4.3 5.4-0.3 2.5 0.8 4.9 2.9 6.3l23.3 15.2 0.6 27.8c0.1 2.5 1.5 4.7 3.8 5.8 2.3 1.1 4.9 0.7 6.9-0.8l21.7-17.4 26.7 8c1 0.3 2.1 0.4 3.1 0.2 1.3-0.3 2.6-0.9 3.5-2 1.7-1.8 2.2-4.4 1.3-6.8l-9.9-26 15.8-22.9c1.7-2.3 1.8-4.9 0.6-7.1z"
            fill="#FED572"></path>
        </svg>
        <h2 class="site-name">命宫在线</h2>
      </div>
      <div class="nav-links">
        <router-link to="/ziwei" class="nav-link">排盘</router-link>
        <span>更新日志</span>
        <span>意见反馈</span>
      </div>
    </div>
    <div class="right-actions">
      <el-button type="primary" class="login-btn">登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  // 为Logo中的星星添加鼠标悬停闪烁效果
  const logoStars = document.querySelectorAll('.logo-star');
  logoStars.forEach((star) => {
    star.addEventListener('mouseenter', () => {
      star.classList.add('logo-star-hover');
    });
    star.addEventListener('mouseleave', () => {
      star.classList.remove('logo-star-hover');
    });
  });
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  width: 100%;
  height:60px;
  box-sizing: border-box;
  background-color: transparent;
  backdrop-filter: blur(5px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.left-section {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-svg {
  width: 40px;
  height: 40px;
  overflow: visible;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo-star {
  transition: filter 0.3s ease;
}

.logo-star:hover,
.logo-star.logo-star-hover {
  filter: drop-shadow(0 0 5px #FED572);
  cursor: pointer;
}

.site-name {
  font-size: 24px;
  color: #FFFBE5;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-links {
  display: flex;
  gap: 32px;
  font-size: 16px;
  color: #333;
  margin-left: 30px;
}

.nav-links span {
  cursor: pointer;
  color: #66605A;
  transition: color 0.3s ease;
}

.nav-links span:hover {
  color: #FED572;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.login-btn {
  background-color: #72AEC5;
  border-color: #72AEC5;
  color: white;
  border-radius: 10px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: #5a9cb5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 