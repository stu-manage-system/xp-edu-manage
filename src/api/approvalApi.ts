/** @format */

import { BaseResult } from "@/types/axios";
import request from "@/utils/http";
import _ from "lodash";

export class ApprovalService {
  //审批列表
  static getApprovalList(data: any) {
    return request.post<BaseResult>({
      url: `/approval/approvalList`,
      data,
    });
  }
  //审批/
  static approval(data: any) {
    return request.post<BaseResult>({
      url: `/approval/approval`,
      data,
    });
  }
  //详情
  static getDetail(flowCode: string) {
    return request.get<BaseResult>({
      url: `/approval/approvalDetail/${flowCode}`,
    });
  }
}
