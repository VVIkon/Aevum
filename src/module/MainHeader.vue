<script setup lang="ts">
import { onMounted } from 'vue'
// import { useAuth } from './auth/composable/useAuth';
import MainMenu from '@/module/MainMenu.vue'

defineProps<{
  msg: string;
  desc: string;
}>()
// const { goToLogin } = useAuth();

onMounted(() => {
  // loadProfile()
})

</script>

<template>
  <el-page-header>
    <template #title>
      <div class="flex items-center">
        <span class="text-large font-600 mr-3"> {{ msg }}</span>
      </div>
    </template>
    <template #default>
      <div class="flex items-center">
        <MainMenu />
      </div>
    </template>
    <template #extra>
      <!-- <el-button type="primary" style="margin-left: 16px" @click="goToLogin">Сменить пользователя</el-button> -->
    </template>
  </el-page-header>
</template>
