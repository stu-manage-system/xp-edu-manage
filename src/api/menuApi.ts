import { ApiService } from "@/api/apiApi";
import { MenuListType } from "@/types/menu";

// 菜单接口
export const menuService = {
  // 获取菜单列表
  async getMenuList(): Promise<{
    menuList: MenuListType[];
  }> {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await ApiService.getMenuList();
      return {
        menuList: getMeta(response.data),
      };
    } catch (error) {
      // loading.close();
      throw error;
    }
  },
};

const getMeta = (arr: any) => {
  arr.forEach((item: any) => {
    item.meta =
      typeof item.meta === "string" ? JSON.parse(item.meta) : item.meta;
    // 处理icon转义,将e7b9这样的字符串转为unicode
    if (item.meta.icon) {
      item.meta.icon = String.fromCharCode(parseInt(item.meta.icon, 16));
    }
    if (item.children) {
      // 解析 meta 字符串为对象
      getMeta(item.children);
    }
  });

  return arr;
};
