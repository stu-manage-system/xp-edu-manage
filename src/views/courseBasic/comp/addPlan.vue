<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="dialogType === 'add' ? '新增课程' : '编辑课程'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      v-loading="loading"
      :disabled="loading"
    >
      <el-form-item label="课程名称" prop="courseName">
        <el-input
          v-model="formData.courseName"
          placeholder="请输入课程名称"
          :maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="课程体系编号" prop="courseSystemCode">
        <el-select
          v-model="formData.courseSystemCode"
          placeholder="请选择课程体系编号"
        >
          <el-option label="其他" value="other" />
          <el-option label="素养课" value="literacy" />
          <el-option label="IGCSE" value="igcse" />
          <el-option label="A-level" value="alevel" />
        </el-select>
      </el-form-item>

      <el-form-item label="课程简介">
        <el-input
          v-model="formData.remark"
          placeholder="请输入课程简介"
          :maxlength="500"
          show-word-limit
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { CourseService } from "@/api/courseApi";

interface CourseForm {
  courseName: string;
  courseSystemCode: string;
  remark: string;
  courseCode: string;
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  dialogType: {
    type: String,
    default: "add"
  },
  rowData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:visible", "success"]);

const loading = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<CourseForm>({
  courseCode: "",
  courseName: "",
  courseSystemCode: "",
  remark: ""
});

// 表单校验规则
const rules = {
  courseName: [
    { required: true, message: "请输入课程名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  courseSystemCode: [
    { required: true, message: "请选择课程体系编号", trigger: "blur" }
  ]
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    const api =
      props.dialogType === "edit"
        ? () =>
            CourseService.updateCourseBasic({
              ...formData,
              id: props.rowData.id
            })
        : () => CourseService.addCourseBasic({ ...formData });

    const res = await api();
    if (res.code === 0) {
      ElMessage.success(props.dialogType === "add" ? "新增成功" : "修改成功");
      emit("success");
      handleCancel();
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    // 表单验证失败
  }
};

// 取消操作
const handleCancel = () => {
  emit("update:visible", false);
  formRef.value?.resetFields();
};

// 监听弹窗显示并加载数据
watch(
  () => props.visible,
  (val) => {
    if (val && props.dialogType === "edit") {
      // 编辑时直接使用传入的行数据
      Object.assign(formData, {
        courseName: props.rowData.courseName,
        courseSystemCode: props.rowData.courseSystemCode,
        remark: props.rowData.remark || "",
        courseCode: props.rowData.courseCode || ""
      });
    }
  }
);
</script>

<style lang="scss" scoped>
.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input),
:deep(.el-select) {
  width: 100%;
  max-width: 500px;
}
</style>
