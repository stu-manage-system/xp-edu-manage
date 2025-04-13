<template>
  <div class="add-course-container">
    <el-form
      :model="formData"
      :rules="rules"
      ref="courseForm"
      label-width="100px"
    >
      <el-form-item label="教师" prop="userCode" required>
        <el-select
          v-model="formData.userCode"
          placeholder="请选择教师"
          class="form-input"
        >
          <el-option label="李老师" value="李老师" />
          <el-option label="徐清妍" value="徐清妍" />
        </el-select>
      </el-form-item>

      <el-form-item label="年级" prop="gradeName" required>
        <el-select
          v-model="formData.gradeName"
          placeholder="请选择年级"
          class="form-input"
        >
          <el-option label="高级年级" value="高级年级" />
        </el-select>
      </el-form-item>

      <el-form-item label="班级" prop="className">
        <el-select
          v-model="formData.className"
          placeholder="请选择班级"
          class="form-input"
        >
          <el-option label="高级班级" value="高级班级" />
        </el-select>
      </el-form-item>

      <el-form-item label="日期" prop="date1">
        <el-date-picker
          v-model="formData.date1"
          type="date"
          placeholder="选择日期"
          class="form-input"
          value-format="YYYY/MM/DD"
        />
      </el-form-item>

      <el-form-item label="课程体系" prop="subjectName" required>
        <el-select
          v-model="formData.subjectName"
          placeholder="请选择课程体系"
          class="form-input"
        >
          <el-option label="艺术课程体系" value="艺术课程体系" />
        </el-select>
      </el-form-item>

      <el-form-item label="学期名称" prop="termName">
        <el-select
          v-model="formData.termName"
          placeholder="请选择学期名称"
          class="form-input"
        >
          <el-option label="一学期" value="一学期" />
        </el-select>
      </el-form-item>

      <el-form-item label="本学期内几周" prop="weekNumber">
        <el-input
          v-model="formData.weekNumber"
          placeholder="请输入"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="第几节课" prop="lessonNo">
        <el-input
          v-model="formData.lessonNo"
          placeholder="请输入第几节课"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="总体概要" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          placeholder="请输入总体概要"
          :rows="3"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="计划时间" prop="timeSlots">
        <div class="time-slots-container">
          <div class="time-slots-header">
            <div class="time-slot-index">序号</div>
            <div class="time-slot-time">时间间隔</div>
            <div class="time-slot-content">内容</div>
          </div>

          <div
            class="time-slot-row"
            v-for="(slot, index) in formData.timeSlots"
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
            <div class="time-slot-delete" v-if="formData.timeSlots.length > 1">
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

      <el-form-item label="计划内容" prop="planContent">
        <el-input
          v-model="formData.planContent"
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
  </div>
</template>

<script setup>
import { TeachPlanService } from "@/api/teachPlan";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";

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

const emit = defineEmits(["close", "refresh"]);
const courseForm = ref(null);

// 表单数据
const formData = reactive({
  userCode: "",
  gradeName: "",
  className: "",
  date1: "",
  subjectName: "",
  weekNumber: "",
  lessonNo: "",
  summary: "",
  timeSlots: [
    { timeSlot: "1st 10 mins", content: "" },
    { timeSlot: "Homework", content: "" }
  ],
  planContent: ""
});

// 表单验证规则
const rules = reactive({
  userCode: [{ required: true, message: "请选择教师", trigger: "change" }],
  gradeName: [{ required: true, message: "请选择年级", trigger: "change" }],
  subjectName: [
    { required: true, message: "请选择课程体系", trigger: "change" }
  ],
  date1: [{ required: true, message: "请选择日期", trigger: "change" }]
});

// 添加时间段
const addTimeSlot = () => {
  formData.timeSlots.push({ timeSlot: "", content: "" });
};

// 删除时间段
const deleteTimeSlot = (index) => {
  if (formData.timeSlots.length > 1) {
    formData.timeSlots.splice(index, 1);
  }
};

// 获取课程详情
const getCourseDetail = async (id) => {
  if (props.type === "edit" && id) {
    const res = await TeachPlanService.getCoursePlanDetail(id);
    if (res.code === 0) {
      // 处理时间段数据转换
      const timeSlots = [];
      Object.assign(formData, {
        userCode: res.data.userCode || "",
        date: res.data.date || "",
        lessonNo: res.data.lessonNo || "",
        summary: res.data.summary || "",
        planContent: res.data.planContent || "",
        timeSlots: res.data.timeSlotData || [],
        subjectName: res.data.subject || "",
        gradeName: res.data.gradeName || "",
        className: res.data.className || ""
      });
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!courseForm.value) return;

  await courseForm.value.validate(async (valid) => {
    if (valid) {
      try {
        // 构建提交的数据
        const submitData = {
          userCode: formData.userCode,
          dateTime: formData.date1,
          subject: formData.subjectName,
          lessonNo: formData.lessonNo,
          // 从timeSlots构建数据
          timeSlotData: formData.timeSlots.map((slot) => ({
            timeSlot: slot.timeSlot,
            description: slot.content
          })),
          planContent: formData.planContent
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

        if (res.code === 200) {
          ElMessage.success(props.type === "add" ? "添加成功" : "更新成功");
          emit("refresh");
          emit("close");
        } else {
          ElMessage.error(res.message || "操作失败");
        }
      } catch (error) {
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
onMounted(() => {});

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
