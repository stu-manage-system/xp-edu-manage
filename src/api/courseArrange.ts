import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class CourseArrangeService {
  // 保存课程表
  static saveCourseArrange(data: any) {
    return request.post<BaseResult>({
      url: "/courseArrange/addCourseArrange",
      data,
    });
  }

  // 查询课程排课详情
  static getCourseArrangeDetail(params: any) {
    return request.get<BaseResult>({
      url: "/courseArrange/getDetail",
      params
    });
  }

  //编辑课程表
  static editCourseArrange(data: any) {
    return request.post<BaseResult>({
      url: "/courseArrange/updateCourseArrange",
      data,
    });
  }
}
