<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainHeader from '@/module/MainHeader.vue';

</script>

<template>
  <ElConfigProvider>
    <div class="common-layout">
      <el-container>
        <el-header>
          <div class="header-wrapper">
            <MainHeader msg="Aevum" desc="Aevum - messanger prototype" />
          </div>
        </el-header>
        <el-main>
          <RouterView />
        </el-main>
      </el-container>
    </div>
  </ElConfigProvider>

</template>

<style lang="scss" scoped>
.el-main {
  margin-top:0px;
}

.el-header {
  margin-bottom: 50px;
}
</style>
