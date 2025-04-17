<!-- @format -->

<template>
  <div class="page-content">
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
      <el-table-column label="状态" prop="status" width="180px" />
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
      <el-form :model="approvalForm" label-width="120px">
        <el-form-item label="标题">
          <el-input v-model="approvalForm.baseInfo.title" disabled />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="approvalForm.baseInfo.stuCode" disabled />
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input :value="currentApprovalInfo.stuName" disabled />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-input v-model="approvalForm.baseInfo.startTime" disabled />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-input v-model="approvalForm.baseInfo.endTime" disabled />
        </el-form-item>
        <el-form-item label="申请原因">
          <el-input
            v-model="approvalForm.baseInfo.context"
            type="textarea"
            disabled
          />
        </el-form-item>
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
            v-model="approvalForm.approvalPerson"
            placeholder="请选择下一个审批人"
            disabled
          >
            <template #append>
              <el-button @click="openUserSelect">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          type="danger"
          @click="submitApproval('reject')"
          :loading="isSubmitLoading"
          >拒绝</el-button
        >
        <el-button
          type="primary"
          @click="submitApproval('agree')"
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
    status: "",
    isEndNode: false,
    baseInfo: {
      title: "",
      flowCode: "",
      type: "",
      stuCode: "",
      startTime: "",
      endTime: "",
      userCode: "",
      context: "",
    },
    isApplicantNode: true,
    approvalPerson: "",
    ccUserCode: "",
    remark: "",
  });
  //当前审批的信息
  const currentApprovalInfo = ref<any>(null);
  const userSelectVisible = ref(false);
  const userList = ref([]);
  const userTotal = ref(0);
  const userQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    userName: "",
  });

  const getStudentList = async () => {
    isLoading.value = true;
    const res = await ApprovalService.getApprovalList(approvalQuery);
    studentList.value = res.data?.list || [];
    total.value = res.data?.total || 0;
    isLoading.value = false;
  };

  const handlePageChange = (page: number) => {
    approvalQuery.pageNum = page;
    getStudentList();
  };
  const handleSizeChange = (size: number) => {
    approvalQuery.pageSize = size;
    getStudentList();
  };
  const handleApproval = (row: any) => {
    dialogVisible.value = true;
    approvalForm.baseInfo.title = row.title;
    approvalForm.baseInfo.stuCode = row.stuCode;
    approvalForm.baseInfo.startTime = row.startTime;
    approvalForm.baseInfo.endTime = row.endTime;
    approvalForm.baseInfo.context = row.context;
    approvalForm.flowCode = row.flowCode;
    approvalForm.taskId = row.taskId;
    currentApprovalInfo.value = row;
  };

  const submitApproval = async (type: string) => {
    isSubmitLoading.value = true;
    try {
      if (approvalForm.isEndNode && !approvalForm.approvalPerson) {
        ElMessage.error("请选择下一个审批人");
        return;
      }
      if (!approvalForm.isEndNode && !approvalForm.remark) {
        ElMessage.error("请输入审批意见");
        return;
      }
      if (type === "agree") {
        approvalForm.status = "AGREE";
      } else {
        approvalForm.status = "REJECT";
      }
      await ApprovalService.approval(approvalForm);
      dialogVisible.value = false;
      getStudentList();
      ElMessage.success("审批成功");
    } catch (error) {
      ElMessage.error("审批失败");
    } finally {
      isSubmitLoading.value = false;
    }
  };

  const openUserSelect = async () => {
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
    approvalForm.approvalPerson = row.userCode;
    userSelectVisible.value = false;
  };

  onMounted(() => {
    getStudentList();
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
</style>
