import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class NoticeService {
  // 获取公告列表
  static getNoticeList(data: any) {
    return request.post<BaseResult>({
      url: "/notice/getNoticeList",
      data,
    });
  }

  // 添加公告
  static addNotice(data: any) {
    return request.post<BaseResult>({
      url: "/notice/save",
      data,
    });
  }

  // 编辑公告
  static editNotice(data: any) {
    return request.post<BaseResult>({
      url: "/notice/update",
      data,
    });
  }

  // 获取公告详情
  static getNoticeDetail(params: any) {
    return request.get<BaseResult>({
      url: "/notice/getDetail",
      params
    });
  }

  // 删除公告
  static deleteNotice(data: any) {
    return request.del<BaseResult>({
      url: `/notice/delete/${data}`,
    });
  }
}
