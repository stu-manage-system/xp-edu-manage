<template>
  <div class="page-content">
    <!-- 自定义标签头 -->
    <div class="custom-tab-header">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'term' }"
        @click="activeTab = 'term'"
      >
        学期
        <div class="active-bar" v-if="activeTab === 'term'"></div>
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'grade' }"
        @click="activeTab = 'grade'"
      >
        年级/班级
        <div class="active-bar" v-if="activeTab === 'grade'"></div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="tab-content">
      <!-- 学期内容 -->
      <div v-show="activeTab === 'term'" class="tab-pane">
        <div class="tab-header">
          <el-button type="primary" @click="handleAddTerm">添加学期</el-button>
        </div>
        <art-table
          :data="termList"
          :total="termTotal"
          :current-page="termCurrentPage"
          :page-size="termPageSize"
          :loading="termLoading"
          @page-change="handleTermPageChange"
          @size-change="handleTermSizeChange"
        >
          <el-table-column prop="termName" label="学期名称" />
          <el-table-column prop="startTime" label="开始时间" />
          <el-table-column prop="endTime" label="结束时间" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button
                type="primary"
                link
                @click="handleEditTerm(scope.row)"
                :icon="EditPen"
                >编辑</el-button
              >
              <el-button
                type="danger"
                link
                @click="handleDeleteTerm(scope.row)"
                :icon="Delete"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </art-table>
      </div>

      <!-- 年级/班级内容 -->
      <div v-show="activeTab === 'grade'" class="tab-pane">
        <div class="tab-header">
          <el-button type="primary" @click="handleAddGrade"
            >添加年级/班级</el-button
          >
        </div>
        <art-table
          :data="gradeList"
          :total="gradeTotal"
          :current-page="gradeCurrentPage"
          :page-size="gradePageSize"
          :loading="gradeLoading"
          @page-change="handleGradePageChange"
          @size-change="handleGradeSizeChange"
        >
          <el-table-column prop="gradeName" label="年级" />
          <el-table-column prop="className" label="班级" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button
                type="primary"
                link
                @click="handleEditGrade(scope.row)"
                :icon="EditPen"
                >编辑</el-button
              >
              <el-button
                type="danger"
                link
                @click="handleDeleteGrade(scope.row)"
                :icon="Delete"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </art-table>
      </div>
    </div>

    <!-- 学期表单对话框 -->
    <el-dialog
      v-model="termDialogVisible"
      :title="termFormTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="termFormRef"
        :model="termForm"
        :rules="termRules"
        label-width="100px"
      >
        <el-form-item label="学期名称" prop="termName">
          <el-input v-model="termForm.termName" placeholder="请输入学期名称" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="termForm.startTime"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="termForm.endTime"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="termDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTermForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 年级/班级表单对话框 -->
    <el-dialog
      v-model="gradeDialogVisible"
      :title="gradeFormTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="gradeFormRef"
        :model="gradeForm"
        :rules="gradeRules"
        label-width="100px"
      >
        <el-form-item label="年级" prop="gradeName">
          <el-input
            v-model="gradeForm.gradeName"
            placeholder="请输入年级名称"
          />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input
            v-model="gradeForm.className"
            placeholder="请输入班级名称"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="gradeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="gradeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGradeForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Delete, EditPen } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";

// 当前活动的标签页
const activeTab = ref("term");

// --------- 学期相关 ---------
interface TermItem {
  id?: string | number;
  termName: string;
  startTime: string;
  endTime: string;
}

// 学期表格数据和分页
const termList = ref<TermItem[]>([
  {
    id: 1,
    termName: "2023-2024学年第一学期",
    startTime: "2023-09-01",
    endTime: "2024-01-15"
  },
  {
    id: 2,
    termName: "2023-2024学年第二学期",
    startTime: "2024-02-20",
    endTime: "2024-07-10"
  }
]);
const termTotal = ref(2);
const termCurrentPage = ref(1);
const termPageSize = ref(10);
const termLoading = ref(false);

// 学期表单相关
const termDialogVisible = ref(false);
const termFormTitle = ref("添加学期");
const termFormRef = ref<FormInstance>();
const termForm = reactive<TermItem>({
  termName: "",
  startTime: "",
  endTime: ""
});
const currentTermId = ref<string | number | undefined>(undefined);

// 学期表单验证规则
const termRules = reactive<FormRules>({
  termName: [{ required: true, message: "请输入学期名称", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }]
});

// --------- 年级/班级相关 ---------
interface GradeItem {
  id?: string | number;
  gradeName: string;
  className: string;
  remark: string;
}

// 年级/班级表格数据和分页
const gradeList = ref<GradeItem[]>([
  {
    id: 1,
    gradeName: "一年级",
    className: "1班",
    remark: "班主任：张老师"
  },
  {
    id: 2,
    gradeName: "一年级",
    className: "2班",
    remark: "班主任：李老师"
  },
  {
    id: 3,
    gradeName: "二年级",
    className: "1班",
    remark: "班主任：王老师"
  }
]);
const gradeTotal = ref(3);
const gradeCurrentPage = ref(1);
const gradePageSize = ref(10);
const gradeLoading = ref(false);

// 年级/班级表单相关
const gradeDialogVisible = ref(false);
const gradeFormTitle = ref("添加年级/班级");
const gradeFormRef = ref<FormInstance>();
const gradeForm = reactive<GradeItem>({
  gradeName: "",
  className: "",
  remark: ""
});
const currentGradeId = ref<string | number | undefined>(undefined);

// 年级/班级表单验证规则
const gradeRules = reactive<FormRules>({
  gradeName: [{ required: true, message: "请输入年级", trigger: "blur" }],
  className: [{ required: true, message: "请输入班级", trigger: "blur" }]
});

// 页面初始化
onMounted(() => {
  // 加载学期数据
  fetchTermList();
  // 加载年级/班级数据
  fetchGradeList();
});

// ------- 学期相关方法 -------
// 加载学期数据
const fetchTermList = async () => {
  try {
    termLoading.value = true;
    // 实际开发中应该调用API获取数据
    // const res = await api.getTermList({
    //   page: termCurrentPage.value,
    //   pageSize: termPageSize.value
    // });
    // termList.value = res.data.list;
    // termTotal.value = res.data.total;

    // 模拟延迟
    setTimeout(() => {
      termLoading.value = false;
    }, 300);
  } catch (error) {
    console.error("获取学期列表失败", error);
    termLoading.value = false;
  }
};

// 学期分页变化
const handleTermPageChange = (page: number) => {
  termCurrentPage.value = page;
  fetchTermList();
};

// 学期每页条数变化
const handleTermSizeChange = (size: number) => {
  termPageSize.value = size;
  termCurrentPage.value = 1;
  fetchTermList();
};

// 添加学期
const handleAddTerm = () => {
  termFormTitle.value = "添加学期";
  termForm.termName = "";
  termForm.startTime = "";
  termForm.endTime = "";
  currentTermId.value = undefined;
  termDialogVisible.value = true;
};

// 编辑学期
const handleEditTerm = (row: TermItem) => {
  termFormTitle.value = "编辑学期";
  currentTermId.value = row.id;
  termForm.termName = row.termName;
  termForm.startTime = row.startTime;
  termForm.endTime = row.endTime;
  termDialogVisible.value = true;
};

// 删除学期
const handleDeleteTerm = (row: TermItem) => {
  ElMessageBox.confirm("确定要删除该学期吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      // 实际开发中这里应该调用删除API
      const index = termList.value.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        termList.value.splice(index, 1);
        termTotal.value -= 1;
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 提交学期表单
const submitTermForm = async () => {
  if (!termFormRef.value) return;

  await termFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用添加/编辑API
      if (currentTermId.value) {
        // 编辑现有学期
        const index = termList.value.findIndex(
          (item) => item.id === currentTermId.value
        );
        if (index !== -1) {
          termList.value[index] = {
            ...termForm,
            id: currentTermId.value
          };
          ElMessage.success("修改成功");
        }
      } else {
        // 添加新学期
        termList.value.push({
          ...termForm,
          id: Date.now() // 临时ID，实际应该由后端生成
        });
        termTotal.value += 1;
        ElMessage.success("添加成功");
      }
      termDialogVisible.value = false;
    }
  });
};

// ------- 年级/班级相关方法 -------
// 加载年级/班级数据
const fetchGradeList = async () => {
  try {
    gradeLoading.value = true;
    // 实际开发中应该调用API获取数据
    // const res = await api.getGradeList({
    //   page: gradeCurrentPage.value,
    //   pageSize: gradePageSize.value
    // });
    // gradeList.value = res.data.list;
    // gradeTotal.value = res.data.total;

    // 模拟延迟
    setTimeout(() => {
      gradeLoading.value = false;
    }, 300);
  } catch (error) {
    console.error("获取年级/班级列表失败", error);
    gradeLoading.value = false;
  }
};

// 年级/班级分页变化
const handleGradePageChange = (page: number) => {
  gradeCurrentPage.value = page;
  fetchGradeList();
};

// 年级/班级每页条数变化
const handleGradeSizeChange = (size: number) => {
  gradePageSize.value = size;
  gradeCurrentPage.value = 1;
  fetchGradeList();
};

// 添加年级/班级
const handleAddGrade = () => {
  gradeFormTitle.value = "添加年级/班级";
  gradeForm.gradeName = "";
  gradeForm.className = "";
  gradeForm.remark = "";
  currentGradeId.value = undefined;
  gradeDialogVisible.value = true;
};

// 编辑年级/班级
const handleEditGrade = (row: GradeItem) => {
  gradeFormTitle.value = "编辑年级/班级";
  currentGradeId.value = row.id;
  gradeForm.gradeName = row.gradeName;
  gradeForm.className = row.className;
  gradeForm.remark = row.remark;
  gradeDialogVisible.value = true;
};

// 删除年级/班级
const handleDeleteGrade = (row: GradeItem) => {
  ElMessageBox.confirm("确定要删除该年级/班级吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      // 实际开发中这里应该调用删除API
      const index = gradeList.value.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        gradeList.value.splice(index, 1);
        gradeTotal.value -= 1;
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 提交年级/班级表单
const submitGradeForm = async () => {
  if (!gradeFormRef.value) return;

  await gradeFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该调用添加/编辑API
      if (currentGradeId.value) {
        // 编辑现有年级/班级
        const index = gradeList.value.findIndex(
          (item) => item.id === currentGradeId.value
        );
        if (index !== -1) {
          gradeList.value[index] = {
            ...gradeForm,
            id: currentGradeId.value
          };
          ElMessage.success("修改成功");
        }
      } else {
        // 添加新年级/班级
        gradeList.value.push({
          ...gradeForm,
          id: Date.now() // 临时ID，实际应该由后端生成
        });
        gradeTotal.value += 1;
        ElMessage.success("添加成功");
      }
      gradeDialogVisible.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;

  .header {
    padding-bottom: 15px;
    border-bottom: 1px solid var(--art-border-color);

    h3 {
      font-size: 18px;
      font-weight: 500;
    }
  }

  /* 自定义标签头 */
  .custom-tab-header {
    display: flex;
    position: relative;

    .tab-item {
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      position: relative;
      transition: color 0.3s;
      width: 100px;
      text-align: center;

      &.active {
        color: #409eff;
        font-weight: 500;
      }

      .active-bar {
        height: 2px;
        background-color: #409eff;
      }
    }
  }

  .tab-content {
    .tab-pane {
      width: 100%;
    }
  }

  .tab-header {
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
