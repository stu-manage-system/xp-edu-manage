import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

// api 登录
export class ApiService {
  static getApiList(data: any) {
    return request.post<BaseResult>({
      url: "/user/login",
      data,
    });
  }


  // 获取字典配置
  static getDictConfig(params: string) {
    return request.get<BaseResult>({
      url: `/common/config/${params}`,
    });
  }

  // 工作台卡片接口
  static getWorkbenchData() {
    return request.get<BaseResult>({
      url: "/store/workbench/dataShow",
    });
  }

  // 获取菜单
  static getMenuList() {
    return request.get<BaseResult>({
      url: "/auth/getMenu",
    });
  }
}
