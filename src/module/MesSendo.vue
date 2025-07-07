<script setup lang="ts">
import { Message, Edit, User } from '@element-plus/icons-vue';
import { ref, onMounted, watch, nextTick } from 'vue';
import { ElMessageBox, ElScrollbar } from 'element-plus';
import type { IGroupProfile, INewGroup } from './messendo/interfaces/messendo.interface';
import { useWebSocket } from '@/module/messendo/composable/useWebSocket';
import { ROUTES_PATHS } from '@/constants';
import msGroupDialog from '@/module/messendo/components/msGroupDialog.vue';

type ScrollbarInstance = InstanceType<typeof ElScrollbar> & {
  wrapRef: HTMLDivElement;
};
const scrollbarRef = ref<ScrollbarInstance | null>(null);
const selectedGroupId = ref(0);
const selectedGroupProfile = ref<IGroupProfile | null>(null);
const messageInput = ref('');
const groupDialog = ref<InstanceType<typeof msGroupDialog> | null>(null);

const {
  connection,
  // isInitialized,
  // initializationError,
  // connectionId,
  messages,
  isConnected,
  getUser,
  init,
  sendMessage,
  getRoomProfile,
  getGroupContent,
  // createNewRoom,
  createNewGroup
} = useWebSocket(ROUTES_PATHS.WEB_SOCKET, selectedGroupId.value);

onMounted(async () => {
  try {
    await init();
    getRoomProfile();
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
  }
});

const createGroup = () => {
  groupDialog.value?.openForm();
};

const handleNewGroupSubmit = (payload: INewGroup) => {
  payload.active = Number(payload.active);
  payload.readOnly = Number(payload.readOnly);
  createNewGroup(payload);
};

const sendMsg = () => {
  if (!isConnected || Number(selectedGroupId.value) === 0) {
    ElMessageBox.alert('Нужно выбрать группу', 'Незадача', { confirmButtonText: 'OK' });
    return;
  }
  sendMessage(messageInput.value, Number(selectedGroupId.value), selectedGroupProfile.value?.nameGroup || '');
  messageInput.value = '';
};

const handleGroupChange = (selectedId: number) => {
  selectedGroupProfile.value = connection?.value?.roomProfile?.groups?.find((group) => group.id === selectedId) || null;
  if (isConnected && selectedGroupProfile.value) {
    getGroupContent(selectedGroupId.value);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollbarRef.value?.wrapRef) {
      scrollbarRef.value.wrapRef.scrollTop = scrollbarRef.value.wrapRef.scrollHeight;
    }
  });
};

watch(messages, () => scrollToBottom(), { deep: true });
// watch(connection, () => console.log(`>>> connection groups: `, connection?.value || ''), { deep: true });

</script>
<template>
  <div class="messendo-container">
    <div class="messendo-form">
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="user-name">
            {{ getUser?.value?.fio || '-' }}
          </span>
        </div>
        <div class="panel-content">
          <el-scrollbar style="height: 92%">
            <div class="scroll-user">
              <el-radio-group v-if="connection?.profileStatus === 2" v-model="selectedGroupId" @change="handleGroupChange">
                <el-radio v-for="(groupProfile, index) in connection?.roomProfile?.groups || []" :key="index" :value="groupProfile.id" :name="groupProfile.nameGroup" size="small">
                  {{ groupProfile.users?.length === 2 ? groupProfile.users.filter((el) => el.id != getUser?.value?.userId || 0)[0]?.fio || '' : `${groupProfile.nameGroup}` }}
                  <el-badge v-show="(groupProfile.notification?.hasMessage && groupProfile.notification?.senderId !== getUser?.value?.userId) || 0" is-dot class="badge-item"></el-badge>
                  <!-- <el-tooltip class="box-item" effect="dark" placement="top" :content="`Gr: ${groupProfile.id} (${groupProfile.users?.map((el) => `${el.fio}[${el.id}]`).join(', ')})`">
                    </el-tooltip> -->
                </el-radio>
              </el-radio-group>
            </div>
          </el-scrollbar>
          <div class="panel-error">
            <span v-if="connection?.profileStatus === 1" class="profile-not-load">Активный профиль не найден</span>
          </div>
          <div class="panel-tool">
            <!-- <el-button class="add-group" type="primary" :icon="House" @click="createRoom" /> -->
            <el-button class="add-group" type="primary" :icon="User" @click="createGroup" />
            <el-button class="edit-group" type="primary" :icon="Edit" />
          </div>
        </div>
      </div>
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="connection-status">Статус соединения: {{ connection?.connectionStatus || 'Error' }}</span>
        </div>
        <div class="panel-content">
          <div class="scroll-msg">
            <el-scrollbar ref="scrollbarRef">
              <div v-for="(message, index) in messages || []" :key="index">
                <template v-if="message.contentGroupId === selectedGroupId">
                  <div v-if="['groupContent', 'newMessage'].includes(message.event) && Number(message.senderId) === Number(getUser?.value?.userId || 0)" class="msg right-msg">
                    <div class="sender-name">{{ message.senderName }}</div>
                    <div class="sender-message" v-html="message.message"></div>
                    <div class="sender-time">{{ message.dateCreate }}</div>
                  </div>
                  <div v-if="['groupContent', 'newMessage'].includes(message.event) && message.senderId !== (getUser?.value?.userId || 0)" class="msg left-msg">
                    <div class="sender-name">{{ message.senderName }}</div>
                    <div class="sender-message" v-html="message.message"></div>
                    <div class="sender-time">{{ message.dateCreate }}</div>
                  </div>
                  <div v-if="['errorMessage'].includes(message.event)" class="msg error-msg">
                    {{ `!!! Error: ${message.message}` }}
                  </div>
                </template>
              </div>
            </el-scrollbar>
          </div>
          <div class="input-group">
            <el-input class="input-msg" v-model="messageInput" type="textarea" :rows="2" placeholder="Please type" />
            <el-button class="send-btn" type="primary" :icon="Message" @click="sendMsg" />
          </div>
        </div>
      </div>
    </div>
    <msGroupDialog
      ref="groupDialog"
      :roomProfile="connection?.roomProfile || null"
      :groupProfile="selectedGroupProfile || null"
      :availableUsers="connection?.roomProfile?.users || []"
      :currentUser="getUser.value"
      @submit="handleNewGroupSubmit"
    ></msGroupDialog>
  </div>
</template>

<style lang="scss" scoped>
.messendo-container {
  display: block;
  width: 100%;
  /* height: 80vh; */
  gap: 20px;

  .messendo-form {
    display: flex;

    .panel {
      display: flex;
      color: $text-color;
      background-color: $background-color;
      border: 1px;
      border-style: solid;
      border-radius: 4px;
      border-color: #dcdfe6;
      padding: 10px;
      flex-direction: column;
    }
    .left-panel {
      display: flex;
      width: 300px;
      background-color: $left-panel-color;
    }

    .right-panel {
      display: flex;
      width: 100%;
      background-color: $left-panel-color;
    }

    .panel-header {
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: bold;
    }
  }
}
.connection-status {
  display: inline;
  text-align: right;
  color: black;
  margin-right: 5px;
}
.panel-content {
  flex: 1;
  overflow: hidden;

  .scroll-user {
    padding: 10px;
    height: 50vh;
  }
  .panel-tool {
    padding: 5px;
  }
  .scroll-msg {
    background-color: $background-color;
    height: 50vh;
    border: 1px solid #bccef7;
    border-radius: 6px;

    .msg {
      font-size: 11px;
      background-color: $message-color;
      color: rgb(70, 28, 4);
      margin: 5px;
      padding: 3px;
      width: 96%;
      border: 1px solid #a79779;
      border-radius: 6px;
    }
    .right-msg {
      text-align: left;
      color: blue;
      margin: 0px 20px;
    }
    .left-msg {
      text-align: left;
      color: green;
      margin: 0, 5px;
    }
    .error-msg {
      text-align: center;
      color: red;
    }
    .sender-name {
      text-align: left;
      background-color: $header-message-color;
    }
    .sender-message {
      color: rgb(20, 19, 12);
      padding: 3px 5px;
    }
    .sender-time {
      text-align: right;
      color: rgb(161 158 138);
    }
  }

  .input-group {
    margin-top: 5px;

    .send-btn {
      position: relative;
      width: 19%;
      margin-left: 3px;
      height: 50px;
      z-index: 1;
    }
    .input-msg {
      width: 80%;
    }
  }
}
.user-name {
  cursor: pointer;
}
.profile-not-load {
  text-align: left;
  color: red;
  margin-left: 5px;
  font-size: 10px;
}
</style>
