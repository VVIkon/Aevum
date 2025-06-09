<script setup lang="ts">
import { Message } from '@element-plus/icons-vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useWebSocket } from '@/module/messendo/composable/useWebSocket'
import { ROUTES_PATHS } from '@/constants'

const { getAuthUser, messages, messageInput, connectionStatus, connect, send, disconnect } = useWebSocket(ROUTES_PATHS.WEB_SOCKET)

const sendMessage = () => {
  if (send()) messageInput.value = ''
}

onMounted(() => {
  connect()
})
onBeforeUnmount(() => {
  disconnect()
})
</script>
<template>
  <div class="messendo-container">
    <div class="messendo-form">
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="user-name">
            {{ getAuthUser?.fio || '-' }}
          </span>
        </div>
        <div class="panel-content">
          <el-scrollbar>
            <div class="scroll-content">
              <p v-for="item in 20" :key="'left-' + item">Left panel item {{ item }}</p>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="panel right-panel">
        <div class="panel-header">
         <span class="connection-status">Статус соединения: {{ connectionStatus }}</span>
        </div>
        <div class="panel-content">
          <div class="scroll-box">
            <el-scrollbar>
              <div v-for="(message, index) in messages" :key="index">
                <div v-if="message.event === 'sendMessage'" class="msg right-msg">
                  {{ `>>> ${message.senderName}: ${message.message}` }}
                </div>
                <div v-if="message.event === 'newMessage'" class="msg left-msg">
                  {{ `<<< ${message.senderName}: ${message.message}` }}
                </div>
                <div v-if="message.event === 'errorMessage'" class="msg error-msg">
                  {{ `!!! Error: ${message.message}` }}
                </div>
              </div>
            </el-scrollbar>
          </div>
          <div class="input-group">
            <el-input class="input-msg" v-model="messageInput" type="textarea" :rows="2" placeholder="Please type" />
            <el-button class="send-btn" type="primary" :icon="Message" @click="sendMessage" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.messendo-container {
  display: block;
  width: 100%;
  /* height: 80vh; */
  /* gap: 20px; */
}

.panel {
  /* flex: 1; */
  background-color: white;
  border-radius: 4px;
  border-color: black;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.scroll-content {
  padding: 10px;
}

.messendo-form {
  display: flex;
}
.scroll-box {
  height: 74vh;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.msg {
  font-size: 11px;
}
.right-msg {
  text-align: right;
  color: blue;
  margin-right: 5px;
}
.left-msg {
  text-align: left;
  color: green;
  margin-left: 5px;
}
.error-msg {
  text-align: center;
  color: red;
}
.connection-status {
  display: inline;
  text-align: right;
  color: black;
  margin-right: 5px;
}
.left-panel {
  display: flex;
  width: 300px;
}

.right-panel {
  display: flex;
  width: 100%;
}
.input-group{
  margin-top: 5px;;
}
.send-btn {
  position: relative;
  width: 65px;
  margin-left: 5px;
  height: 50px;
  z-index: 1;
}
.input-msg {
  width: 90%;
}
</style>
