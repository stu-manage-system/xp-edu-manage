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
}
