<template>
  <div class="page-content">
    <el-row :gutter="15">
      <el-col :xs="19" :sm="12" :lg="6">
        <el-input
          v-model="courseQuery.semester"
          placeholder="请输入学期"
        ></el-input>
      </el-col>
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="courseList"
      :total="total"
      :current-page="courseQuery.pageNum"
      :page-size="courseQuery.pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <el-table-column label="学期名称" prop="semester" />
      <el-table-column label="开始时间" prop="courseName" />
      <el-table-column label="结束时间" prop="stuEnName" />
      <el-table-column label="操作时间" prop="ctime" />
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
            @click="handleEdit(scope.row)"
            >修改</el-button
          >
          <el-button
            type="warning"
            style="margin-left: 10px"
            size="default"
            @click="handleArchive(scope.row)"
          >
            排课
          </el-button>
          <el-popconfirm
            title="确定删除吗？"
            @confirm="handleDelete(scope.row)"
          >
            <template #reference>
              <el-button type="danger" style="margin-left: 10px" size="default">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-table-column>
    </art-table>

    <el-dialog v-model="addSemesterDialogVisible" title="新增学期" width="50%">
      <el-form :model="addSemesterForm" label-width="100px">
        <el-form-item label="学期名称" prop="semester">
          <el-input
            v-model="addSemesterForm.semester"
            placeholder="请输入学期名称"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="addSemesterForm.startTime"
            type="date"
            placeholder="请选择开始时间"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="addSemesterForm.endTime"
            type="date"
            placeholder="请选择结束时间"
          />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  const courseQuery = ref({
    semester: "",
    pageNum: 1,
    pageSize: 10,
  });

  const courseList = ref([]);
  const total = ref(0);
  const isLoading = ref(false);
  const addSemesterDialogVisible = ref(false);
  const addSemesterForm = ref({
    semester: "",
    startTime: "",
    endTime: "",
  });

  const handleSearch = () => {
    console.log(courseQuery.value);
  };

  const handleAdd = () => {
    console.log("新增");
  };

  const handlePageChange = (pageNum: number, pageSize: number) => {
    courseQuery.value.pageNum = pageNum;
    courseQuery.value.pageSize = pageSize;
    handleSearch();
  };

  const handleSizeChange = (pageSize: number) => {
    courseQuery.value.pageSize = pageSize;
    handleSearch();
  };

  const handleEdit = (row: any) => {
    console.log(row);
  };

  const handleArchive = (row: any) => {
    console.log(row);
  };

  const handleDelete = (row: any) => {
    console.log(row);
  };
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
