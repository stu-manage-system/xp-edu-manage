<template>
  <el-dialog
    :title="isEdit ? '编辑公告' : '新增公告'"
    v-model="dialogVisible"
    width="80%"
    @closed="handleClosed"
  >
    <el-form :model="formData" ref="formRef" label-width="100px">
      <el-form-item label="公告标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入公告标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="公告类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择公告类型"
          style="width: 100%"
        >
          <el-option label="系统公告" value="系统公告"></el-option>
          <el-option label="活动公告" value="活动公告"></el-option>
          <el-option label="紧急通知" value="紧急通知"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="公告内容" prop="content">
        <wang-editor v-model="formData.content"></wang-editor>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import WangEditor from "@/components/Form/Editor.vue";
import { Announcement } from "@/views/notice/type";

// 定义组件的属性
const props = defineProps<{
  visible: boolean;
  isEdit: boolean;
  currentData?: Announcement;
}>();
// 定义组件的事件
const emit = defineEmits<{
  "update:visible": [value: boolean];
  submit: [formData: Announcement];
  cancel: [];
}>();

// 对话框可见状态
const dialogVisible = ref(props.visible);

// 监听props.visible的变化，同步到dialogVisible
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听dialogVisible的变化，同步到props.visible
watch(dialogVisible, (newVal) => {
  emit("update:visible", newVal);
});

// 表单数据
const formData = ref<Announcement>({
  id: "",
  title: "",
  type: "",
  content: "",
  operator: "当前用户",
  create_time: ""
});

// 表单引用
const formRef = ref(null);

// 取消按钮
const handleCancel = () => {
  emit("cancel");
  dialogVisible.value = false;
};

// 确定按钮
const handleSubmit = () => {
  // 这里可以添加表单验证
  emit("submit", formData.value);
  dialogVisible.value = false;
};

// 对话框关闭事件
const handleClosed = () => {
  // 重置表单数据
  formData.value = {
    id: "",
    title: "",
    type: "",
    content: "",
    operator: "当前用户",
    create_time: ""
  };
};

const getDetail = (id: string) => {
  console.log(id);
};

defineExpose({
  getDetail
});
</script>

<style lang="scss" scoped>
// 可以添加自定义样式
</style>
