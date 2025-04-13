export interface LoginParams {
  username: string
  password: string
}

export interface pageParams {
  pageNum: number | string
  pageSize: number | string
  searchForm?: any,
  keyWord?: string
}
