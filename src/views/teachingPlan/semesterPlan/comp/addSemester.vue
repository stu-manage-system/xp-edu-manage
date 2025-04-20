<template>
  <div class="add-semester">
    <el-form
      :model="formData"
      :rules="rules"
      ref="formRef"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="教师" prop="userName" required>
        <el-input
          v-model="formData.userName"
          placeholder="请选择教师"
          readonly
          @click="handleSelectTeacher"
        >
          <template #append>
            <el-button @click="handleSelectTeacher"> 选择 </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="年级/班级" prop="name" required>
        <el-select
          v-model="formData.name"
          placeholder="请选择年级"
          class="form-input"
          @change="handleGradeChange"
        >
          <el-option
            v-for="item in gradeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="课程" prop="subjectName" required>
        <el-select v-model="formData.subjectName" placeholder="请选择课程">
          <el-option
            v-for="item in courseList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学期名称" prop="termName">
        <el-select
          v-model="formData.termName"
          placeholder="请选择学期名称"
          class="form-input"
        >
          <el-option
            v-for="item in termList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <div class="plan-table">
        <div class="table-header">
          <span>学期计划明细</span>
        </div>
        <el-table :data="tableData" border>
          <el-table-column
            label="序号"
            type="index"
            width="70"
            align="center"
          />
          <el-table-column label="月" prop="month" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.month" placeholder="请输入月" />
            </template>
          </el-table-column>
          <el-table-column label="周" prop="termNumber" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.termNumber" placeholder="请输入周" />
            </template>
          </el-table-column>
          <el-table-column label="时间段" width="300" align="center">
            <template #default="scope">
              <el-time-picker
                v-model="scope.row.timeRange"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="HH:mm"
                style="width: 260px"
              />
            </template>
          </el-table-column>
          <el-table-column label="课次" prop="subjectCount" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.subjectCount" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column label="内容" prop="subjectContext" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.subjectContext"
                type="textarea"
                placeholder="请输入"
              />
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.remark"
                type="textarea"
                placeholder="请输入"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="deleteRow(scope.$index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <div class="table-footer">
          <el-button type="primary" @click="addRow">添加</el-button>
        </div>
      </div>

      <div class="form-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </el-form>

    <SelectTeacher
      ref="selectTeacherRef"
      :multiple="false"
      @confirm="(teacher) => handleTeacherSelected(teacher)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import SelectTeacher from "@/components/user/select.vue";
import { GradeService } from "@/api/gradeApi";
import { CourseService } from "@/api/courseApi";
import { TermService } from "@/api/termApi";

const formRef = ref(null);
const loading = ref(false);
const formData = ref<any>({
  userName: "",
  name: "",
  subjectName: "",
  termName: "",
  dateTime: [],
  userCode: "",
  gradeName: "",
  className: ""
});

const rules = {
  termName: [{ required: true, message: "请输入学期名称", trigger: "blur" }],
  userCode: [{ required: true, message: "请输入教师编号", trigger: "blur" }],
  gradeName: [{ required: true, message: "请输入年级名称", trigger: "blur" }],
  className: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  subjectName: [{ required: true, message: "请输入科目名称", trigger: "blur" }],
  termCode: [{ required: true, message: "请输入学期编号", trigger: "blur" }]
};

const tableData = ref([
  {
    month: "",
    termNumber: "",
    timeRange: [],
    subjectCount: "",
    subjectContext: "",
    remark: ""
  }
]);
const emit = defineEmits(["close"]);
// 获取年级列表
const gradeList = ref<{ label: string; value: string }[]>([]);
const getGradeList = async () => {
  const res = await GradeService.getGradeList({});
  if (res.code === 0) {
    gradeList.value = res.data.list.map((item) => {
      return {
        label: `${item.gradeName}/${item.className}`,
        value: `${item.gradeName}/${item.className}`
      };
    });
  }
};

// 获取课程体系
const courseList = ref<{ label: string; value: string }[]>([]);
const getCourseList = async () => {
  const res = await CourseService.queryCourseBasicList({});
  if (res.code === 0) {
    courseList.value = res.data.list.map((item) => {
      return {
        label: item.courseName,
        value: item.courseName
      };
    });
  }
};
// 获取学期列表
const termList = ref<{ label: string; value: string }[]>([]);
const getTermList = async () => {
  const res = await TermService.getTermList({});
  if (res.code === 0) {
    termList.value = res.data.list.map((item: any) => {
      return {
        label: item.termName,
        value: item.termCode
      };
    });
  }
};
const teacherList = ref({ userCode: "", userName: "" });
const selectTeacherRef = ref(null);
const handleSelectTeacher = () => {
  selectTeacherRef.value?.show();
};
const handleTeacherSelected = (teacher: any) => {
  formData.value.userName = teacher.userName;
  formData.value.userCode = teacher.userCode;
};
const handleGradeChange = (value: string) => {
  formData.value.name = value;
  formData.value.className = value.split("/")[1];
  formData.value.gradeName = value.split("/")[0];
};
const addRow = () => {
  tableData.value.push({
    month: "",
    termNumber: "",
    timeRange: [],
    subjectCount: "",
    subjectContext: "",
    remark: ""
  });
};

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1);
};

const save = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 保存逻辑
      console.log("保存成功", formData.value, tableData.value);
    }
  });
};

const cancel = () => {
  // 取消逻辑
  formData.value.termName = "";
  formData.value.dateTime = [];
  formData.value.userCode = "";
  formData.value.gradeName = "";
  tableData.value = [];
  emit("close");
};

onMounted(async () => {
  loading.value = true;
  await getGradeList();
  await getCourseList();
  await getTermList();
  loading.value = false;
});
</script>

<style scoped>
.add-semester {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.el-form {
  .el-form-item {
    width: 100%;
    max-width: 400px; /* 限制表单项的最大宽度 */

    .el-input,
    .el-date-picker,
    .el-select {
      width: 100%;
    }
  }
}

.plan-table {
  margin: 20px 0;

  .el-table {
    width: 100%;
    margin-top: 10px;

    /* 调整表格内输入框的宽度 */
    .el-input {
      width: 100%;
    }

    /* 调整时间选择器的宽度 */
    .el-time-picker {
      width: 100%;
    }

    /* 调整文本域的高度 */
    .el-textarea__inner {
      min-height: 32px;
    }
  }
}

.table-header {
  margin-bottom: 10px;
  font-weight: bold;
}

.table-footer {
  margin-top: 10px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}
</style>
