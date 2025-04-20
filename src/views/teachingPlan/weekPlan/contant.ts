export interface PlanItem {
  weekday: string;
  period: string;
  content: string;
}

export interface FormData {
  weekCode: string;
  name: string;
  userCode: string;
  userName: string;
  gradeName: string;
  className: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  termCode: string;
  termName: string;
  termNumber: string;
  weekPlanDetail: PlanItem[];
  subjectCount?: string;
  processRate: number;
  remark: string;
}