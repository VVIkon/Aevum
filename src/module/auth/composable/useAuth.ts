import { computed, toRefs } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES_PATHS } from '@/constants'
import { useRouter } from 'vue-router'

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore();
  const { getAccessToken, getProfile, getToken } = authStore;
  const { token, role, status, authUser } = toRefs(authStore);

  const isAuthenticated = computed(() => (status.value === 'got_user') );
  const isTokenated = computed(() => (!!token?.value) );
  const getAuthUser = computed(() => (authUser.value) );

  const goToLogin = () => {
    router.push(ROUTES_PATHS.LOGIN)
  }

  return {
    status,
    token,
    role,
    isTokenated,
    isAuthenticated,
    getToken,
    getAuthUser,
    getAccessToken,
    getProfile,
    goToLogin,
  }
}
