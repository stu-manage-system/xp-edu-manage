<template>
  <el-dialog
    :title="dialogType === 'add' ? '新增年级班级' : '编辑年级班级'"
    v-model="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="年级名称" prop="gradeName">
        <el-input v-model="formData.gradeName" placeholder="请输入年级名称" />
      </el-form-item>
      <el-form-item label="班级名称" prop="className">
        <el-input v-model="formData.className" placeholder="请输入班级名称" />
      </el-form-item>
      <el-form-item label="班级类型" prop="classType">
        <el-select v-model="formData.classType" placeholder="请选择班级类型">
          <el-option
            v-for="item in classTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="班主任" prop="headTeacherCode">
        <el-input
          v-model="formData.headTeacherName"
          placeholder="请选择班主任"
          readonly
          @click="handleSelectHeadTeacher"
        >
          <template #append>
            <el-button @click="handleSelectHeadTeacher"> 选择 </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="副班主任" prop="deputyHeadCode">
        <el-input
          v-model="formData.deputyHeadName"
          placeholder="请选择副班主任"
          readonly
          @click="handleSelectDeputyHead()"
        >
          <template #append>
            <el-button @click="handleSelectDeputyHead()"> 选择 </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
    <SelectTeacher
      ref="selectTeacherRef"
      :multiple="false"
      @confirm="(teacher) => handleTeacherSelected(teacher)"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { GradeService } from "@/api/gradeApi";
import { ApiService } from "@/api/apiApi";
import SelectTeacher from "@/components/user/select.vue";

const props = defineProps({
  dialogType: {
    type: String,
    default: "add"
  },
  rowData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update", "close"]);

const dialogVisible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();
const classTypeOptions = ref<any[]>([]); // 班级类型选项
const selectHeadTeacher = ref<any>({}); // 新增：班主任选择状态
const selectDeputyTeacher = ref<any>({}); // 新增：副班主任选择状态
const currentSelectType = ref<"head" | "deputy">("head");
const formData = reactive({
  code: "",
  gradeName: "",
  className: "",
  classType: "",
  headTeacherCode: "",
  headTeacherName: "",
  deputyHeadCode: "",
  deputyHeadName: "",
  remark: ""
});

const rules: FormRules = {
  gradeName: [{ required: true, message: "请输入年级名称", trigger: "blur" }],
  className: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  classType: [{ required: true, message: "请选择班级类型", trigger: "change" }],
  headTeacherCode: [
    { required: true, message: "请选择班主任", trigger: "change" }
  ]
};

const selectTeacherRef = ref();
const handleSelectHeadTeacher = () => {
  currentSelectType.value = "head";
  selectTeacherRef.value?.show(selectHeadTeacher.value);
};

const handleSelectDeputyHead = () => {
  currentSelectType.value = "deputy";
  selectTeacherRef.value?.show(selectDeputyTeacher.value);
};

const handleTeacherSelected = (teacher: any) => {
  if (currentSelectType.value === "head") {
    selectHeadTeacher.value = teacher;
    formData.headTeacherCode = teacher.userCode;
    formData.headTeacherName = teacher.userName;
  } else {
    selectDeputyTeacher.value = teacher;
    formData.deputyHeadCode = teacher.userCode;
    formData.deputyHeadName = teacher.userName;
  }
};

// 获取班级类型
const getGradeList = async () => {
  const res = await ApiService.getDictConfig("eduClassTypeEnum");
  console.log(res);
  if (res.code === 0) {
    classTypeOptions.value = res.data;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res =
          await GradeService[
            props.dialogType === "add" ? "addGrade" : "editGrade"
          ](formData);
        if (res.code === 0) {
          ElMessage.success(
            `${props.dialogType === "add" ? "新增" : "编辑"}成功`
          );
          emit("update");
          handleClose();
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
  formData.headTeacherCode = "";
  formData.headTeacherName = "";
  formData.deputyHeadCode = "";
  formData.deputyHeadName = "";
};

// 显示弹窗
const show = async ({ type, data }: { type: string; data: any }) => {
  dialogVisible.value = true;
  await getGradeList();
  if (type === "edit" && data) {
    Object.assign(formData, data);
    selectHeadTeacher.value = {
      userCode: data.headTeacherCode,
      userName: data.headTeacherName
    };
    selectDeputyTeacher.value = {
      userCode: data.deputyHeadCode,
      userName: data.deputyHeadName
    };
  } else {
    formRef.value?.resetFields();
  }
};

defineExpose({
  show
});
</script>
