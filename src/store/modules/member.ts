//会员卡的store
import { ApiService } from "@/api/apiApi";
import { defineStore } from "pinia";
interface IMemberState {
  memberCardType: { label: string; value: string }[];
  memberStatusEnum: { label: string; value: string }[];
}

export const useMemberStore = defineStore("member", {
  state: (): IMemberState => ({
    memberCardType: [], //会员卡类型
    memberStatusEnum: [], //会员状态
  }),
  actions: {
    async loadEnums() {
      const res = await ApiService.getDictConfig("memberCardTypeEnum");
      this.memberCardType = res.data;
    },
    async loadMemberStatus() {
      if (this.memberStatusEnum.length > 0) return;
      const res = await ApiService.getDictConfig("storeMemberStatusEnum");
      this.memberStatusEnum = res.data;
    },
  },
  getters: {
    getMemberCardType(): { label: string; value: string }[] {
      return this.memberCardType;
    },
    getMemberStatus(): { label: string; value: string }[] {
      return this.memberStatusEnum;
    },
  },
});
