<template>
  <div class="page-content">
    <table-bar :showTop="false" @search="search" @reset="resetForm(searchFormRef)" @changeColumn="changeColumn"
      :columns="columns">
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input label="姓名" prop="name" v-model="searchForm.userName" />
            <form-input label="手机号" prop="phone" v-model="searchForm.userTel" />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button type="primary" @click="showDialog('add', {})">添加用户</el-button>
      </template>
    </table-bar>

    <art-table :data="tableData" :total="total" :current-page="currentPage" :page-size="pageSize"
      @page-change="handlePageChange" @size-change="handleSizeChange" :loading="isLoading">
      <template #default>
        <el-table-column label="公司名称" prop="storeName" v-if="columns[0].show" width="100px" show-overflow-tooltip />
        <el-table-column label="登录账号" prop="account" v-if="columns[1].show" show-overflow-tooltip width="100px" />
        <el-table-column label="姓名" prop="userName" v-if="columns[2].show" show-overflow-tooltip />
        <el-table-column label="角色名称" prop="roleName" v-if="columns[3].show" show-overflow-tooltip width="100px" />
        <el-table-column label="手机号" prop="userTel" v-if="columns[4].show" width="150px" show-overflow-tooltip />
        <el-table-column label="邮箱" prop="userMail" v-if="columns[5].show" show-overflow-tooltip />
        <el-table-column label="微信" prop="userWx" v-if="columns[6].show" show-overflow-tooltip />
        <el-table-column label="账户级别" prop="accountLevel" #default="scope" v-if="columns[7].show" show-overflow-tooltip
          width="100px">
          {{ scope.row.accountLevel === "STORE_ADMIN" ? "管理员" : "普通员工" }}
        </el-table-column>
        <el-table-column label="账号状态" prop="status" #default="scope" v-if="columns[8].show" width="100px">
          <el-tag :type="scope.row.status == '0' ? 'primary' : 'info'">
            {{ scope.row.status == "0" ? "启用" : "禁用" }}
          </el-tag>
        </el-table-column>

        <el-table-column label="创建日期" prop="createTime" v-if="columns[9].show" width="130px" show-overflow-tooltip>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150px" #default="scope">
          <div style="display: flex; justify-content: center; gap: 8px">
            <el-button link :icon="View" type="primary" @click="
              router.push({
                path: ''
              })
              ">
              详情
            </el-button>
            <el-dropdown>
              <el-button link :icon="More" style="color: #153870">
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <el-button link :icon="EditPen" type="primary" @click="showDialog('edit', scope.row)">
                      编辑
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button link :icon="RefreshRight" style="color: #67c23a" @click="resetPassword(scope.row)">
                      重置密码
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button link :icon="Delete" style="color: #fa6962" @click="deleteUser">
                      注销
                    </el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加用户' : '编辑用户'" width="40%">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="登录账号" prop="account">
          <el-input v-model="formData.account" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="formData.password" type="password" placeholder="请输入登录密码" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="userTel">
          <el-input v-model="formData.userTel" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="用户微信">
          <el-input v-model="formData.userWx" placeholder="请输入微信号" />
        </el-form-item>
        <el-form-item label="用户邮箱">
          <el-input v-model="formData.userMail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="用户角色" prop="roleId">
          <el-select v-model="formData.roleId" filterable placeholder="请选择用户角色" clearable>
            <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" />
          </el-select>
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
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
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
import {
  EditPen,
  Delete,
  Key,
  More,
  View,
  RefreshRight
} from "@element-plus/icons-vue"
import type { FormInstance, FormRules } from "element-plus"
import { ElMessageBox, ElMessage } from "element-plus"
import { UserService } from "@/api/usersApi"
import { formatDate } from "@/utils/utils"
import { useRouter } from "vue-router"

const router = useRouter()
const dialogType = ref("add")
const dialogVisible = ref(false)
// 新增用户
const formData = ref({
  account: "",
  password: "",
  userName: "",
  userTel: "",
  userMail: "",
  userWx: "",
  roleId: ""
})

const columns = reactive([
  { name: "公司名称", show: true },
  { name: "登录账号", show: true },
  { name: "姓名", show: true },
  { name: "角色名称", show: true },
  { name: "手机号", show: true },
  { name: "邮箱", show: true },
  { name: "微信", show: true },
  { name: "账户级别", show: true },
  { name: "账号状态", show: true },
  { name: "创建时间", show: true }
])

const searchFormRef = ref<FormInstance>()
const searchForm = reactive({
  userTel: "",
  userName: ""
})
const rules = reactive<FormRules>({
  account: [
    { required: true, message: "请输入登录账号", trigger: "blur" },
    { min: 5, max: 15, message: "账号长度应在5到15个字符之间", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入登录密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
  ],
  userName: [{ required: true, message: "请输入用户名称", trigger: "blur" }],
  userTel: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号", trigger: "blur" }
  ],
  roleId: [
    {
      required: true,
      message: "请选择用户角色",
      trigger: "[change,blur]"
    }
  ]
})

const showDialog = (type: string, row?: any) => {
  if (type === "password") {
    passwordDialogVisible.value = true
    passwordForm.value.userId = row.id
    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields()
    }
    return
  }
  dialogVisible.value = true
  dialogType.value = type
  if (formRef.value) {
    formRef.value.clearValidate() // 清除表单校验信息
  }
  // 编辑时回显数据
  if (type === "edit" && row) {
    formData.value = {
      ...row
    }
  } else {
    // 新增时重置表单
    formData.value = {
      account: "",
      password: "",
      userName: "",
      userTel: "",
      userWx: "",
      userMail: "",
      roleId: ""
    }
  }
}
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

// 添加表单ref
const formRef = ref<FormInstance>()

// 修改 submitForm 方法
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        const res =
          dialogType.value === "add"
            ? await UserService.addStoreUser(formData.value)
            : await UserService.editStoreUser(formData.value)
        if (res.code === 0) {
          ElMessage.success(
            dialogType.value === "add" ? "添加成功" : "编辑成功"
          )
          dialogVisible.value = false
          getUserList()
        }
      } catch (error) {
        ElMessage.error("添加失败")
      }
    } else {
      console.log("表单验证失败", fields)
    }
  })
}
const closeDialog = () => {
  dialogVisible.value = false
  if (formRef.value) {
    formRef.value.resetFields() // 重置表单
  }
}
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(true)
const tableData = ref([])
// 列表接口
const getUserList = async (pageNo = 1, pageSize = 10) => {
  isLoading.value = true
  const data = {
    pageNo,
    pageSize,
    ...searchForm
  }
  const res = await UserService.queryStoreUserList(data)
  if (res.code === 0) {
    isLoading.value = false
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const search = () => {
  currentPage.value = 1
  getUserList(1, pageSize.value)
}

const changeColumn = (list: any) => {
  columns.values = list
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  getUserList(page, pageSize.value)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  getUserList(currentPage.value, size)
}

const deleteUser = () => {
  ElMessageBox.confirm("确定要注销该用户吗？", "注销用户", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error"
  }).then(() => {
    ElMessage.success("注销成功")
  })
}
// 重置密码
const resetPassword = (row: any) => {
  ElMessageBox.confirm("确定要重置该用户的密码吗？", "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        const res = await UserService.resetStoreUserPassword({
          account: row.account
        })
        if (res.code === 0) {
          ElMessage.success("密码重置成功")
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试")
      }
    })
    .catch(() => {
      ElMessage.info("已取消重置")
    })
}

const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  userId: ""
})

const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: "请输入原密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
  ]
})

const closePasswordDialog = () => {
  passwordDialogVisible.value = false
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        const res = await UserService.editStoreUserPassword(passwordForm.value)
        if (res.code === 0) {
          ElMessage.success("密码修改成功")
          passwordDialogVisible.value = false
        }
      } catch (error) {
        ElMessage.error("修改失败")
      }
    } else {
      console.log("表单验证失败", fields)
    }
  })
}

// 角色选项数据
const roleOptions = ref([])

// 获取角色列表
const getRoleList = async () => {
  try {
    const res = await UserService.queryStoreRoleList({
      pageNo: 1,
      pageSize: 999 // 获取所有角色数据
    })
    if (res.code === 0) {
      roleOptions.value = res.data.list
    }
  } catch (error) {
    ElMessage.error("获取角色列表失败")
  }
}

onMounted(() => {
  getUserList()
  getRoleList() // 添加获取角色列表
})
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

    >div {
      margin-left: 10px;

      .user-name {
        font-weight: 500;
        color: var(--art-text-gray-800);
      }
    }
  }
}
</style>
