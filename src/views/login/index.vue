<template>
  <div class="login">
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
      <!-- <div class="language-wrap">
        <el-dropdown @command="changeLanguage">
          <div class="btn language-btn">
            <i class="iconfont-sys">&#xe611;</i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh">
                <span class="menu-txt">中文</span>
              </el-dropdown-item>
              <el-dropdown-item command="en">
                <span class="menu-txt">English</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div> -->
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t("login.title") }}</h3>
          <p class="sub-title">{{ $t("login.subTitle") }}</p>
          <div class="input-wrap">
            <el-input
              :placeholder="$t('login.placeholder[0]')"
              size="large"
              v-model.trim="account"
            />
          </div>
          <div class="input-wrap">
            <el-input
              :placeholder="$t('login.placeholder[1]')"
              size="large"
              v-model.trim="password"
              type="password"
              radius="8px"
              autocomplete="off"
              @keyup.enter="login"
            />
          </div>

          <div class="forget-password">
            <el-checkbox v-model="rememberPassword">{{
              $t("login.rememberPwd")
            }}</el-checkbox>
            <router-link to="/forget-password">{{
              $t("login.forgetPwd")
            }}</router-link>
          </div>

          <div style="margin-top: 30px">
            <el-button
              class="login-btn"
              size="large"
              type="primary"
              @click="login"
              :loading="loading"
            >
              {{ $t("login.btnText") }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ApiService } from "@/api/apiApi";
import { menuService } from "@/api/menuApi";
import { SystemInfo } from "@/config/setting";
import { LanguageEnum } from "@/enums/appEnum";
import { HOME_PAGE } from "@/router";
import { useMenuStore } from "@/store/modules/menu";
import { useUserStore } from "@/store/modules/user";
import { ApiStatus } from "@/utils/http/status";
import { getGreeting } from "@/utils/utils";
import CryptoJS from "crypto-js";
import { ElMessage, ElNotification } from "element-plus";
import { jwtDecode } from "jwt-decode";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const menuStore = useMenuStore();
const router = useRouter();

const systemName = SystemInfo.name;
const account = ref(SystemInfo.login.account);
const password = ref(SystemInfo.login.password);
const loading = ref(false);
const rememberPassword = ref(true);

const login = async () => {
  if (!account.value) {
    ElMessage.error("请输入账号");
    return;
  }

  if (!password.value) {
    ElMessage.error("请输入密码");
    return;
  }

  // if (!isPassing.value) {
  //   isClickPass.value = true
  //   return
  // }

  loading.value = true;

  const params = {
    userTel: account.value,
    password: CryptoJS.MD5(password.value).toString()
  };

  try {
    // 封装 axios 登录，替换掉 .env 中的 VITE_API_URL 为你的 api 地址
    const res = await ApiService.getApiList(params);
    if (res.code === ApiStatus.success) {
      const data = jwtDecode(res.data);
      console.log("data", data);
      if (data) {
        const user = { ...JSON.parse((data as any).userInfo) };
        userStore.setToken(res.data);
        userStore.setUserInfo(user);
        userStore.setLoginStatus(true);
        userStore.saveUserData();
        // 获取菜
        const menuList = await menuService.getMenuList();
        userStore.setMenuList(menuList.menuList);
        menuStore.setMenuList(menuList.menuList);
        showLoginSuccessNotice();
        router.push(HOME_PAGE); // 登录成功后跳转到主页
      }
    }
  } finally {
    loading.value = false; // 无论成功还是失败，都停止加载
  }
};

// 登录成功提示
const showLoginSuccessNotice = () => {
  setTimeout(() => {
    ElNotification({
      title: getGreeting(),
      type: "success",
      showClose: false,
      duration: 2500,
      zIndex: 10000,
      message: `欢迎登录 ${systemName}`
    });
  }, 300);
};

const { locale } = useI18n();
const changeLanguage = (lang: LanguageEnum) => {
  locale.value = lang;
  userStore.setLanguage(lang);
};
</script>

<style lang="scss" scoped>
@use "./index";
</style>
