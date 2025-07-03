<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuth } from './auth/composable/useAuth';
import { useRouter } from "vue-router";

let IsDealogVisible = true;
const ruleFormRef = ref<FormInstance>()
const { getAccessToken, isTokenated } = useAuth();
const router = useRouter();

const validateName = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Введите логин или email (> 4 букв)'))
  } else if ([...value].length <= 3) {
    callback(new Error(" Логин должен быть больше 4 букв"))
  } else {
      if (!ruleFormRef.value) return;
      // ruleFormRef.value.validateField('name');
  }
  callback()
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Введите пароль'))
  }else if ([...value].length <= 3) {
    callback(new Error("Пароль должен быть больше 4 букв"))
  } else {
    if (!ruleFormRef.value) return;
      // ruleFormRef.value.validateField('pass');
  }
    callback()
}

const ruleForm = reactive({
  name: '',
  pass: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
  name: [{ validator: validateName, trigger: 'blur' }],
  pass: [{ validator: validatePass, trigger: 'blur' }],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  const  { name, pass } = ruleForm;
  if (!formEl) return
  formEl.validate(async(valid) => {
    if (valid) {
      //  console.log('>>> -1 isTokenated.value: ', isTokenated.value);
      await getAccessToken(name, pass);
      // console.log('>>> 1 isTokenated.value: ', isTokenated.value);
      if (isTokenated) {
        // console.log('>>> 2 isTokenated.value: ', isTokenated.value);
        router.push('/').catch(() => {})
      }
    } else {
      console.log('error submit!')
    }
  })
}
const handleClose = (done: any) => {
  done();
}
onMounted(() => {
  IsDealogVisible = true;
})
</script>

<template>
    <el-dialog
    v-model="IsDealogVisible"
    title="Регистрация"
    width="30%"
    :before-close="handleClose"
  >
    <el-form
      ref="ruleFormRef"
      style="max-width: 600px; width: 100%"
      :model="ruleForm"
      status-icon
      :rules="rules"
      label-width="auto"
      class="dallet-ruleForm"
    >
      <el-form-item  prop="name">
        <el-input v-model="ruleForm.name" type="text" autocomplete="off" placeholder="Логин или eMail" :prefix-icon="User"/>
      </el-form-item>
      <el-form-item prop="pass">
        <el-input v-model="ruleForm.pass" type="password" autocomplete="off" placeholder="Пароль" show-password :prefix-icon="Lock"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.stop="submitForm(ruleFormRef)">Вход</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .login-container {
    height: 100vh;
    background-size: cover;

    .title {
      font-size: 54px;
      font-weight: 500;
      color: rgba(14, 18, 26, 1);
    }

    .title-tips {
      margin-top: 29px;
      font-size: 26px;
      font-weight: 400;
      color: rgba(14, 18, 26, 1);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .login-btn {
      display: inherit;
      width: 220px;
      height: 60px;
      margin-top: 5px;
      border: 0;

      &:hover {
        opacity: 0.9;
      }
    }

    .login-form {
      position: relative;
      max-width: 100%;
      margin: calc((100vh - 425px) / 2) 10% 10%;
      overflow: hidden;
      border-color: #454545;

      .forget-password {
        width: 100%;
        margin-top: 40px;
        text-align: left;

        .forget-pass {
          width: 129px;
          height: 19px;
          font-size: 20px;
          font-weight: 400;
          color: rgba(92, 102, 240, 1);
        }
      }
    }

    .tips {
      margin-bottom: 10px;
      font-size: 14px;
      color: #fff;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .title-container {
      position: relative;

      .title {
        margin: 0 auto 40px auto;
        font-size: 34px;
        font-weight: bold;
        color: #409eff;
        text-align: center;
      }
    }

    .svg-container {
      position: absolute;
      top: 14px;
      left: 15px;
      z-index: 999;
      font-size: 16px;
      color: #d7dee3;
      cursor: pointer;
      user-select: none;
    }

    .show-password {
      position: absolute;
      top: 14px;
      right: 25px;
      font-size: 16px;
      color: #d7dee3;
      cursor: pointer;
      user-select: none;
    }

    :v-deep {
      .el-form-item {
        padding-right: 0;
        margin: 20px 0;
        color: #454545;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 2px;

        &__content {
          min-height: 32px;
          line-height: 32px;
        }

        &__error {
          position: absolute;
          top: 100%;
          left: 18px;
          font-size: 12px;
          line-height: 18px;
          color: #f34d37;
        }
      }

      .el-input {
        box-sizing: border-box;

        input {
          height: 58px;
          padding-left: 45px;
          font-size: 14px;
          line-height: 58px;
          color: #606266;
          background: #f6f4fc;
          border: 0;
          caret-color: #606266;
        }
      }
    }
  }
</style>
