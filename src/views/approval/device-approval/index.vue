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
            >修改</el-button
          >
        </div>
      </el-table-column>
    </art-table>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted, ref } from "vue";
  import { ApprovalService } from "@/api/approvalApi";
  const studentList = ref([]);
  const total = ref(0);
  const approvalQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    type: "EQUIPMENT_APPROVAL", //STUDENT_LEAVE,EQUIPMENT_APPROVAL
  });

  const isLoading = ref(false);

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
    console.log(row);
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
