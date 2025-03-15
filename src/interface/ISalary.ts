export interface ISalaryDetail {
  id: number;
  account: string;
  employeeName: string;
  baseSalary: number;
  performanceSalary: number;
  subsidy: number;
  overtimePay: number;
  deductions: number;
  personTax: number;
  remark: string;
}

export interface IAddSalary {
  /** 员工id */
  id?: number;
  /** 员工账号 */
  account: string;
  /** 基本工资 */
  baseSalary: number;
  /** 绩效工资 */
  performanceSalary: number;
  /** 补贴 */
  subsidy: number;
  /** 加班费 */
  overtimePay: number;
  /** 扣除 */
  deductions: number;
  /** 个人税 */
  personTax: number;
}

export interface ISearchForm {
  pageNum: number;
  pageSize: number;
}
