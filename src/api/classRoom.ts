import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class ClassRoomService {
  // 获取教室列表
  static getClassRoomList(data: any) {
    return request.post<BaseResult>({
      url: "/classroom/getRoomList",
      data,
    });
  }

  // 新增教室
  static addClassRoom(data: any) {
    return request.post<BaseResult>({
      url: "/classroom/save",
      data,
    });
  }

  // 编辑教室
  static editClassRoom(data: any) {
    return request.post<BaseResult>({
      url: "/classroom/update",
      data,
    });
  }

  // 删除教室
  static deleteClassRoom(params: any) {
    return request.post<BaseResult>({
      url: `/classroom/delete/${params}`,
    });
  }
}
