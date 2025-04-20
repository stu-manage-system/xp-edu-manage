<template>
  <div class="add-course-container" v-loading="loading">
    <el-form
      :model="formData"
      :rules="rules"
      ref="courseForm"
      label-width="100px"
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

      <el-form-item label="日期" prop="date1">
        <el-date-picker
          v-model="formData.date1"
          type="date"
          placeholder="选择日期"
          class="form-input"
          value-format="YYYY-MM-DD"
        />
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

      <el-form-item label="本学期内几周" prop="termNumber">
        <el-input
          v-model="formData.termNumber"
          placeholder="请输入"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="第几节课" prop="subjectNumber">
        <el-input
          v-model="formData.subjectNumber"
          placeholder="请输入第几节课"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="计划时间" prop="subjectContext">
        <div class="time-slots-container">
          <div class="time-slots-header">
            <div class="time-slot-index">序号</div>
            <div class="time-slot-time">时间间隔</div>
            <div class="time-slot-content">内容</div>
          </div>

          <div
            class="time-slot-row"
            v-for="(slot, index) in formData.subjectContext"
            :key="index"
          >
            <div class="time-slot-index">{{ index + 1 }}</div>
            <div class="time-slot-time">
              <el-input
                v-model="slot.timeSlot"
                placeholder="例如：1st 10 mins"
              />
            </div>
            <div class="time-slot-content">
              <el-input
                type="textarea"
                v-model="slot.content"
                placeholder="请输入内容"
                :rows="2"
              />
            </div>
            <div
              class="time-slot-delete"
              v-if="formData.subjectContext.length > 1"
            >
              <el-button
                type="danger"
                :icon="Delete"
                link
                @click="deleteTimeSlot(index)"
              >
              </el-button>
            </div>
          </div>

          <div class="add-time-slot">
            <el-button type="primary" @click="addTimeSlot"
              >添加时间段</el-button
            >
          </div>
        </div>
      </el-form-item>

      <el-form-item label="总体内容" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入计划内容"
          :rows="3"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item class="form-buttons">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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
import { TeachPlanService } from "@/api/teachPlan";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref, watch } from "vue";
import SelectTeacher from "@/components/user/select.vue";
import { GradeService } from "@/api/gradeApi";
import { CourseService } from "@/api/courseApi";
import { TermService } from "@/api/termApi";

const props = defineProps({
  type: {
    type: String,
    default: "add"
  },
  id: {
    type: String,
    default: ""
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["close", "refresh"]);
const courseForm = ref(null);
const selectTeacherRef = ref(null);
const gradeList = ref<{ label: string; value: string }[]>([]);
const courseList = ref<{ label: string; value: string }[]>([]);
const loading = ref(false);
// 表单数据
const formData = reactive({
  courseCode: "",
  name: "",
  userCode: "",
  userName: "",
  gradeName: "",
  className: "",
  date1: "",
  subjectName: "",
  termName: "",
  termNumber: "",
  subjectNumber: "",
  subjectContext: [{ timeSlot: "", content: "" }],
  remark: ""
});

// 表单验证规则
const rules = reactive({
  userName: [{ required: true, message: "请选择教师", trigger: "change" }],
  name: [{ required: true, message: "请选择年级", trigger: "change" }],
  subjectName: [
    { required: true, message: "请选择课程体系", trigger: "change" }
  ],
  date1: [{ required: true, message: "请选择日期", trigger: "change" }]
});

// 添加时间段
const addTimeSlot = () => {
  formData.subjectContext.push({ timeSlot: "", content: "" });
};

// 删除时间段
const deleteTimeSlot = (index: number) => {
  if (formData.subjectContext.length > 1) {
    formData.subjectContext.splice(index, 1);
  }
};
const teacherList = ref({ userCode: "", userName: "" });
// 选择教师
const handleSelectTeacher = () => {
  selectTeacherRef.value?.show(teacherList.value);
};

// 获取年级列表
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

const handleGradeChange = (value: string) => {
  formData.name = value;
  formData.className = value.split("/")[1];
  formData.gradeName = value.split("/")[0];
};
// 教师选择确认
const handleTeacherSelected = (teacher: any) => {
  formData.userCode = teacher.userCode;
  formData.userName = teacher.userName;
};
// 获取课程详情
const getCourseDetail = async (id: string) => {
  if (props.type === "edit" && id) {
    const res = await TeachPlanService.queryCoursePlanDetail({
      courseCode: id
    });
    if (res.code === 0) {
      teacherList.value.userCode = res.data.userCode;
      teacherList.value.userName = res.data.userName;
      Object.assign(formData, {
        courseCode: res.data.courseCode || "",
        userCode: res.data.userCode || "",
        userName: res.data.userName || "",
        name: res.data.gradeName + "/" + res.data.className || "",
        date1: res.data.dateTime || "",
        subjectNumber: res.data.subjectNumber || "",
        termName: res.data.termName || "",
        termNumber: res.data.termNumber || "",
        remark: res.data.remark || "",
        subjectContext: JSON.parse(res.data.subjectContext) || "",
        subjectName: res.data.subjectName || "",
        gradeName: res.data.gradeName || "",
        className: res.data.className || ""
      });
    }
  } else {
    // 清空表单数据
    Object.keys(formData).forEach((key) => {
      formData[key] = "";
    });
    courseForm.value?.resetFields();
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!courseForm.value) return;
  await courseForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          courseCode: formData.courseCode,
          userCode: formData.userCode,
          dateTime: formData.date1,
          subjectName: formData.subjectName,
          gradeName: formData.gradeName,
          className: formData.className,
          subjectNumber: formData.subjectNumber,
          termName: formData.termName,
          termNumber: formData.termNumber,
          subjectContext: formData.subjectContext.map((slot) => ({
            timeSlot: slot.timeSlot,
            content: slot.content
          })),
          remark: formData.remark
        };
        console.log("submitData", submitData);
        let res;
        if (props.type === "add") {
          res = await TeachPlanService.addCoursePlan(submitData);
        } else {
          res = await TeachPlanService.updateCoursePlan({
            ...submitData,
            id: props.id
          });
        }

        if (res.code === 0) {
          ElMessage.success(props.type === "add" ? "添加成功" : "更新成功");
          emit("refresh");
          emit("close");
        } else {
          ElMessage.error(res.message || "操作失败");
        }
      } catch (error: any) {
        ElMessage.error("操作失败：" + error.message);
      }
    }
  });
};

// 取消
const handleCancel = () => {
  emit("close");
};

// 初始化编辑数据
onMounted(async () => {
  loading.value = true;
  await getGradeList();
  await getCourseList();
  await getTermList();
  loading.value = false;
});

defineExpose({
  getCourseDetail
});
</script>

<style scoped lang="scss">
.add-course-container {
  padding: 10px;
}

.form-input {
  width: 100%;
}

.time-slots-container {
  width: 100%;
}

.time-slots-header {
  display: flex;
  font-weight: bold;
  margin-bottom: 10px;
}

.time-slot-row {
  display: flex;
  margin-bottom: 10px;
}

.time-slot-index {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-slot-time {
  flex: 1;
  padding-right: 10px;
}

.time-slot-content {
  flex: 2;
}

.time-slot-delete {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.add-time-slot {
  margin-top: 10px;
  text-align: center;
}

.form-buttons {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}
</style>
