// 会员卡
import { BaseResult } from "@/types/axios";
import request from "@/utils/http";
import { IMemberCardListItem, IMemberCardListRep, IMemberCardSearchForm } from "@/interface/IMember";
import _ from "lodash";

export default class MemberCardApi {
  // 获取会员卡列表
  static getMemberCardList(data: IMemberCardSearchForm) {
    const filteredForm = _.pickBy(data, Boolean);
    return request.post<BaseResult<IMemberCardListRep>>({
      url: "/store/memberCard/queryList",
      data: filteredForm,
    });
  }

  // 新增会员卡
  static addMemberCard(data: Omit<IMemberCardListItem, "updateTime" | "createTime" | "status" | "cardCode">) {
    return request.post<BaseResult<IMemberCardListRep>>({
      url: "/store/memberCard/saveMemberCard",
      data,
    });
  }

  // 修改会员卡
  static editMemberCard(data: Omit<IMemberCardListItem, "updateTime" | "createTime" | "status">) {
    return request.post<BaseResult<IMemberCardListRep>>({
      url: "/store/memberCard/updateMemberCard",
      data,
    });
  }

  // 删除会员卡
  static delMemberCard(cardCode: string) {
    return request.post<BaseResult<IMemberCardListRep>>({
      url: `/store/memberCard/deleteMemberCard/${cardCode}`,
    });
  }
  // 切换状态
  static switchStatus(cardCode: string, status: number) {
    return request.post<BaseResult<IMemberCardListRep>>({
      url: `/store/memberCard/changeStatus`,
      data: {
        cardCode,
        status,
      },
    });
  }
}
