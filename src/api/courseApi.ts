import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class CourseService {

  // 获取周计划列表
  static queryWeekPlanList() {
    return request.get<BaseResult>({
      url: "/weekPlan/getList",
    });
  }

  // 查询周计划详情
  static queryWeekPlanDetail(params: any) {
    return request.get<BaseResult>({
      url: `/weekPlan/getDetail/`,
      params,
    });
  }

  // 添加周计划
  static addWeekPlan(data: any) {
    return request.post<BaseResult>({
      url: "/weekPlan/add",
      data,
    });
  }

  // 修改周计划
  static updateWeekPlan(data: any) {
    return request.post<BaseResult>({
      url: "/weekPlan/update",
      data,
    });
  }

  // 删除周计划
  static deleteWeekPlan(params: any) {
    return request.del<BaseResult>({
      url: `/weekPlan/delete/${params}`,
    });
  }

  // 获取学期计划列表
  static addTermPlan(data: any) {
    return request.post<BaseResult>({
      url: "/termPlan/addTermPlan",
      data,
    });
  }

  // 修改学期计划
  static updateTermPlan(data: any) {
    return request.post<BaseResult>({
      url: "/termPlan/updateTermPlan",
      data,
    });
  }

  // 删除学期计划
  static deleteTermPlan(params: any) {
    return request.del<BaseResult>({
      url: `/termPlan/delete/${params}`,
    });
  }

  // 获取学期详情
  static queryTermPlanDetail(params: any) {
    return request.get<BaseResult>({
      url: `/termPlan/getDetail`,
      params,
    });
  }

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
