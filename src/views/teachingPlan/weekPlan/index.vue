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
            >
              <el-option label="徐清妍" value="徐清妍" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="fixed-width-input"
            />
          </el-form-item>
          <el-form-item label="科目">
            <el-select
              v-model="searchForm.subjectName"
              placeholder="请选择科目"
              class="fixed-width-input"
            >
              <el-option label="艺术" value="艺术" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级/班级">
            <el-select
              v-model="searchForm.gradeName"
              placeholder="请选择年级/班级"
              class="fixed-width-input"
            >
              <el-option label="高级年级" value="高级年级" />
            </el-select>
          </el-form-item>
          <div class="button-group">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="success" @click="handleExport">导出</el-button>
            <el-button type="primary" @click="handleAdd({}, 'add')"
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
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column label="教师" prop="teacher" align="center" />
      <el-table-column label="年级" prop="gradeName" align="center" />
      <el-table-column label="班级" prop="className" align="center" />
      <el-table-column label="开始日期" prop="startTime" align="center" />
      <el-table-column label="结束日期" prop="endTime" align="center" />
      <el-table-column label="科目" prop="subjectName" align="center" />
      <el-table-column label="周计划明细" align="center">
        <el-table-column
          label="周几"
          prop="timeSlot"
          width="150"
          align="center"
        />
        <el-table-column
          label="课时"
          prop="description"
          width="150"
          align="center"
        />
        <el-table-column
          label="内容"
          prop="content"
          width="150"
          align="center"
        />
      </el-table-column>
      <el-table-column label="操作人" prop="operator" align="center" />
      <el-table-column label="更新时间" prop="updateTime" align="center" />
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
import { Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { nextTick, reactive, ref } from "vue";
import AddWeek from "./comp/addWeek.vue";

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

const tableData = ref([
  {
    id: 1,
    teacher: "徐清妍",
    gradeName: "高级年级",
    className: "高级班级",
    startTime: "2025-03-09",
    endTime: "2025-03-09",
    subjectName: "艺术",
    timeSlot: "1st 10 mins",
    description: "材料选择",
    content: "内容选择1",
    operator: "徐清妍",
    updateTime: "2025-03-09"
  },
  {
    id: 1, // 相同 id 表示同一组数据
    teacher: "徐清妍",
    gradeName: "高级年级",
    className: "高级班级",
    startTime: "2025-03-09",
    endTime: "2025-03-09",
    subjectName: "艺术",
    timeSlot: "2nd 10 mins",
    description: "内容选择1",
    content: "内容选择2",
    operator: "徐清妍",
    updateTime: "2025-03-09"
  },
  {
    id: 1,
    teacher: "徐清妍",
    gradeName: "高级年级",
    className: "高级班级",
    startTime: "2025-03-09",
    endTime: "2025-03-09",
    subjectName: "艺术",
    timeSlot: "3rd 10 mins",
    description: "内容选择2",
    content: "内容选择3",
    operator: "徐清妍",
    updateTime: "2025-03-09"
  }
]);

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref("add");
const addCourseRef = ref(null);
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

// 搜索方法
const handleSearch = async () => {
  // TODO: 实现搜索逻辑
  const res = await CourseService.queryCourseList();
  if (res.code === 200) {
    tableData.value = res.data.list;
    total.value = res.data.total;
  }
};

// 分页方法
const handlePageChange = (page) => {
  // TODO: 实现分页逻辑
  currentPage.value = page;
  handleSearch();
};

// 分页方法
const handleSizeChange = (size) => {
  // TODO: 实现分页逻辑
  pageSize.value = size;
  handleSearch();
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
  courseId.value = row.id;
  nextTick(() => {
    if (type === "edit") {
      addCourseRef.value?.getCourseDetail(row.id);
    } else {
      addCourseRef.value?.getCourseDetail();
    }
  });
};

// 关闭对话框方法
const closeDialog = () => {
  dialogVisible.value = false;
};

// 新增方法
const handleAdd = () => {
  showDialog("add");
};

// 修改方法
const handleEdit = (row) => {
  showDialog("edit", row);
};

// 删除方法
const handleDelete = async (row) => {
  try {
    const res = await CourseService.deleteCourse(row.id);
    if (res.code === 200) {
      ElMessage.success("删除成功");
      handleSearch();
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};
</script>

<style scoped lang="scss">
.class-plan {
  padding: 20px;
}

.search-bar {
  display: flex;
  justify-content: center;
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
  padding: 0 !important;
}
</style>
