export interface IMemberCardListRep {
  list: Array<IMemberCardListItem>;
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface IMemberCardListItem {
  cardCode: string;
  cardName: string;
  createTime: string;
  effectiveDays: number;
  giftDays: number;
  price: number;
  remark: string;
  startCardType: string;
  status: number;
  updateTime: string;
}
export interface IMemberCardSearchForm {
  pageNum: number;
  pageSize: number;
  cardName: string;
}

export interface IMemberSearchForm {
  keyword: string;
  status: string | number;
  pageNum: number;
  pageSize: number;
}

export interface IMemberForm {
  memberCode?: string;
  telephone: string;
  memberName: string;
  memberNick: string;
  memberSex: number;
  birthDate: string;
  operator: string;
  remark: string;
}

export interface IMemberListRep {
  list: Array<IMemberListItem>;
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface IMemberListItem {
  memberCode: string;
  telephone: string;
  memberName: string;
  memberNick: string;
  memberSex: number;
  birthDate: string;
  cardCode: string;
  memberResource: string;
  operator: string;
  memberType: string;
  isFollow: number;
  followPerson: string;
  numberCard: string;
  status: number;
  startDate: string;
  endDate: string;
  lastSign: string;
  creator: string;
  updatePerson: string;
  remark: string;
}

export interface IMemberBasicInfo {
  memberCode: string;
  telephone: string;
  memberName: string;
  memberNick: string;
  memberSex: number;
  birthDate: string;
  cardCode: string;
  memberType: string;
  isFollow: number;
  followPerson: string;
  numberCard: string;
  status: string;
  startDate: string;
  endDate: string;
  lastSign: string;
  creator: string;
  remark: string;
  createTime: string;
}

export interface IMemberCardRecord {
  businessName: string;
  status: number;
  startDate: string;
  endDate: string;
  salesperson: string;
  remark: string;
  createTime: string;
}

export interface IMemberCourseRecord {
  businessName: string;
  businessType: string;
  status: number;
  courseRule: string;
  surplus: number;
  salesperson: string;
  startDate: string;
  endDate: string;
  remark: string;
  createTime: string;
}

export interface IMemberAccessRecord {
  storeName: string;
  status: number;
  remark: string;
  updateTime: string;
  createTime: string;
}

export interface IMemberDetailRep {
  memberBasicInfo: IMemberBasicInfo;
  memberCardRecords: Array<IMemberCardRecord>;
  courseRecords: Array<IMemberCourseRecord>;
  accessRecords: {
    list: Array<IMemberAccessRecord>;
    pageNum: number;
    pageSize: number;
    total: number;
  };
}
