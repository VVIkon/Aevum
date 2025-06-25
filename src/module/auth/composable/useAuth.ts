import { computed, toRefs, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
// import { ROUTES_PATHS } from '@/constants';
// import { useRouter } from 'vue-router';

export const useAuth = () => {
  // const router = useRouter();
  const authStore = useAuthStore();
  const { getAccessToken, getCurrUserProfile, getToken } = authStore;
  const { token, role, status, authUser } = toRefs(authStore);

  const isAuthenticated = computed(() => status.value === 'got_user');
  const isTokenated = computed(() => !!token?.value);
  const getAuthUser = computed(() => authUser.value);

  // const goToLogin = () => {
  //   router.push(ROUTES_PATHS.LOGIN);
  // };

  const waitForAuth = () => {
    return new Promise<void>((resolve, reject) => {
      console.log('>>> status.value: ', status.value);

      if (isTokenated.value && !getAuthUser.value) {
        getCurrUserProfile();
      }

      // Если уже аутентифицированы, сразу резолвим
      if (isAuthenticated.value) {
        resolve();
        return;
      }

      // Наблюдаем за изменениями isAuthenticated
      const unwatch = watch(
        isAuthenticated,
        (authenticated) => {
          console.log('>>> status.value: ', status.value);
          if (authenticated) {
            unwatch(); // Прекращаем наблюдение
            resolve();
          }
        },
        { immediate: true },
      );

      // Опционально: добавляем таймаут для избежания бесконечного ожидания
      const timeout = setTimeout(() => {
        unwatch();
        reject(new Error('Authentication timeout'));
      }, 10000); // 10 секунд таймаут

      // Очистка при завершении
      Promise.resolve().finally(() => {
        clearTimeout(timeout);
      });
    });
  };

  return {
    status,
    token,
    role,
    isTokenated,
    isAuthenticated,
    getToken,
    getAuthUser,
    getAccessToken,
    getCurrUserProfile,
    waitForAuth,
    // goToLogin,
  };
};
