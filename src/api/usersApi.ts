import { BaseResult } from "@/types/axios";
import request from "@/utils/http";
import { pageParams } from "./model/loginModel";

export class UserService {

  // 获取用户信息列表
  static queryStoreUserList(data: pageParams) {
    return request.post<BaseResult>({
      url: "/user/list",
      data,
    });
  }

  // 添加用户
  static addUser(data: any) {
    return request.post<BaseResult>({
      url: "/user/save",
      data,
    });
  }

  // 编辑用户
  static editUser(data: any) {
    return request.post<BaseResult>({
      url: "/user/edit",
      data,
    });
  }

  // 获取用户详情
  static getUserDetail(params: any) {
    return request.get<BaseResult>({
      url: `/user/detail/${params}`,
    });
  }

  // 删除用户
  static deleteUser(params: any) {
    return request.del<BaseResult>({
      url: `/user/delete/${params}`,
    });
  }

  // 修改密码
  static editUserPassword(data: any) {
    return request.post<BaseResult>({
      url: "/user/modifyPassword",
      data,
    });
  }

  // 重置密码
  static resetUserPassword(params: any) {
    return request.get<BaseResult>({
      url: `/user/resetPassword`,
      params,
    });
  }

  // 获取角色列表
  static queryRoleList(data: pageParams) {
    return request.post<BaseResult>({
      url: "/auth/queryRoleList",
      data,
    });
  }

  // 添加角色
  static addRole(data: any) {
    return request.post<BaseResult>({
      url: "/auth/addRole",
      data,
    });
  }

  // 编辑角色
  static updateRole(data: any) {
    return request.post<BaseResult>({
      url: "/auth/modifyRole",
      data,
    });
  }

  // 删除角色
  static deleteRole(params: any) {
    return request.del<BaseResult>({
      url: `/auth/deleteRole/${params}`,
    });
  }

  // 角色详情
  static getRoleDetail(params: any) {
    return request.get<BaseResult>({
      url: `/auth/detail/${params}`,
    });
  }

  // 获取学期列表
  static getTermList() {
    return request.get<BaseResult>({
      url: "/common/getTermList",
    });
  }

  // 新增学期
  static addTerm(data: any) {
    return request.post<BaseResult>({
      url: "/common/addTerm",
      data,
    });
  }

  // 获取年级列表
  static getGradeList() {
    return request.get<BaseResult>({
      url: "/common/getGradeList",
    });
  }

  // 新增年级
  static addGrade(data: any) {
    return request.post<BaseResult>({
      url: "/common/addGrade",
      data,
    });
  }

}
