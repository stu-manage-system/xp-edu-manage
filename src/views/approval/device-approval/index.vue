<!-- @format -->

<template>
  <div class="page-content">
    <el-row :gutter="15">
      <el-col :xs="19" :sm="12" :lg="6">
        <el-input
          v-model="approvalQuery.title"
          placeholder="请输入标题搜索"
          clearable
        ></el-input>
      </el-col>
      <el-col :xs="19" :sm="12" :lg="6">
        <el-select
          v-model="approvalQuery.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option label="待审核" value="PENDING" />
          <el-option label="通过" value="COMPLETE" />
          <el-option label="驳回" value="REJECT" />
        </el-select>
      </el-col>
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button @click="handleSearch">搜索</el-button>
      </el-col>
    </el-row>
    <art-table
      :data="studentList"
      :total="total"
      :current-page="approvalQuery.pageNum"
      :page-size="approvalQuery.pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <el-table-column label="标题" prop="title" width="180px" />
      <el-table-column label="学号" prop="stuCode" width="180px" />
      <el-table-column label="学生姓名" prop="stuName" width="180px" />
      <el-table-column label="家长姓名" prop="parName" width="180px" />
      <el-table-column label="状态" prop="status" width="180px">
        <template #default="{ row }">
          {{
            row.status === "PENDING"
              ? "待审核"
              : row.status === "COMPLETE"
                ? "通过"
                : "驳回"
          }}
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createTime" width="180px" />
      <el-table-column
        label="操作"
        width="300px"
        #default="scope"
        fixed="right"
      >
        <div style="display: flex; align-items: center">
          <el-button
            type="primary"
            size="default"
            @click="handleApproval(scope.row)"
            >审批</el-button
          >
        </div>
      </el-table-column>
    </art-table>

    <!-- Add Approval Dialog -->
    <el-dialog v-model="dialogVisible" title="审批" width="50%">
      <el-descriptions :column="1" border v-loading="approvalDetailLoading">
        <el-descriptions-item label="标题">{{
          approvalDetail?.title
        }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{
          approvalDetail?.createTime
        }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{
          approvalDetail?.stuName
        }}</el-descriptions-item>
        <el-descriptions-item label="审批记录">
          <div
            v-for="(record, index) in approvalDetail?.approvalRecordList"
            :key="index"
            style="max-height: 200px; overflow-y: auto"
          >
            <p>
              审批人: {{ record.approvalPersonName || record.approvalPerson }}
            </p>
            <p>审批时间: {{ record.createTime }}</p>
            <p>
              审批状态:
              {{ record.currentStatus === "COMPLETE" ? "已完成" : "待审核" }}
            </p>
            <p>审批意见: {{ record.remark || "无" }}</p>
            <el-divider
              v-if="index !== approvalDetail?.approvalRecordList.length - 1"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="抄送记录">
          <div v-if="approvalDetail?.ccRecordList?.length">
            <div
              v-for="(cc, index) in approvalDetail?.ccRecordList"
              :key="index"
            >
              {{ cc }}
            </div>
          </div>
          <div v-else>无</div>
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        style="margin-top: 20px"
        :model="approvalForm"
        label-width="120px"
      >
        <el-form-item label="审批意见" required>
          <el-input v-model="approvalForm.remark" type="textarea" />
        </el-form-item>
        <el-form-item label="是否为最后节点">
          <el-switch v-model="approvalForm.isEndNode" />
        </el-form-item>
        <el-form-item
          label="下一个审批人"
          v-if="!approvalForm.isEndNode"
          required
        >
          <el-input
            :value="
              approvalForm.approvalPerson
                ? `${selectedUser.userName}(${approvalForm.approvalPerson})`
                : ''
            "
            placeholder="请选择下一个审批人"
            disabled
          >
            <template #append>
              <el-button @click="openUserSelect('approval')">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="抄送人">
          <el-input
            :value="
              approvalForm.ccUserCode
                ? `${ccDetail.userName}(${approvalForm.ccUserCode})`
                : ''
            "
            placeholder="请选择抄送人"
            disabled
          >
            <template #append>
              <el-button @click="openUserSelect('cc')">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          v-if="approvalDetail?.actionButton.includes('REJECT')"
          type="danger"
          @click="submitApproval('REJECT')"
          :loading="isSubmitLoading"
          >拒绝</el-button
        >
        <el-button
          v-if="approvalDetail?.actionButton.includes('CC')"
          type="danger"
          @click="submitApproval('CC')"
          :loading="isSubmitLoading"
          >拒绝</el-button
        >
        <el-button
          v-if="approvalDetail?.actionButton.includes('THROUGH')"
          type="primary"
          @click="submitApproval('THROUGH')"
          :loading="isSubmitLoading"
          >同意</el-button
        >
      </template>
    </el-dialog>

    <!-- 选择审批人弹窗 -->
    <el-dialog
      title="选择审批人"
      v-model="userSelectVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div style="display: flex; gap: 10px">
        <el-form :model="userQuery" label-width="100px" ref="userFormRef">
          <el-form-item label="姓名" prop="userName">
            <el-input
              v-model="userQuery.userName"
              placeholder="请输入姓名"
              style="width: 200px"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleSearchUser">搜索</el-button>
      </div>
      <el-table :data="userList" height="400" @row-click="handleSelectUser">
        <el-table-column prop="userCode" label="工号" />
        <el-table-column prop="userName" label="姓名" />
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="position" label="职位" />
      </el-table>
      <el-pagination
        v-model:current-page="userQuery.pageNum"
        v-model:page-size="userQuery.pageSize"
        :total="userTotal"
        @current-change="getUserList"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted, ref } from "vue";
  import { ApprovalService } from "@/api/approvalApi";
  import { ElMessage } from "element-plus";
  import { UserService } from "@/api/usersApi";

  const studentList = ref([{}]);
  const total = ref(0);
  const approvalQuery = reactive({
    title: "",
    status: "",
    pageNum: 1,
    pageSize: 10,
    type: "EQUIPMENT_APPROVAL", //STUDENT_LEAVE,EQUIPMENT_APPROVAL
  });

  const isLoading = ref(false);
  const isSubmitLoading = ref(false);

  const dialogVisible = ref(false);
  const approvalForm = reactive({
    flowCode: "",
    taskId: "",
    action: "",
    isEndNode: false,
    approvalPerson: "",
    ccUserCode: "",
    remark: "",
  });
  const approvalDetail = ref<any>(null);
  const approvalDetailLoading = ref(false);
  const ccDetail = ref<any>(null);
  const currentAction = ref<string>("approval");
  const userSelectVisible = ref(false);
  const userList = ref([]);
  const userTotal = ref(0);
  const userQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    userName: "",
  });
  const selectedUser = ref<any>(null);

  const getStudentList = async () => {
    isLoading.value = true;
    const res = await ApprovalService.getApprovalList(approvalQuery);
    studentList.value = res.data?.list || [];
    total.value = res.data?.total || 0;
    isLoading.value = false;
  };

  const handleSearch = async () => {
    approvalQuery.pageNum = 1;
    await getStudentList();
  };

  const handlePageChange = (page: number) => {
    approvalQuery.pageNum = page;
    getStudentList();
  };
  const handleSizeChange = (size: number) => {
    approvalQuery.pageSize = size;
    getStudentList();
  };
  const handleApproval = async (row: any) => {
    dialogVisible.value = true;
    approvalDetailLoading.value = true;
    const res = await ApprovalService.getDetail(row.flowCode);
    approvalDetail.value = { ...row, ...res.data };
    approvalForm.flowCode = row.flowCode;
    approvalForm.taskId = res.data.taskId;
    approvalDetailLoading.value = false;
  };

  const submitApproval = async (type: string) => {
    isSubmitLoading.value = true;
    try {
      if (!approvalForm.isEndNode && !approvalForm.approvalPerson) {
        ElMessage.error("请选择下一个审批人");
        return;
      }
      if (!approvalForm.isEndNode && !approvalForm.remark) {
        ElMessage.error("请输入审批意见");
        return;
      }
      if (type === "THROUGH") {
        approvalForm.action = "THROUGH";
      } else if (type === "CC") {
        approvalForm.action = "CC";
      } else if (type === "REJECT") {
        approvalForm.action = "REJECT";
      }

      const res = await ApprovalService.approval(approvalForm);
      if (res.code === 0) {
        ElMessage.success("审批成功");
        dialogVisible.value = false;
        getStudentList();
      }
    } catch (error) {
      ElMessage.error("审批失败");
    } finally {
      isSubmitLoading.value = false;
    }
  };

  const openUserSelect = async (action: string) => {
    currentAction.value = action;
    userSelectVisible.value = true;
    await getUserList();
  };

  const handleSearchUser = async () => {
    userQuery.pageNum = 1;
    await getUserList();
  };

  const getUserList = async () => {
    try {
      const res = await UserService.queryStoreUserList(userQuery);
      userList.value = res.data?.list || [];
      userTotal.value = res.data?.total || 0;
    } catch (error) {
      console.error(error);
      ElMessage.error("获取用户列表失败");
    }
  };

  const handleSelectUser = (row: any) => {
    if (currentAction.value === "approval") {
      approvalForm.approvalPerson = row.userCode;
      selectedUser.value = row;
    } else {
      approvalForm.ccUserCode = row.userCode;
      ccDetail.value = row;
    }

    userSelectVisible.value = false;
  };

  onMounted(() => {
    getStudentList();
  });
  watch(dialogVisible, (val) => {
    if (!val) {
      approvalDetail.value = null;
    }
  });
</script>

<style lang="scss" scoped>
  .parents-info {
    h3 {
      margin-bottom: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .el-select {
    width: 100%;
  }
  :deep(.el-dialog) {
    margin-top: 20px;
    .el-dialog__body {
      height: 100%;
      overflow-y: auto;
    }
  }
</style>
