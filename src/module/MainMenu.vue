<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const activeIndex = ref('0')
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
  >
    <el-menu-item index="0">
      <RouterLink to="/">Home</RouterLink>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>
