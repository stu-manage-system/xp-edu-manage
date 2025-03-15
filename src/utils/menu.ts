import { AppRouteRecordRaw, router } from "@/router";
import { MenuListType } from "@/types/menu";
import { LanguageEnum } from "@/enums/appEnum";
import { useUserStore } from "@/store/modules/user";

// 动态匹配路由
export function routerMatch(
  menuList: MenuListType[],
  roleRoutes: AppRouteRecordRaw[],
) {
  const routesToAdd: AppRouteRecordRaw[] = [];

  menuList.forEach((item) => processMenuItem(item, roleRoutes, routesToAdd));
  routesToAdd.forEach((route) => {
    const { name } = route;
    if (name && !router.hasRoute(name)) {
      router.addRoute(route);
    }
  });
}

function processMenuItem(
  item: any,
  roleRoutes: AppRouteRecordRaw[],
  routesToAdd: AppRouteRecordRaw[],
) {
  const { path, children = [] } = item;
  // 解析 meta 字符串为对象
  const meta =
    typeof item.meta === "string" ? JSON.parse(item.meta) : item.meta;

  const matchingRoute = roleRoutes.find((route) => route.path === path);

  if (matchingRoute) {
    matchingRoute.meta = {
      ...(matchingRoute.meta || {}),
      ...meta, // 直接使用解析后的完整 meta 对象
    };

    if (children?.length > 0) {
      children.forEach((child: any) =>
        processMenuItem(child, matchingRoute.children || [], routesToAdd),
      );
    }
    routesToAdd.push(matchingRoute);
  } else {
    console.error("【动态添加路由】找不到与路径匹配的路由:", path);
  }
}

// 菜单标题映射
const titlePropertyMap = {
  [LanguageEnum.ZH]: "title",
  [LanguageEnum.EN]: "title_en",
};

const getTitleProp = () => {
  return titlePropertyMap[useUserStore().language];
};

// 获取多语言菜单标题
export const getMenuTitle = (item: any) => {
  return item.meta[getTitleProp()];
};

// 获取 meta 多语言菜单标题
export const getMetaMenuTitle = (item: any) => {
  return item.meta[getTitleProp()];
};

// 获取标签页多语言标题
export const getWorkTabTitle = (item: any) => {
  return item[getTitleProp()];
};

// 打开链接
export const openLink = (link: string, isIframe: boolean = false) => {
  if (isIframe) {
    return router.push({ path: "/outside/iframe", query: { url: link } });
  } else {
    return window.open(link, "_blank");
  }
};
