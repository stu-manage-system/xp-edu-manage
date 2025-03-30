import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class ParentService {
  // 获取用户信息列表
  static queryStoresParentList(data: any) {
    return request.post<BaseResult>({
      url: "/parent/queryParentList",
      data,
    });
  }

  // 获取用户详情
  static getParentDetail(parCode: string) {
    return request.get<BaseResult>({
      url: `/parent/getDetail/${parCode}`,
    });
  }

  // 删除用户
  static deleteParent(parCode: string) {
    return request.del<BaseResult>({
      url: `/parent/delete/${parCode}`,
    });
  }
  //绑定学生
  static bindingStudent(params: {
    parCode: string;
    stuCode: string;
    isEmergency: boolean;
    remark: string;
  }) {
    return request.post<BaseResult>({
      url: "/parent/binding",
      data: params,
    });
  }
}
