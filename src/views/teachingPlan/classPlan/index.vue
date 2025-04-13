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
          <div class="button-group">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="success" @click="handleExport">导出</el-button>
            <el-button type="primary" @click="handleAdd">新增</el-button>
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
      <el-table-column label="序号" prop="index" align="center" />
      <el-table-column label="教师" prop="userName" align="center" />
      <el-table-column label="年级/班级" prop="gradeName" align="center">
        <template #default="{ row }">
          {{ row.gradeName + "/" + row.className }}
        </template>
      </el-table-column>
      <el-table-column label="日期" prop="dateTime" align="center" />
      <el-table-column label="科目" prop="subjectName" align="center" />
      <el-table-column label="周" prop="termNumber" align="center" />
      <el-table-column label="第几节课" prop="subjectNumber" align="center" />
      <el-table-column label="总体内容" align="center">
        <el-table-column
          label="时间间隔"
          prop="timeSlot"
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
      <el-table-column
        label="创建时间"
        prop="ctime"
        align="center"
        show-overflow-tooltip
        width="250"
      />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            @click="showDialog('edit', row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            title="确认删除该课程计划吗？"
            @confirm="handleDelete(row)"
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
      :title="dialogType === 'add' ? '新增课程计划' : '编辑课程计划'"
      v-model="dialogVisible"
      width="80%"
      :close-on-click-modal="false"
    >
      <add-course
        :type="dialogType"
        :visible="dialogVisible"
        @close="closeDialog"
        @refresh="handleSearch"
        :id="courseId"
        ref="addCourseRef"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { TeachPlanService } from "@/api/teachPlan";
import { Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { nextTick, reactive, ref } from "vue";
import AddCourse from "./comp/addCourse.vue";

const isLoading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
// 搜索表单数据
const searchForm = reactive({
  userCode: "",
  dateRange: [],
  subjectName: ""
});

const tableData = ref([]);

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref("add");
const addCourseRef = ref(null);
const courseId = ref(null);
// 处理单元格合并
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (column.property === "timeSlot" || column.property === "content") {
    return {
      rowspan: 1,
      colspan: 1
    };
  }

  const currentId = row.id;

  // 找到当前行在表格中的位置
  let startIndex = rowIndex;
  // 向上查找同一个 id 的第一行
  while (startIndex > 0 && tableData.value[startIndex - 1].id === currentId) {
    startIndex--;
  }

  if (startIndex === rowIndex) {
    let count = 1;
    // 向下计算同一组的行数
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
  } else {
    // 如果不是第一行，隐藏单元格
    return {
      rowspan: 0,
      colspan: 0
    };
  }
};

// 搜索方法
const handleSearch = async () => {
  isLoading.value = true;
  try {
    const res = await TeachPlanService.getCoursePlanList(searchForm);
    if (res.code === 0) {
      let flattenedData = [];
      let count = 0;
      res.data.list.forEach((item) => {
        count++;
        let subjectContextArray = [];
        try {
          subjectContextArray = JSON.parse(item.subjectContext || "[]");
          if (!Array.isArray(subjectContextArray)) {
            subjectContextArray = []; // 确保是数组
          }
        } catch (e) {
          console.error("解析 subjectContext 失败:", e);
          subjectContextArray = [];
        }

        if (subjectContextArray.length === 0) {
          flattenedData.push({
            ...item,
            id: item.courseCode, // 使用 courseCode 作为 id
            timeSlot: "",
            content: "",
            subjectContextArray: []
          });
        } else {
          subjectContextArray.forEach((context, index) => {
            flattenedData.push({
              index: count,
              ...item,
              id: item.courseCode, // 使用 courseCode 作为 id
              timeSlot: context.timeSlot,
              content: context.content,
              subjectContextArray: subjectContextArray
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
  handleSearch();
};

// 分页方法
const handleSizeChange = (size) => {
  pageSize.value = size;
  handleSearch();
};

// 导出方法
const handleExport = () => {
  // TODO: 实现导出逻辑
};

// 显示对话框方法
const showDialog = (type, row) => {
  dialogType.value = type;
  dialogVisible.value = true;
  courseId.value = row.courseCode;
  if (type === "edit") {
    console.log("222", 222);
    nextTick(() => {
      addCourseRef.value?.getCourseDetail(row.courseCode);
    });
  } else {
    nextTick(() => {
      addCourseRef.value?.getCourseDetail();
    });
  }
};

// 关闭对话框方法
const closeDialog = () => {
  dialogVisible.value = false;
};

// 新增方法
const handleAdd = () => {
  showDialog("add", "");
};

// 修改方法
const handleEdit = (row) => {
  showDialog("edit", row);
};

// 删除方法
const handleDelete = async (row) => {
  try {
    const res = await CourseService.deleteCourse(row.courseCode);
    if (res.code === 200) {
      ElMessage.success("删除成功");
      handleSearch();
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
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
