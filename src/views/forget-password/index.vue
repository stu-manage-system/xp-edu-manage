<template>
  <div class="login register">
    <div class="left-wrap">
      <div class="logo">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1 class="title">{{ systemName }}</h1>
      </div>
      <img class="left-bg" src="@imgs/login/lf_bg.png" />
      <img class="left-img" src="@imgs/login/lf_icon.svg" />
    </div>
    <div class="right-wrap">
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ $t('forgetPassword.subTitle') }}</p>
          <div class="input-wrap">
            <span class="input-label" v-if="showInputLabel">账号</span>
            <el-input
              :placeholder="$t('forgetPassword.placeholder')"
              size="large"
              v-model.trim="username"
            />
          </div>

          <div style="margin-top: 15px">
            <el-button
              class="login-btn"
              size="large"
              type="primary"
              @click="register"
              :loading="loading"
            >
              {{ $t('forgetPassword.submitBtnText') }}
            </el-button>
          </div>

          <div style="margin-top: 15px">
            <el-button style="width: 100%" size="large" plain @click="toLogin">
              {{ $t('forgetPassword.backBtnText') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { SystemInfo } from '@/config/setting'

  const router = useRouter()
  const showInputLabel = ref(false)

  const systemName = SystemInfo.name
  const username = ref('')
  const loading = ref(false)

  const register = async () => {}

  const toLogin = () => {
    router.push('/login')
  }
</script>

<style lang="scss" scoped>
  @use '../login/index';
</style>
