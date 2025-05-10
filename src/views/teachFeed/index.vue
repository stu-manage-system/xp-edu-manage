<template>
  <div class="teach-feed">
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
              v-model="searchForm.courseCode"
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
      <el-table-column label="序号" type="index" width="80" align="center" />
      <el-table-column
        label="反馈教师"
        prop="userName"
        align="center"
        width="100"
      />
      <el-table-column label="年级" prop="gradeName" align="center" />
      <el-table-column label="班级" prop="className" align="center" />
      <el-table-column label="科目" prop="subjectName" align="center" />
      <el-table-column
        label="本学期第几周"
        prop="termNumber"
        align="center"
        width="140"
      />
      <el-table-column
        label="反馈日期"
        prop="feedbackDate"
        align="center"
        width="100"
      />
      <el-table-column label="总体内容" align="center">
        <el-table-column label="学生" prop="studentName" align="center" />
        <el-table-column
          label="本周所授章节及知识点"
          prop="knowledge"
          align="center"
          width="140"
        />
        <el-table-column
          label="本学期进度完成百分比"
          prop="progressing"
          align="center"
          width="140"
        />
        <el-table-column
          label="课堂表现评分（1-5）"
          prop="performanceScore"
          align="center"
          width="140"
        />
        <el-table-column
          label="评分原因（低于4必填）"
          prop="testScore"
          align="center"
          width="140"
        />
        <el-table-column label="作业结果" prop="homework" align="center" />
        <el-table-column label="考试结果" prop="testScore" align="center" />
      </el-table-column>
      <el-table-column label="操作人" prop="operator" align="center" />
      <el-table-column
        label="更新时间"
        prop="updateTime"
        align="center"
        width="100"
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
            title="确认删除该教学反馈吗？"
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
      :title="dialogType === 'add' ? '新增教学反馈' : '编辑教学反馈'"
      v-model="dialogVisible"
      width="80%"
      :close-on-click-modal="false"
    >
      <AddFeedback
        :type="dialogType"
        @close="closeDialog"
        @refresh="handleSearch"
        :id="feedbackId"
        ref="addFeedbackRef"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { CourseService } from "@/api/courseApi";
import { UserService } from "@/api/usersApi";
import { Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { nextTick, reactive, ref, onMounted } from "vue";
import AddFeedback from "./comp/addFeedback.vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";

const router = useRouter();
const isLoading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索表单数据
const searchForm = reactive({
  userCode: "",
  courseCode: ""
});

const tableData = ref([]);
const teacherList = ref([]);
const subjectList = ref([]);

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref("add");
const addFeedbackRef = ref(null);
const feedbackId = ref(null);

// 处理单元格合并
const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 7 || columnIndex === 8 || columnIndex === 9) {
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

// 远程搜索教师
const remoteMethod = debounce(async (query) => {
  if (query) {
    try {
      const res = await UserService.queryStoreUserList({ keyword: query });
      teacherList.value = res.data.list || [];
    } catch (error) {
      console.error("搜索教师失败:", error);
    }
  }
}, 300);

// 远程搜索课程
const remoteMethodSubject = debounce(async (query) => {
  if (query) {
    try {
      const res = await CourseService.queryCourseBasicList({
        courseName: query
      });
      subjectList.value = res.data.list || [];
    } catch (error) {
      console.error("搜索课程失败:", error);
    }
  }
}, 300);

// 显示对话框
const showDialog = (row, type) => {
  router.push({
    path: type === "add" ? "/system/add" : "/system/edit/:id",
    query: { id: row.id, type: type }
  });
};

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
  feedbackId.value = null;
};

// 处理搜索
const handleSearch = async () => {
  isLoading.value = true;
  try {
    // TODO: 实现搜索逻辑
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };
    // const res = await TeachFeedService.getList(params);
    // tableData.value = res.data.list;
    // total.value = res.data.total;
  } catch (error) {
    console.error("获取列表失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 处理导出
const handleExport = async () => {
  try {
    // TODO: 实现导出逻辑
    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败");
  }
};

// 处理删除
const handleDelete = async (row) => {
  try {
    // TODO: 实现删除逻辑
    // await TeachFeedService.delete(row.id);
    ElMessage.success("删除成功");
    handleSearch();
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败");
  }
};

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page;
  handleSearch();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  handleSearch();
};

onMounted(() => {
  handleSearch();
});
</script>

<style lang="scss" scoped>
.teach-feed {
  padding: 20px;

  .search-bar {
    margin-bottom: 20px;

    .search-form {
      .form-container {
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 10px;

        .fixed-width-input {
          width: 200px;
        }

        .button-group {
          // margin-left: auto;
        }
      }
    }
  }
}
</style>
