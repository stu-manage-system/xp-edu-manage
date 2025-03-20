export interface PlanItem {
  weekday: string;
  period: string;
  content: string;
}

export interface FormData {
  teacher: string;
  grade: string;
  class: string;
  startDate: string;
  endDate: string;
  courseSystem: string;
  planList: PlanItem[];
  homework: string;
  progress: string;
}