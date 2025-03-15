import { BaseResult } from "@/types/axios";
import request from "@/utils/http";
import {
  IApprovalListForm,
  IApprovalListRep,
  IFormState,
  ITemplateItemRep,
  ITemplateNodeRep,
} from "@/interface/IApproval";
import _ from "lodash";

export class ApprovalService {
  // 获取审批模板列表
  static getApprovalTemplateList() {
    return request.get<BaseResult<ITemplateItemRep[]>>({
      url: "/store/flow/queryTempLateList",
    });
  }

  // 获取审批模板详情
  static getApprovalTemplateDetail(templateCode: string) {
    return request.get<BaseResult<ITemplateNodeRep>>({
      url: `/store/flow/flowTemplateDetail?templateCode=${templateCode}`,
    });
  }

  // 提交审批模板
  static submitApprovalTemplate(data: IFormState) {
    return request.post<BaseResult<any>>({
      url: "/store/flow/addFlowTemplate",
      data,
    });
  }

  // 删除审批模板
  static deleteApprovalTemplate(templateCode: string) {
    return request.del<BaseResult<any>>({
      url: `/store/flow/deleteFlowTemplate/${templateCode}`,
    });
  }

  // 更新审批模板状态
  static updateApprovalTemplateStatus(templateCode: string, status: number) {
    return request.post<BaseResult<any>>({
      url: `/store/flow/changeStatus`,
      data: {
        status,
        templateCode,
      },
    });
  }

  //获取审批列表
  static getApprovalList(data: IApprovalListForm) {
    const filteredForm = _.pickBy(data, Boolean);
    return request.post<BaseResult<IApprovalListRep>>({
      url: "/store/flow/approvalList",
      data: filteredForm,
    });
  }

  //获取审批详情
  static getApprovalDetail(flowCode: string) {
    return request.get<BaseResult<any>>({
      url: `/store/flow/approvalDetail?flowCode=${flowCode}`,
    });
  }

  //审批通过
  static approvalPass(flowCode: string, taskId: string, remark: string) {
    return request.post<BaseResult<any>>({
      url: `/store/flow/approvalExecute`,
      data: {
        flowCode,
        taskId,
        remark,
      },
    });
  }

  // 审批不通过
  static approvalAbandon(flowCode: string, taskId: string, remark: string) {
    return request.post<BaseResult<any>>({
      url: `/store/flow/approvalAbandon`,
      data: {
        flowCode,
        taskId,
        remark,
      },
    });
  }
  //撤回
  static approvalBack(flowCode: string, taskId: string, remark: string) {
    return request.post<BaseResult<any>>({
      url: `/store/flow/approvalBack`,
      data: {
        flowCode,
        taskId,
        remark,
      },
    });
  }

  //拒绝
  static approvalReject(flowCode: string, taskId: string, remark: string) {
    return request.post<BaseResult<any>>({
      url: `/store/flow/approvalReject`,
      data: {
        flowCode,
        taskId,
        remark,
      },
    });
  }

  // 创建审批
  static createApproval(data: { templateCode: string; title: string; remark: string }) {
    return request.post<BaseResult<any>>({
      url: "/store/flow/startApproval",
      data,
    });
  }

  //查询角色下是否有人员
  static queryRoleHasUser(roleId: string) {
    return request.get<BaseResult<any>>({
      url: `/store/user/queryExistAccount?roleId=${roleId}`,
    });
  }
}
