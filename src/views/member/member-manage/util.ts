import dayjs from "dayjs";

// 获取会员状态标签
export const getMemberStatusTag = (status?: string) => {
  if (status === "ACTIVATED") {
    return "success";
  } else if (status === "EXPIRED") {
    return "danger";
  } else {
    return "info";
  }
};

//日期格式化
export const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};
