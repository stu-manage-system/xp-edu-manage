<template>
  <div class="page-content">
    <el-row>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.roleName"
          placeholder="请输入角色名称"
          clearable
        ></el-input>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="search">搜索</el-button>
        <el-button type="success" @click="showDialog('add', {})"
          >新增角色</el-button
        >
      </el-col>
    </el-row>

    <art-table
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :loading="isLoading"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #default>
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色类型" prop="roleType" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column
          fixed="right"
          label="操作"
          width="250"
          #default="scope"
        >
          <el-button
            link
            :icon="View"
            type="success"
            @click="showPermissionDialog(scope.row)"
          >
            详情
          </el-button>
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
            :icon="Delete"
            style="color: #fa6962"
            @click="deleteRole(scope.row)"
          >
            删除
          </el-button>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="30%"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色类型" prop="roleType">
          <el-select v-model="form.roleType" placeholder="请选择角色类型">
            <el-option
              v-for="item in roleConfig"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-select v-model="form.menuType" placeholder="请选择菜单类型">
            <el-option
              v-for="item in menuConfig"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="配置菜单角色"
          v-if="form.menuType === 'CUSTOM' || form.menuType === '自定义菜单'"
          prop="menuIds"
        >
          <el-tree-select
            ref="treeRef"
            v-model="form.menuIds"
            :data="roleTreeData"
            :render-after-expand="false"
            show-checkbox
            multiple
            placeholder="请配置菜单角色"
            clearable
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialog" title="角色详情">
      <el-skeleton :loading="loading" animated :rows="6">
        <template #default>
          <div class="permission-detail">
            <el-descriptions :column="2" border label-width="160">
              <el-descriptions-item
                label="角色名称"
                label-class-name="my-label"
              >
                {{ form.roleName }}
              </el-descriptions-item>
              <el-descriptions-item
                label="角色类型"
                label-class-name="my-label"
              >
                {{ form.roleType }}
              </el-descriptions-item>
              <el-descriptions-item
                label="数据类型"
                label-class-name="my-label"
              >
                {{ form.menuType }}
              </el-descriptions-item>
              <el-descriptions-item label="备注" label-class-name="my-label">
                {{ form.remark }}
              </el-descriptions-item>
              <el-descriptions-item
                label="菜单权限"
                label-class-name="my-label"
              >
                <el-tree
                  ref="treeIdRef"
                  :data="roleTreeData"
                  :default-checked-keys="form.menuIds"
                  :default-expand-all="true"
                  node-key="value"
                  show-checkbox
                  :props="{
                    children: 'children',
                    label: 'label',
                    disabled: 'disabled'
                  }"
                />
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-skeleton>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ApiService } from "@/api/apiApi";
import { menuService } from "@/api/menuApi";
import { UserService } from "@/api/usersApi";
import { useMenuStore } from "@/store/modules/menu";
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { nextTick, ref } from "vue";

const dialogVisible = ref(false);
const permissionDialog = ref(false);
const menuList = computed(() => useMenuStore().getMenuList);
const searchForm = reactive({
  roleName: ""
});

const form = ref({
  roleId: "",
  roleName: "",
  roleType: "",
  menuType: "",
  menuIds: [],
  remark: ""
  // status: true
});

const dialogType = ref("add");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(true);
const loading = ref(true);
const tableData = ref([]);
const treeRef = ref();
const treeIdRef = ref();
// 列表接口
const getRoleList = async (pageNum = 1, pageSize = 10) => {
  isLoading.value = true;
  const data = {
    pageNum,
    pageSize,
    ...searchForm
  };
  const res = await UserService.queryRoleList(data);
  if (res.code === 0) {
    isLoading.value = false;
    tableData.value = res.data.list;
    total.value = res.data.total;
  }
};

const search = () => {
  currentPage.value = 1;
  getRoleList(1, pageSize.value);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  getRoleList(page, pageSize.value);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  getRoleList(currentPage.value, size);
};
// 添加转换函数
const convertLabelToValue = (label: string, options: any[]) => {
  return options.find((item) => item.label === label)?.value;
};

const initForm = () => {
  form.value = {
    roleId: "",
    roleName: "",
    roleType: "",
    menuType: "",
    menuIds: [],
    remark: ""
  };
};
// 获取详情接口
const getRoleDetail = async (roleId: string) => {
  const res = await UserService.getRoleDetail(roleId);
  if (res.code === 0) {
    const formData = res.data;
    if (dialogType.value === "edit") {
      formData.roleType = convertLabelToValue(
        res.data.roleType,
        roleConfig.value
      );
      formData.menuType = convertLabelToValue(
        res.data.menuType,
        menuConfig.value
      );
    }
    form.value = formData;
    // 先清空之前的选中状态
    if (treeIdRef.value) {
      treeIdRef.value.setCheckedKeys([]);
    }
    treeIdRef.value?.setCheckedKeys(form.value.menuIds || []);
  }
};
const addDisabled = (data: any) => {
  data.forEach((item: any) => {
    item.disabled = true;
    if (item.children && item.children.length > 0) {
      addDisabled(item.children);
    }
  });
};
// 显示详情
const showPermissionDialog = async (row: { roleId: string }) => {
  loading.value = true;
  permissionDialog.value = true;
  dialogType.value = "";
  await getRoleDetail(row.roleId);
  addDisabled(roleTreeData.value);
  loading.value = false;
};
const showDialog = (type: string, row: any) => {
  getRoleTreeData();
  dialogVisible.value = true;
  dialogType.value = type;
  nextTick(() => {
    if (type === "edit") {
      getRoleDetail(row.roleId);
    } else {
      initForm();
    }
    formRef.value?.resetFields();
  });
};

const deleteRole = async (row: any) => {
  try {
    ElMessageBox.confirm("确定删除该角色吗？", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(async () => {
      try {
        const res = await UserService.deleteStoreRole(row.roleId);
        if (res.code === 0) {
          ElMessage.success("删除成功");
          getRoleList();
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    });
  } catch (err) {
    console.log("删除取消", err);
  }
};

// 角色树形数据
const roleTreeData = ref([]);
const transformData = (data: any) => {
  return data.map((item: any) => ({
    label: item.title,
    value: item.id,
    children:
      item.children && item.children.length > 0
        ? transformData(item.children)
        : []
  }));
};
const getRoleTreeData = async () => {
  const res = await menuService.getMenuList();
  roleTreeData.value = transformData(res.menuList);
  console.log("roleTreeData.value", roleTreeData.value);
};

// 添加表单校验规则
const rules = {
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  roleType: [{ required: true, message: "请选择角色类型", trigger: "blur" }],
  menuType: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  menuIds: [{ required: true, message: "请选择菜单角色", trigger: "blur" }]
};

// 获取表单ref
const formRef = ref();
// 修改提交按钮处理
const handleSubmit = async () => {
  let checked: any = [];
  if (treeRef.value) {
    checked = treeRef.value!.getCheckedNodes(false, true);
  }
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // TODO: 调用提交接口
      const params = {
        ...form.value,
        menuIds: checked.map((item: any) => item.value)
      };
      const res =
        dialogType.value === "add"
          ? await UserService.addRole(params)
          : await UserService.updateRole({
              ...params
            });
      if (res.code === 0) {
        ElMessage.success(dialogType.value === "add" ? "添加成功" : "编辑成功");
        dialogVisible.value = false;
        getRoleList();
      }
    }
  });
};

// 添加类型定义
interface ConfigItem {
  label: string;
  value: string;
}

// 修改ref定义
const menuConfig = ref<ConfigItem[]>([]);
const roleConfig = ref<ConfigItem[]>([]);
const getDictConfig = async () => {
  const res = await ApiService.getDictConfig("roleMenuTypeEnum");
  const data = await ApiService.getDictConfig("userRoleEnum");
  menuConfig.value = res.data;
  roleConfig.value = data.data;
};

onMounted(() => {
  getRoleList();
  getRoleTreeData();
  getDictConfig();
});
</script>

<style lang="scss" scoped>
.page-content {
  .svg-icon {
    width: 1.8em;
    height: 1.8em;
    overflow: hidden;
    vertical-align: -8px;
    fill: currentcolor;
  }
}

.permission-detail {
  padding: 0 10px;
}

/* 树容器样式优化 */
.tree-container {
  margin: 8px 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

/* Descriptions 组件样式优化 */
:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: bold;
}

:deep(.el-descriptions__content) {
  padding: 12px 16px;
}

/* 骨架屏样式 */
:deep(.el-skeleton) {
  padding: 20px;
}

:deep(.my-label) {
  font-weight: 700 !important;
}
</style>
