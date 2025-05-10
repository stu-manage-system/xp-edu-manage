import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class StudentService {
  // 获取用户信息列表
  static queryStoresStudentList(data: any) {
    return request.post<BaseResult>({
      url: "/student/stuList",
      data,
    });
  }

  // 添加用户
  static addStudent(data: any) {
    return request.post<BaseResult>({
      url: "/student/save",
      data,
    });
  }

  // 编辑用户
  static editStudent(data: any) {
    return request.post<BaseResult>({
      url: "/student/modify",
      data,
    });
  }

  // 获取用户详情
  static getStudentDetail(params: any) {
    return request.get<BaseResult>({
      url: `/student/getDetail`,
      params,
    });
  }

  // 删除用户
  static deleteStudent(params: any) {
    return request.del<BaseResult>({
      url: `/student/delete/${params}`,
    });
  }

  // 获取学生列表（不分页）
  static getStuNotPageList(data: any) {
    return request.post<BaseResult>({
      url: "/student/queryStuNotPage",
      data,
    });
  }
}
