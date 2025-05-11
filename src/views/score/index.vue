<template>
  <div class="page-content">
    <div class="search-bar">
      <el-form :inline="true" class="search-form">
        <div class="form-container">
          <el-form-item label="教师">
            <el-select
              v-model="searchForm.userCode"
              placeholder="请选择教师"
              class="fixed-width-input"
              clearable
              filterable
              remote
              remote-show-suffix
              :remote-method="remoteMethod"
            >
              <el-option
                v-for="item in teacherList"
                :key="item.userCode"
                :label="item.userName"
                :value="item.userCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="学生">
            <el-select
              v-model="searchForm.stuCode"
              placeholder="请选择学生"
              class="fixed-width-input"
              clearable
              filterable
              remote
              remote-show-suffix
              :remote-method="remoteStudentMethod"
            >
              <el-option
                v-for="item in studentList"
                :key="item.stuCode"
                :label="item.stuName"
                :value="item.stuCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程">
            <el-select
              v-model="searchForm.courseCode"
              placeholder="请选择课程"
              class="fixed-width-input"
              clearable
              filterable
              remote
              remote-show-suffix
              :remote-method="remoteSubjectMethod"
            >
              <el-option
                v-for="item in subjectList"
                :key="item.courseCode"
                :label="item.courseName"
                :value="item.courseCode"
              />
            </el-select>
          </el-form-item>
          <div class="button-group">
            <el-button plain @click="handleSearch">搜索</el-button>
            <el-button type="primary" @click="handleExport">导出</el-button>
            <el-button type="success" @click="handleAdd">新增</el-button>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 表格 -->
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
      <el-table-column
        label="学期"
        prop="termName"
        align="center"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column label="教师" prop="userName" align="center" width="80" />
      <el-table-column
        label="科目"
        prop="courseName"
        align="center"
        width="80"
      />
      <el-table-column label="年级" prop="gradeName" align="center" />
      <el-table-column label="班级" prop="className" align="center" />
      <el-table-column
        label="更新时间"
        prop="ctime"
        align="center"
        width="200"
      />
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            @click="showDialog('edit', row)"
          >
            编辑
          </el-button>
          <el-button
            link
            :icon="View"
            plain
            color="#67c23a"
            @click="showDialog('view', row)"
          >
            详情
          </el-button>
          <el-popconfirm
            title="确认删除该成绩吗？"
            @confirm="handleDelete(row)"
            confirm-button-text="确定"
            cancel-button-text="取消"
            width="200px"
            icon="CircleClose"
            icon-color="red"
          >
            <template #reference>
              <el-button link :icon="Delete" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </art-table>

    <!-- 对话框组件 -->
    <el-dialog
      :title="
        dialogType === 'add'
          ? '新增成绩'
          : dialogType === 'edit'
            ? '编辑成绩'
            : '查看成绩'
      "
      v-model="dialogVisible"
      width="80%"
      :close-on-click-modal="false"
    >
      <add-semester
        v-if="dialogType === 'add' || dialogType === 'edit'"
        :type="dialogType"
        @close="closeDialog"
        @refresh="handleSearch"
        :id="courseId"
        ref="addSemesterRef"
      />
      <plan-detail
        v-if="dialogType === 'view'"
        :id="courseId"
        @close="closeDialog"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { nextTick, reactive, ref, onMounted } from "vue";
import AddSemester from "./comp/addSemester.vue";
import PlanDetail from "./comp/detail.vue";
import { UserService } from "@/api/usersApi";
import { ScoreService } from "@/api/score";
import { CourseService } from "@/api/courseApi";
import { StudentService } from "@/api/studentApi";

const isLoading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
// 搜索表单数据
const searchForm = reactive({
  userCode: "",
  stuCode: "",
  courseCode: ""
});
const tableData = ref([]);
// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref("add");
const addSemesterRef = ref(null);
const courseId = ref(null);
// 搜索方法
const handleSearch = async () => {
  try {
    isLoading.value = true;
    const res = await ScoreService.getScoreList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    });
    if (res.code === 0) {
      tableData.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 分页方法
const handlePageChange = (page) => {
  currentPage.value = page;
  handleSearch();
};

const handleSizeChange = (size) => {
  currentPage.value = 1;
  pageSize.value = size;
  handleSearch();
};

// 导出方法
const handleExport = () => {
  // TODO: 实现导出逻辑
};

// 显示对话框方法
const showDialog = (type, row = {}) => {
  dialogType.value = type;
  dialogVisible.value = true;
  courseId.value = row.uniqueCode;
  nextTick(() => {
    if (type === "edit") {
      addSemesterRef.value?.getSemesterDetail(row.uniqueCode);
    }
  });
};

// 关闭对话框方法
const closeDialog = () => {
  dialogVisible.value = false;
  handleSearch();
};

// 新增方法
const handleAdd = () => {
  showDialog("add");
};

// 删除方法
const handleDelete = async (row) => {
  try {
    const res = await ScoreService.deleteScore(row.uniqueCode);
    if (res.code === 0) {
      ElMessage.success("删除成功");
      handleSearch();
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};
const teacherList = ref([]);
const remoteMethod = async (query) => {
  const res = await UserService.queryStoreUserList({
    pageNum: 1,
    pageSize: 100,
    keyWord: query
  });
  teacherList.value = res.data.list;
};
const subjectList = ref([]);
const remoteSubjectMethod = async (query) => {
  const res = await CourseService.queryCourseBasicList({
    pageNum: 1,
    pageSize: 100,
    courseName: query
  });
  subjectList.value = res.data.list;
};
const studentList = ref([]);
const remoteStudentMethod = async (query) => {
  const res = await StudentService.queryStoresStudentList({
    pageNum: 1,
    pageSize: 100,
    stuClass: query
  });
  studentList.value = res.data.list;
};

onMounted(() => {
  handleSearch();
});
</script>

<style scoped lang="scss">
.page-content {
  padding: 20px;
}

.search-bar {
  display: flex;
  //justify-content: center;
  align-items: flex-start;

  .search-form {
    // margin: 20px 0;

    .form-container {
      display: flex;
      flex-wrap: wrap;
    }
  }
}

.fixed-width-input {
  width: 180px !important;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-left: 10px;
}

:deep(.el-dialog__body) {
  padding: 0 !important;
}
</style>
