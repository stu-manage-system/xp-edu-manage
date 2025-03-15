import request from "@/utils/http";
import { BaseResult } from "@/types/axios";

// api 登录
export class RevenueService {
  // 获取营收列表
  static getRevenueList(data: any) {
    return request.post<BaseResult>({
      url: "/store/revenue/queryRevenue",
      data,
    });
  }

  // 查询业务条件
  static getRevenuebusinessCode(data: any) {
    return request.post<BaseResult>({
      url: "/store/revenue/queryBusinessInfo",
      data,
    });
  }
}
