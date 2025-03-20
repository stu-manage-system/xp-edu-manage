import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class TeachService {
  // 获取教学计划列表
  static queryCourseList() {
    return request.get<BaseResult>({
      url: "/coursePlan/getList",
    });
  }

  // 添加课程
  static addCoursePlan(data: any) {
    return request.post<BaseResult>({
      url: "/store/course/saveCourse",
      data,
    });
  }

  // 修改课程
  static updateCoursePlan(data: any) {
    return request.post<BaseResult>({
      url: "/coursePlan/updateCoursePlan",
      data,
    });
  }

  // 查询课程详情
  static queryCourseDetail(params: any) {
    return request.get<BaseResult>({
      url: `/coursePlan/getDetail/${params}`,
    });
  }

  // 删除课程
  static deleteCourse(params: any) {
    return request.del<BaseResult>({
      url: `/coursePlan/delete/${params}`,
    });
  }

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

}
