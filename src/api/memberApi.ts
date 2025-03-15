import { BaseResult } from "@/types/axios";
import request from "@/utils/http";
import {
  IMemberAccessRecord,
  IMemberDetailRep,
  IMemberForm,
  IMemberListRep,
  IMemberSearchForm,
} from "@/interface/IMember";
import _ from "lodash";

export default class MemberApi {
  // 获取会员列表
  static getMemberList(data: IMemberSearchForm) {
    const filteredForm = _.pickBy(data, Boolean);
    return request.post<BaseResult<IMemberListRep>>({
      url: "/store/member/queryMemberList",
      data: filteredForm,
    });
  }

  // 新增会员
  static addMember(data: IMemberForm) {
    return request.post<BaseResult<IMemberListRep>>({
      url: "/store/member/addStoreMember",
      data,
    });
  }

  // 更新会员
  static updateMember(data: IMemberForm) {
    return request.post<BaseResult<IMemberListRep>>({
      url: "/store/member/modifyStoreMember",
      data,
    });
  }

  //获取详情
  static getMemberDetail(memberCode: string) {
    return request.post<BaseResult<IMemberDetailRep>>({
      url: `/store/member/detail/${memberCode}`,
    });
  }

  // 获取会员出入记录
  static getMemberAccessRecords(memberCode: string, data: any) {
    const filteredForm = _.pickBy(data, Boolean);
    return request.post<
      BaseResult<{
        list: Array<IMemberAccessRecord>;
        pageNum: number;
        pageSize: number;
        total: number;
      }>
    >({
      url: `/store/member/queryAccessRecord/${memberCode}`,
      data: filteredForm,
    });
  }
}
