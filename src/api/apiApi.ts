import request from "@/utils/http";
import { BaseResult } from "@/types/axios";

// api 登录
export class ApiService {
  static getApiList(data: any) {
    return request.post<BaseResult>({
      url: "/store/login",
      data,
    });
  }

  // 获取菜单
  static getMeunList() {
    return request.get<BaseResult>({
      url: "/store/getStoreMenu",
    });
  }

  // 获取字典配置
  static getDictConfig(params: string) {
    return request.get<BaseResult>({
      url: `/config/${params}`,
    });
  }

  // 工作台卡片接口
  static getWorkbenchData() {
    return request.get<BaseResult>({
      url: "/store/workbench/dataShow",
    });
  }
}
