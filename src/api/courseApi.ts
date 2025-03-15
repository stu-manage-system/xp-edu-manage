import request from "@/utils/http";
import { BaseResult } from "@/types/axios";
import { pageParams } from "./model/loginModel";

export class UserService {
  // 获取课程列表
  static queryCourseList(data: pageParams) {
    return request.post<BaseResult>({
      url: "store/course/queryCourseList",
      data,
    });
  }

  // 添加课程
  static addCourse(data: any) {
    return request.post<BaseResult>({
      url: "/store/course/saveCourse",
      data,
    });
  }

  // 修改课程
  static updateCourse(data: any) {
    return request.post<BaseResult>({
      url: "/store/course/updateCourse",
      data,
    });
  }

  // 查询课程详情
  static queryCourseDetail(params: any) {
    return request.get<BaseResult>({
      url: `/store/course/courseDetail/${params}`,
    });
  }

  // 删除课程
  static deleteCourse(params: any) {
    return request.del<BaseResult>({
      url: `/store/course/deleteCourse/${params}`,
    });
  }
}
