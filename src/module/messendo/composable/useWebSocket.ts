// composables/useWebSocket.ts
import { useWebSocketStore } from '@/stores/websocket.store';
import { onUnmounted, computed, ref } from 'vue';
import { useAuth } from '@/module/auth/composable/useAuth';

export function useWebSocket(websocketUrl: string, initialGroupId?: number) {
  const { getAuthUser, waitForAuth } = useAuth();

  const websocketStore = useWebSocketStore();

  const connectionId = ref<number | null>(null);
  const isInitialized = ref(false);
  const initializationError = ref<Error | null>(null);

  // Реактивные данные соединения
  const connection = computed(() => (
    connectionId.value
    ? websocketStore.getConnection(connectionId.value || 0)
    : null
  ));

   // Очистка при размонтировании
  onUnmounted(() => {
    websocketStore.removeConnection(connectionId.value || 0);
  });

  // Реактивные данные
  const messages = computed(() => connection.value?.messages || []);
  const isConnected = computed(() => connection.value?.isConnected || false);
  const getUser = computed(() => {
    const { getAuthUser } = useAuth();
    return getAuthUser;
  });

// Инициализация
  const init = async () => {
    try {
      await waitForAuth();
      const id = getAuthUser.value?.userId || 0;
      connectionId.value = id;
      if (!websocketStore.getConnection(id)) {
        console.log(`>>> Нет соединения по id=${id}`);
        websocketStore.createConnection(id, websocketUrl);
      }

      // websocketStore.getRoomProfile(id);
      // if (initialGroupId) {
      //   getGroupContent(initialGroupId);
      // }

      isInitialized.value = true;
    } catch (error) {
      initializationError.value = error as Error;
      throw error;
    }
  };

  // Методы
  const sendMessage = (message: string, groupId: number, groupName: string) => {
    websocketStore.sendMessage(connectionId.value || 0, message, groupId, groupName);
  };
  const getGroupContent = (groupId: number) => {
    websocketStore.getGroupContent(connectionId.value || 0, groupId);
  };

  const getRoomProfile = () => {
    websocketStore.getRoomProfile(connectionId.value || 0);
  }

  const createNewRoom = () => {
    websocketStore.createNewRoom(connectionId.value || 0);
  }



  return {
    connectionId,
    isInitialized,
    initializationError,
    connection,
    messages,
    getUser,
    isConnected,
    init,
    sendMessage,
    getGroupContent,
    getRoomProfile,
    createNewRoom,
  };
}
