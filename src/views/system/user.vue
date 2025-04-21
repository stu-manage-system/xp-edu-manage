<template>
  <div class="page-content">
    <el-row>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.keyWord"
          placeholder="请输入用户名称"
          clearable
        ></el-input>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="search">搜索</el-button>
        <el-button type="success" @click="showDialog('add', {})"
          >新增</el-button
        >
      </el-col>
    </el-row>

    <art-table
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <template #default>
        <el-table-column label="用户名" prop="userName" show-overflow-tooltip />
        <el-table-column
          label="英文名称"
          prop="teacherEnName"
          show-overflow-tooltip
        />
        <el-table-column label="角色" prop="roleName" show-overflow-tooltip />
        <el-table-column
          label="用户电话"
          prop="userTel"
          show-overflow-tooltip
        />
        <el-table-column label="邮箱" prop="userMail" show-overflow-tooltip />
        <el-table-column label="备注" prop="remark" show-overflow-tooltip />
        <el-table-column
          fixed="right"
          label="操作"
          width="250px"
          #default="scope"
        >
          <div style="display: flex; justify-content: center">
            <el-button
              link
              :icon="EditPen"
              type="primary"
              @click="showDialog('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              :icon="RefreshRight"
              style="color: #67c23a"
              @click="resetPassword(scope.row)"
            >
              重置密码
            </el-button>
            <el-button
              link
              :icon="Delete"
              style="color: #fa6962"
              @click="deleteUser(scope.row)"
            >
              删除
            </el-button>
          </div>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="40%"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="user-form"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="用户电话" prop="userTel">
          <el-input v-model="formData.userTel" placeholder="请输入用户电话" />
        </el-form-item>
        <el-form-item
          label="用户密码"
          prop="password"
          v-if="dialogType === 'add'"
        >
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入用户密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="formData.roleId" placeholder="请选择角色">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.roleName"
              :value="role.roleId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教师英文名">
          <el-input
            v-model="formData.teacherEnName"
            placeholder="请输入教师英文名"
          />
        </el-form-item>
        <el-form-item label="用户邮箱">
          <el-input v-model="formData.userMail" placeholder="请输入用户邮箱" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="40%">
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePasswordDialog">取消</el-button>
          <el-button type="primary" @click="submitPasswordForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { UserService } from "@/api/usersApi";
import { Delete, EditPen, RefreshRight } from "@element-plus/icons-vue";
import CryptoJS from "crypto-js";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();
const dialogType = ref("add");
const dialogVisible = ref(false);
// 新增用户
const formData = ref({
  userName: "",
  teacherEnName: "",
  userTel: "",
  password: "",
  userMail: "",
  roleId: "",
  remark: ""
});

const searchFormRef = ref<FormInstance>();
const searchForm = reactive({
  keyWord: ""
});
const rules = reactive<FormRules>({
  userName: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  userTel: [{ required: true, message: "用户电话不能为空", trigger: "blur" }],
  password: [{ required: true, message: "用户密码不能为空", trigger: "blur" }],
  roleId: [{ required: true, message: "角色不能为空", trigger: "change" }]
});
// 获取用户详情
const getUserDetail = async (userCode: string) => {
  const res = await UserService.getUserDetail(userCode);
  return res.data;
};

const showDialog = async (type: string, row?: any) => {
  if (type === "password") {
    passwordDialogVisible.value = true;
    passwordForm.value.userId = row.userCode;
    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields();
    }
    return;
  }
  dialogVisible.value = true;
  dialogType.value = type;
  if (formRef.value) {
    formRef.value.clearValidate(); // 清除表单校验信息
  }
  // 编辑时回显数据
  if (type === "edit" && row) {
    const res = await getUserDetail(row.userCode);
    formData.value = {
      ...res
    };
  } else {
    // 新增时重置表单
    formData.value = {
      userName: "",
      teacherEnName: "",
      userTel: "",
      password: "",
      userMail: "",
      roleId: "",
      remark: ""
    };
  }
};
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

// 添加表单ref
const formRef = ref<FormInstance>();

// 修改 submitForm 方法
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        // 如果是添加操作，需要对密码进行md5加密
        if (dialogType.value === "add") {
          formData.value.password = CryptoJS.MD5(
            formData.value.password
          ).toString();
        }
        const res =
          dialogType.value === "add"
            ? await UserService.addUser(formData.value)
            : await UserService.editUser(formData.value);
        if (res.code === 0) {
          ElMessage.success(
            dialogType.value === "add" ? "添加成功" : "编辑成功"
          );
          dialogVisible.value = false;
          getUserList();
        }
      } catch (error) {
        ElMessage.error("添加失败");
      }
    } else {
      console.log("表单验证失败", fields);
    }
  });
};
const closeDialog = () => {
  dialogVisible.value = false;
  if (formRef.value) {
    formRef.value.resetFields(); // 重置表单
  }
};
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(true);
const tableData = ref([]);
// 列表接口
const getUserList = async (pageNum = 1, pageSize = 10) => {
  isLoading.value = true;
  const data = {
    pageNum,
    pageSize,
    ...searchForm
  };
  const res = await UserService.queryStoreUserList(data);
  if (res.code === 0) {
    isLoading.value = false;
    tableData.value = res.data.list;
    total.value = res.data.total;
  }
};

const search = () => {
  currentPage.value = 1;
  getUserList(1, pageSize.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  getUserList(page, pageSize.value);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getUserList(currentPage.value, size);
};

const deleteUser = (row: any) => {
  ElMessageBox.confirm("确定要删除该用户吗？", "删除用户", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error"
  }).then(async () => {
    try {
      const res = await UserService.deleteUser(row.userCode);
      if (res.code === 0) {
        ElMessage.success("删除成功");
        getUserList();
      }
    } catch (error) {
      ElMessage.error("删除失败");
    }
  });
};

const passwordDialogVisible = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  userId: ""
});

const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: "请输入原密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
  ]
});

const closePasswordDialog = () => {
  passwordDialogVisible.value = false;
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields();
  }
};
// 重置密码
const resetPassword = (row: any) => {
  ElMessageBox.confirm("确定要重置该用户密码为（123456）吗？", "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        const res = await UserService.resetUserPassword({
          userCode: row.userCode
        });
        if (res.code === 0) {
          ElMessage.success("密码重置成功");
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    })
    .catch(() => {
      ElMessage.info("已取消重置");
    });
};
const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        const res = await UserService.editStoreUserPassword(passwordForm.value);
        if (res.code === 0) {
          ElMessage.success("密码修改成功");
          passwordDialogVisible.value = false;
        }
      } catch (error) {
        ElMessage.error("修改失败");
      }
    } else {
      console.log("表单验证失败", fields);
    }
  });
};

// 角色选项数据
const roleList = ref([]);

// 获取角色列表
const getRoleList = async () => {
  try {
    const res = await UserService.queryRoleList({
      pageNum: 1,
      pageSize: 999 // 获取所有角色数据
    });
    if (res.code === 0) {
      res.data.list.map((item: any) => {
        item.roleId = item.roleId;
        item.roleName = item.roleName + "(" + item.roleType + ")";
      });
      roleList.value = res.data.list;
    }
  } catch (error) {
    ElMessage.error("获取角色列表失败");
  }
};

onMounted(() => {
  getUserList();
  getRoleList(); // 添加获取角色列表
});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;

  .user {
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }

    > div {
      margin-left: 10px;

      .user-name {
        font-weight: 500;
        color: var(--art-text-gray-800);
      }
    }
  }
}

.user-form {
  max-width: 600px;
  margin: 20px auto;
}
</style>
