import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class MentorGroupService {
  // 获取导师组列表
  static getMentorGroupList(data: any) {
    return request.post<BaseResult>({
      url: "/mentorGroup/getList",
      data,
    });
  }

  // 新增导师组
  static addMentorGroup(data: any) {
    return request.post<BaseResult>({
      url: "/mentorGroup/save",
      data,
    });
  }

  // 编辑导师组
  static editMentorGroup(data: any) {
    return request.post<BaseResult>({
      url: "/mentorGroup/update",
      data,
    });
  }

  // 删除导师组
  static deleteMentorGroup(data: any) {
    return request.del<BaseResult>({
      url: `/mentorGroup/delete/${data}`,
    });
  }

  // 获取导师组详情
  static getMentorGroupDetail(params: any) {
    return request.get<BaseResult>({
      url: "/mentorGroup/getDetail",
      params,
    });
  }

}
