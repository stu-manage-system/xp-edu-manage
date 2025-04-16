<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="dialogType === 'add' ? '新增' : '编辑'"
    width="600px"
  >
    <el-form
      :model="form"
      label-width="100px"
      :rules="rules"
      ref="formRef"
      class="exam-form"
    >
      <el-form-item label="知识类型" prop="knowledgeType">
        <el-select
          v-model="form.knowledgeType"
          placeholder="请选择知识类型"
          clearable
        >
          <el-option label="选项1" value="1" />
          <!-- 根据实际需求添加选项 -->
        </el-select>
      </el-form-item>

      <el-form-item label="真题名称" prop="examName">
        <el-input v-model="form.examName" placeholder="请输入真题名称" />
      </el-form-item>

      <el-form-item label="考试题" prop="examQuestion">
        <el-select
          v-model="form.examQuestion"
          placeholder="请选择考试题"
          clearable
        >
          <el-option label="选项1" value="1" />
          <!-- 根据实际需求添加选项 -->
        </el-select>
      </el-form-item>

      <el-form-item label="真题日期" prop="examDate">
        <el-date-picker
          v-model="form.examDate"
          type="date"
          placeholder="请选择日期"
        />
      </el-form-item>

      <el-form-item label="上传真题" prop="examFile">
        <el-upload
          class="avatar-uploader"
          :limit="1"
          v-model:file-list="fileList"
          :on-exceed="handleExceed"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          name="uploadfile"
          :action="url"
          :auto-upload="false"
        >
          <el-button type="primary">PDF上传</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="上传答案" prop="answerFile">
        <el-upload
          class="avatar-uploader"
          :limit="1"
          v-model:file-list="answerFileList"
          :on-exceed="handleExceed"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          name="uploadfile"
          :action="url"
          :auto-upload="false"
        >
          <el-button type="primary">PDF上传</el-button>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { FormInstance } from "element-plus";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  dialogType: {
    type: String,
    default: "add"
  },
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:visible", "submit"]);
const fileList = ref([]);
const answerFileList = ref([]);
const formRef = ref<FormInstance>();
const url = ref("http://localhost:8080/api/upload");
const form = reactive({
  knowledgeType: "",
  examName: "",
  examQuestion: "",
  examDate: "",
  examFile: null,
  answerFile: null
});

const rules = {
  knowledgeType: [
    { required: true, message: "请选择知识类型", trigger: "change" }
  ],
  examName: [{ required: true, message: "请输入真题名称", trigger: "blur" }],
  examQuestion: [
    { required: true, message: "请选择考试题", trigger: "change" }
  ],
  examDate: [{ required: true, message: "请选择日期", trigger: "change" }]
};

watch(
  () => props.formData,
  (newVal) => {
    Object.assign(form, newVal);
  },
  { deep: true }
);

const beforeUpload = (file: any) => {
  console.log(file);
};

const handleExceed = (files: any, fileList: any) => {
  console.log(files, fileList);
};

const handleSuccess = (response: any, file: any, fileList: any) => {
  console.log(response, file, fileList);
};

const handleAnswerFileChange = (file: any) => {
  form.answerFile = file.raw;
};

const handleCancel = () => {
  emit("update:visible", false);
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      emit("submit", { ...form });
    }
  });
};
</script>

<style lang="scss" scoped>
.exam-form {
  :deep(.el-select),
  :deep(.el-input),
  :deep(.el-date-picker) {
    width: 100%;
  }
}

.upload-demo {
  :deep(.el-upload) {
    width: auto;
    .el-button {
      width: auto;
    }
  }
}
</style>
