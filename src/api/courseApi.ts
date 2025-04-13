import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class CourseService {

  // 获取课程列表
  static queryCourseBasicList(data: any) {
    return request.post<BaseResult>({
      url: "/courseBasic/getCourseList",
      data,
    });
  }

  // 添加课程
  static addCourseBasic(data: any) {
    return request.post<BaseResult>({
      url: "/courseBasic/save",
      data,
    });
  }

  // 修改课程
  static updateCourseBasic(data: any) {
    return request.post<BaseResult>({
      url: "/courseBasic/update",
      data,
    });
  }

  // 查询课程详情
  static queryCourseDetail(params: any) {
    return request.get<BaseResult>({
      url: `/courseBasic/getDetail`,
      params,
    });
  }

  // 删除课程
  static deleteCourseBasic(params: any) {
    return request.del<BaseResult>({
      url: `/courseBasic/delete/${params}`,
    });
  }

  // 获取课程体系列表
  static queryCourseSystemList(data: any) {
    return request.post<BaseResult>({
      url: "/courseSystem/getList",
      data,
    });
  }

  // 添加课程体系
  static addCourseSystem(data: any) {
    return request.post<BaseResult>({
      url: "/courseSystem/save",
      data,
    });
  }

  // 修改课程体系
  static updateCourseSystem(data: any) {
    return request.post<BaseResult>({
      url: "/courseSystem/update",
      data,
    });
  }

  // 删除课程体系
  static deleteCourseSystem(params: any) {
    return request.del<BaseResult>({
      url: `/courseSystem/delete/${params}`,
    });
  }

  // 查询课程体系详情
  static queryCourseSystemDetail(params: any) {
    return request.get<BaseResult>({
      url: `/courseSystem/getDetail`,
      params,
    });
  }

  // 查询课程体系子类别
  static getCourseChildrenList(params: any) {
    return request.get<BaseResult>({
      url: `/courseSystem/getChildren`,
      params,
    });
  }
}
