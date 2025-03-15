export interface INode {
  nodeName: string; //节点名称
  nodeCode: string; //节点编码：md5
  beforeCode: string; //前节点编码
  afterCode: string; //后节点编码
  approvalType: number; //审批类型；0=角色审批，1=人员审批,2=全部
  approvalInfo: string; //审批信息
  remark: string; //备注
  isLastNode: boolean; //是否是最后一个节点
}

export interface IFormState {
  templateCode?: string; //模板编码
  flowName: string; //流程名称
  remark: string; //备注
  templateNodeReqList: INode[]; //节点列表
}
/** 模板详情返回 */
export interface ITemplateNodeRep {
  templateCode: string;
  flowName: string;
  /** 状态；0=启用，1=禁用 */
  status: number;
  remark: string;
  creator: string;
  templateNodeList: INode[];
}

/** 模板列表单个模板信息返回 */
export interface ITemplateItemRep {
  templateCode: string;
  flowName: string;
  /** 状态；0=启用，1=禁用 */
  status: number;
  remark: string;
  /** 创建人 */
  creator: string;
}

/** 审批列表返回 */
export interface IApprovalListRep {
  list: IApprovalItem[];
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface IApprovalItem {
  templateName: string;
  flowCode: string;
  /** 审批状态；PROCESS：审批中，PASS：已通过，REJECT：已驳回 */
  status: string;
  title: string;
  creator: string;
  remark: string;
  // createTime: string;
}
export interface IRecord {
  nodeName: string;
  taskId: string;
  approvalPerson: string;
  /** 审批状态；0=待审批，1=已通过，2=已驳回 */
  approvalStatus: number;
  approvalName: string;
  remark: string;
  createTime: string;
}

export enum EApprovalButton {
  UNDO = "undo",
  REJECT = "reject",
  AGREE = "agree",
  CANCEL = "cancel",
}

export interface IApprovalFlowDetailFlow {
  nodeName: string;
  nodeCode: string;
  beforeCode: string;
  afterCode: string;
  approvalType: number;
  approvalPerson: string;
  approvalInfo: string;
  isCurrentNode: boolean;
}
export interface IApprovalFlowDetail {
  flowCode: string;
  status: string;
  title: string;
  remark: string;
  creator: string;
  updatePerson: string;
  updateTime: string;
  createTime: string;
  recordList: Array<IRecord>;
  button: Array<EApprovalButton>;
  flowTemplateNodeList: Array<IApprovalFlowDetailFlow>;
}

export interface IApprovalListForm {
  status: string;
  title: string;
  pageNum: number;
  pageSize: number;
}

export enum EApprovalStatus {
  PROCESS = "PROCESS",
  COMPLETE = "COMPLETE",
  ABANDON = "ABANDON",
}
