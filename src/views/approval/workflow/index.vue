<template>
  <div class="page-container">
    <div class="workflow-container" v-loading="loading">
      <el-tabs v-model="activeName">
        <el-tab-pane label="① 基本信息" name="first">
          <div class="workflow-basic-info">
            <el-form-item label="流程名称" label-width="100px" label-position="right" required>
              <el-input v-model="form.flowName" clearable :disabled="!!form.templateCode" />
            </el-form-item>
            <el-form-item label="流程描述" label-width="100px" label-position="right">
              <el-input
                v-model="form.remark"
                type="textarea"
                maxlength="300"
                show-word-limit
                :autosize="{ minRows: 4 }"
                :disabled="!!form.templateCode"
              />
            </el-form-item>
          </div>
        </el-tab-pane>
        <el-tab-pane label="② 审批流程" name="second">
          <div class="workflow-process">
            <NodeFormList
              :nodes="form.templateNodeReqList"
              @updateNodes="updateNodes"
              :disabled="!!form.templateCode"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="save-btn-container">
        <el-button size="default" type="primary" plain @click="handleBack"> 返回 </el-button>
        <el-button v-if="!form.templateCode" size="default" type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import NodeFormList from "./components/NodeFormList.vue";
  import { IFormState } from "@/interface/IApproval";
  import { isNil } from "lodash";
  import { ApprovalService } from "@/api/approvalApi";
  import { nanoid } from "nanoid";
  const router = useRouter();
  const route = useRoute();
  const activeName = ref("first");
  const form = reactive<IFormState>({
    flowName: "",
    remark: "",
    templateNodeReqList: [
      {
        nodeName: "",
        nodeCode: nanoid(8),
        beforeCode: "",
        afterCode: "",
        approvalType: 2,
        approvalInfo: "",
        remark: "",
        isLastNode: false,
      },
    ],
  });
  const loading = ref(false);

  onMounted(() => {
    const templateCode = route.query.templateCode as string;
    if (templateCode) {
      loading.value = true;
      form.templateCode = templateCode;
      ApprovalService.getApprovalTemplateDetail(templateCode)
        .then((res) => {
          if (res.code === 0) {
            form.templateNodeReqList = res.data.templateNodeList;
            form.flowName = res.data.flowName;
            form.remark = res.data.remark;
            form.templateCode = res.data.templateCode;
          }
          loading.value = false;
        })
        .catch((err) => {
          loading.value = false;
        });
    }
  });

  const handleBack = () => {
    router.back();
  };
  const updateNodes = (nodes: any) => {
    form.templateNodeReqList = nodes;
  };
  const handleSave = () => {
    if (form.flowName === "") {
      ElMessage.warning("请先填写流程名称");
      return;
    } else {
      if (form.templateNodeReqList.length <= 1) {
        ElMessage.warning("请添加审批节点");
        return;
      }
      if (form.templateNodeReqList[0].nodeName === "") {
        ElMessage.warning("请填写申请节点名称");
        return;
      }
      if (form.templateNodeReqList.length > 1)
        for (let index = 1; index < form.templateNodeReqList.length; index++) {
          const element = form.templateNodeReqList[index];
          if (!element.nodeName) {
            ElMessage.warning(`请填写${index}级审批节点名称`);
            return;
          }
          if (isNil(element.approvalType)) {
            ElMessage.warning(`请选择${index}级审批节点类型`);
            return;
          }
          if (!element.approvalInfo) {
            ElMessage.warning(`请填写${index}级审批节点处理人`);
            return;
          }
        }
      form.templateNodeReqList.forEach((node, index, array) => {
        // 前一个节点的 nodeCode
        node.beforeCode = index > 0 ? array[index - 1].nodeCode : "";
        // 后一个节点的 nodeCode
        node.afterCode = index < array.length - 1 ? array[index + 1].nodeCode : "";
        //最后一个节点的isLastNode为true
        if (index === array.length - 1) {
          node.isLastNode = true;
        }
      });
      ApprovalService.submitApprovalTemplate(form).then((res) => {
        console.log(res);
        if (res.code === 0) {
          ElMessage.success("保存成功");
          router.back();
        } else {
          ElMessage.error(res.message);
        }
      });
    }
  };
</script>
<style lang="scss" scoped>
  .workflow-container {
    padding: 10px;
    background-color: #fff;
    border-radius: 10px;
    height: 100%;
    overflow: auto;
    position: relative;

    .save-btn-container {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }
</style>
