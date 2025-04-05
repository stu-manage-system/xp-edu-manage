<template>
  <div class="page-content">
    <el-row :gutter="15">
      <el-col :xs="19" :sm="12" :lg="6">
        <el-input
          v-model="studentQuery.stuName"
          placeholder="请输入学生姓名搜索"
        ></el-input>
      </el-col>
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="studentList"
      :total="total"
      :current-page="studentQuery.pageNum"
      :page-size="studentQuery.pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <el-table-column label="学号" prop="stuCode" width="180px" />
      <el-table-column label="姓名" prop="stuName" width="180px" fixed="left" />
      <el-table-column
        label="英文名"
        prop="stuEnName"
        width="180px"
        fixed="left"
      />
      <el-table-column label="性别" prop="stuSex" width="180px">
        <template #default="{ row }">
          {{ row.stuSex === 1 ? "男" : "女" }}
        </template>
      </el-table-column>
      <el-table-column label="年龄" prop="stuAge" width="180px" />
      <el-table-column label="手机号" prop="stuTel" width="180px" />
      <el-table-column label="邮箱" prop="stuMail" width="180px" />
      <el-table-column label="house信息" prop="stuHouse" width="180px" />
      <el-table-column label="在读年级" prop="stuGrade" width="180px" />
      <el-table-column label="在读班级" prop="stuClass" width="180px" />
      <el-table-column label="操作时间" prop="ctime" width="180px" />
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
            信息
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

    <!-- Add student dialog -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="formData"
        label-width="100px"
        ref="formRef"
        style="height: 60vh; overflow-y: auto"
      >
        <el-form-item label="姓名" prop="stuName">
          <el-input
            v-model="formData.stuName"
            placeholder="请输入姓名"
          ></el-input>
        </el-form-item>
        <el-form-item label="英文名" prop="stuEnName">
          <el-input
            v-model="formData.stuEnName"
            placeholder="请输入英文名"
          ></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="stuSex">
          <el-select v-model="formData.stuSex" placeholder="请选择性别">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="stuAge">
          <el-input-number v-model="formData.stuAge" :min="1" />
        </el-form-item>
        <el-form-item label="手机号" prop="stuTel">
          <el-input v-model="formData.stuTel" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="stuMail">
          <el-input v-model="formData.stuMail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="house信息" prop="stuHouse">
          <el-input v-model="formData.stuHouse" placeholder="请输入house信息" />
        </el-form-item>
        <el-form-item label="在读年级" prop="stuGrade">
          <el-input v-model="formData.stuGrade" placeholder="请输入在读年级" />
        </el-form-item>
        <el-form-item label="在读班级" prop="stuClass">
          <el-input v-model="formData.stuClass" placeholder="请输入在读班级" />
        </el-form-item>
        <el-form-item label="班级类型" prop="classType">
          <el-select v-model="formData.classType" placeholder="请选择班级类型">
            <el-option label="班级制" value="CLASS_SYSTEM" />
            <el-option label="跑班制" value="RUNNING_SYSTEM" />
          </el-select>
        </el-form-item>
        <el-form-item label="教师编号" prop="teacherCode">
          <el-input
            :value="`${teacherSelectData.userCode ? teacherSelectData.userName + '（' + teacherSelectData.userCode + '）' : ''}`"
            placeholder="请选择教师"
            readonly
          >
            <template #append>
              <el-button @click="openTeacherSelectInForm">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            v-model="formData.remark"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 选择教师弹窗 -->
    <el-dialog
      title="选择教师"
      v-model="teacherSelectVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div style="display: flex; gap: 10px; margin-bottom: 15px">
        <el-input
          v-model="teacherQuery.keyWord"
          placeholder="请输入教师姓名"
          style="width: 200px"
        />
        <el-button type="primary" @click="handleSearchTeacher">搜索</el-button>
      </div>

      <el-table
        :data="teacherList"
        height="400"
        @row-click="handleSelectTeacher"
      >
        <el-table-column prop="userCode" label="教师编号" />
        <el-table-column prop="userName" label="姓名" />
        <el-table-column prop="teacherEnName" label="英文名" />
        <el-table-column prop="userTel" label="联系电话" />
        <el-table-column prop="userMail" label="邮箱" />
        <el-table-column prop="remark" label="备注" />
      </el-table>

      <el-pagination
        :current-page="teacherQuery.pageNum"
        :page-size="teacherQuery.pageSize"
        :total="teacherTotal"
        @current-change="getTeacherList"
        layout="total, prev, pager, next"
        style="margin-top: 15px"
      />
    </el-dialog>

    <!-- Student Detail Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="学生详细信息"
      size="60%"
      :destroy-on-close="true"
      @close="handleClose"
    >
      <el-descriptions :column="2" border v-loading="detailLoading">
        <el-descriptions-item label="学号">{{
          detailData.stuCode
        }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{
          detailData.stuName
        }}</el-descriptions-item>
        <el-descriptions-item label="英文名">{{
          detailData.stuEnName
        }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{
          detailData.stuSex
        }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{
          detailData.stuAge
        }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{
          detailData.stuTel
        }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{
          detailData.stuMail
        }}</el-descriptions-item>
        <el-descriptions-item label="House信息">{{
          detailData.stuHouse
        }}</el-descriptions-item>
        <el-descriptions-item label="在读年级">{{
          detailData.stuGrade
        }}</el-descriptions-item>
        <el-descriptions-item label="在读班级">{{
          detailData.stuClass
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          detailData.ctime
        }}</el-descriptions-item>
      </el-descriptions>

      <div class="parents-info" style="margin-top: 20px">
        <h3>家长信息</h3>
        <el-table :data="detailData?.parents || []" border style="width: 100%">
          <el-table-column prop="parName" label="姓名" />
          <el-table-column prop="parCode" label="编号" />
          <el-table-column prop="parTel" label="联系电话" />
          <el-table-column prop="parSex" label="性别">
            <template #default="{ row }">
              {{ row.parSex === 1 ? "男" : "女" }}
            </template>
          </el-table-column>
          <el-table-column prop="parIdentify" label="身份" />
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
  import { reactive, onMounted, ref } from "vue";
  import { StudentService } from "@/api/studentApi";
  import { UserService } from "@/api/usersApi";
  import { ElMessage } from "element-plus";

  const studentList = ref([]);
  const total = ref(0);
  const studentQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    stuName: "",
    stuEnName: "",
    stuClass: "",
    stuGrade: "",
  });
  const teacherList = ref([]);
  const teacherTotal = ref(0);
  const teacherQuery = reactive({
    pageNum: 1,
    pageSize: 10,
    keyWord: "",
  });
  const isLoading = ref(false);
  const dialogVisible = ref(false);
  const dialogTitle = ref("新增学生");
  const formRef = ref();
  const formData = reactive({
    stuName: "",
    stuEnName: "",
    stuTel: "",
    stuMail: "",
    stuSex: 1, //1：男，0：女
    stuAge: 0,
    stuClass: "", //学生班级
    stuGrade: "", //学生年级
    stuHouse: "",
    remark: "",
    classType: "CLASS_SYSTEM", // 新增：班级类型
    teacherCode: "", // 新增：教师编号
  });

  const drawerVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref({
    stuName: "",
    stuEnName: "",
    stuCode: "",
    stuTel: "",
    stuMail: "",
    stuSex: 1,
    stuAge: 1,
    stuClass: "",
    stuGrade: "",
    stuHouse: "",
    ctime: "",
    parents: [],
  });

  // 教师选择相关变量
  const teacherSelectVisible = ref(false);
  const teacherSelectData = ref({
    userCode: "",
    userName: "",
    teacherEnName: "",
    userTel: "",
    userMail: "",
    remark: "",
  });
  const getStudentList = async () => {
    isLoading.value = true;
    const res = await StudentService.queryStoresStudentList(studentQuery);
    studentList.value = res.data?.list || [];
    total.value = res.data?.total || 0;
    isLoading.value = false;
  };
  const handleSearch = () => {
    studentQuery.pageNum = 1;
    getStudentList();
  };
  const handlePageChange = (page: number) => {
    studentQuery.pageNum = page;
    getStudentList();
  };
  const handleSizeChange = (size: number) => {
    studentQuery.pageSize = size;
    getStudentList();
  };
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
    Object.assign(formData, {
      stuName: "",
      stuEnName: "",
      stuTel: "",
      stuMail: "",
      stuSex: 1,
      stuAge: 0,
      stuClass: "",
      stuGrade: "",
      stuHouse: "",
      remark: "",
      classType: "CLASS_SYSTEM",
      teacherCode: "",
    });
  };
  const handleAdd = () => {
    dialogTitle.value = "新增学生";
    dialogVisible.value = true;
    resetForm();
  };
  const handleEdit = (row: any) => {
    dialogTitle.value = "修改学生信息";
    dialogVisible.value = true;
    Object.assign(formData, row);
  };
  const handleArchive = async (row: any) => {
    try {
      drawerVisible.value = true;
      detailLoading.value = true;
      const res = await StudentService.getStudentDetail({
        stuCode: row.stuCode,
      }); // 假设这是获取详情的API
      if (res.code === 0) {
        detailData.value = res.data;
      }
      detailLoading.value = false;
    } catch (error) {
      console.error(error);
      ElMessage.error("获取学生详情失败");
      detailLoading.value = false;
    }
  };
  const handleClose = () => {
    drawerVisible.value = false;
    detailLoading.value = false;
  };
  const handleDelete = (row: any) => {
    StudentService.deleteStudent(row.stuCode).then((res) => {
      if (res.code === 0) {
        ElMessage.success("删除成功");
        getStudentList();
      }
    });
  };
  const handleSubmit = async () => {
    try {
      if (dialogTitle.value === "新增学生") {
        const res = await StudentService.addStudent(formData);
        if (res.code === 0) {
          ElMessage.success("添加成功");
          dialogVisible.value = false;
          getStudentList();
        }
      } else {
        const res = await StudentService.editStudent(formData);
        if (res.code === 0) {
          ElMessage.success("修改成功");
          dialogVisible.value = false;
          getStudentList();
        }
      }
    } catch (error) {
      console.error(error);
      ElMessage.error("操作失败");
    }
  };

  // 打开选择教师弹窗（在表单中）
  const openTeacherSelectInForm = async () => {
    teacherSelectVisible.value = true;
    await getTeacherList();
  };

  // 搜索教师
  const handleSearchTeacher = async () => {
    teacherQuery.pageNum = 1;
    await getTeacherList();
  };

  // 获取教师列表
  const getTeacherList = async () => {
    try {
      const res = await UserService.queryStoreUserList(teacherQuery);
      teacherList.value = res.data?.list || [];
      teacherTotal.value = res.data?.total || 0;
    } catch (error) {
      console.error(error);
      ElMessage.error("获取教师列表失败");
    }
  };

  // 选择教师
  const handleSelectTeacher = (row: any) => {
    formData.teacherCode = row.userCode;
    teacherSelectVisible.value = false;
    teacherSelectData.value = row;
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
