export interface Announcement {
  noticeCode?: string;
  title?: string;
  noticeSystem?: string;
  noticeType?: string;
  content?: string;
  startTime?: string | null;
  endTime?: string | null;
  isTop?: number;
  priority?: number;
  operator?: string;
  ctime?: string;
}
