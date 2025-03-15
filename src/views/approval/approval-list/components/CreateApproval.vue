<template>
  <div class="create-approval">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="82px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="申请类型" prop="templateCode">
        <el-select v-model="form.templateCode" placeholder="请选择申请类型">
          <el-option
            v-for="item in approvalTemplateList"
            :label="item.flowName"
            :value="item.templateCode"
            :key="item.templateCode"
            :disabled="item.status === 1"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          placeholder="请输入备注"
          :autosize="{ minRows: 6 }"
          type="textarea"
          v-model="form.remark"
        />
      </el-form-item>
    </el-form>
    <div class="btn-container">
      <el-button type="primary" @click="submitForm">提交</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { FormInstance, FormRules } from "element-plus";
import { useApprovalStore } from "@/store/modules/approval";
import { ApprovalService } from "@/api/approvalApi";
const emit = defineEmits(["onSuccess"]);

const form = reactive({
  title: "",
  templateCode: "",
  remark: "",
});

const rules = reactive<FormRules>({
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  templateCode: [
    { required: true, message: "请选择申请类型", trigger: "change" },
  ],
});

const approvalStore = useApprovalStore();
const approvalTemplateList = computed(() => {
  return approvalStore.getApprovalTemplateList;
});

const formRef = ref<FormInstance>();

const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log(form);
      ApprovalService.createApproval(form).then((res) => {
        if (res.code === 0) {
          emit("onSuccess");
          ElMessage.success("申请成功");
        } else {
          ElMessage.error(res.message);
        }
      });
    }
  });
};
</script>
<style lang="scss" scoped>
.create-approval {
  padding: 20px;
  .btn-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
