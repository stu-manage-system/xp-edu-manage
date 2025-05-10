<template>
  <div class="page-content">
    <el-row :gutter="15" style="margin-bottom: 16px">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.groupName"
          placeholder="请输入导师组名"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="4">
        <el-button plain @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :loading="isLoading"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column label="导师组名" prop="groupName" align="center" />
      <el-table-column label="导师组长" prop="leaderName" align="center" />
      <el-table-column label="班级类型" prop="classType" align="center" />
      <el-table-column label="导师组成员" prop="memberNames" align="center">
        <template #default="{ row }">
          <el-tag
            v-for="(name, idx) in row.memberNames"
            :key="idx"
            style="margin: 2px"
            type="info"
            size="small"
          >
            {{ name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            @click="handleEdit(row)"
            style="margin-right: 8px"
          >
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除该导师组吗？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link :icon="Delete" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </art-table>

    <MentorGroupDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :edit-data="editRow"
      @save="handleDialogSave"
      @cancel="handleDialogCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { EditPen, Delete } from "@element-plus/icons-vue";
import MentorGroupDialog from "./MentorGroupDialog.vue";

const searchForm = reactive({
  groupName: ""
});

const tableData = ref([
  // 示例数据
  {
    groupName: "导师组A",
    leaderName: "张三",
    classType: "普通班",
    memberNames: ["李四", "王五", "赵六"]
  }
  // ...更多数据
]);
const total = ref(1);
const currentPage = ref(1);
const pageSize = ref(10);
const isLoading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const editRow = ref<any>(null);

function handleSearch() {
  // 搜索逻辑
}
function handleAdd() {
  dialogType.value = "add";
  editRow.value = null;
  dialogVisible.value = true;
}
function handleEdit(row: any) {
  dialogType.value = "edit";
  editRow.value = { ...row };
  dialogVisible.value = true;
}
function handleDelete(row: any) {
  // 删除逻辑
}
function handlePageChange(page: number) {
  currentPage.value = page;
  // 分页逻辑
}
function handleSizeChange(size: number) {
  pageSize.value = size;
  // 分页逻辑
}

function handleDialogSave(data: any) {
  // 保存回调，新增或编辑
  dialogVisible.value = false;
  // 这里可以根据dialogType判断是新增还是编辑，进行数据处理
}
function handleDialogCancel() {
  dialogVisible.value = false;
}
</script>

<style scoped>
.page-content {
  padding: 24px;
}
</style>
