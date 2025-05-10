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
              <el-input
                v-model="scope.row.month"
                placeholder="请输入月"
                readonly
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column label="周" prop="termNumber" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.termNumber"
                placeholder="请输入周"
                readonly
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column label="时间段" width="300" align="center">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD"
                style="width: 260px"
                readonly
                disabled
              />
            </template>
          </el-table-column>
          <el-table-column label="课次" prop="courseCount" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.courseCount" placeholder="请输入" />
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
import { TeachPlanService } from "@/api/teachPlan";
import { TermService } from "@/api/termApi";

const props = defineProps({
  id: {
    type: [String, Number],
    default: ""
  }
});
const formRef = ref(null);
const loading = ref(false);
const formData = ref<any>({
  termPlanCode: "",
  userName: "",
  gradeClassCode: "",
  name: "",
  courseCode: "",
  termName: "",
  dateTime: [],
  userCode: "",
  gradeName: "",
  className: "",
  remark: ""
});

const rules = {
  userName: [{ required: true, message: "请输入教师名称", trigger: "blur" }],
  termName: [{ required: true, message: "请输入学期名称", trigger: "blur" }],
  gradeName: [{ required: true, message: "请输入年级名称", trigger: "blur" }],
  className: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  courseCode: [{ required: true, message: "请输入科目名称", trigger: "blur" }],
  termCode: [{ required: true, message: "请输入学期编号", trigger: "blur" }]
};

const tableData = ref<any[]>([]);
const emit = defineEmits(["close"]);
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
const courseList = ref<{ label: string; value: string }[]>([]);
const getCourseList = async () => {
  const res = await CourseService.queryCourseBasicList({});
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
  selectTeacherRef.value?.show();
};
const handleCourseChange = (value: string) => {
  let arr: any = courseList.value.find((item) => item.value === value);
  formData.value.courseName = arr.label;
};
const handleTermChange = (value: string) => {
  formData.value.termName = termList.value.find(
    (item) => item.value === value
  )?.label;
  tableData.value = termList.value.find((item) => item.value === value)
    ?.termWeekInfoList as any[];
  tableData.value.forEach((item) => {
    item.timeRange = [` ${item.startTime}`, ` ${item.endTime}`];
    item.termNumber = item.weekNum;
    item.month = item.startTime.split("-")[1];
  });
};
const handleTeacherSelected = (teacher: any) => {
  formData.value.userName = teacher.userName;
  formData.value.userCode = teacher.userCode;
};
const handleGradeChange = (value: string) => {
  formData.value.gradeClassCode = value;
  let arr: any = gradeList.value
    .find((item) => item.value === value)
    ?.label.split("/");
  formData.value.className = arr[1];
  formData.value.gradeName = arr[0];
};

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1);
};

const save = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 保存逻辑
      console.log("保存成功", formData.value, tableData.value);
      let params = {
        userCode: formData.value.userCode,
        gradeName: formData.value.gradeName,
        className: formData.value.className,
        gradeClassCode: formData.value.gradeClassCode,
        courseCode: formData.value.courseCode,
        courseName: formData.value.courseName,
        termCode: formData.value.termCode,
        termName: formData.value.termName,
        remark: formData.value.remark,
        termPlanCode: formData.value.termPlanCode || "",
        termPlanDetailList: tableData.value.map((item) => {
          return {
            ...item,
            startTime: item.timeRange[0],
            endTime: item.timeRange[1]
          };
        })
      };
      const res = props.id
        ? await TeachPlanService.updateTermPlan(params)
        : await TeachPlanService.addTermPlan(params);
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
    const res = await TeachPlanService.queryTermPlanDetail({
      termPlanCode: props.id
    });
    if (res.code === 0) {
      formData.value = res.data;
      formData.value.termPlanCode = res.data.termPlanCode;
      teacherList.value = {
        userCode: res.data.userCode,
        userName: res.data.userName
      };
      formData.value.name = res.data.gradeClassCode;
      tableData.value = res.data.termPlanDetailInfoList;
      tableData.value.forEach((item) => {
        item.timeRange = [` ${item.startTime}`, ` ${item.endTime}`];
      });
    } else {
      ElMessage.error(res.msg || "获取学期计划详情失败");
    }
  } catch (error) {
    console.error("获取学期计划详情失败:", error);
  }
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
