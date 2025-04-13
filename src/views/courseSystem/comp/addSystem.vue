<template>
  <el-dialog
    v-model="dialogVisible"
    :title="
      props.type === 'add'
        ? '新增'
        : props.type === 'addSon'
          ? '新增子类别'
          : '编辑'
    "
    width="40%"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="课程体系" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入课程体系名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { CourseService } from "@/api/courseApi";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: "add"
  },
  courseData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:visible", "success"]);

const formRef = ref<FormInstance>();
const dialogVisible = ref(props.visible);

// 表单数据
const formData = reactive({
  code: "",
  name: "",
  parentId: "",
  remark: ""
});

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入课程体系名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ]
});

const clearForm = () => {
  formData.code = "";
  formData.name = "";
  formData.remark = "";
};
// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  clearForm();
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        const api =
          props.type === "add" || props.type === "addSon"
            ? CourseService.addCourseSystem
            : CourseService.updateCourseSystem;
        formData.parentId =
          props.type === "add"
            ? "-1"
            : formData.parentId || props.courseData.parentId;
        console.log("formData", formData);
        const res = await api(formData);
        if (res.code === 0) {
          ElMessage.success(props.type === "edit" ? "编辑成功" : "添加成功");
          emit("success");
          handleClose();
        }
      } catch (error) {}
    } else {
      console.log("表单验证失败", fields);
    }
  });
};

// 监听visible变化
watch(
  () => props.visible,
  async (val) => {
    dialogVisible.value = val;
    formData.code = props.courseData.code || "";
    if (props.type === "edit" && val) {
      clearForm();
      let res = await CourseService.queryCourseSystemDetail({
        systemCode: props.courseData.code
      });
      if (res.code === 0) {
        formData.code = res.data.code;
        formData.name = res.data.name;
        formData.remark = res.data.remark;
        formData.parentId = res.data.parentId;
      }
    }
  },
  { immediate: true }
);

// 监听dialogVisible变化
watch(
  () => dialogVisible.value,
  (val) => {
    emit("update:visible", val);
  }
);
</script>

<style lang="scss" scoped>
.course-form {
  padding: 20px;

  :deep(.el-form-item__content) {
    width: 100%;
    max-width: 400px;
  }
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}
</style>
