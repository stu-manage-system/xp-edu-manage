import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class ExamTypeService {
  // 获取考试类型列表
  static getExamTypeList(data: any) {
    return request.post<BaseResult>({
      url: "/examType/getList",
      data,
    });
  }
}