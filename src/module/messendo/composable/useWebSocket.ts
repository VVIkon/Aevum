import { ref, onUnmounted} from 'vue'
import { useAuth } from '@/module/auth/composable/useAuth';

export interface IMessage {
  event: string;
  authUserId: number;
  senderId?: number;
  senderName?: string;
  message?: string;
}

export function useWebSocket(url: string) {
  const socket = ref<WebSocket | null>(null);
  const messages = ref<IMessage[]>([]);
  const messageInput = ref<string>('');
  const isConnected = ref<boolean>(false);
  const connectionStatus = ref('Disconnected');
  const error = ref<Event | null>(null);

  const {token, getAuthUser, getProfile, isTokenated } = useAuth();

  const connect = () => {
    socket.value = new WebSocket(url);
    // if (!getAuthUser.value){
        loadProfile();
    // }

    socket.value.onopen = () => {
      // console.log('>>> 2. socket: ', JSON.stringify(socket));
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        const msg = {
          event: 'authenticate',
          data: {
            token: token?.value || ''
          }
        }
        socket.value.send(JSON.stringify(msg));
        isConnected.value = true;
        connectionStatus.value = 'Connected';
        // messages.value.push('Подключено к WebSocket server');
      }
    }

    socket.value.onmessage = (event) => {
      // authUser.value = state?.value?.authUser;
      // console.log('>>> 3. authUser: ', authUserId);
      if (event.data) {
        const data = JSON.parse(event.data);
        // console.log('>>> 4. event: ', data);
        if (data.event !== 'authenticated' && getAuthUser.value?.userId !== data.data.userId && data.data.message) {
          const msg: IMessage = {
            event: data.event,
            authUserId: getAuthUser.value?.userId || 0,
            senderId: data.data.userId,
            senderName: data.data.username,
            message: data.data.message,
          }
          messages.value.push(msg);
        }
      }
    }

    socket.value.onerror = (err) => {
      error.value = err
      isConnected.value = false
    }

    socket.value.onclose = () => {
      isConnected.value = false
      connectionStatus.value = 'Disconnected'
    }
  }

  const send = () => {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        const msg = {
          event: 'sendMessage',
          data: {
            token: token?.value || '',
            message: messageInput.value
          }
        }
        socket.value.send(JSON.stringify(msg));
        const sentMsg: IMessage = {
            event: msg.event,
            authUserId: getAuthUser.value?.userId || 0,
            senderId: getAuthUser.value?.userId || 0,
            senderName: getAuthUser.value?.fio,
            message: messageInput.value,
        }
        messages.value.push(sentMsg);
        messageInput.value = '';
        return true;
      }
      const sentErr: IMessage = {
        event:'errorMessage',
        authUserId: getAuthUser.value?.userId || 0,
        senderId: getAuthUser.value?.userId || 0,
        senderName: getAuthUser.value?.fio,
        message: 'Failed to send - not connected',
      }
      messages.value.push(sentErr);
      return false
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  const loadProfile = async () => {
  try {
    if (isTokenated && !getAuthUser.value) {
      await getProfile();
    }
  } catch (err) {
      console.error(err);
  }
};

  return {
    getAuthUser,
    socket,
    messages,
    messageInput,
    isConnected,
    connectionStatus,
    error,
    connect,
    send,
    disconnect
  }
}
