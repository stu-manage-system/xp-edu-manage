import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class TermService {
  // 新增学期
  static addTerm(data: any) {
    return request.post<BaseResult>({
      url: "/common/addTerm",
      data,
    });
  }

  // 编辑学期
  static editTerm(data: any) {
    return request.post<BaseResult>({
      url: "/common/editTerm",
      data,
    });
  }
  // 获取学期列表
  static getTermList(data: any) {
    return request.post<BaseResult>({
      url: `/common/getTermList`,
      data,
    });
  }
}
