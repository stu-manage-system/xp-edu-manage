import request from "@/utils/http";
import { BaseResult } from "@/types/axios";
import { pageParams } from "./model/loginModel";

export class UserService {

  // 获取用户信息列表
  static queryStoreUserList(data: pageParams) {
    return request.post<BaseResult>({
      url: "/store/user/queryStoreUserList",
      data,
    });
  }

  // 添加用户
  static addStoreUser(data: any) {
    return request.post<BaseResult>({
      url: "/store/user/addStoreUser",
      data,
    });
  }

  // 编辑用户
  static editStoreUser(data: any) {
    return request.post<BaseResult>({
      url: "/store/user/modifyStoreUser",
      data,
    });
  }

  // 修改密码
  static editStoreUserPassword(data: any) {
    return request.post<BaseResult>({
      url: "/store/user/modifyPassword",
      data,
    });
  }

  // 重置密码
  static resetStoreUserPassword(data: any) {
    return request.post<BaseResult>({
      url: "/store/user/resetPassword",
      data,
    });
  }

  // 获取角色列表
  static queryStoreRoleList(data: pageParams) {
    return request.post<BaseResult>({
      url: "/store/role/queryRoleList",
      data,
    });
  }

  // 添加角色
  static addStoreRole(data: any) {
    return request.post<BaseResult>({
      url: "/store/role/addRole",
      data,
    });
  }

  // 编辑角色
  static updateStoreRole(data: any) {
    return request.post<BaseResult>({
      url: "/store/role/modifyRole",
      data,
    });
  }

  // 删除角色
  static deleteStoreRole(params: any) {
    return request.del<BaseResult>({
      url: `/store/role/deleteRole/${params}`,
    });
  }

  // 角色详情
  static getStoreRoleDetail(params: any) {
    return request.get<BaseResult>({
      url: `/store/role/detail/${params}`,
    });
  }

  // 添加门店
  static addStore(data: any) {
    return request.post<BaseResult>({
      url: "/store/storeInfo/addStoreInfo",
      data,
    });
  }

  // 编辑门店
  static editStore(data: any) {
    return request.post<BaseResult>({
      url: "/store/storeInfo/modifyStoreInfo",
      data,
    });
  }

  // 获取门店详情
  static getStoreDetail(params: any) {
    return request.get<BaseResult>({
      url: `/store/storeInfo/detail/${params}`,
    });
  }

  // 获取门店列表
  static getStoreList() {
    return request.get<BaseResult>({
      url: "/store/storeInfo/queryStoreList",
    });
  }
}
