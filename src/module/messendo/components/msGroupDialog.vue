<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, watchEffect, computed } from 'vue';
import type { IRoomProfile, INewGroup, IGroupProfile, IActiveUser  } from '../interfaces/messendo.interface';
import type { IAuthUser } from '@/module/auth/interfaces/auth.interfaces';

interface Props {
  roomProfile: IRoomProfile | null
  groupProfile: IGroupProfile | null;
  availableUsers: IActiveUser[];
  currentUser: IAuthUser | null;
}

interface Option {
  key: number;
  label: string;
  disabled: boolean;
}
interface IOptionParams {
  namesOfGroups: string[];
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

const optionParams = reactive<IOptionParams>({
  namesOfGroups: [],
})

watchEffect(() => {
  groupParams.roomId = props.roomProfile?.id || 0;
  groupParams.nameGroup = `${props.currentUser?.fio || ''} - Group`;
  groupParams.userId = props.currentUser?.userId || 0;
  groupParams.moderators = [props.currentUser?.userId || 0];
  groupParams.users = [props.currentUser?.userId || 0];
  optionParams.namesOfGroups = props.roomProfile?.groups?.map(el => el.nameGroup.trim()) || [];
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

const validateUsers = (rule: any, value: any, callback: any) => {
  if (value.length <= 1) {
    activeTab.value = 'users';
    callback(new Error('Необходимо ещё добавить участников группы'))
  } else {
    callback()
  }
}
const validateNameGroup = (rule: any, value: string, callback: any) => {
  // console.log(`>>> optionParams.namesOfGroups: `, optionParams.namesOfGroups);
  // console.log(`>>> validateNameGroup value: `, value);
  if (value === '') {
    activeTab.value = 'basic';
    callback(new Error('Необходимо добавить название группы'))
  } else if (value.length < 3 || value.length > 63) {
    activeTab.value = 'basic';
    callback(new Error('Длинна имени должна быть от 3 до 63 символов'))
  } else if (optionParams.namesOfGroups.includes(value.trim()) ) {
      activeTab.value = 'basic';
      callback(new Error('Такое имя группы уже имеется. Придумайте другое'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<INewGroup>>({
  nameGroup: [
    { validator: validateNameGroup, trigger: 'blur' }
  ],
  users: [
    { validator: validateUsers, trigger: 'blur' }
  ],
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

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      emit('submit', groupParams);
      visibleDialog.value = false;
    } else {
      console.log('error submit!');
    }
  });
};

defineExpose({ openForm, closeForm });
</script>

<template>
  <el-dialog
    v-model="visibleDialog"
    title="Новая группа пользователя"
    width="40%"
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
            <el-input v-model="groupParams.nameGroup" :value="groupParams.nameGroup"/>
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
          <el-form-item label="Только чтение">
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
          <el-form-item class="transfer-item" label="Участники группы" prop="users">
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
.el-form {
  display: flex;
  flex-direction: column;

  .el-form-item:last-child {
    margin-top: auto; /* прижмет к низу */
    align-self: flex-end; /* выравнивание по правому краю */
  }
}
.transfer-item{
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
