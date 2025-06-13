<template>
  <el-row style="margin-top: 1%" :gutter="20">
    <!-- 左侧 列表 -->
    <el-col style="height: 350px" :span="span" class="resizable-col">
      <div style="position: relative; width: 100%; height: 100%">
        <el-drawer
          class="drawerClass"
          style="position: absolute"
          :append-to-body="false"
          :modal="false"
          :show-close="false"
          :wrapperClosable="false"
          size="100%"
          :visible.sync="drawer"
          direction="ltr"
        >
          <el-card class="box-card" style="position: relative">
            <!-- 左侧插槽 -->
            <slot name="left"></slot>
          </el-card>
        </el-drawer>
        <div
          style="
            position: absolute;
            z-index: 999999999;
            cursor: pointer;
            top: 30%;
          "
          :class="[drawer ? 'imgright' : 'imgright1']"
          @click="clickImg"
        >
          <img
            v-show="!drawer"
            style="height: 40px; width: 25px"
            :src="require('@/assets/image/zhankai.png')"
            alt="展开"
          />
          <img
            v-show="drawer"
            style="height: 40px; width: 25px"
            :src="require('@/assets/image/shousuo.png')"
            alt="收起"
          />
        </div>
      </div>
    </el-col>
    <!-- 右侧 用户列表 -->
    <el-col :span="span1" class="resizable-col">
      <el-card class="box-card">
        <!-- 右侧插槽 -->
        <slot name="right"></slot>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "ResizableLayout",
  data() {
    return {
      span: 8,
      span1: 15,
      drawer: true,
    };
  },
  methods: {
    clickImg() {
      this.drawer = !this.drawer;
      if (this.drawer) {
        this.span = 8;
        this.span1 = 15;
      } else {
        this.span = 1;
        this.span1 = 23;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.resizable-col {
  transition: all 0.2s;
}
.imgright {
  right: 0;
  background-color: #f5f5f5;
  transition: all 0.2s;
}
.imgright1 {
  left: 0;
  background-color: #fff;
  transition: all 0.2s;
}
/* 隐藏el-drawer的头部 */
.drawerClass ::v-deep .el-drawer__header {
  display: none;
}
.box-card {
  height: 350px;
}
</style> 