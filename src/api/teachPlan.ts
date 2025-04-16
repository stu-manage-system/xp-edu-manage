import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class TeachPlanService {
  // 获取课程计划列表
  static getCoursePlanList(data: any) {
    return request.post<BaseResult>({
      url: "/coursePlan/getList",
      data,
    });
  }

  // 添加课程计划
  static addCoursePlan(data: any) {
    return request.post<BaseResult>({
      url: "/coursePlan/addCoursePlan",
      data,
    });
  }

  // 修改课程计划
  static updateCoursePlan(data: any) {
    return request.post<BaseResult>({
      url: "/coursePlan/updateCoursePlan",
      data,
    });
  }

  // 获取课程计划详情
  static queryCoursePlanDetail(params: any) {
    return request.get<BaseResult>({
      url: `/coursePlan/getDetail`,
      params,
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
}
