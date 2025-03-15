<template>
  <div class="salary-manage">
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      :columns="columns"
      layout="search,refresh"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px"> </el-form>
      </template>
      <template #bottom>
        <el-button type="primary" @click="handleBatchPay">批量发放</el-button>
        <el-button type="success" @click="handleImport">导入薪资</el-button>
        <el-button type="warning" @click="handleExport">导出薪资</el-button>
      </template>
    </table-bar>

    <art-table
      :data="salaryList"
      :loading="loading"
      :currentPage="searchForm.pageNum"
      :pageSize="searchForm.pageSize"
      :total="total"
      @page-change="changeCurrentPage"
      @selection-change="handleSelectionChange"
    >
      <template #default>
        <el-table-column type="selection" width="55" />
        <el-table-column :prop="columns[0].prop" :label="columns[0].label" width="180" />
        <el-table-column :prop="columns[1].prop" :label="columns[1].label" width="180" />
        <el-table-column :prop="columns[2].prop" :label="columns[2].label" width="180">
          <template #default="{ row }">
            {{ formatPrice(row.baseSalary) }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[3].prop" :label="columns[3].label" width="180">
          <template #default="{ row }">
            {{ formatPrice(row.bonus) }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[4].prop" :label="columns[4].label" width="180">
          <template #default="{ row }">
            {{ formatPrice(row.deduction) }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[5].prop" :label="columns[5].label" width="180">
          <template #default="{ row }">
            {{ formatPrice(row.actualSalary) }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[6].prop" :label="columns[6].label" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ salaryStatusOptions.find((item) => item.value === row.status)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :prop="columns[7].prop" :label="columns[7].label" min-width="180" />
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)" :icon="View">详情</el-button>
            <el-button v-if="row.status === 0" link type="success" @click="handlePay(row)" :icon="Check"
              >发放</el-button
            >
            <el-button link type="primary" @click="handleEdit(row)" :icon="EditPen">编辑</el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 编辑薪资弹窗 -->
    <el-dialog v-model="dialogVisible" :title="currentSalary ? '编辑薪资' : '新增薪资'" width="600px" destroy-on-close>
      <el-form :model="salaryForm" ref="salaryFormRef" :rules="salaryRules" label-width="100px"> </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 薪资详情弹窗 -->
    <el-dialog v-model="detailVisible" title="薪资详情" width="800px" destroy-on-close> </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import type { FormInstance } from "element-plus";
  import { ElMessage, ElMessageBox } from "element-plus";
  import { View, EditPen, Check } from "@element-plus/icons-vue";
  import { IAddSalary, ISearchForm } from "@/interface/ISalary";

  const columns = [
    { label: "员工姓名", prop: "employeeName" },
    { label: "发放月份", prop: "salaryMonth" },
    { label: "基本工资", prop: "baseSalary" },
    { label: "奖金", prop: "bonus" },
    { label: "扣除金额", prop: "deduction" },
    { label: "实发工资", prop: "actualSalary" },
    { label: "发放状态", prop: "status" },
    { label: "发放时间", prop: "payTime" },
  ];

  const salaryStatusOptions = [
    { label: "未发放", value: 0 },
    { label: "已发放", value: 1 },
  ];

  const searchFormRef = ref<FormInstance>();
  const salaryFormRef = ref<FormInstance>();
  const dialogVisible = ref<boolean>(false);
  const detailVisible = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const total = ref<number>(0);
  const salaryList = ref<any[]>([]);
  const currentSalary = ref<IAddSalary | undefined>(undefined);
  const selectedRows = ref<any[]>([]);

  const searchForm = reactive<ISearchForm>({
    pageNum: 1,
    pageSize: 10,
  });

  const salaryForm = reactive<IAddSalary>({
    id: -1, //默认-1就是没有id
    account: "",
    baseSalary: 0,
    performanceSalary: 0,
    subsidy: 0,
    overtimePay: 0,
    deductions: 0,
    personTax: 0,
  });

  const salaryRules = {
    baseSalary: [{ required: true, message: "请输入基本工资", trigger: "blur" }],
    bonus: [{ required: true, message: "请输入奖金", trigger: "blur" }],
    deduction: [{ required: true, message: "请输入扣除金额", trigger: "blur" }],
  };

  // 格式化金额
  const formatPrice = (price: number) => {
    return `￥${price?.toFixed(2)}`;
  };

  // 重置表单
  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    searchForm.pageNum = 1;
    getSalaryList();
  };

  // 搜索
  const search = () => {
    searchForm.pageNum = 1;
    getSalaryList();
  };

  // 切换页码
  const changeCurrentPage = (page: number) => {
    searchForm.pageNum = page;
    getSalaryList();
  };

  // 选择行变化
  const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows;
  };

  // 获取列表
  const getSalaryList = async () => {
    loading.value = true;
    try {
      // 这里替换为实际的 API 调用
      // const res = await SalaryService.getList(searchForm)
      // if (res.code === 0) {
      //   salaryList.value = res.data.list
      //   total.value = res.data.total
      // }
    } catch (error) {
      ElMessage.error("获取列表失败");
    }
    loading.value = false;
  };

  // 查看详情
  const handleDetail = (row: any) => {
    currentSalary.value = row;
    detailVisible.value = true;
  };

  // 编辑
  const handleEdit = (row: any) => {
    currentSalary.value = row;
    Object.assign(salaryForm, row);
    dialogVisible.value = true;
  };

  // 单个发放
  const handlePay = async (row: any) => {
    try {
      await ElMessageBox.confirm("确认发放该员工的薪资吗？", "提示");
      // 这里替换为实际的 API 调用
      // await SalaryService.pay(row.id)
      ElMessage.success("发放成功");
      getSalaryList();
    } catch (error) {
      console.error(error);
    }
  };

  // 批量发放
  const handleBatchPay = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("请选择要发放的记录");
      return;
    }
    try {
      await ElMessageBox.confirm("确认发放选中员工的薪资吗？", "提示");
      const ids = selectedRows.value.map((row) => row.id);
      // 这里替换为实际的 API 调用
      // await SalaryService.batchPay(ids)
      ElMessage.success("发放成功");
      getSalaryList();
    } catch (error) {
      console.error(error);
    }
  };

  // 导入
  const handleImport = () => {
    // 实现导入逻辑
  };

  // 导出
  const handleExport = () => {
    // 实现导出逻辑
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!salaryFormRef.value) return;

    await salaryFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          // 这里替换为实际的 API 调用
          // if (currentSalary.value) {
          //   await SalaryService.update(currentSalary.value.id, salaryForm)
          // } else {
          //   await SalaryService.create(salaryForm)
          // }
          ElMessage.success("操作成功");
          dialogVisible.value = false;
          getSalaryList();
        } catch (error) {
          ElMessage.error("操作失败");
        }
      }
    });
  };

  onMounted(() => {
    getSalaryList();
  });
</script>

<style lang="scss" scoped>
  .salary-manage {
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
</style>
