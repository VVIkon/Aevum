import { ref, onUnmounted } from 'vue'
import { useAuth } from '@/module/auth/composable/useAuth'
import type { IMessage } from '../interfaces/imessage.interface'
import type { IRoomProfile } from '../interfaces/iuser.profile.interface'

export function useWebSocket(url: string) {
  const socket = ref<WebSocket | null>(null)
  const messages = ref<IMessage[]>([])
  const roomProfile = ref<IRoomProfile | null>(null)
  const messageInput = ref<string>('')
  const isConnected = ref<boolean>(false)
  const connectionStatus = ref('Disconnected')
  const error = ref<Event | null>(null)

  const { token, getAuthUser, getProfile, isTokenated } = useAuth()

  const connect = () => {
    socket.value = new WebSocket(url)
    // if (!getAuthUser.value){
    loadProfile()
    // }

    socket.value.onopen = () => {
      // console.log('>>> 2. socket: ', JSON.stringify(socket));
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        const msg = {
          event: 'authenticate',
          data: {
            token: token?.value || '',
          },
        }
        socket.value.send(JSON.stringify(msg))
        isConnected.value = true
        connectionStatus.value = 'Connected'
      }
    }

    socket.value.onmessage = (event) => {
      if (event.data) {
        const msg: IMessage = {
          event: 'None',
          authUserId: getAuthUser.value?.userId || 0,
          senderId: 0,
          senderName: '',
          contentGroupId: 0,
          message: '',
        }

        const data = JSON.parse(event.data)
        switch (data.event) {
          case 'newMessage':
            msg.event = data.event
            msg.message = data.data.message
            msg.senderId = data.data.senderId
            msg.senderName = data.data.senderName
            msg.contentGroupId = data.data.sendToGroup
            messages.value.push(msg)
            break
          case 'roomProfile':
            if (data.data.message) {
              roomProfile.value = data.data.message
            }
            break
          case 'groupContent':
            // console.log('>>> data: ', data)
            messages.value = [];
            if (data.data?.message?.length) {
              for (const mes of data.data?.message || []) {
                msg.event = data.event
                msg.message = mes.message
                msg.senderId = mes.userid
                msg.senderName = mes.username
                msg.contentGroupId = mes.groupid
                msg.contentGroupName = mes.groupname
                messages.value.push(msg);
              }
              console.log('>>> msg: ', messages.value)
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
      socket.value.send(JSON.stringify(msg))
      return true
    }
    const sentErr: IMessage = {
      event: 'errorMessage',
      authUserId: getAuthUser.value?.userId || 0,
      senderId: getAuthUser.value?.userId || 0,
      senderName: getAuthUser.value?.fio,
      message: 'Failed to send - not connected',
    }
    messages.value.push(sentErr)
    return false
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
      // console.log('>>> msg: ', msg);
      socket.value.send(JSON.stringify(msg))
      return true
    }
    const sentErr: IMessage = {
      event: 'errorMessage',
      authUserId: getAuthUser.value?.userId || 0,
      message: 'Failed to send - not connected',
    }
    messages.value.push(sentErr)
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
      const sentMsg: IMessage = {
        event: msg.event,
        authUserId: getAuthUser.value?.userId || 0,
        senderId: getAuthUser.value?.userId || 0,
        senderName: getAuthUser.value?.fio,
        message: 'getRoomProfile',
      }
      messages.value.push(sentMsg)
      messageInput.value = ''
      return true
    }
    const sentErr: IMessage = {
      event: 'errorMessage',
      authUserId: getAuthUser.value?.userId || 0,
      senderId: getAuthUser.value?.userId || 0,
      senderName: getAuthUser.value?.fio,
      message: 'Failed to send - not connected',
    }
    messages.value.push(sentErr)
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
        await getProfile()
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
