import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class DepartService {
  // 获取部门列表
  static getDepartList(data: any) {
    return request.post<BaseResult>({
      url: "/department/geDeptList",
      data,
    });
  }

  // 新增部门
  static addDepart(data: any) {
    return request.post<BaseResult>({
      url: "/department/saveDept",
      data,
    });
  }

  // 编辑部门
  static editDepart(data: any) {
    return request.post<BaseResult>({
      url: "/department/updateDept",
      data,
    });
  }

  // 删除部门
  static deleteDepart(data: any) {
    return request.del<BaseResult>({
      url: `/department/deleteDept/${data}`,
    });
  }

  // 新增职位
  static addPosition(data: any) {
    return request.post<BaseResult>({
      url: "/department/savePosition",
      data,
    });
  }

  // 获取职位列表
  static getPositionList(params: any) {
    return request.get<BaseResult>({
      url: "/department/getPositionList",
      params,
    });
  }

  // 编辑职位
  static editPosition(data: any) {
    return request.post<BaseResult>({
      url: "/department/updatePosition",
      data,
    });
  }

  // 删除职位
  static deletePosition(data: any) {
    return request.del<BaseResult>({
      url: `/department/deletePosition/${data}`,
    });
  }
}
