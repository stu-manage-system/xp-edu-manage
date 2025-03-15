<template>
  <div class="approval-list">
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      :columns="columns"
      layout="search,refresh"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input label="标题" prop="title" v-model="searchForm.title" />
            <form-select
              label="状态"
              prop="status"
              v-model="searchForm.status"
              :options="approvalStatusEnum"
              clearable
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button type="primary" @click="createApprovalVisible = true"> 创建审批 </el-button>
      </template>
    </table-bar>
    <art-table
      :data="approvalList"
      :loading="loading"
      :currentPage="searchForm.pageNum"
      :pageSize="searchForm.pageSize"
      :total="total"
      @page-change="changeCurrentPage"
    >
      <template #default>
        <el-table-column :prop="columns[0].prop" :label="columns[0].label" width="200" />
        <el-table-column :prop="columns[1].prop" :label="columns[1].label" width="200" />
        <el-table-column :prop="columns[2].prop" :label="columns[2].label" width="200" />
        <el-table-column :prop="columns[3].prop" :label="columns[3].label">
          <template #default="{ row }">
            {{ row.remark || "--" }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[4].prop" :label="columns[4].label" width="200">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{
              approvalStatusEnum.find((status) => status.value === row.status)?.label
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button
              v-if="row.status === EApprovalStatus.PROCESS"
              link
              type="primary"
              @click="handleView(row)"
              :icon="EditPen"
              >审批</el-button
            >
            <el-button v-else link type="primary" @click="handleView(row)" :icon="View">查看</el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>
    <el-drawer v-model="detailsVisible" title="审批详情" @close="handleBeforeClose">
      <el-tabs v-model="approvalDetailTab" class="approval-detail-tabs">
        <el-tab-pane class="approval-detail-tab" label="审批记录" name="record">
          <div class="approval-detail" v-loading="detailsLoading">
            <div class="approval-detail-content">
              <div class="approval-detail-content-item">
                <div class="person-info">
                  <div class="person-info-avatar">
                    <el-avatar style="background-color: var(--el-color-primary)">{{
                      currentApprovalDetail?.creator.slice(-2)
                    }}</el-avatar>
                    {{ currentApprovalDetail?.creator }}
                  </div>
                  <div class="person-info-text">
                    <div class="person-info-name">
                      {{ currentApprovalDetail?.title }}
                    </div>
                    <div class="person-info-id">编号：{{ currentApprovalDetail?.flowCode || "--" }}</div>
                  </div>
                  <div class="approval-status">
                    <el-tag v-if="currentApprovalDetail?.status" :type="getStatusType(currentApprovalDetail?.status)">{{
                      approvalStatusEnum.find((status) => status.value === currentApprovalDetail?.status)?.label
                    }}</el-tag>
                  </div>
                </div>
                <div class="gap"></div>
                <div class="approval-info">
                  <approval-flow :approvalFlow="currentApprovalDetail?.recordList || []" />
                </div>
              </div>
            </div>
            <div class="approval-detail-footer">
              <el-button
                v-for="item in currentApprovalDetail?.button"
                :key="item"
                :type="item === EApprovalButton.REJECT ? 'danger' : 'primary'"
                :plain="item === EApprovalButton.REJECT"
                @click="handleApprovalModal(item)"
                >{{ getButtonText(item) }}</el-button
              >
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane class="approval-detail-tab" label="审批流程" name="flow" style="padding: 0 10px">
          <flow-list :flowList="currentApprovalDetail?.flowTemplateNodeList || []" />
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
    <el-dialog
      v-model="approvalCheckVisible"
      :title="`${currentButton ? getButtonText(currentButton) : ''}理由`"
      width="500"
      draggable
      destroy-on-close
    >
      <div class="approval-check-content">
        <el-input
          placeholder="请输入审批理由"
          v-model="approvalCheckReason"
          type="textarea"
          :autosize="{ minRows: 6 }"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approvalCheckVisible = false">取消</el-button>
          <el-button type="primary" @click="handleApprovalCheck"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="createApprovalVisible" title="创建审批" @close="createApprovalVisible = false" destroy-on-close>
      <create-approval @onSuccess="handleSuccess" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import { EditPen, View } from "@element-plus/icons-vue";
  import { IApprovalFlowDetail, IApprovalItem, IApprovalListForm } from "@/interface/IApproval";
  import ApprovalFlow from "./components/ApprovalFlow.vue";
  import FlowList from "./components/FlowList.vue";
  import { FormInstance } from "element-plus";
  import { ApprovalService } from "@/api/approvalApi";
  import CreateApproval from "./components/CreateApproval.vue";
  import _ from "lodash";
  import { useApprovalStore } from "@/store/modules/approval";
  import { EApprovalButton, EApprovalStatus } from "@/interface/IApproval";
  import { getStatusType, getButtonText } from "@/utils/approval";

  const columns = reactive([
    {
      label: "审批类型",
      prop: "templateName",
      show: true,
    },
    {
      label: "标题",
      prop: "title",
      show: true,
    },
    {
      label: "发起人",
      prop: "creator",
      show: true,
    },
    {
      label: "备注",
      prop: "remark",
      show: true,
    },
    {
      label: "审批状态",
      prop: "status",
      show: true,
    },
  ]);
  const searchFormRef = ref<FormInstance>();
  const searchForm = reactive<IApprovalListForm>({
    status: "",
    title: "",
    pageNum: 1,
    pageSize: 30,
  });
  const total = ref(0);
  // 审批列表
  const approvalList = ref<IApprovalItem[]>([]);
  const loading = ref(false);
  const detailsLoading = ref(false);

  const approvalCheckVisible = ref(false);
  const approvalCheckReason = ref("");
  const detailsVisible = ref(false);
  const approvalDetailTab = ref("record");
  const createApprovalVisible = ref(false);
  const approvalStore = useApprovalStore();
  const currentButton = ref<EApprovalButton | null>(null);
  const approvalStatusEnum = computed(() => {
    return approvalStore.getApprovalStatusEnum;
  });

  const currentApprovalDetail = ref<IApprovalFlowDetail | null>(null);

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    searchForm.pageNum = 1;
    getApprovalList();
  };

  const search = () => {
    searchForm.pageNum = 1;
    getApprovalList();
  };

  const handleView = (row: IApprovalItem) => {
    detailsVisible.value = true;
    detailsLoading.value = true;
    ApprovalService.getApprovalDetail(row.flowCode)
      .then((res) => {
        if (res.code === 0) {
          currentApprovalDetail.value = res.data;
        }
      })
      .catch((error) => {
        ElMessage.error("获取审批详情失败");
      })
      .finally(() => {
        detailsLoading.value = false;
      });
  };

  const changeCurrentPage = (curPage: number) => {
    searchForm.pageNum = curPage;
    getApprovalList();
  };

  const getApprovalList = async () => {
    loading.value = true;
    const res = await ApprovalService.getApprovalList(searchForm);
    if (res.code === 0) {
      approvalList.value = res.data.list;
      total.value = res.data.total;
    } else {
      ElMessage.error(res.message);
    }
    loading.value = false;
  };

  const getApprovalTemplateList = async () => {
    const res = await ApprovalService.getApprovalTemplateList();
    if (res.code === 0) {
      approvalStore.setApprovalTemplateList(res.data);
    } else {
      ElMessage.error(res.message);
    }
  };

  const handleSuccess = () => {
    createApprovalVisible.value = false;
    getApprovalList();
  };

  const handleApprovalModal = (item: EApprovalButton) => {
    approvalCheckVisible.value = true;
    currentButton.value = item;
  };

  const handleApprovalCheck = () => {
    switch (currentButton.value) {
      case EApprovalButton.AGREE:
        handleAgree();
        break;
      case EApprovalButton.REJECT:
        handleReject();
        break;
      case EApprovalButton.UNDO:
        handleUndo();
        break;
      case EApprovalButton.CANCEL:
        handleCancel();
        break;
    }
    approvalCheckReason.value = "";
  };
  const findCurrentNodeIndex = () => {
    return currentApprovalDetail.value?.recordList.findIndex((item) => item.approvalStatus === 0);
  };

  const findTaskId = () => {
    const currentNodeIndex = findCurrentNodeIndex();
    if (currentNodeIndex !== -1 && !_.isNil(currentNodeIndex)) {
      const currentNode = currentApprovalDetail?.value?.recordList[currentNodeIndex];
      if (currentNode) {
        return currentNode.taskId;
      }
    }
  };

  const handleCloseVisible = () => {
    detailsVisible.value = false;
    approvalCheckVisible.value = false;
    getApprovalList();
  };

  const handleAgree = () => {
    const taskId = findTaskId();
    if (taskId && currentApprovalDetail.value?.flowCode) {
      ApprovalService.approvalPass(currentApprovalDetail.value?.flowCode, taskId, approvalCheckReason.value)
        .then((res) => {
          if (res.code === 0) {
            ElMessage.success("审批已通过");
            handleCloseVisible();
          }
        })
        .catch((error) => {
          ElMessage.error("操作失败");
        });
    } else {
      ElMessage.error("操作失败");
    }
  };

  const handleReject = () => {
    const taskId = findTaskId();
    if (taskId && currentApprovalDetail.value?.flowCode) {
      ApprovalService.approvalReject(currentApprovalDetail.value?.flowCode, taskId, approvalCheckReason.value)
        .then((res) => {
          if (res.code === 0) {
            ElMessage.success("审批已拒绝");
            handleCloseVisible();
          }
        })
        .catch((error) => {
          ElMessage.error("操作失败");
        });
    } else {
      ElMessage.error("操作失败");
    }
  };

  const handleUndo = () => {
    const taskId = findTaskId();
    if (taskId && currentApprovalDetail.value?.flowCode) {
      ApprovalService.approvalBack(currentApprovalDetail.value?.flowCode, taskId, approvalCheckReason.value)
        .then((res) => {
          if (res.code === 0) {
            ElMessage.success("审批已撤回");
            handleCloseVisible();
          }
        })
        .catch((error) => {
          ElMessage.error("操作失败");
        });
    } else {
      ElMessage.error("操作失败");
    }
  };

  const handleCancel = () => {
    const taskId = findTaskId();
    if (taskId && currentApprovalDetail.value?.flowCode) {
      ApprovalService.approvalAbandon(currentApprovalDetail.value?.flowCode, taskId, approvalCheckReason.value)
        .then((res) => {
          if (res.code === 0) {
            ElMessage.success("审批已作废");
            handleCloseVisible();
          }
        })
        .catch((error) => {
          ElMessage.error("操作失败");
        });
    } else {
      ElMessage.error("操作失败");
    }
  };

  const handleBeforeClose = () => {
    currentApprovalDetail.value = null;
  };

  onBeforeMount(() => {
    approvalStore.loadEnums();
  });

  onMounted(() => {
    getApprovalList();
    getApprovalTemplateList();
  });
</script>
<style lang="scss" scoped>
  .approval-list {
    :deep(.el-drawer__body) {
      padding: 0;
    }

    :deep(.el-drawer) {
      width: 30% !important;
    }

    .approval-detail {
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;

      &-content {
        padding: 20px 0;
        flex: 1;
        height: 0;
        overflow-y: auto;
        gap: 10px;

        &-item {
          display: flex;
          flex-direction: column;
          gap: 20px;

          .gap {
            height: 20px;
            background-color: rgb(221.7, 222.6, 224.4);
          }

          .person-info {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 20px;

            &-avatar {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              font-size: 14px;
            }

            .person-info-text {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            &-name {
              font-size: 16px;
              font-weight: 600;
              color: #000000;
            }

            &-id {
              font-size: 14px;
              color: #999;
            }
          }

          .approval-info {
            padding: 0 20px;
          }
        }
      }

      &-tabs {
        height: 100%;
      }
      &-tab {
        height: 100%;
      }

      &-footer {
        padding: 10px;
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 20px;
        box-shadow: 0 0 15px #dad8d8;
      }
    }

    .pagination-container {
      padding: 10px;
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
