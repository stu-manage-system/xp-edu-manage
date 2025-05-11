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

      <el-form-item label="课程" prop="courseCode" required>
        <el-select
          v-model="formData.courseCode"
          placeholder="请选择课程"
          @change="handleCourseChange"
        >
          <el-option
            v-for="item in courseList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课程体系" prop="courseSystemCode">
        <el-tree-select
          v-model="formData.courseSystemCode"
          placeholder="请选择课程体系"
          class="form-input"
          :data="courseSystemList"
          show-checkbox
          check-strictly
          node-key="code"
          :props="{
            label: 'name',
            value: 'code',
            children: 'children'
          }"
        />
      </el-form-item>
      <el-form-item label="考试阶段" prop="examTypeCode">
        <el-select
          v-model="formData.examTypeCode"
          placeholder="请选择考试阶段"
          class="form-input"
        >
          <el-option
            v-for="item in examStageList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学期名称" prop="termCode">
        <el-select
          v-model="formData.termCode"
          placeholder="请选择学期名称"
          class="form-input"
          @change="handleTermChange"
        >
          <el-option
            v-for="item in termList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>

      <div class="plan-table">
        <div class="table-header">
          <span>成绩明细</span>
        </div>
        <el-table :data="tableData" border>
          <el-table-column
            label="序号"
            type="index"
            width="70"
            align="center"
          />
          <el-table-column label="姓名" prop="stuName" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.stuName"
                placeholder="请输入姓名"
                readonly
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column label="科目" prop="courseName" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.courseName"
                placeholder="请输入科目"
                readonly
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column label="成绩" prop="score" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.score" placeholder="请输入成绩" />
            </template>
          </el-table-column>
          <el-table-column label="等级" prop="level" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.level" placeholder="请输入等级" />
            </template>
          </el-table-column>
          <el-table-column label="评语" prop="comment" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.comment"
                type="textarea"
                placeholder="请输入评语"
              />
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" width="90" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="deleteRow(scope.$index)"
                >删除</el-button
              >
            </template>
          </el-table-column> -->
        </el-table>
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
import { StudentService } from "@/api/studentApi";
import { ScoreService } from "@/api/score";
import { ExamTypeService } from "@/api/examType";
const props = defineProps({
  id: {
    type: [String, Number],
    default: ""
  }
});
const formRef = ref(null);
const loading = ref(false);
const formData = ref<any>({
  uniqueCode: "",
  userName: "",
  gradeClassCode: "",
  name: "",
  courseCode: "",
  termName: "",
  userCode: "",
  gradeName: "",
  className: "",
  remark: "",
  examTypeCode: "",
  courseSystemCode: ""
});

const rules = {
  userName: [{ required: true, message: "请输入教师名称", trigger: "blur" }],
  termName: [{ required: true, message: "请输入学期名称", trigger: "blur" }],
  gradeName: [{ required: true, message: "请输入年级名称", trigger: "blur" }],
  className: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  courseCode: [{ required: true, message: "请输入科目名称", trigger: "blur" }],
  courseSystemCode: [
    { required: true, message: "请选择课程体系", trigger: "blur" }
  ],
  examTypeCode: [
    { required: true, message: "请选择考试阶段", trigger: "blur" }
  ],
  termCode: [{ required: true, message: "请输入学期编号", trigger: "blur" }]
};

const tableData = ref<any[]>([]);
const emit = defineEmits(["close"]);
const examStageList = ref<{ label: string; value: string }[]>([]);
const getExamStageList = async () => {
  const res = await ExamTypeService.getExamTypeList({
    pageNum: 1,
    pageSize: 10000
  });
  if (res.code === 0) {
    examStageList.value = res.data.list.map((item: any) => {
      return {
        label: item.examName,
        value: item.examCode
      };
    });
  }
};
// 获取年级列表
const gradeList = ref<{ label: string; value: string }[]>([]);
const getGradeList = async () => {
  const res = await GradeService.getGradeList({});
  if (res.code === 0) {
    gradeList.value = res.data.list.map((item) => {
      return {
        label: `${item.gradeName}/${item.className}`,
        value: item.code
      };
    });
  }
};
// 获取课程体系
const courseSystemList = ref<{ label: string; value: string }[]>([]);
const getCourseSystemList = async () => {
  const res = await CourseService.queryCourseSystemList({});
  if (res.code === 0) {
    courseSystemList.value = res.data;
  }
};
// 获取课程
const courseList = ref<{ label: string; value: string }[]>([]);
const getCourseList = async () => {
  const res = await CourseService.queryCourseBasicList({
    pageNum: 1,
    pageSize: 10000
  });
  if (res.code === 0) {
    courseList.value = res.data.list.map((item) => {
      return {
        label: item.courseName,
        value: item.courseCode
      };
    });
  }
};
// 获取学期列表
const termList = ref<
  { label: string; value: string; termWeekInfoList: any[] }[]
>([]);
const getTermList = async () => {
  const res = await TermService.getTermList({});
  if (res.code === 0) {
    termList.value = res.data.list.map((item: any) => {
      return {
        label: item.termName,
        value: item.termCode,
        termWeekInfoList: item.termWeekInfoList
      };
    });
  }
};
const teacherList = ref({ userCode: "", userName: "" });
const selectTeacherRef = ref(null);
const handleSelectTeacher = () => {
  selectTeacherRef.value?.show(teacherList.value);
};
const handleCourseChange = (value: string) => {
  let arr: any = courseList.value.find((item) => item.value === value);
  formData.value.courseName = arr.label;
};
const handleTermChange = (value: string) => {
  formData.value.termName = termList.value.find(
    (item) => item.value === value
  )?.label;
};
const handleTeacherSelected = (teacher: any) => {
  teacherList.value = teacher;
  formData.value.userName = teacher.userName;
  formData.value.userCode = teacher.userCode;
};
// 获取学生列表
const getStudentList = async (code: string) => {
  const res = await StudentService.getStuNotPageList({
    gradeClasCode: code
  });
  if (res.code === 0) {
    tableData.value = res.data;
    tableData.value.forEach((item) => {
      item.courseName = formData.value.courseName;
    });
  }
};
const handleGradeChange = (value: string) => {
  formData.value.gradeClassCode = value;
  let arr: any = gradeList.value
    .find((item) => item.value === value)
    ?.label.split("/");
  formData.value.className = arr[1];
  formData.value.gradeName = arr[0];
  getStudentList(value);
};
const save = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 保存逻辑
      let params = {
        userCode: formData.value.userCode,
        userName: formData.value.userName,
        gradeName: formData.value.gradeName,
        className: formData.value.className,
        classCode: formData.value.gradeClassCode,
        courseCode: formData.value.courseCode,
        courseName: formData.value.courseName,
        termCode: formData.value.termCode,
        termName: formData.value.termName,
        remark: formData.value.remark,
        uniqueCode: formData.value.uniqueCode || "",
        examTypeCode: formData.value.examTypeCode,
        courseSystemCode: formData.value.courseSystemCode,
        relationDTOList: tableData.value.map((item) => {
          return {
            ...item,
            score: Number(item.score)
          };
        })
      };
      console.log("保存成功", params);
      const res = props.id
        ? await ScoreService.editScore(params)
        : await ScoreService.addScore(params);
      if (res.code === 0) {
        ElMessage.success("保存成功");
        emit("close");
      }
    }
  });
};
const getSemesterDetail = async () => {
  if (!props.id) return;

  try {
    const res = await ScoreService.getScoreDetail({
      uniqueCode: props.id
    });
    if (res.code === 0) {
      formData.value = res.data;
      formData.value.uniqueCode = res.data.uniqueCode;
      teacherList.value = {
        userCode: res.data.userCode,
        userName: res.data.userName
      };
      formData.value.name = res.data.classCode;
      tableData.value = res.data.relationDTOList;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error("获取学期计划详情失败:", error);
  }
};

const reset = () => {
  Object.assign(formData.value, {});
  tableData.value = [];
};

const cancel = () => {
  // 取消逻辑
  reset();
  emit("close");
};

onMounted(async () => {
  reset();
  loading.value = true;
  await getGradeList();
  await getCourseList();
  await getTermList();
  await getCourseSystemList();
  await getExamStageList();
  loading.value = false;
});

watch(
  () => formData.value.courseName,
  (value) => {
    tableData.value.forEach((item) => {
      item.courseName = value;
    });
  },
  { immediate: true }
);

defineExpose({
  getSemesterDetail
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
    max-width: 400px;
    /* 限制表单项的最大宽度 */

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
