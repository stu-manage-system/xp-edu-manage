<template>
  <div class="approval-template">
    <div v-if="isLoading">
      <el-skeleton animated />
    </div>
    <div v-else>
      <div class="tool-bar">
        <el-button type="primary" @click="goAddTemplate">新增模板</el-button>
      </div>
      <div v-if="emptyTemplate">
        <el-empty description="暂无模板数据" />
      </div>

      <el-row :gutter="20">
        <el-col :span="6" class="mb-20" v-for="template in templateList" :key="template.templateCode">
          <el-card shadow="hover">
            <template #header>
              <div>
                <span>{{ template.flowName }}</span>
              </div>
            </template>
            <div class="justify-between">
              <el-switch
                v-model="template.status"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                :active-value="0"
                :inactive-value="1"
                @click="handleSwitch(template.templateCode, template.status)"
              />
              <div class="justify-end">
                <el-button type="primary" :icon="Edit" circle @click="goWorkflow(template.templateCode)" />
                <el-popconfirm title="是否删除该审批模板?" @confirm="handleDelete(template.templateCode)">
                  <template #reference>
                    <el-button type="danger" :icon="Delete" circle />
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { Delete, Edit } from "@element-plus/icons-vue";
  import { useRouter } from "vue-router";
  import { ApprovalService } from "@/api/approvalApi";
  import { ITemplateItemRep } from "@/interface/IApproval";

  const router = useRouter();
  const templateList = ref<ITemplateItemRep[]>([]);
  const isLoading = ref(true);

  const emptyTemplate = computed(() => {
    return templateList?.value?.length === 0;
  });

  onMounted(() => {
    ApprovalService.getApprovalTemplateList()
      .then((res) => {
        templateList.value = res.data;
        isLoading.value = false;
      })
      .catch((err) => {
        isLoading.value = false;
      });
  });

  const handleDelete = (id: string) => {
    ApprovalService.deleteApprovalTemplate(id).then((res) => {
      if (res.code === 0) {
        ElMessage.success("删除成功");
        templateList.value = templateList.value.filter((item: any) => item.templateCode !== id);
      } else {
        ElMessage.error(res.message);
      }
    });
  };
  const goWorkflow = (id: string) => {
    router.push(`/approval/workflow?templateCode=${id}`);
  };

  const handleSwitch = (id: string, status: number) => {
    ApprovalService.updateApprovalTemplateStatus(id, status).then((res) => {
      if (res.code === 0) {
        ElMessage.success("操作成功");
      } else {
        ElMessage.error(res.message);
      }
    });
  };

  const goAddTemplate = () => {
    router.push("/approval/workflow");
  };
</script>
<style lang="scss" scoped>
  .approval-template {
    .mb-20 {
      margin-bottom: 20px;
    }

    .justify-between {
      display: flex;
      justify-content: space-between;
    }

    .justify-end {
      display: flex;
      justify-content: flex-end;
    }
    .tool-bar {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 20px;
    }
  }
</style>
