<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, watchEffect, computed } from 'vue';
import type { INewGroup, IGroupProfile, IActiveUser  } from '../interfaces/messendo.interface';
import type { IAuthUser } from '@/module/auth/interfaces/auth.interfaces';

interface Props {
  roomId: number;
  groupProfile: IGroupProfile | null;
  availableUsers: IActiveUser[];
  currentUser: IAuthUser | null;
}

interface Option {
  key: number;
  label: string;
  disabled: boolean;
}

const props = defineProps<Props>();
const visibleDialog = ref(false);
const groupFormRef = ref<FormInstance>();
const activeTab = ref('basic')

const emit = defineEmits<{(e: 'submit', payload: INewGroup): void}>();

const groupParams = reactive<INewGroup>({
  roomId: 0,
  nameGroup: '',
  typeGroup: 'private',
  userId: 0,
  users: [],
  moderators: [],
  active: '1',
  readOnly: '0',
});

watchEffect(() => {
  groupParams.roomId = props.roomId || 0;
  groupParams.nameGroup = `${props.currentUser?.fio || ''} - Group`;
  groupParams.userId = props.currentUser?.userId || 0;
  groupParams.moderators = [props.currentUser?.userId || 0];
  groupParams.users = [props.currentUser?.userId || 0];
});

const avUsers = computed<Option[]>(() => {
  return props.availableUsers.map(usr => ({
    key: usr.id,
    label: usr.fio,
    disabled: false,  //usr.id === props.currentUser?.userId,
  }));
});
const modeUsers = computed<Option[]>(() => {
  return props.availableUsers.map(usr => ({
    key: usr.id,
    label: usr.fio,
    disabled: false,
  }));
});

const rules = reactive<FormRules<INewGroup>>({
  nameGroup: [
    { required: true, message: 'Введите наименование группы', trigger: 'blur' },
    { min: 3, max: 64, message: 'Длинна названия должна быть от 3 до 64 символов', trigger: 'blur' },
  ],
  users: [],
});


const openForm = () => {
  visibleDialog.value = true;
};

const handleClose = (done: any) => {
  done();
  visibleDialog.value = false;
};
const closeForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      visibleDialog.value = false;
    }
  });
};

const submitForm = () => {
  emit('submit', groupParams);
  visibleDialog.value = false;
};

// const submitForm = async (formEl: FormInstance | undefined) => {
//   // const { name, pass } = ruleForm;
//   if (!formEl) return;
//   formEl.validate(async (valid) => {
//     if (valid) {
//     } else {
//       console.log('error submit!');
//     }
//     visibleDialog.value = false;
//   });
// };

defineExpose({ openForm, closeForm });
</script>

<template>
  <el-dialog
    v-model="visibleDialog"
    title="Новая группа пользователя"
    width="26%"
    :before-close="handleClose"
  >
    <el-form
      ref="groupFormRef"
      class="dallet-ruleForm"
      :model="groupParams"
      :rules="rules"
      status-icon
      label-width="auto"
      style="max-width: 600px; width: 100%"
      label-position="left"
      size="default"
    >
      <el-tabs
        v-model="activeTab"
        class="group-tabs"
      >
        <el-form-item label="Владелец группы">
          <span class="text-gray-500">{{ props.currentUser?.fio || '' }} ({{ groupParams.userId }}) room: {{ groupParams.roomId }}</span>
        </el-form-item>
        <el-tab-pane label="Основные" name="basic">

          <el-form-item label="Название группы" prop="nameGroup">
            <el-input v-model="groupParams.nameGroup" />
          </el-form-item>
          <el-form-item label="Тип" prop="typeGroup">
            <el-radio-group v-model="groupParams.typeGroup">
              <el-radio value="public">public</el-radio>
              <el-radio value="private">private</el-radio>
              <el-radio value="hidden">hidden</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Активный">
            <el-switch
              v-model="groupParams.active"
              active-text="Активный"
              inactive-text="Удалён"
              active-value='1'
              inactive-value='0'
              />
          </el-form-item>
          <el-form-item label="Только чтение" prop="readOnly">
            <el-switch
              v-model="groupParams.readOnly"
              active-value='1'
              inactive-value='0'
              active-text="Читает"
              inactive-text="Читает/Пишет"
            />
          </el-form-item>

        </el-tab-pane>
        <el-tab-pane label="Участники группы" name="users">
          <el-form-item class="transfer-item" label="Участники группы">
            <el-transfer
              v-model="groupParams.users"
              filterable
              :data="avUsers"
              :titles="['Доступные', 'Участники']"
              :right-default-checked="[props.currentUser?.userId]"
            />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="Модераторы" name="moderators">
          <el-form-item class="transfer-item" label="Модераторы группы">
            <el-transfer
              v-model="groupParams.moderators"
              filterable
              :data="modeUsers"
              :titles="['Доступные', 'Участники']"
              :right-default-checked="[props.currentUser?.userId]"
            />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-form-item>
        <el-button
          type="primary"
          @click.stop="closeForm(groupFormRef)"
        >Выход</el-button>
        <el-button
          type="primary"
          @click.stop="submitForm(groupFormRef)"
        >Выполнить</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="scss">
.transfer-item {
  display: flow;
}
</style>
