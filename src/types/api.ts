// API响应的基础接口
export interface BaseResult<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

// 分页查询参数
export interface PageQuery {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}

// 分页响应数据
export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
} 