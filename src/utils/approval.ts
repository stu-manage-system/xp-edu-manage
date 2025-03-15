import { EApprovalButton, EApprovalStatus } from "@/interface/IApproval";

const getStatusType = (status: string): "success" | "warning" | "info" | "primary" | "danger" => {
  const statusMap: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = {
    [EApprovalStatus.PROCESS]: "primary", // 待审批
    [EApprovalStatus.COMPLETE]: "success", // 已通过
    [EApprovalStatus.ABANDON]: "danger", // 已驳回
  };
  return statusMap[status] || "info";
};

const getButtonText = (button: EApprovalButton) => {
  const buttonMap: Record<EApprovalButton, string> = {
    [EApprovalButton.UNDO]: "撤销",
    [EApprovalButton.REJECT]: "拒绝",
    [EApprovalButton.AGREE]: "同意",
    [EApprovalButton.CANCEL]: "作废",
  };
  return buttonMap[button] || "未知按钮";
};

export { getStatusType, getButtonText };
