import { LanguageEnum } from "@/enums/appEnum";
import { router } from "@/router";
import { defineStore } from "pinia";
import { useMenuStore } from "./menu";
import { useSettingStore } from "./setting";
import { useWorktabStore } from "./worktab";

interface UserState {
  language: LanguageEnum; // 语言
  isLogin: boolean; // 是否登录
  isLock: boolean; // 是否锁屏
  lockPassword: string; // 锁屏密码
  info: {
    role?: string; // 添加角色属性
    [key: string]: any;
  };
  searchHistory: string[];
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    language: LanguageEnum.ZH,
    isLogin: false,
    isLock: false,
    lockPassword: "",
    info: {},
    searchHistory: [],
  }),
  persist: true,
  getters: {
    userInfo: (state) => state.info,
    userRole: (state) => state.info?.role || 'user', // 默认普通用户角色
    getSettingState() {
      return useSettingStore().$state;
    },
    getWorktabState() {
      return useWorktabStore().$state;
    },
  },
  actions: {
    initState() {
      const version = import.meta.env.VITE_VERSION;
      const vs = localStorage.getItem("version") || version;
      const sys = localStorage.getItem(`sys-v${vs}`);

      if (sys) {
        const parsedData = JSON.parse(sys);
        const { info, isLogin, language, searchHistory, isLock, lockPassword } =
          parsedData.user || {};

        this.info = info || {};
        this.isLogin = isLogin || false;
        this.isLock = isLock || false;
        this.language = language || LanguageEnum.ZH;
        this.searchHistory = searchHistory || [];
        this.lockPassword = lockPassword || "";
      }
    },
    // 用户数据持久化存储
    saveUserData() {
      saveStoreStorage({
        user: {
          info: this.info,
          isLogin: this.isLogin,
          language: this.language,
          isLock: this.isLock,
          lockPassword: this.lockPassword,
          searchHistory: this.searchHistory,
          worktab: this.getWorktabState,
          setting: this.getSettingState,
        },
      });
    },
    setUserInfo(info: any) {
      this.info = info;
      this.isLogin = true;
      // 登录后加载菜单
      this.loadMenuByRole();
    },
    setLoginStatus(isLogin: boolean) {
      this.isLogin = isLogin;
    },
    setLanguage(lang: LanguageEnum) {
      this.language = lang;
    },
    setSearchHistory(list: string[]) {
      this.searchHistory = list;
    },
    setLockStatus(isLock: boolean) {
      this.isLock = isLock;
    },
    setLockPassword(password: string) {
      this.lockPassword = password;
    },
    logOut() {
      setTimeout(() => {
        document.getElementsByTagName("html")[0].removeAttribute("class"); // 移除暗黑主题
        this.info = {};
        this.isLogin = false;
        this.isLock = false;
        this.lockPassword = "";
        useWorktabStore().opened = [];
        this.saveUserData();
        const menuStore = useMenuStore();
        menuStore.setMenuList([]);
        router.push("/login");
      }, 300);
    },
    // 加载对应角色的菜单
    loadMenuByRole() {
      const menuStore = useMenuStore();
      // 过滤出当前角色可见的菜单
      const filteredMenus = filterMenuByRole(allRoutes, this.userRole);
      menuStore.setMenuList(filteredMenus);
    },
  },
});

function initVersion(version: string) {
  const vs = localStorage.getItem("version");
  if (!vs) {
    localStorage.setItem("version", version);
  }
}

// 数据持久化存储
function saveStoreStorage<T>(newData: T) {
  const version = import.meta.env.VITE_VERSION;
  initVersion(version);
  const vs = localStorage.getItem("version") || version;
  const storedData = JSON.parse(localStorage.getItem(`sys-v${vs}`) || "{}");

  // 合并新数据与现有数据
  const mergedData = { ...storedData, ...newData };
  localStorage.setItem(`sys-v${vs}`, JSON.stringify(mergedData));
}
