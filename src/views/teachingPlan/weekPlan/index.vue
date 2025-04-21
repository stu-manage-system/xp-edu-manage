<template>
  <div class="class-plan">
    <div class="search-bar">
      <el-form :inline="true" class="search-form">
        <div class="form-container">
          <el-form-item label="教师">
            <el-select
              v-model="searchForm.userCode"
              placeholder="请选择教师"
              class="fixed-width-input"
              filterable
              remote
              remote-show-suffix
              clearable
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
          <el-form-item label="课程">
            <el-select
              v-model="searchForm.subjectName"
              placeholder="请选择课程"
              class="fixed-width-input"
              filterable
              remote
              remote-show-suffix
              clearable
              :remote-method="remoteMethodSubject"
            >
              <el-option
                v-for="item in subjectList"
                :key="item.courseCode"
                :label="item.courseName"
                :value="item.courseCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="年级/班级">
            <el-select
              v-model="searchForm.gradeName"
              placeholder="请选择年级/班级"
              class="fixed-width-input"
              clearable
              :remote-method="remoteMethodGrade"
              filterable
              remote
              remote-show-suffix
            >
              <el-option
                v-for="item in gradeList"
                :key="item.gradeCode"
                :label="item.gradeName"
                :value="item.gradeCode"
              />
            </el-select>
          </el-form-item>
          <div class="button-group">
            <el-button plain @click="handleSearch">搜索</el-button>
            <el-button type="primary" @click="handleExport">导出</el-button>
            <el-button type="success" @click="showDialog({}, 'add')"
              >新增</el-button
            >
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
      :objectSpanMethod="objectSpanMethod"
    >
      <el-table-column label="序号" prop="index" width="80" align="center" />
      <el-table-column label="教师" prop="userName" align="center" />
      <el-table-column label="年级" prop="gradeName" align="center" />
      <el-table-column label="班级" prop="className" align="center" />
      <el-table-column
        label="开始日期"
        prop="startTime"
        align="center"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        label="结束日期"
        prop="endTime"
        align="center"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column label="课程" prop="subjectName" align="center" />
      <el-table-column label="周计划明细" align="center">
        <el-table-column
          label="工作日"
          prop="weekday"
          width="120"
          align="center"
        />
        <el-table-column
          label="课时"
          prop="period"
          width="120"
          align="center"
        />
        <el-table-column
          label="内容"
          prop="content"
          width="120"
          align="center"
        />
      </el-table-column>
      <el-table-column
        label="更新时间"
        prop="ctime"
        align="center"
        width="150"
        show-overflow-tooltip=""
      />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            @click="showDialog(row, 'edit')"
          >
            编辑
          </el-button>
          <el-popconfirm
            title="确认删除该周计划吗？"
            @confirm="handleDelete(row, {})"
            confirm-button-text="确定"
            cancel-button-text="取消"
            width="200px"
            icon="CircleClose"
            icon-color="red"
          >
            <template #reference>
              <el-button link :icon="Delete" type="danger"> 删除 </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </art-table>

    <!-- 对话框组件 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增周计划' : '编辑周计划'"
      v-model="dialogVisible"
      width="80%"
      :close-on-click-modal="false"
    >
      <AddWeek
        :type="dialogType"
        @close="closeDialog"
        @refresh="handleSearch"
        :id="courseId"
        ref="addWeekPlanRef"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { CourseService } from "@/api/courseApi";
import { UserService } from "@/api/usersApi";
import { GradeService } from "@/api/gradeApi";
import { Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { nextTick, reactive, ref, onMounted } from "vue";
import AddWeek from "./comp/addWeek.vue";
import { debounce } from "lodash";
import { TeachPlanService } from "@/api/teachPlan";

const isLoading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
// 搜索表单数据
const searchForm = reactive({
  userCode: "",
  dateRange: [],
  subjectName: "",
  gradeName: ""
});

const tableData = ref([]);

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref("add");
const addWeekPlanRef = ref(null);
const courseId = ref(null);
// 处理单元格合并
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 7 || columnIndex === 8 || columnIndex === 9) {
    // 时间内容和事件列不合并
    return {
      rowspan: 1,
      colspan: 1
    };
  }
  const currentId = tableData.value[rowIndex].id;
  if (rowIndex === 0) {
    let count = 1;
    for (let i = 1; i < tableData.value.length; i++) {
      if (tableData.value[i].id === currentId) {
        count++;
      } else {
        break;
      }
    }
    return {
      rowspan: count,
      colspan: 1
    };
  } else {
    const prevId = tableData.value[rowIndex - 1].id;
    if (currentId === prevId) {
      return {
        rowspan: 0,
        colspan: 0
      };
    } else {
      let count = 1;
      for (let i = rowIndex + 1; i < tableData.value.length; i++) {
        if (tableData.value[i].id === currentId) {
          count++;
        } else {
          break;
        }
      }
      return {
        rowspan: count,
        colspan: 1
      };
    }
  }
};

const doSearch = debounce(() => {
  handleSearch();
}, 300);

// 搜索方法
const handleSearch = async () => {
  isLoading.value = true;
  try {
    const res = await TeachPlanService.queryWeekPlanList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    });
    if (res.code === 0) {
      let flattenedData = [];
      let count = 0;
      res.data.list.forEach((item) => {
        count++;
        let weekPlanDetailArray = [];
        try {
          weekPlanDetailArray = JSON.parse(item.weekPlanDetail || "[]");
          if (!Array.isArray(weekPlanDetailArray)) {
            weekPlanDetailArray = []; // 确保是数组
          }
        } catch (e) {
          console.error("解析 weekPlanDetail 失败:", e);
          weekPlanDetailArray = [];
        }

        if (weekPlanDetailArray.length === 0) {
          flattenedData.push({
            ...item,
            id: item.weekCode, // 使用 courseCode 作为 id
            weekday: "",
            period: "",
            content: "",
            weekPlanDetailArray: []
          });
        } else {
          weekPlanDetailArray.forEach((context) => {
            flattenedData.push({
              index: count,
              ...item,
              id: item.weekCode, // 使用 courseCode 作为 id
              weekday: context.weekday,
              period: context.period,
              content: context.content,
              weekPlanDetailArray: weekPlanDetailArray
            });
          });
        }
      });
      tableData.value = flattenedData;
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
  doSearch();
};

// 分页方法
const handleSizeChange = (size) => {
  currentPage.value = 1;
  pageSize.value = size;
  doSearch();
};

// 导出方法
const handleExport = () => {
  // TODO: 实现导出逻辑
};

// 显示对话框方法
const showDialog = (row, type) => {
  console.log("row", row);
  dialogType.value = type;
  dialogVisible.value = true;
  courseId.value = row.weekCode;
  nextTick(() => {
    if (type === "edit") {
      addWeekPlanRef.value?.getWeekPlanDetail(row.weekCode);
    } else {
      addWeekPlanRef.value?.getWeekPlanDetail();
    }
  });
};

// 关闭对话框方法
const closeDialog = () => {
  dialogVisible.value = false;
};

// 删除方法
const handleDelete = async (row) => {
  try {
    const res = await TeachPlanService.deleteWeekPlan(row.weekCode);
    if (res.code === 0) {
      ElMessage.success("删除成功");
      handleSearch();
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

const teacherList = ref([]);
const subjectList = ref([]);
const gradeList = ref([]);
const remoteMethod = async (query) => {
  const res = await UserService.queryStoreUserList({
    pageNum: 1,
    pageSize: 10000,
    keyWord: query
  });
  teacherList.value = res.data.list;
};
const remoteMethodSubject = async (query) => {
  const res = await CourseService.queryCourseBasicList({
    pageNum: 1,
    pageSize: 10000,
    courseName: query
  });
  subjectList.value = res.data.list;
};
const remoteMethodGrade = async (query) => {
  const res = await GradeService.getGradeList({
    pageNum: 1,
    pageSize: 10000,
    keyWord: query
  });
  gradeList.value = res.data.list.map((item) => ({
    gradeCode: item.code,
    gradeName: item.gradeName + "/" + item.className
  }));
};

onMounted(() => {
  handleSearch();
});
</script>

<style scoped lang="scss">
.class-plan {
  padding: 20px;
}

.search-bar {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;

  .search-form {
    margin: 20px 0;

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
  padding: 0;
}

:deep(.any-table .el-table td:first-of-type) {
  padding-left: 0 !important;
}
:deep(.any-table .el-table td:last-of-type) {
  padding-right: 0 !important;
}
:deep(.any-table .el-table tr) {
  height: 47px !important;
}
</style>
