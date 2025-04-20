<template>
  <div class="page-content">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.roomName"
          placeholder="请输入教室名称"
          clearable
        ></el-input>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-select
          v-model="searchForm.roomType"
          placeholder="请选择教室类型"
          clearable
          class="full-width"
        >
          <el-option
            v-for="item in roomTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-button plain @click="handleSearch">搜索</el-button>
        <el-button plain @click="handleExport">导出</el-button>
        <el-button plain @click="showDialog('add', '')">新增</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <art-table
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :loading="isLoading"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <el-table-column label="序号" type="index" width="80" />
      <el-table-column label="教室名称" prop="roomName" />
      <el-table-column label="容量" prop="capacity" />
      <el-table-column label="教室类型" prop="roomType" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            @click="showDialog('edit', row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            title="确认删除该教室信息吗？"
            @confirm="handleDelete(row)"
            confirm-button-text="确定"
            cancel-button-text="取消"
            width="200px"
            icon="CircleClose"
            icon-color="red"
          >
            <template #reference>
              <el-button link :icon="Delete" type="danger"> 删除 </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </art-table>

    <!-- 对话框组件 -->
    <add-edit
      :visible="dialogVisible"
      :dialog-type="dialogType"
      :row-data="currentRow"
      @update:visible="closeDialog"
      @success="handleSearch"
    />

    <!-- 预约对话框 -->
    <reserve-dialog
      :visible="reserveDialogVisible"
      :row-data="currentRow"
      @update:visible="closeReserveDialog"
      @success="handleSearch"
    />
  </div>
</template>

<script setup>
import { Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { reactive, ref, onMounted } from "vue";
import AddEdit from "./comp/addEdit.vue";
import ReserveDialog from "./comp/reserveDialog.vue";
import { ClassRoomService } from "@/api/classRoom";
import { ApiService } from "@/api/apiApi";

const isLoading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
// 搜索表单数据
const searchForm = reactive({
  roomName: "",
  roomType: "",
  status: ""
});

const tableData = ref([]);

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref("add");
const currentRow = ref(null);
const reserveDialogVisible = ref(false);

// 获取教室类型
const roomTypeList = ref([]);
const getRoomTypeList = async () => {
  const res = await ApiService.getDictConfig("classroomTypeEnum");
  roomTypeList.value = res.data;
};

// 搜索方法
const handleSearch = async () => {
  isLoading.value = true;
  try {
    const res = await ClassRoomService.getClassRoomList(searchForm);
    if (res.code === 0) {
      tableData.value = res.data.list;
      total.value = res.data.total;
      isLoading.value = false;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
};

// 分页方法
const handlePageChange = (page) => {
  currentPage.value = page;
  handleSearch();
};

// 分页方法
const handleSizeChange = (size) => {
  currentPage.value = 1;
  pageSize.value = size;
  handleSearch();
};

// 导出方法
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success("导出功能待实现");
};

// 显示对话框方法
const showDialog = (type, row) => {
  if (type === "reserve") {
    reserveDialogVisible.value = true;
  } else {
    currentRow.value = row || {};
    dialogType.value = type;
    dialogVisible.value = true;
  }
};

// 关闭对话框方法
const closeDialog = () => {
  dialogVisible.value = false;
};

const closeReserveDialog = () => {
  reserveDialogVisible.value = false;
};

// 删除方法
const handleDelete = async (row) => {
  try {
    const res = await ClassRoomService.deleteClassRoom(row.roomCode);
    if (res.code === 0) {
      ElMessage.success("删除成功");
      handleSearch();
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

onMounted(async () => {
  await getRoomTypeList();
  handleSearch();
});
</script>

<style scoped lang="scss">
.page-content {
  width: 100%;
  height: 100%;
}

.fixed-width-input {
  width: 180px !important;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-left: 10px;
}
</style>
