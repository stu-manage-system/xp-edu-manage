<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="dialogType === 'add' ? '新增教室' : '编辑教室'"
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
      <el-form-item label="教室名称" prop="roomName">
        <el-input
          v-model="formData.roomName"
          placeholder="请输入教室名称"
          :maxlength="50"
          show-word-limit
          clearable
        />
      </el-form-item>
      <el-form-item label="容量(人数)" prop="capacity">
        <el-input-number
          v-model="formData.capacity"
          :min="1"
          :max="999"
          placeholder="请输入教室容量"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="教室类型">
        <el-select
          v-model="formData.roomType"
          placeholder="请选择教室类型"
          class="full-width"
          clearable
        >
          <el-option
            v-for="item in roomTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注信息"
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
import { ClassRoomService } from "@/api/classRoom";
import { ApiService } from "@/api/apiApi";

// 定义表单接口
interface ClassRoomForm {
  roomCode: string;
  roomName: string;
  capacity: number;
  roomType: string;
  remark: string;
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

// 教室类型选项
const roomTypeOptions = ref([]);
const getRoomTypeOptions = async () => {
  const res = await ApiService.getDictConfig("classroomTypeEnum");
  roomTypeOptions.value = res.data;
};

// 表单数据
const formData = reactive<ClassRoomForm>({
  roomCode: "",
  roomName: "",
  capacity: 30,
  roomType: "",
  remark: ""
});

// 表单校验规则
const rules = {
  roomName: [
    { required: true, message: "请输入教室名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  capacity: [
    { required: true, message: "请输入教室容量", trigger: "blur" },
    {
      type: "number" as const,
      min: 1,
      message: "容量必须大于0",
      trigger: "blur"
    }
  ],
  roomType: [{ required: true, message: "请选择教室类型", trigger: "change" }]
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;
    const api =
      props.dialogType === "edit"
        ? ClassRoomService.editClassRoom
        : ClassRoomService.addClassRoom;
    const res = await api(formData);
    if (res.code === 0) {
      ElMessage.success(props.dialogType === "add" ? "新增成功" : "修改成功");
      emit("success");
      handleCancel();
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    console.error("表单提交错误:", error);
  } finally {
    loading.value = false;
  }
};
const resetForm = () => {
  formData.roomCode = "";
  formData.roomName = "";
  formData.capacity = 30;
  formData.roomType = "";
  formData.remark = "";
};
// 取消操作
const handleCancel = () => {
  loading.value = false;
  resetForm();
  emit("update:visible", false);
  formRef.value?.resetFields();
};

// 监听弹窗显示并加载数据
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      await getRoomTypeOptions();
      if (props.dialogType === "edit" && props.rowData) {
        loading.value = true;
        try {
          formData.roomCode = props.rowData.roomCode;
          formData.roomName = props.rowData.roomName;
          formData.capacity = props.rowData.capacity;
          formData.roomType = props.rowData.roomType;
          formData.remark = props.rowData.remark;
        } catch (error) {
          console.error("获取详情失败:", error);
        } finally {
          loading.value = false;
        }
      } else {
        resetForm();
      }
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
:deep(.el-select),
:deep(.el-input-number) {
  width: 100%;
  max-width: 500px;
}
</style>
