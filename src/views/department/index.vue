<template>
  <div class="page-content">
    <el-row :gutter="15" style="margin-bottom: 20px">
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button type="success" @click="handleAddDepartment"
          >新增部门</el-button
        >
      </el-col>
    </el-row>
    <div>
      <el-table
        ref="tableRef"
        :data="departmentList"
        style="width: 100%"
        row-key="deptCode"
        lazy
        :load="load"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="isLoading"
      >
        <!-- <el-table-column label="序号" type="index" width="80" /> -->
        <el-table-column label="部门/职位" prop="deptName" />
        <el-table-column label="操作人" prop="updateName" />
        <el-table-column label="创建时间" prop="ctime" />
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; align-items: center">
              <el-button
                link
                :icon="EditPen"
                type="primary"
                @click="handleEdit(row)"
                >编辑</el-button
              >
              <el-button
                link
                :icon="Delete"
                style="color: #fa6962"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
              <el-button
                v-if="!row.posCode"
                link
                :icon="Plus"
                style="color: #67c23a"
                @click="handleAddPosition(row)"
              >
                添加职位
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑部门对话框 -->
    <el-dialog
      :title="dialogType === 'addDept' ? '新增部门' : '编辑部门'"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="formData"
        label-width="100px"
        ref="formRef"
        :rules="rules"
      >
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="formData.deptName"
            placeholder="请输入部门名称"
          ></el-input>
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
          <el-button type="primary" @click="handleSubmit" :loading="loading"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑职位对话框 -->
    <el-dialog
      :title="dialogType === 'addPos' ? '新增职位' : '编辑职位'"
      v-model="positionDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="positionFormData"
        label-width="100px"
        ref="positionFormRef"
        :rules="rules"
      >
        <el-form-item
          label="所属部门"
          prop="deptCode"
          v-if="dialogType === 'addPos'"
        >
          <el-select
            v-model="positionFormData.deptCode"
            placeholder="请选择部门"
            disabled
          >
            <el-option
              v-for="item in departmentList"
              :key="item.deptCode"
              :label="item.deptName"
              :value="item.deptCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位名称" prop="posName">
          <el-input
            v-model="positionFormData.posName"
            placeholder="请输入职位名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            v-model="positionFormData.remark"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="positionDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handlePositionSubmit"
            :loading="loading"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, EditPen, Plus } from "@element-plus/icons-vue";
import { DepartService } from "@/api/depart";
import { log } from "console";

// 定义部门和职位的类型
interface Department {
  deptCode: string;
  deptName: string;
  remark?: string;
  updateName?: string;
  ctime?: string;
  children?: Array<Department | Position>;
  hasChildren?: boolean;
  parentId?: string; // 标识是否为职位
  posCode?: string;
}

interface Position {
  deptCode: string;
  posCode: string;
  posName: string;
  updateName?: string;
  createTime?: string;
  ctime?: string;
  remark?: string;
  parentId?: string; // 标识属于哪个部门
}

// 查询参数
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ""
});

// 表格数据
const departmentList = ref<Department[]>([]);
const total = ref(0);
const isLoading = ref(false);
const loading = ref(false);
const tableRef = ref<any>(null);

// 对话框控制
const dialogVisible = ref(false);
const positionDialogVisible = ref(false);
const dialogType = ref<"addDept" | "editDept" | "addPos" | "editPos">(
  "addDept"
);

// 表单数据
const formRef = ref();
const formData = reactive<Partial<Department>>({
  deptName: "",
  remark: ""
});

// 职位表单数据
const positionFormRef = ref();
const positionFormData = reactive<Partial<Position>>({
  posCode: "",
  deptCode: "",
  posName: "",
  remark: "",
  createTime: ""
});

const rules = ref({
  deptName: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
  posName: [{ required: true, message: "请输入职位名称", trigger: "blur" }]
});
const loadMap = new Map();

// 获取职位列表
const getPositionList = (deptCode: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 添加时间戳参数，避免浏览器缓存
      const timestamp = new Date().getTime();
      let res = await DepartService.getPositionList({
        deptCode,
        _t: timestamp // 添加时间戳参数
      });
      if (res.code === 0) {
        resolve(res.data);
      } else {
        reject(res.message);
      }
    } catch (error) {
      reject(error);
    }
  });
};

// 获取部门列表
const getDepartmentList = async () => {
  isLoading.value = true;
  let params = {
    pageNum: query.pageNum,
    pageSize: query.pageSize
  };
  try {
    const res = await DepartService.getDepartList(params);
    if (res.code === 0) {
      departmentList.value = res.data.list.map((item: any) => ({
        ...item,
        hasChildren: true // 默认所有部门都可能有职位，点击时再检查
      }));
      total.value = res.data.total;
    } else {
      ElMessage.error(res.message || "获取部门列表失败");
    }
  } catch (error) {
    console.error("获取部门列表失败:", error);
  } finally {
    isLoading.value = false;
  }
};
const loadId = ref({});
// 加载职位数据的函数，确保每次都获取最新数据
const load = (row: any, _treeNode: any, resolve: (data: any[]) => void) => {
  loadId.value = row;
  loadMap.set(row.deptCode, { row, treeNode: _treeNode, resolve });
  getPositionList(row.deptCode)
    .then((res: any) => {
      if (Array.isArray(res) && res.length > 0) {
        const positions = res.map((item) => {
          const { posCode, posName, remark, ctime, updaterName } = item;
          return {
            deptCode: posCode, // 保持部门编码
            posCode, // 职位编码作为唯一标识
            posName,
            deptName: posName,
            remark,
            ctime: ctime,
            updateName: updaterName,
            parentId: row.deptCode
          };
        });
        console.log("加载到的职位数据:", positions);
        resolve(positions);
      } else {
        // 标记该部门没有子节点
        row.hasChildren = false;
        console.log("该部门没有职位数据");
        resolve([]);
      }
    })
    .catch((error) => {
      console.error("获取职位列表失败", error);
      resolve([]);
    });
};
const reload = (id: string) => {
  if (loadMap.get(id)) {
    const { row, treeNode, resolve } = loadMap.get(id);
    load(row, treeNode, resolve);
  } else {
    getPositionList(id).then((res: any) => {
      loadMap.set(id, res);
    });
  }
};
// 分页处理
const handlePageChange = (page: number) => {
  query.pageNum = page;
  getDepartmentList();
};

const handleSizeChange = (size: number) => {
  query.pageSize = size;
  getDepartmentList();
};

// 新增部门
const handleAddDepartment = () => {
  dialogType.value = "addDept";
  dialogVisible.value = true;
  resetForm();
};

// 编辑部门或职位
const handleEdit = (row: Department | Position) => {
  console.log("row", row);
  loadId.value = row;
  if ("parentId" in row) {
    // 编辑职位
    dialogType.value = "editPos";
    positionDialogVisible.value = true;
    Object.assign(positionFormData, row);
  } else {
    // 编辑部门
    dialogType.value = "editDept";
    dialogVisible.value = true;
    Object.assign(formData, row);
  }
};

// 添加职位
const handleAddPosition = (row: Department) => {
  dialogType.value = "addPos";
  positionDialogVisible.value = true;
  resetPositionForm();
  positionFormData.deptCode = row.deptCode || "";
};

// 删除部门或职位
const handleDelete = async (row: Department | Position) => {
  ElMessageBox.confirm("确定删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      loading.value = true;
      let res = await DepartService.deleteDepart(
        "parentId" in row ? row.posCode : row.deptCode
      );
      if (res.code === 0) {
        ElMessage.success(`删除${"parentId" in row ? "职位" : "部门"}成功`);
        getDepartmentList();
      } else {
        ElMessage.error(`删除${"parentId" in row ? "职位" : "部门"}失败`);
      }
    } catch (error) {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    } finally {
      loading.value = false;
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {
    deptCode: "",
    deptName: "",
    remark: ""
  });
};

// 重置职位表单
const resetPositionForm = () => {
  if (positionFormRef.value) {
    positionFormRef.value.resetFields();
  }
  Object.assign(positionFormData, {
    posName: "",
    deptCode: "",
    remark: ""
  });
};

// 提交部门表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;

    if (dialogType.value === "addDept") {
      let res = await DepartService.addDepart(formData);
      if (res.code === 0) {
        ElMessage.success("新增部门成功");
      } else {
        ElMessage.error("新增部门失败");
        return;
      }
    } else {
      let res = await DepartService.editDepart(formData);
      if (res.code === 0) {
        ElMessage.success("编辑部门成功");
      } else {
        ElMessage.error("编辑部门失败");
        return;
      }
    }
    // 关闭对话框
    dialogVisible.value = false;
    getDepartmentList();
  } catch (error) {
    console.error("提交部门表单失败:", error);
  } finally {
    loading.value = false;
  }
};

// 提交职位表单
const handlePositionSubmit = async () => {
  try {
    await positionFormRef.value.validate();
    loading.value = true;

    if (dialogType.value === "addPos") {
      let res = await DepartService.addPosition(positionFormData);
      if (res.code === 0) {
        ElMessage.success("新增职位成功");
      } else {
        ElMessage.error("新增职位失败");
        return;
      }
    } else {
      let res = await DepartService.editPosition(positionFormData);
      if (res.code === 0) {
        ElMessage.success("编辑职位成功");
      } else {
        ElMessage.error("编辑职位失败");
        return;
      }
    }
    // 关闭对话框
    await getDepartmentList();
    positionDialogVisible.value = false;
    nextTick(() => {
      reload(loadId.value.parentId);
    });
    // window.location.reload();
  } catch (error) {
    console.error("提交职位表单失败:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getDepartmentList();
});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;
}

.el-select {
  width: 100%;
}

:deep(.el-table) {
  thead th:first-of-type,
  td:first-of-type {
    padding-left: 10px;
  }

  thead th:last-of-type,
  td:last-of-type {
    padding-right: 10px;
  }

  tr {
    height: 65px !important;
  }
}
</style>
