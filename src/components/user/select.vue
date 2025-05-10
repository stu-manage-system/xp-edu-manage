<template>
  <el-dialog
    title="选择教师"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入教师姓名搜索"
        style="width: 200px"
        @input="handleSearch"
      />
    </div>

    <div class="user-list-box" v-loading="loading">
      <el-scrollbar>
        <el-radio-group v-model="selectedUserId">
          <div
            v-for="item in teacherList"
            :key="item.userCode"
            class="user-item"
          >
            <el-radio :value="item.userCode">
              <div class="user-info">
                <div class="main-info">姓名：{{ item.userName }}</div>
                <div class="sub-info">
                  英文名：{{ item.teacherEnName }}
                  <span class="separator">|</span>
                  工号：{{ item.userCode }}
                </div>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </el-scrollbar>
    </div>

    <div
      style="display: flex; justify-content: flex-end; margin-top: 20px"
      v-if="total"
    >
      <el-pagination
        v-model="pageNum"
        :total="total"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 40, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { UserService } from "@/api/usersApi";
import { debounce } from "lodash";

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  selectedTeachers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["confirm"]);
const dialogVisible = ref(false);
const searchKeyword = ref("");
const teacherList = ref<any[]>([]);
const selectedUserId = ref("");
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const doSearch = async () => {
  loading.value = true;
  const res = await UserService.queryStoreUserList({
    keyWord: searchKeyword.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  });
  if (res.code === 0) {
    teacherList.value = res.data.list;
    total.value = res.data.total;
    loading.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageNum.value = 1;
  pageSize.value = size;
  doSearch();
};

const handleCurrentChange = (page: number) => {
  pageNum.value = page;
  doSearch();
};

const handleSearch = debounce(doSearch, 300);

const handleConfirm = () => {
  if (!selectedUserId.value) {
    ElMessage.warning("请选择一名用户");
    return;
  }
  const selectedUser = teacherList.value.find(
    (item) => item.userCode === selectedUserId.value
  );
  emit("confirm", selectedUser);
  dialogVisible.value = false;
};

const show = (user?: any) => {
  searchKeyword.value = "";
  dialogVisible.value = true;
  selectedUserId.value = user?.userCode || "";
  handleSearch();
};

defineExpose({
  show
});
</script>

<style scoped lang="scss">
.search-bar {
  margin-bottom: 20px;
}

.user-item {
  padding: 12px 16px;
  border: 1px solid #ebeef5;
  margin-bottom: 24px;

  &:hover {
    background-color: #f5f7fa;
  }

  :deep(.el-radio) {
    width: 100%;
    height: 100%;
    margin-right: 0;

    .el-radio__label {
      width: 100%;
      margin-left: 20px;
    }
  }
}

.user-info {
  .main-info {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 14px;
  }

  .sub-info {
    font-size: 13px;
    color: #666;
  }

  .separator {
    margin: 0 8px;
    color: #dcdfe6;
  }
}

:deep(.el-radio-group) {
  display: block;
}
</style>
