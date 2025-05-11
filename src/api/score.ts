import { BaseResult } from "@/types/axios";
import request from "@/utils/http";

export class ScoreService {
  // 获取成绩列表
  static getScoreList(data: any) {
    return request.post<BaseResult>({
      url: "/score/getList",
      data,
    });
  }

  // 添加成绩
  static addScore(data: any) {
    return request.post<BaseResult>({
      url: "/score/save",
      data,
    });
  }

  // 编辑成绩
  static editScore(data: any) {
    return request.post<BaseResult>({
      url: "/score/update",
      data,
    });
  }

  // 删除成绩
  static deleteScore(data: any) {
    return request.del<BaseResult>({
      url: `/score/delete/${data}`,
    });
  }

  // 详情
  static getScoreDetail(params: any) {
    return request.get<BaseResult>({
      url: `/score/getDetail`,
      params,
    });
  }
}