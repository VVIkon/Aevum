import { ref, onUnmounted } from 'vue';
import { useAuth } from '@/module/auth/composable/useAuth';
import type { IMessage } from '../interfaces/imessage.interface';
import type { IRoomProfile } from '../interfaces/iuser.profile.interface';

export function useWebSocket(url: string) {
  const socket = ref<WebSocket | null>(null);
  const messages = ref<IMessage[]>([]);
  const roomProfile = ref<IRoomProfile | null>(null);
  const profoleStatus = ref<number>(0); // 0-не было загрузки, 1-нет профиля, 2-профиль загружен
  const messageInput = ref<string>('');
  const isConnected = ref<boolean>(false);
  const connectionStatus = ref('Disconnected');
  const error = ref<Event | null>(null);

  const { token, getAuthUser, getCurrUserProfile, isTokenated } = useAuth();

  const connect = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      console.log('! Already connected, skipping duplicate connection');
      return
    }

    socket.value = new WebSocket(url)

    socket.value.onopen = () => {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        const msg = {
          event: 'authenticate',
          data: {
            token: token?.value || '',
          },
        }
        socket.value.send(JSON.stringify(msg));
        isConnected.value = true;
        connectionStatus.value = 'Connected';
        loadProfile();
      }
    }

    socket.value.onmessage = (event) => {
      if (event.data) {
        const data = JSON.parse(event.data);
        switch (data.event) {
          case 'authenticated':
            // console.log('>>> authenticated user: ', data.data.user);
            break
          case 'newMessage':
            const mesTmp = {
              event: data.event,
              message: data.data.message,
              senderId: data.data.senderId,
              senderName: data.data.senderName,
              contentGroupId: data.data.sendToGroup,
            }
            messages.value.push(mesTmp)
            break
          case 'roomProfile':
            profoleStatus.value = 1;
            if (data.data.message) {
              profoleStatus.value = 2;
              roomProfile.value = data.data.message
            }
            break
          case 'groupContent':
            messages.value = [];
            if (data.data?.message?.length) {
              for (const mes of data.data?.message || []) {
                const mesTmp = {
                  event: data.event,
                  message: mes.message,
                  senderId: mes.userid,
                  senderName: mes.username,
                  contentGroupId: mes.groupid,
                  contentGroupName: mes.groupname,
                }
                messages.value.push(mesTmp);
              }
            }
            break
          default:
            break
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

  const sendMsg = (sendToGroup: number, groupName: string) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const msg = {
        event: 'sendMessage',
        data: {
          token: token?.value || '',
          message: messageInput.value,
          sendToGroup,
          groupName,
          senderId: getAuthUser.value?.userId,
          senderName: getAuthUser.value?.fio,
        },
      }
      socket.value.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  const getGroupContent = (groupId: number) => {
    if (groupId && socket.value && socket.value.readyState === WebSocket.OPEN) {
      const msg = {
        event: 'getGroupContent',
        data: {
          token: token?.value || '',
          message: 'getGroupContent',
          groupId,
          authUserId: getAuthUser.value?.userId,
        },
      }
      socket.value.send(JSON.stringify(msg))
      return true
    }
    return false
  }

  const getRoomProfile = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const msg = {
        event: 'getRoomProfile',
        data: {
          token: token?.value || '',
          message: 'getRoomProfile',
        },
      }
      socket.value.send(JSON.stringify(msg))
      return true
    }
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
      if (isTokenated.value && !getAuthUser.value) {
        // await getCurrUserProfile()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return {
    getAuthUser,
    socket,
    messages,
    roomProfile,
    profoleStatus,
    messageInput,
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
    sendMsg,
    getRoomProfile,
    getGroupContent,
  }
}
