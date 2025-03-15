<template>
  <div class="page-content">
    <table-bar :showTop="false" @search="search" @reset="resetForm(searchFormRef)" layout="search,refresh">
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px" class="search-form">
          <div class="search-container">
            <div class="search-left">
              <el-row :gutter="24" class="search-row">
                <el-col :span="6">
                  <el-form-item label="收支类型" prop="type">
                    <el-select v-model="searchForm.type" placeholder="请选择收支类型" clearable class="w-full">
                      <el-option label="收入" value="income" />
                      <el-option label="支出" value="expense" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="订单号" prop="orderId">
                    <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="课程类型" prop="businessCode">
                    <el-select v-model="searchForm.businessCode" placeholder="请选择课程类型" clearable class="w-full">
                      <el-option v-for="item in courseTypeOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6" v-if="searchForm.businessCode">
                  <el-form-item :label="searchForm.businessCode === 'MEMBER_CARD'
                    ? '会员卡名称'
                    : '私教课名称'
                    " prop="revenueType">
                    <el-select v-model="searchForm.revenueType"
                      :placeholder="`请选择${searchForm.businessCode === 'MEMBER_CARD' ? '会员卡名称' : '私教课名称'}`" clearable
                      class="w-full">
                      <el-option v-for="item in revenueTypeOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24" class="search-row">
                <el-col :span="6">
                  <el-form-item label="经办人" prop="operator">
                    <el-select v-model="searchForm.operator" placeholder="请选择经办人" clearable filterable remote
                      :remote-method="queryOperators" :loading="operatorLoading" class="w-full">
                      <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="时间范围">
                    <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                      end-placeholder="结束日期" value-format="YYYY-MM-DD" class="w-full" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-form>
      </template>
    </table-bar>

    <art-table :data="tableData" :total="total" :current-page="currentPage" :page-size="pageSize"
      @page-change="handlePageChange" @size-change="handleSizeChange" :loading="isLoading">
      <template #default>
        <el-table-column label="会员名称" prop="memberName" show-overflow-tooltip width="100px" />
        <el-table-column label="类型" prop="type" show-overflow-tooltip width="80px" />
        <el-table-column label="订单编号" prop="orderId" show-overflow-tooltip />
        <el-table-column label="业务类型" prop="businessName" show-overflow-tooltip width="100px" />
        <el-table-column label="经办人名称" prop="operatorName" width="120px" show-overflow-tooltip />
        <el-table-column label="金额" prop="amount" show-overflow-tooltip width="120px">
          <template #default="{ row }">
            <span style="color: #000">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="退款金额" prop="refundAmount" show-overflow-tooltip width="120px">
          <template #default="{ row }">
            <span style="color: #000">¥{{ row.refundAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="付款状态" prop="status" width="100px">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建日期" prop="createTime" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDate(scope.row.createTime, "YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
      </template>
    </art-table>
  </div>
</template>

<script setup lang="ts">
import {
  EditPen,
  Delete,
  Key,
  More,
  View,
  RefreshRight
} from "@element-plus/icons-vue"
import type { FormInstance, FormRules } from "element-plus"
import { ElMessageBox, ElMessage } from "element-plus"
import { RevenueService } from "@/api/revenue"
import { ApiService } from "@/api/apiApi"
import { UserService } from "@/api/usersApi"
import { formatDate } from "@/utils/utils"
import { useRouter } from "vue-router"
import { ref, reactive } from "vue"
import { debounce } from "lodash"

const router = useRouter()
const dialogType = ref("add")
const dialogVisible = ref(false)

const searchFormRef = ref<FormInstance>()
const searchForm = reactive({
  type: "",
  orderId: "",
  businessCode: "",
  operator: ""
})
const dateRange = ref([])

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(true)
const tableData = ref([])
const courseTypeOptions = ref([])
// 列表接口
const getUserList = async (pageNo = 1, pageSize = 10) => {
  isLoading.value = true
  const startTime = dateRange.value.length
    ? dateRange.value[0] + " 00:00:00"
    : ""
  const endTime = dateRange.value.length ? dateRange.value[1] + " 23:59:59" : ""
  const data = {
    pageNo,
    pageSize,
    ...searchForm,
    startTime,
    endTime
  }
  const res = await RevenueService.getRevenueList(data)
  if (res.code === 0) {
    isLoading.value = false
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const search = () => {
  currentPage.value = 1
  getUserList(1, pageSize.value)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  getUserList(page, pageSize.value)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  getUserList(currentPage.value, size)
}

const deleteUser = () => {
  ElMessageBox.confirm("确定要注销该用户吗？", "注销用户", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error"
  }).then(() => {
    ElMessage.success("注销成功")
  })
}

// 角色选项数据
const roleOptions = ref([])

// 获取课程类型
const getCourseType = async () => {
  const res = await ApiService.getDictConfig("storeIncomeBusinessTypeEnum")
  courseTypeOptions.value = res.data.filter((item: any) => item.value !== "ALL")
}
const revenueTypeOptions = ref([])
// 获取卡号名称
const getRevenueType = async () => {
  let data = {
    businessType: searchForm.businessCode,
    keyWord: ""
  }
  const res = await RevenueService.getRevenuebusinessCode(data)
  revenueTypeOptions.value = res.data.map((item: any) => ({
    value: item.businessCode,
    label: item.businessName
  }))
}

// 经办人选项
const operatorOptions = ref([])
const operatorLoading = ref(false)

// 创建防抖的查询方法
const debouncedQuery = debounce(async (query: string) => {
  let data = {
    pageNo: 1,
    pageSize: 50,
    userName: query
  }
  if (query) {
    operatorLoading.value = true
    try {
      // 这里替换成实际的API调用
      const res = await UserService.queryStoreUserList(data)
      if (res.code === 0) {
        operatorOptions.value = res.data.list.map((item: any) => ({
          value: item.account,
          label: item.userName
        }))
      }
    } catch (error) {
      ElMessage.error("获取经办人列表失败")
    } finally {
      operatorLoading.value = false
    }
  } else {
    operatorOptions.value = []
  }
}, 1000)

// 查询经办人
const queryOperators = (query: string) => {
  debouncedQuery(query)
}

// 组件卸载时取消未执行的防抖函数
onBeforeUnmount(() => {
  debouncedQuery.cancel()
})

watch(
  () => searchForm.businessCode,
  (val) => {
    if (val) getRevenueType()
  },
  {
    immediate: true
  }
)

// 添加状态类型判断函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    待付款: "danger",
    已付款: "success",
    已取消: "info",
    已退款: "warning"
  }
  return statusMap[status] || ""
}

onMounted(() => {
  getUserList()
  getCourseType()
})
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;

  .user {
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }

    >div {
      margin-left: 10px;

      .user-name {
        font-weight: 500;
        color: var(--art-text-gray-800);
      }
    }
  }
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.search-left {
  flex: 1;
  margin-right: 24px;
}

.search-right {
  padding-top: 4px;
  white-space: nowrap;

  .el-button {
    margin-left: 12px;

    &:first-child {
      margin-left: 0;
    }
  }
}

.search-row {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.w-full {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__content) {
  .el-date-editor {
    width: 100%;
  }
}
</style>
