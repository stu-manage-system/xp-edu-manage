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
      <el-table-column label="在读班级" prop="stuClassCodeList" width="180px">
        <template #default="{ row }">
          {{
            `${row.gradeName || "--"}${row.className || "--"}(${DictEnum[row.classType] || "--"})`
          }}
        </template>
      </el-table-column>
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
        <el-form-item label="班级" prop="stuClassCodeList">
          <el-select
            v-model="formData.stuClassCodeList"
            multiple
            filterable
            :remote-method="remoteMethod"
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择班级"
          >
            <el-option
              v-for="item in gradeOptions"
              :key="item.code"
              :label="`${item.gradeName}${item.className}(${DictEnum[item.classType]})`"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="教师编号" prop="teacherCode">
          <el-input
            :value="`${teacherSelectData.userCode ? teacherSelectData.userName + '（' + teacherSelectData.userCode + '）' : ''}`"
            placeholder="请选择教师"
            readonly
          >
            <template #append>
              <el-button @click="openTeacherSelectInForm">选择</el-button>
            </template>
          </el-input>
        </el-form-item> -->
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
        <el-descriptions-item label="在读班级">{{
          detailData.gradeClassList
            .map((row) => {
              return `${row.gradeName || "--"}${row.className || "--"}(${DictEnum[row.classType] || "--"})`;
            })
            .join(",")
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
  import { GradeService } from "@/api/gradeApi";
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

  const isLoading = ref(false);
  const dialogVisible = ref(false);
  const dialogTitle = ref("新增学生");
  const formRef = ref();
  const formData = reactive({
    stuName: "",
    stuEnName: "",
    stuTel: "",
    stuMail: "",
    stuSex: 1,
    stuAge: 0,
    stuClassCodeList: [], //班级code
    stuHouse: "",
    remark: "",
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

  const gradeList = ref<
    {
      className: string;
      classType: "CLASS_SYSTEM" | "RUNNING_SYSTEM";
      code: string;
      ctime: string;
      deputyHeadCode: string;
      deputyHeadName: string;
      gradeName: string;
      headTeacherCode: string;
      headTeacherName: string;
      remark: string;
    }[]
  >([]);
  const gradeOptions = ref<
    {
      className: string;
      classType: string;
      code: string;
      ctime: string;
      deputyHeadCode: string;
      deputyHeadName: string;
      gradeName: string;
      headTeacherCode: string;
      headTeacherName: string;
      remark: string;
    }[]
  >([]);

  const DictEnum = { CLASS_SYSTEM: "班级制", RUNNING_SYSTEM: "跑班制" };

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
      stuClassCodeList: [], //班级code
      stuHouse: "",
      remark: "",
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
      const filterCLASS_SYSTEM = gradeList.value.filter((grade) => {
        return grade.classType === "CLASS_SYSTEM";
      });
      const filterFormdataCLASS_SYSTEM = filterCLASS_SYSTEM.filter((item) => {
        return formData.stuClassCodeList.includes(item.code);
      });
      if (filterFormdataCLASS_SYSTEM.length > 1) {
        ElMessage.error("最多只能选择一个班级制的班级");
        return;
      }
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

  const queryGradeList = () => {
    GradeService.getGradeList({ pageNum: 1, pageSize: 10000 }).then((res) => {
      gradeList.value = res.data.list;
      gradeOptions.value = res.data.list;
    });
  };

  const remoteMethod = (query: string) => {
    if (query) {
      setTimeout(() => {
        gradeOptions.value = gradeList.value.filter((item: any) => {
          return item.gradeName.toLowerCase().includes(query.toLowerCase());
        });
      }, 200);
    } else {
      gradeOptions.value = gradeList.value;
    }
  };

  onMounted(() => {
    getStudentList();
    queryGradeList();
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
