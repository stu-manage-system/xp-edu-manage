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
      <el-form-item label="公告系统" prop="noticeSystem">
        <el-select
          v-model="formData.noticeSystem"
          placeholder="请选择公告系统"
          style="width: 100%"
        >
          <el-option label="系统公告" value="系统公告"></el-option>
          <el-option label="活动公告" value="活动公告"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="公告类型" prop="noticeType">
        <el-select
          v-model="formData.noticeType"
          placeholder="请选择公告类型"
          style="width: 100%"
        >
          <el-option label="普通消息" value="普通消息"></el-option>
          <el-option label="紧急消息" value="紧急消息"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          placeholder="选择开始时间"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          placeholder="选择结束时间"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="是否置顶" prop="isTop">
        <el-switch
          v-model="formData.isTop"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item
        label="置顶优先级"
        prop="priority"
        v-if="formData.isTop === 1"
      >
        <el-input-number
          v-model="formData.priority"
          :min="0"
          :max="999"
          placeholder="请输入"
        />
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
import { NoticeService } from "@/api/notice";

// 定义组件的属性
const props = defineProps<{
  visible: boolean;
  isEdit: boolean;
}>();
// 定义组件的事件
const emit = defineEmits<{
  "update:visible": [value: boolean];
  submit: [];
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
  noticeCode: "",
  title: "",
  noticeSystem: "",
  noticeType: "",
  content: "",
  startTime: null,
  endTime: null,
  isTop: 0,
  priority: 0,
  operator: "当前用户",
  ctime: ""
});

// 表单引用
const formRef = ref(null);

// 取消按钮
const handleCancel = () => {
  emit("cancel");
  dialogVisible.value = false;
};

// 确定按钮
const handleSubmit = async () => {
  // 这里可以添加表单验证
  console.log("formData.value ~ 🚀", formData.value);
  let res = props.isEdit
    ? await NoticeService.editNotice(formData.value)
    : await NoticeService.addNotice(formData.value);
  console.log("res ~ 🚀", res);
  if (res.code === 0) {
    ElMessage.success(props.isEdit ? "编辑成功" : "新增成功");
    emit("submit");
    dialogVisible.value = false;
  } else {
    ElMessage.error(props.isEdit ? "编辑失败" : "新增失败");
  }
};

// 对话框关闭事件
const handleClosed = () => {
  // 重置表单数据
  formData.value = {
    id: "",
    title: "",
    noticeSystem: "",
    noticeType: "",
    content: "",
    startTime: null,
    endTime: null,
    isTop: 0,
    priority: 0,
    operator: "当前用户",
    ctime: ""
  };
};

const getDetail = async (id: string) => {
  if (!id) return;
  let res = await NoticeService.getNoticeDetail({ noticeCode: id });
  console.log("res ~ 🚀", res);
  if (res.code === 0) {
    formData.value = res.data;
  }
};

defineExpose({
  getDetail
});
</script>

<style lang="scss" scoped>
// 可以添加自定义样式
</style>
