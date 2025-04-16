import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class GradeService {
  // 获取年级列表
  static getGradeList(data: any) {
    return request.post<BaseResult>({
      url: "/common/getGradeList",
      data,
    });
  }

  // 新增年级
  static addGrade(data: any) {
    return request.post<BaseResult>({
      url: "/common/addGrade",
      data,
    });
  }

  // 编辑年级
  static editGrade(data: any) {
    return request.post<BaseResult>({
      url: "/common/updateGrade",
      data,
    });
  }

  // 删除年级
  static deleteGrade(data: any) {
    return request.post<BaseResult>({
      url: "/grade/delete",
      data,
    });
  }
}
