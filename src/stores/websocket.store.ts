import { defineStore } from 'pinia';
// import { ref, computed } from 'vue';
import { useAuth } from '@/module/auth/composable/useAuth';
import type { IMessage } from '@/module/messendo/interfaces/imessage.interface';
import type { IRoomProfile } from '@/module/messendo/interfaces/iuser.profile.interface';

interface WebSocketConnection {
  id: number;
  socket: WebSocket | null;
  roomProfile: IRoomProfile | null;
  profileStatus: number; // 0-не было загрузки, 1-нет профиля, 2-профиль загружен
  isConnected: boolean;
  connectionStatus: 'Disconnected'|'Connecting'|'Connected'|'Error';
  error: Event | null;
  messageInput: string;
}

interface State {
  connections: Record<number, WebSocketConnection>;
  messages: IMessage[];
}

export const useWebSocketStore = defineStore('websocket', {
  state: (): State => ({
    connections: {},
    messages: [],
  }),

  actions: {
    createConnection(id: number, url: string) {
      if (this.connections[id]) {
        console.log(`Connection ${id} already exists`);
        return;
      }

      this.connections[id] = {
        id,
        socket: null,
        // messages: [],
        roomProfile: null,
        profileStatus: 0,
        isConnected: false,
        connectionStatus: 'Disconnected',
        error: null,
        messageInput: '',
      };

      this.connect(id, url);
    },

    connect(id: number, url: string) {
      const connection = this.connections[id];
      if (!connection) {
        console.error(`Connection ${id} not found`);
        return;
      }

      if (connection.socket && connection.socket.readyState === WebSocket.OPEN) {
        console.log(`Connection ${id} already connected`);
        return;
      }

      const { token } = useAuth();
      connection.socket = new WebSocket(url);
      connection.isConnected = false;
      connection.connectionStatus = 'Connecting';

      connection.socket.onopen = async () => {
        // console.log(`>>> connection.socket: `, connection)
        if (connection.socket && connection.socket.readyState === WebSocket.OPEN) {
          const msg = {
            event: 'authenticate',
            data: {
              token: token?.value || '',
            },
          };
          connection.socket.send(JSON.stringify(msg));
          connection.isConnected = true;
          connection.connectionStatus = 'Connected';
          await this.loadCurrentUserProfile();
        }
      };

      connection.socket.onmessage = (event) => {
        if (event.data) {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(id, data);
        }
      };

      connection.socket.onerror = (err) => {
        connection.error = err;
        connection.isConnected = false;
        connection.connectionStatus = 'Error';
      };

      connection.socket.onclose = () => {
        connection.isConnected = false;
        connection.connectionStatus = 'Disconnected';
      };
    },

    notifyForGroup(id: number, groupId: number, senderId: number, flag: boolean){
      const connection = this.connections[id];
      const groups = connection?.roomProfile?.groups || [];
      if (groups.length) {
        const ind = groups.findIndex(el=> el.id === groupId)
        groups[ind].notifycation = { hasMessage: flag, senderId: senderId};
      }
    },

    handleIncomingMessage(id: number, data: any) {
      console.log(`>>> handleIncomingMessage id: `, id);

      const connection = this.connections[id];
      if (!connection) return;

      switch (data.event) {
        case 'authenticated':
          break;
        case 'newMessage':
          const mesTmp = {
            event: data.event,
            message: data.data.message,
            senderId: data.data.senderId,
            senderName: data.data.senderName,
            contentGroupId: data.data.sendToGroup,
          };
          console.log(`>>> newMessage: `, mesTmp)
          this.messages.push(mesTmp);
          this.notifyForGroup(id, data.data.sendToGroup, data.data.senderId, true);
          break;
        case 'roomProfile':
          connection.profileStatus = !data.data.message ? 1 : 2;
          if (data.data.message) {
            connection.profileStatus = 2;
            connection.roomProfile = data.data.message;
          }
          break;
        case 'groupContent':
          this.messages = [];
          if (data.data?.message?.length) {
            for (const mes of data.data?.message || []) {
              const mesTmp = {
                event: data.event,
                message: mes.message,
                senderId: mes.userid,
                senderName: mes.username,
                contentGroupId: mes.groupid,
                contentGroupName: mes.groupname,
              };
              this.messages.push(mesTmp);
            }
          }
          break;
        case 'newRoom':
          this.messages = [];
          if (data.data?.message) {

          }
          break;
        default:
          break;
      }
    },
disconnect(id: number) {
      const connection = this.connections[id];
      if (!connection || !connection.socket) return;

      connection.socket.close();
      connection.isConnected = false;
      connection.connectionStatus = 'Disconnected';
    },

    removeConnection(id: number) {
      this.disconnect(id);
      delete this.connections[id];
    },
    /**
     * Загрузка профиля авторизованного профиля
     * (восстановление профиля после смены страницы)
     */
    async loadCurrentUserProfile() {
      const { isTokenated, getAuthUser, getCurrUserProfile } = useAuth();
      try {
        if (isTokenated.value && !getAuthUser.value) {
          await getCurrUserProfile();
        }
      } catch (err) {
        console.error(err);
      }
    },
    /**
     * Ожидатель соединения
     * @param connection
     * @param msg
     * @returns
     */
    sendWhenReady(connection: WebSocketConnection, msg: object) {
      return new Promise((resolve, reject) => {
        if (connection?.socket?.readyState === WebSocket.OPEN) {
          connection?.socket?.send(JSON.stringify(msg));
          resolve(true);
        } else {
          const interval = setInterval(() => {
            if (connection?.socket?.readyState === WebSocket.OPEN) {
              clearInterval(interval);
              connection.socket.send(JSON.stringify(msg));
              resolve(true);
            } else if (connection?.socket?.readyState === WebSocket.CLOSED) {
              clearInterval(interval);
              reject(new Error('Connection closed'));
            }
          }, 100);
        }
      });
    },
    /**
     *  отпревка сообщений
     * @param id
     * @param message
     * @param sendToGroup
     * @param groupName
     * @returns
     */
    sendMessage(id: number, message: string, sendToGroup: number, groupName: string) {
      const connection = this.connections[id];
      if (!connection || !connection.socket || connection.socket.readyState !== WebSocket.OPEN) {
        return false;
      }

      const { token, getAuthUser } = useAuth();
      if (!getAuthUser?.value) {
        return false;
      }
      const msg = {
        event: 'sendMessage',
        data: {
          token: token?.value || '',
          message,
          sendToGroup,
          groupName,
          senderId: getAuthUser.value.userId,
          senderName: getAuthUser.value.fio,
        },
      };
      this.sendWhenReady(connection, msg);
      this.notifyForGroup(id, sendToGroup, getAuthUser.value.userId,false);
      return true;
    },
    /**
     * Получение всех сохранённых сообщений данной группы участников
     * @param id
     * @param groupId
     * @returns
     */
    getGroupContent(id: number, groupId: number) {
      const connection = this.connections[id];
      if (!connection || !connection.socket || connection.socket.readyState !== WebSocket.OPEN) {
        return false;
      }

      const { token, getAuthUser } = useAuth();
      const msg = {
        event: 'getGroupContent',
        data: {
          token: token?.value || '',
          message: 'getGroupContent',
          groupId,
          authUserId: getAuthUser.value?.userId,
        },
      };
      this.sendWhenReady(connection, msg);
      return true;
    },
    /**
     * Загрузка профиля авторизированного пользователя
     * @param id
     * @returns
     */
    getRoomProfile(id: number) {
      const connection = this.connections[id];
      if (connection?.socket) {
          const { token } = useAuth();
          const msg = {
            event: 'getRoomProfile',
            data: {
              token: token?.value || '',
              message: 'getRoomProfile',
            },
          };
        this.sendWhenReady(connection, msg);
        return true;
      }
      return false;
    },
    createNewRoom(id: number) {
      const connection = this.connections[id];
      if (connection?.socket) {
          const { token } = useAuth();
          const msg = {
            event: 'createNewRoom',
            data: {
              token: token?.value || '',
              message: 'createNewRoom',
            },
          };
        this.sendWhenReady(connection, msg);
        return true;
      }
      return false;
    },


  },

  getters: {
    getConnection: (state) => {
      return (id: number) => state.connections[id];
    },
    getMessages: (state) => {
      return () => state.messages;
    },
  },
});
