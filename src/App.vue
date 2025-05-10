<template>
  <el-config-provider :size="elSize" :locale="locales[language]" :z-index="3000">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useUserStore } from "./store/modules/user";
import zh from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { checkSystemUpgrade } from "./utils/upgrade";
import { initState, saveUserData } from "./utils/storage";

const userStore = useUserStore();
const language = computed(() => userStore.language);
const elSize = computed(() =>
  document.body.clientWidth >= 500 ? "large" : "default"
);

const locales = {
  zh: zh,
  en: en
};

onBeforeMount(() => {
  setBodyClass(true);
});

onMounted(() => {
  // initState();
  saveUserData();
  setBodyClass(false);
  // checkSystemUpgrade();
});

// 提升暗黑主题下页面刷新视觉体验
const setBodyClass = (addClass: boolean) => {
  let el = document.getElementsByTagName("body")[0];

  if (addClass) {
    el.setAttribute("class", "theme-change");
  } else {
    setTimeout(() => {
      el.removeAttribute("class");
    }, 300);
  }
};
</script>
<style lang="scss">
.align-center {
  display: flex;
  align-items: center;
}

.justify-center {
  display: flex;
  justify-content: center;
}

.el-table__header thead tr {
  .el-table__cell {
    color: rgb(102, 102, 102);
  }
}

// .el-table--striped .el-table__body-wrapper {
//   background-color: rgba(238, 247, 255, 0.5) !important;
// }
// .el-table--striped .el-table__body tr.el-table__row td.el-table__cell {
//   background-color: rgba(238, 247, 255, 0.5) !important;
// }

// .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
//   background-color: rgba(223, 238, 252, 1) !important;
// }</style>
