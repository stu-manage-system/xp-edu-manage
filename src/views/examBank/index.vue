<template>
  <div class="page-content">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.keyWord"
          placeholder="请输入搜索关键词"
          clearable
          @keyup.enter="search"
        ></el-input>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="search">搜索</el-button>
        <el-button @click="showDialog('add', {})">添加</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <template #default>
        <el-table-column label="序号" type="index" width="80px" />
        <el-table-column
          label="课程类型"
          prop="courseType"
          show-overflow-tooltip
        />
        <el-table-column
          label="创建时间"
          prop="createTime"
          show-overflow-tooltip
        />
        <el-table-column
          label="更新时间"
          prop="updateTime"
          show-overflow-tooltip
        />
        <el-table-column label="创建人" prop="creator" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" show-overflow-tooltip />
        <el-table-column
          fixed="right"
          label="操作"
          width="180"
          #default="scope"
        >
          <div style="display: flex; justify-content: center">
            <el-button
              link
              :icon="EditPen"
              type="primary"
              @click="showDialog('edit', scope.row)"
            >
              修改
            </el-button>
            <el-button
              link
              :icon="Delete"
              style="color: #fa6962"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </el-table-column>
      </template>
    </art-table>

    <!-- 新增/编辑对话框 -->
    <add-and-edit-dialog
      v-model:visible="dialogVisible"
      :dialog-type="dialogType"
      :form-data="form"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import AddAndEditDialog from "./comp/addAndEdit.vue";

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const tableData = ref([]);
const dialogVisible = ref(false);
const dialogType = ref("add");
const form = ref({
  courseType: ""
});

const searchForm = reactive({
  keyWord: ""
});

// 搜索方法
const search = () => {
  currentPage.value = 1;
  fetchData();
};

// 获取列表数据
const fetchData = async (page = 1, size = 10) => {
  isLoading.value = true;
  try {
    // TODO: 替换为实际的API调用
    // const res = await ExamBankService.getList({
    //   pageNum: page,
    //   pageSize: size,
    //   ...searchForm
    // })
    // if (res.code === 0) {
    //   tableData.value = res.data.list
    //   total.value = res.data.total
    // }
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchData(page, pageSize.value);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchData(currentPage.value, size);
};

const showDialog = (type: string, row?: any) => {
  dialogType.value = type;
  form.value =
    type === "add"
      ? {
          knowledgeType: "",
          examName: "",
          examQuestion: "",
          examDate: "",
          examFile: null,
          answerFile: null
        }
      : { ...row };
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm("确认删除该课程吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      // TODO: 实现删除逻辑
      // const res = await ExamBankService.delete(row.id)
      // if (res.code === 0) {
      //   ElMessage.success('删除成功')
      //   fetchData()
      // }
    } catch (error) {
      ElMessage.error("删除失败");
    }
  });
};

const handleDialogSubmit = async (formData: any) => {
  try {
    // TODO: 调用新增或编辑接口
    // const res = await (dialogType.value === 'add'
    //   ? ExamBankService.add(formData)
    //   : ExamBankService.update(formData))

    ElMessage.success(dialogType.value === "add" ? "新增成功" : "编辑成功");
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error(dialogType.value === "add" ? "新增失败" : "编辑失败");
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;
}
</style>
