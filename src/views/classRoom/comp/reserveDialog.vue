<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="教室预约"
    width="550px"
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
      <el-form-item label="教室名称">
        <el-input v-model="roomInfo.roomName" disabled />
      </el-form-item>
      <el-form-item label="使用时间段" prop="timeRange">
        <el-date-picker
          v-model="formData.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="预约使用人" prop="useBy">
        <el-input
          v-model="formData.useBy"
          placeholder="请输入使用人姓名"
          :maxlength="50"
          show-word-limit
          clearable
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注信息"
          :maxlength="200"
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
import { ref, reactive, computed, watch } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  rowData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:visible", "success"]);

const loading = ref(false);
const formRef = ref<FormInstance>();

// 教室信息
const roomInfo = ref({
  roomId: props.rowData?.roomId || "",
  roomName: props.rowData?.roomName || "",
  capacity: props.rowData?.capacity || 0,
  roomType: props.rowData?.roomType || ""
});

// 表单数据
const formData = reactive({
  timeRange: null as unknown as [Date, Date],
  useBy: "",
  remark: ""
});

// 表单校验规则
const rules = {
  timeRange: [
    { required: true, message: "请选择使用时间段", trigger: "change" }
  ],
  useBy: [
    { required: true, message: "请输入预约使用人", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ]
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;
    let startTime = "";
    let endTime = "";

    if (
      formData.timeRange &&
      Array.isArray(formData.timeRange) &&
      formData.timeRange.length === 2
    ) {
      startTime = formData.timeRange[0] as unknown as string;
      endTime = formData.timeRange[1] as unknown as string;
    }

    const reserveData = {
      roomId: roomInfo.value.roomId,
      startTime,
      endTime,
      useBy: formData.useBy,
      remark: formData.remark
    };
    console.log(reserveData);

    // 这里需要替换为实际的 API 调用
    // const res = await ClassRoomService.reserveClassRoom(reserveData);

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // if (res.code === 0) {
    ElMessage.success("预约成功");
    emit("success");
    handleCancel();
    // } else {
    //   ElMessage.error(res.message);
    // }
  } catch (error) {
    console.error("表单提交错误:", error);
  } finally {
    loading.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  formRef.value?.resetFields();
  emit("update:visible", false);
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      formData.timeRange = null as unknown as [Date, Date];
      formData.useBy = "";
      formData.remark = "";
      formRef.value?.resetFields();
    }
  },
  { immediate: true }
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

.full-width {
  width: 100%;
}

:deep(.el-input),
:deep(.el-time-picker) {
  width: 100%;
  max-width: 380px;
}
</style>
