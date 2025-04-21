<template>
  <div class="page-content">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.courseName"
          placeholder="请输入课程名称"
          clearable
        ></el-input>
      </el-col>
      <!-- <el-col :xs="24" :sm="12" :lg="6">
        <el-select v-model="searchForm.courseType" placeholder="请选择课程类型">
          <el-option label="IGCSE" value="IGCSE"></el-option>
          <el-option label="A-Level" value="A-Level"></el-option>
          <el-option label="AP" value="AP"></el-option>
        </el-select>
      </el-col> -->
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="search">搜索</el-button>
        <el-button type="success" @click="showDialog('add', {})"
          >新增</el-button
        >
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
          label="课程名称"
          prop="courseName"
          show-overflow-tooltip
        />
        <el-table-column
          label="课程体系"
          prop="courseSystemName"
          show-overflow-tooltip
        />
        <el-table-column
          label="课程代码"
          prop="courseCode"
          show-overflow-tooltip
        />
        <el-table-column label="操作时间" prop="ctime" show-overflow-tooltip />
        <el-table-column
          fixed="right"
          label="操作"
          width="250px"
          #default="scope"
        >
          <el-button
            link
            :icon="EditPen"
            type="primary"
            @click="showDialog('edit', scope.row)"
          >
            编辑
          </el-button>
          <el-button
            link
            :icon="Delete"
            style="color: #fa6962"
            @click="deleteCourse(scope.row)"
          >
            删除
          </el-button>
          <!-- <el-button
              link
              :icon="Document"
              style="color: blue"
              @click="deleteCourse(scope.row)"
            >
              真题库
            </el-button> -->
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加弹窗组件 -->
    <CourseDialog
      v-model:visible="dialogVisible"
      :dialog-type="dialogType"
      :row-data="currentRow"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Delete, EditPen, Document } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CourseService } from "@/api/courseApi";
import CourseDialog from "./comp/addPlan.vue";

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const tableData = ref([]);

const searchForm = reactive({
  courseName: ""
  // courseType: ""
});

// 弹窗相关状态
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const currentRow = ref<any>({});

// 搜索方法
const search = () => {
  currentPage.value = 1;
  getList();
};

// 获取列表数据
const getList = async (page = 1, size = 10) => {
  isLoading.value = true;
  try {
    const res = await CourseService.queryCourseBasicList({
      pageNum: page,
      pageSize: size,
      ...searchForm
    });
    if (res.code === 0) {
      tableData.value = res.data.list;
      total.value = res.data.total;
    }
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  getList(page, pageSize.value);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getList(currentPage.value, size);
};

const showDialog = (type: "add" | "edit", row?: any) => {
  dialogType.value = type;
  currentRow.value = row || {};
  dialogVisible.value = true;
};

const deleteCourse = (row: any) => {
  ElMessageBox.confirm("确定要删除该课程吗？", "删除课程", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error"
  }).then(async () => {
    try {
      const res = await CourseService.deleteCourseBasic(row.courseCode);
      if (res.code === 0) {
        ElMessage.success("删除成功");
        getList();
      }
    } catch (error) {}
  });
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;
}
</style>
