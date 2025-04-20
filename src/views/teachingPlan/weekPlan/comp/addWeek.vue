<template>
  <div class="add-week-container">
    <el-form
      :model="formData"
      label-width="100px"
      :rules="rules"
      ref="formRef"
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
          placeholder="请选择年级/班级"
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

      <el-form-item label="课程名称" required>
        <el-select v-model="formData.subjectName" placeholder="请选择课程名称">
          <el-option
            v-for="item in courseList"
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
        >
          <el-option
            v-for="item in termList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="本学期内几周" prop="termNumber">
        <el-select
          v-model="formData.termNumber"
          placeholder="请选择周数"
          @change="handleTermNumberChange"
        >
          <el-option
            v-for="item in termDetailList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期" required>
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          disabled
          :readonly="true"
        />
      </el-form-item>

      <el-form-item label="结束日期" required>
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          disabled
          :readonly="true"
        />
      </el-form-item>

      <el-form-item label="计划明细">
        <div class="plan-detail">
          <div class="detail-header">
            <span>序号</span>
            <span>工作日</span>
            <span>课时</span>
            <span>内容</span>
            <span>操作</span>
          </div>
          <div
            v-for="(item, index) in formData.weekPlanDetail"
            :key="index"
            class="detail-item"
          >
            <span>{{ index + 1 }}</span>
            <el-select v-model="item.weekday" placeholder="请选择工作日">
              <el-option
                v-for="item in weekdayList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input v-model="item.period" placeholder="请输入课时" />
            <el-input
              v-model="item.content"
              placeholder="请输入内容"
              type="textarea"
              :rows="2"
            />
            <div
              class="time-slot-delete"
              v-if="formData.weekPlanDetail.length > 1"
            >
              <el-button
                type="danger"
                :icon="Delete"
                link
                @click="deletePlanItem(index)"
              >
              </el-button>
            </div>
          </div>
          <el-button type="success" @click="addPlanItem">添加</el-button>
        </div>
      </el-form-item>

      <el-form-item label="作业">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入作业"
          :maxlength="1000"
          show-word-limit
          :rows="4"
        />
      </el-form-item>

      <el-form-item label="进度">
        <el-input-number
          v-model="formData.processRate"
          placeholder="请输入进度"
          :min="0"
          :max="100"
          :step="1"
        >
          <template #suffix>
            <span>%</span>
          </template>
        </el-input-number>
      </el-form-item>

      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>

    <SelectTeacher
      ref="selectTeacherRef"
      :multiple="false"
      @confirm="(teacher) => handleTeacherSelected(teacher)"
    />
  </div>
</template>

<script setup lang="ts">
import { Delete } from "@element-plus/icons-vue";
import { reactive, ref, onMounted, watch } from "vue";
import { FormData } from "../contant";
import { TeachPlanService } from "@/api/teachPlan";
import { GradeService } from "@/api/gradeApi";
import { TermService } from "@/api/termApi";
import { CourseService } from "@/api/courseApi";
import SelectTeacher from "@/components/user/select.vue";
import { ApiService } from "@/api/apiApi";

const props = defineProps({
  type: {
    type: String,
    default: "add"
  },
  id: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["refresh", "close"]);
const formData = ref<FormData>({
  weekCode: "",
  name: "",
  userCode: "",
  userName: "",
  gradeName: "",
  className: "",
  startTime: "",
  endTime: "",
  termCode: "",
  termName: "",
  termNumber: "",
  weekPlanDetail: [{ weekday: "", period: "", content: "" }],
  subjectName: "",
  processRate: 0,
  remark: ""
});

const formRef = ref();
const loading = ref(false);
const rules = {
  userName: [{ required: true, message: "请选择教师" }],
  name: [{ required: true, message: "请选择年级/班级" }],
  startTime: [{ required: true, message: "请选择开始日期" }],
  endTime: [{ required: true, message: "请选择结束日期" }],
  subjectName: [{ required: true, message: "请选择课程名称" }]
};

const selectTeacherRef = ref();
const teacherList = ref<{ userCode: string; userName: string }>({
  userCode: "",
  userName: ""
});

// 选择教师
const handleSelectTeacher = () => {
  selectTeacherRef.value.show(teacherList.value);
};

// 教师选择确认
const handleTeacherSelected = (teacher: any) => {
  formData.value.userCode = teacher.userCode;
  formData.value.userName = teacher.userName;
};

const addPlanItem = () => {
  formData.value.weekPlanDetail.push({ weekday: "", period: "", content: "" });
};

const deletePlanItem = (index: number) => {
  formData.value.weekPlanDetail.splice(index, 1);
};

const save = async () => {
  console.log("保存数据：", formData.value);
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    let res;
    if (props.type === "add") {
      res = await TeachPlanService.addWeekPlan(formData.value);
    } else {
      res = await TeachPlanService.updateWeekPlan({
        ...formData.value,
        weekCode: props.id
      });
    }

    if (res.code === 0) {
      ElMessage.success(props.type === "add" ? "添加成功" : "更新成功");
      emit("refresh");
      emit("close");
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  });
};

const cancel = () => {
  emit("close");
};
// 获取周计划详情
const getWeekPlanDetail = async (id: string) => {
  if (props.type === "edit" && id) {
    const res = await TeachPlanService.queryWeekPlanDetail({
      weekCode: id
    });
    if (res.code === 0) {
      teacherList.value.userCode = res.data.userCode;
      teacherList.value.userName = res.data.userName;
      Object.assign(formData.value, {
        weekCode: res.data.weekCode,
        name: res.data.gradeName + "/" + res.data.className,
        userCode: res.data.userCode,
        userName: res.data.userName,
        gradeName: res.data.gradeName,
        className: res.data.className,
        startTime: res.data.startTime,
        endTime: res.data.endTime,
        termName: res.data.termName,
        termCode: res.data.termCode,
        termNumber: res.data.termNumber,
        remark: res.data.remark,
        processRate: res.data.processRate,
        weekPlanDetail: JSON.parse(res.data.weekPlanDetail) || [],
        subjectName: res.data.subjectName
      });
    }
  } else {
    // 清空表单数据
    Object.keys(formData.value).forEach((key) => {
      formData.value[key] = "";
      if (key === "weekPlanDetail") {
        formData.value[key] = [{ weekday: "", period: "", content: "" }];
      }
    });
    formRef.value?.resetFields();
  }
};
// 课程列表
const courseList = ref<{ label: string; value: string }[]>([]);
// 获取课程列表
const getCourseList = async () => {
  const res = await CourseService.queryCourseBasicList({
    page: 1,
    pageSize: 1000
  });
  if (res.code === 0) {
    courseList.value = res.data.list.map((item: any) => {
      return {
        label: item.courseName,
        value: item.courseName
      };
    });
  }
};

const gradeList = ref<{ label: string; value: string }[]>([]);
// 获取年级列表
const getGradeList = async () => {
  const res = await GradeService.getGradeList({});
  if (res.code === 0) {
    gradeList.value = res.data.list.map((item: any) => {
      return {
        label: `${item.gradeName}/${item.className}`,
        value: `${item.gradeName}/${item.className}`
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
const termDetailList = ref<{ label: string; value: string }[]>([]);
const getTermDetailList = async () => {
  const res = await ApiService.getTermDetailList({
    termCode: formData.value.termCode
  });
  if (res.code === 0) {
    termDetailList.value = res.data.map((item: any) => {
      return {
        label: item.weekNum,
        value: item.weekNum,
        startTime: item.startTime,
        endTime: item.endTime
      };
    });
  }
};
const handleTermNumberChange = (value: string) => {
  formData.value.termNumber = value;
  let arr: any = termDetailList.value.filter((item) => item.value === value);
  formData.value.startTime = arr[0].startTime;
  formData.value.endTime = arr[0].endTime;
};

const handleGradeChange = (value: string) => {
  formData.value.name = value;
  formData.value.className = value.split("/")[1];
  formData.value.gradeName = value.split("/")[0];
};

const weekdayList = ref<{ label: string; value: string }[]>([]);
const getWeekdayList = async () => {
  const res = await ApiService.getDictConfig("weekDayEnum");
  if (res.code === 0) {
    weekdayList.value = res.data.map((item: any) => {
      return {
        label: item.label,
        value: item.label
      };
    });
  }
};

onMounted(async () => {
  loading.value = true;
  await getGradeList();
  await getTermList();
  await getCourseList();
  await getWeekdayList();
  loading.value = false;
});
watch(
  () => formData.value.termCode,
  (newVal) => {
    console.log("newVal", newVal);
    if (newVal) {
      formData.value.termName =
        termList.value.find((item) => item.value === newVal)?.label || "";
      console.log(formData.value.termName);
      getTermDetailList();
    }
  },
  { immediate: true, deep: true }
);
defineExpose({
  getWeekPlanDetail
});
</script>

<style scoped lang="scss">
.add-week-container {
  padding: 20px;
}

.time-slot-delete {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}
.plan-detail {
  width: 100%;
  border: 1px solid #dcdfe6;
  padding: 10px;
  border-radius: 4px;
}

.detail-header {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 2fr 80px;
  gap: 10px;
  padding: 10px 0;
  font-weight: bold;
}

.detail-item {
  display: grid;
  grid-template-columns: 60px 140px 140px 2fr 80px;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;

  :deep(.el-textarea .el-input__wrapper) {
    height: 42px;
    padding-top: 1px;
    padding-bottom: 1px;
  }

  :deep(.el-input) {
    width: 100%;
  }
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}
</style>
