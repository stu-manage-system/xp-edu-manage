<template>
  <div class="page-content">
    <el-row :gutter="15">
      <el-col :xs="19" :sm="12" :lg="6">
        <el-input
          v-model="parentQuery.parName"
          placeholder="请输入家长姓名搜索"
        ></el-input>
      </el-col>
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button @click="handleSearchParent">搜索</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="parentList"
      :total="parentTotal"
      :page-size="parentQuery.pageSize"
      :page-num="parentQuery.pageNum"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <el-table-column label="姓名" prop="parName" />
      <el-table-column label="性别" prop="parSex">
        <template #default="{ row }">
          {{ row.parSex === 1 ? "男" : "女" }}
        </template>
      </el-table-column>
      <el-table-column label="联系方式" prop="parTel" />
      <el-table-column label="更新时间" prop="create_time" />
      <el-table-column
        label="操作"
        prop="create_time"
        fixed="right"
        width="300px"
        #default="scope"
      >
        <div style="display: flex; align-items: center">
          <el-button
            type="primary"
            size="default"
            @click="showDetail(scope.row)"
          >
            查看信息
          </el-button>
          <el-button
            type="primary"
            size="default"
            @click="handleBind(scope.row)"
          >
            绑定学生
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

    <!-- 绑定学生弹窗 -->
    <el-dialog
      title="绑定学生"
      v-model="bindDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form :model="bindForm" label-width="150px" ref="bindFormRef">
        <el-form-item label="家长编号" prop="parCode">
          <el-input
            v-model="bindForm.parCode"
            placeholder="请输入家长编号"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="学生编号" prop="stuCode">
          <el-input
            v-model="bindForm.stuCode"
            placeholder="请输入学生编号"
            disabled
          >
            <template #append>
              <el-button @click="openStudentSelect">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="是否紧急联系人" prop="isEmergency">
          <el-switch v-model="bindForm.isEmergency" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="bindForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bindDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBindSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 选择学生弹窗 -->
    <el-dialog
      title="选择学生"
      v-model="studentSelectVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div style="display: flex; gap: 10px">
        <el-form :model="studentQuery" label-width="100px" ref="studentFormRef">
          <el-form-item label="学生编号" prop="stuCode">
            <el-input
              v-model="studentQuery.stuName"
              placeholder="请输入学生姓名"
              style="width: 200px"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <el-table
        :data="studentList"
        height="400"
        @row-click="handleSelectStudent"
      >
        <el-table-column prop="stuCode" label="学号" />
        <el-table-column prop="stuName" label="姓名" />
        <el-table-column prop="stuClass" label="班级" />
        <el-table-column prop="stuGrade" label="年级" />
      </el-table>
      <el-pagination
        v-model:current-page="studentQuery.pageNum"
        v-model:page-size="studentQuery.pageSize"
        :total="studentTotal"
        @current-change="getStudentList"
      />
    </el-dialog>

    <!-- 家长详情抽屉 -->
    <el-drawer v-model="detailDrawerVisible" title="家长详情" size="800px">
      <el-descriptions
        :column="2"
        border
        v-loading="detailLoading"
        label-width="150px"
      >
        <el-descriptions-item label="姓名">{{
          parentDetail.parName
        }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{
          parentDetail.parNickName
        }}</el-descriptions-item>
        <el-descriptions-item label="编号">{{
          parentDetail.parCode
        }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{
          parentDetail.parTel
        }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{
          parentDetail.parMail
        }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{
          parentDetail.parSex === 1 ? "男" : "女"
        }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{
          parentDetail.parIdentify
        }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{
          parentDetail.remark
        }}</el-descriptions-item>
      </el-descriptions>

      <div class="children-list">
        <h3 style="margin: 20px 0">绑定学生信息</h3>
        <el-table :data="parentDetail?.childrenList || []" border>
          <el-table-column prop="stuName" label="姓名" />
          <el-table-column prop="stuEnName" label="英文名" />
          <el-table-column prop="stuCode" label="学号" />
          <el-table-column prop="stuSex" label="性别">
            <template #default="{ row }">
              {{ row.stuSex === 1 ? "男" : "女" }}
            </template>
          </el-table-column>
          <el-table-column prop="stuAge" label="年龄" />
          <el-table-column prop="stuClass" label="班级" />
          <el-table-column prop="stuGrade" label="年级" />
          <el-table-column prop="isEmergency" label="紧急联系人">
            <template #default="{ row }">
              {{ row.isEmergency ? "是" : "否" }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted } from "vue";
  import { StudentService } from "@/api/studentApi";
  import { ParentService } from "@/api/parentApi";
  const parentList = ref([]);
  const parentTotal = ref(0);
  const isLoading = ref(false);
  const parentQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    parName: "",
  });

  // 绑定学生相关变量
  const bindDialogVisible = ref(false);
  const bindFormRef = ref();
  const bindForm = reactive({
    parCode: "",
    stuCode: "",
    isEmergency: true,
    remark: "",
  });

  // 选择学生相关变量
  const studentSelectVisible = ref(false);
  const studentList = ref([]);
  const studentTotal = ref(0);
  const studentQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    stuName: "",
    stuEnName: "",
    stuClass: "",
    stuGrade: "",
  });

  // 家长详情相关变量
  const detailDrawerVisible = ref(false);
  const detailLoading = ref(false);
  const parentDetail = ref({
    parName: "",
    parNickName: "",
    parCode: "",
    parTel: "",
    parMail: "",
    parSex: 1,
    parIdentify: "",
    remark: "",
    childrenList: [],
  });

  const handleDelete = async (row: any) => {
    const res = await ParentService.deleteParent(row.parCode);
    if (res.code === 0) {
      ElMessage.success("删除成功");
      getParentList();
    }
  };

  // 打开绑定学生弹窗
  const handleBind = (row: any) => {
    bindDialogVisible.value = true;
    bindForm.parCode = row.parCode;
  };

  // 打开选择学生弹窗
  const openStudentSelect = async () => {
    studentSelectVisible.value = true;
    await getStudentList();
  };

  // 搜索学生
  const handleSearch = async () => {
    studentQuery.pageNum = 1;
    await getStudentList();
  };

  // 获取学生列表
  const getStudentList = async () => {
    try {
      const res = await StudentService.queryStoresStudentList(studentQuery);
      studentList.value = res.data?.list || [];
      studentTotal.value = res.data?.total || 0;
    } catch (error) {
      console.error(error);
      ElMessage.error("获取学生列表失败");
    }
  };
  const handleSearchParent = () => {
    parentQuery.pageNum = 1;
    getParentList();
  };
  const handlePageChange = (page: number) => {
    parentQuery.pageNum = page;
    getParentList();
  };
  const handleSizeChange = (size: number) => {
    parentQuery.pageSize = size;
    getParentList();
  };
  // 获取家长列表
  const getParentList = async () => {
    try {
      isLoading.value = true;
      const res = await ParentService.queryStoresParentList(parentQuery);
      parentList.value = res.data.list;
      parentTotal.value = res.data.total;
      isLoading.value = false;
    } catch (error) {
      console.error(error);
      isLoading.value = false;
    }
  };
  // 选择学生
  const handleSelectStudent = (row: any) => {
    bindForm.stuCode = row.stuCode;
    studentSelectVisible.value = false;
  };

  // 提交绑定
  const handleBindSubmit = async () => {
    try {
      await ParentService.bindingStudent(bindForm);
      ElMessage.success("绑定成功");
      bindDialogVisible.value = false;
      // 刷新列表
      getParentList();
    } catch (error) {
      console.error(error);
      ElMessage.error("绑定失败");
    }
  };

  // 查看家长详情
  const showDetail = async (row: any) => {
    try {
      detailDrawerVisible.value = true;
      detailLoading.value = true;
      const res = await ParentService.getParentDetail(row.parCode);
      parentDetail.value = res.data;
      detailLoading.value = false;
    } catch (error) {
      console.error(error);
      detailLoading.value = false;
    }
  };

  // 关闭家长详情抽屉
  const handleClose = () => {
    detailDrawerVisible.value = false;
  };

  onMounted(() => {
    getParentList();
  });
</script>

<style lang="scss" scoped></style>
