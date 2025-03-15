import { ApiService } from "@/api/apiApi";
import { ITemplateItemRep } from "@/interface/IApproval";
import { defineStore } from "pinia";

interface IApprovalState {
  approvalTemplateList: ITemplateItemRep[];
  approvalStatusEnum: { label: string; value: string }[];
  approvalNodeStatusEnum: { label: string; value: string }[];
  enumsLoaded: boolean;
}

export const useApprovalStore = defineStore({
  id: "approvalStore",
  state: (): IApprovalState => ({
    approvalTemplateList: [],
    approvalStatusEnum: [],
    approvalNodeStatusEnum: [],
    enumsLoaded: false,
  }),
  getters: {
    getApprovalTemplateList(): ITemplateItemRep[] {
      return this.approvalTemplateList;
    },
    getApprovalStatusEnum(): { label: string; value: string | number }[] {
      return this.approvalStatusEnum;
    },
    getApprovalNodeStatusEnum(): { label: string; value: string | number }[] {
      return this.approvalNodeStatusEnum;
    },
  },
  actions: {
    setApprovalTemplateList(list: ITemplateItemRep[]) {
      this.approvalTemplateList = list;
    },
    async loadEnums() {
      // 如果已经加载过且有数据，直接返回
      if (this.enumsLoaded && this.approvalStatusEnum.length > 0 && this.approvalNodeStatusEnum.length > 0) {
        return;
      }

      try {
        const [statusEnum, nodeStatusEnum] = await Promise.all([
          ApiService.getDictConfig("approvalStatusEnum"),
          ApiService.getDictConfig("approvalNodeStatusEnum"),
        ]);

        this.approvalStatusEnum = statusEnum.data;
        this.approvalNodeStatusEnum = nodeStatusEnum.data;
        this.enumsLoaded = true;
      } catch (error) {
        console.error("Failed to load approval enums:", error);
        throw error;
      }
    },
  },
});
