<template>
  <div class="top-bar" :style="{ width: topBarWidth() }">
    <div class="menu">
      <div class="left" style="display: flex">
        <!-- 系统信息  -->
        <div class="top-header" @click="toHome" v-if="isTopMenu">
          <svg class="svg-icon2" aria-hidden="true">
            <use xlink:href="#iconsys-zhaopian-copy"></use>
          </svg>
          <p v-if="width >= 1300">{{ SystemInfo.name }}</p>
        </div>

        <svg class="svg-icon" aria-hidden="true" @click="toHome()">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <!-- 菜单按钮 -->
        <div class="btn-box" v-if="isLeftMenu">
          <div class="btn menu-btn">
            <i class="iconfont-sys" @click="visibleMenu" v-if="showMenuButton"
              >&#xe6ba;</i
            >
          </div>
        </div>
        <!-- 面包屑 -->
        <breadcrumb v-if="showCrumbs && isLeftMenu" />

        <!-- 顶部菜单 -->
        <MenuTop v-if="isTopMenu" :list="menuList" :width="menuTopWidth" />

        <!-- 混合菜单-顶部 -->
        <MixedMenu
          v-if="isTopLeftMenu"
          :list="menuList"
          :width="menuTopWidth"
        />
      </div>

      <div class="right">
        <!-- 搜索 -->
        <div class="search-wrap">
          <div class="search-input" @click="openSearchDialog">
            <div class="left">
              <i class="iconfont-sys">&#xe710;</i>
              <span>{{ $t("topBar.search.title") }}</span>
            </div>
            <div class="search-keydown">
              <i class="iconfont-sys" v-if="isWindows">&#xeeac;</i>
              <i class="iconfont-sys" v-else>&#xe9ab;</i>
              <span>k</span>
            </div>
          </div>
        </div>
        <!-- 全屏按钮 -->
        <div
          class="btn-box screen-box"
          @click="fullScreenFun"
          v-if="!isFullScreen"
        >
          <div class="btn full-screen-btn">
            <i class="iconfont-sys">&#xe8ce;</i>
          </div>
        </div>
        <div class="btn-box screen-box" @click="exitScreenFun" v-else>
          <div class="btn exit-full-screen-btn">
            <i class="iconfont-sys">&#xe62d;</i>
          </div>
        </div>
        <!-- 锁定屏幕 -->
        <div class="btn-box lock-btn" @click="visibleLock">
          <div class="btn lock-button">
            <i class="iconfont-sys notice-btn">&#xe817;</i>
          </div>
        </div>
        <!-- 通知 -->
        <div class="btn-box notice-btn" @click="visibleNotice">
          <div class="btn notice-button">
            <i class="iconfont-sys notice-btn">&#xe6c2;</i>
            <span class="count notice-btn"></span>
          </div>
        </div>
        <!-- 设置 -->
        <!-- <div class="btn-box" @click="openSetting">
          <el-popover :visible="showSettingGuide" placement="bottom-start" :width="190" :offset="0">
            <template #reference>
              <div class="btn setting-btn">
                <i class="iconfont-sys">&#xe6d0;</i>
              </div>
            </template>
<template #default>
              <p>
                点击这里查看<span :style="{ color: systemThemeColor }">
                  主题风格 </span>、
                <span :style="{ color: systemThemeColor }"> 开启顶栏菜单 </span>等更多配置
              </p>
            </template>
</el-popover>
</div> -->
        <!-- 用户头像、菜单 -->
        <div class="user">
          <el-popover
            ref="userMenuPopover"
            placement="bottom-end"
            :width="210"
            :hide-after="0"
            :offset="20"
            trigger="hover"
            :show-arrow="false"
            popper-class="user-menu-popover"
            popper-style="border: 1px solid var(--art-border-dashed-color); border-radius: 10px; padding: 5px 16px; 5px 16px;"
          >
            <template #reference>
              <img class="cover" src="@imgs/user/avatar.png" />
            </template>
            <template #default>
              <div class="user-menu-box">
                <div class="user-head">
                  <img
                    class="cover"
                    src="@imgs/user/avatar.png"
                    style="float: left"
                  />
                  <div class="user-wrap">
                    <span class="name">{{ userInfo.userName }}</span>
                  </div>
                </div>
                <ul class="user-menu">
                  <li @click="editPassword">
                    <i class="menu-icon iconfont-sys">&#xe600;</i>
                    <span class="menu-txt">{{ $t("topBar.user[1]") }}</span>
                  </li>
                  <li @click="loginOut">
                    <i class="menu-icon iconfont-sys">&#xe780;</i>
                    <span class="menu-txt">{{ $t("topBar.user[2]") }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </el-popover>
        </div>
        <div style="margin-right: 10px; font-size: 14px; color: blueviolet">
          {{ userInfo.userName }}
        </div>
      </div>
    </div>
    <slot></slot>

    <Notice v-model:value="showNotice" ref="notice" />

    <!-- 添加密码修改对话框 -->
    <PasswordDialog
      v-model:visible="showPasswordDialog"
      @success="handlePasswordSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { SystemInfo } from "@/config/setting";
import { MenuTypeEnum, MenuWidth } from "@/enums/appEnum";
import { HOME_PAGE } from "@/router";
import { useMenuStore } from "@/store/modules/menu";
import { useSettingStore } from "@/store/modules/setting";
import { useUserStore } from "@/store/modules/user";
import mittBus from "@/utils/mittBus";
import { exitScreen, fullScreen } from "@/utils/utils";
import { ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import Breadcrumb from "../Breadcrumb/index.vue";
import MixedMenu from "../MixedMenu/index.vue";
import Notice from "../Notice/index.vue";
import PasswordDialog from "./password.vue";

const isWindows = navigator.userAgent.includes("Windows");
const { locale } = useI18n();

const settingStore = useSettingStore();
const userStore = useUserStore();
const router = useRouter();

const showMenuButton = computed(() => settingStore.showMenuButton);
const menuOpen = computed(() => settingStore.menuOpen);
const showCrumbs = computed(() => settingStore.showCrumbs);
const userInfo = computed(() => userStore.userInfo);
const language = computed(() => userStore.language);
const isFullScreen = ref(false);
const showNotice = ref(false);
const notice = ref(null);
const showSettingGuide = computed(() => settingStore.showSettingGuide);
const userMenuPopover = ref();
const menuList = computed(() => useMenuStore().getMenuList);
const menuType = computed(() => settingStore.menuType);
const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT);
const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP);
const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT);
const { t } = useI18n();

const { width } = useWindowSize();

const menuTopWidth = computed(() => {
  return width.value * 0.5;
});

onMounted(() => {
  initLanguage();
  document.addEventListener("click", bodyCloseNotice);
});

onUnmounted(() => {
  document.addEventListener("click", bodyCloseNotice);
});

const fullScreenFun = () => {
  fullScreen();
  isFullScreen.value = true;
};

const exitScreenFun = () => {
  exitScreen();
  isFullScreen.value = false;
};

const topBarWidth = (): string => {
  if (menuType.value === MenuTypeEnum.TOP) {
    return "100%";
  } else {
    return menuOpen.value
      ? `calc(100% - ${MenuWidth.OPEN})`
      : `calc(100% - ${MenuWidth.CLOSE})`;
  }
};

const visibleMenu = () => {
  settingStore.setMenuOpen(!menuOpen.value);
};

const goPage = (path: string) => {
  router.push(path);
};

const toHome = () => {
  router.push(HOME_PAGE);
};

// 添加密码修改对话框的显示状态
const showPasswordDialog = ref(false);

// 修改密码方法
const editPassword = () => {
  showPasswordDialog.value = true;
  closeUserMenu(); // 关闭用户菜单
};

// 密码修改成功的回调
const handlePasswordSuccess = () => {
  showPasswordDialog.value = false;
  userStore.logOut();
};

const loginOut = () => {
  closeUserMenu();
  setTimeout(() => {
    ElMessageBox.confirm(t("common.logOutTips"), t("common.tips"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      customClass: "login-out-dialog"
    }).then(() => {
      userStore.logOut();
    });
  }, 200);
};

const initLanguage = () => {
  locale.value = language.value;
};

const openSetting = () => {
  mittBus.emit("openSetting");

  // 隐藏设置引导
  if (showSettingGuide.value) {
    settingStore.hideSettingGuide();
  }
  // 打开设置引导
  // settingStore.openSettingGuide()
};

const openSearchDialog = () => {
  mittBus.emit("openSearchDialog");
};

const bodyCloseNotice = (e: any) => {
  let { className } = e.target;

  if (showNotice.value) {
    if (typeof className === "object") {
      showNotice.value = false;
      return;
    }
    if (className.indexOf("notice-btn") === -1) {
      showNotice.value = false;
    }
  }
};

const visibleNotice = () => {
  showNotice.value = !showNotice.value;
};

const visibleLock = () => {
  mittBus.emit("openLockScreen");
};

const closeUserMenu = () => {
  setTimeout(() => {
    userMenuPopover.value.hide();
  }, 100);
};
</script>

<style lang="scss" scoped>
@use "./style";
@use "./mobile";
</style>
