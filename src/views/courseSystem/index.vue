<template>
  <div class="page-content">
    <el-row>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入课程体系"
          clearable
        ></el-input>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="search">搜索</el-button>
        <el-button @click="showDialog('add')">添加</el-button>
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
      row-key="code"
    >
      <template #default>
        <el-table-column label="课程体系" prop="name" show-overflow-tooltip />
        <el-table-column
          label="操作人"
          prop="creatorName"
          show-overflow-tooltip
        />
        <el-table-column label="更新时间" prop="ctime" show-overflow-tooltip />
        <el-table-column
          fixed="right"
          label="操作"
          width="300px"
          #default="scope"
        >
          <div style="display: flex; justify-content: flex-start">
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
            <el-button
              link
              :icon="Document"
              style="color: #67c23a"
              @click="showDialog('addSon', scope.row)"
              v-if="scope.row.parentId === -1"
            >
              添加子类别
            </el-button>
          </div>
        </el-table-column>
      </template>
    </art-table>

    <!-- 引入子组件 -->
    <CourseForm
      v-model:visible="dialogVisible"
      :type="dialogType"
      :course-data="currentCourse"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Delete, EditPen, Document } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CourseForm from "./comp/addSystem.vue";
import { CourseService } from "@/api/courseApi";

// 弹窗控制
const dialogVisible = ref(false);
const dialogType = ref("add");
const currentCourse = ref({});

// 搜索表单
const searchForm = reactive({
  name: ""
});

// 表格数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const tableData = ref([]);

// 显示弹窗
const showDialog = (type: string, row?: any) => {
  dialogType.value = type;
  currentCourse.value = row || {};
  dialogVisible.value = true;
};

// 处理表单提交成功
const handleSuccess = () => {
  dialogVisible.value = false;
  getList();
};

// 搜索方法
const search = () => {
  currentPage.value = 1;
  getList();
};
const cleanEmptyChildren = (node: any): any => {
  const newNode = { ...node };
  if (Array.isArray(newNode.children)) {
    newNode.children = newNode.children.map(cleanEmptyChildren);
    if (newNode.children.length === 0) {
      delete newNode.children;
    }
  }
  return newNode;
};

// 获取列表数据
const getList = async (page = 1, size = 10) => {
  isLoading.value = true;
  try {
    const res = await CourseService.queryCourseSystemList({
      data: {
        ...searchForm
      }
    });
    if (res.code === 0) {
      tableData.value = res.data.map(cleanEmptyChildren);
      console.log("tableData.value", tableData.value);
      total.value = res.data.total || 0;
    }
  } finally {
    isLoading.value = false;
  }
};

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  getList(page, pageSize.value);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getList(currentPage.value, size);
};

// 删除课程
const deleteCourse = (row: any) => {
  ElMessageBox.confirm("确定要删除该课程体系吗？", "删除课程", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error"
  }).then(async () => {
    try {
      const res = await CourseService.deleteCourseSystem(row.code);
      if (res.code === 0) {
        ElMessage.success("删除成功");
        getList();
      }
    } catch (error) {
      ElMessage.error("删除失败");
    }
  });
};

// 初始化
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
