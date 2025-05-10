<template>
  <div class="page-content">
    <el-row :gutter="15" class="mb-4">
      <el-col :xs="19" :sm="12" :lg="6">
        <el-input
          v-model="searchTitle"
          placeholder="请输入公告标题搜索"
        ></el-input>
      </el-col>
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button plain @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="showDialog('add', {})"
          >新增</el-button
        >
      </el-col>
    </el-row>

    <art-table
      :data="announceList"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column label="公告标题" prop="title" />
      <el-table-column label="公告类型" prop="noticeType" />
      <el-table-column label="公告时间" prop="ctime" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button
            link
            :icon="EditPen"
            type="primary"
            @click="showDialog('edit', scope.row)"
            >编辑</el-button
          >
          <el-button
            link
            :icon="View"
            type="success"
            @click="handleDetail(scope.row)"
            >详情</el-button
          >
          <el-button
            link
            type="danger"
            :icon="Delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </art-table>

    <!-- 使用公告表单组件 -->
    <AnnouncementForm
      ref="announcementRef"
      v-model:visible="formVisible"
      :is-edit="isEdit"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />

    <!-- 详情弹框 -->
    <el-dialog title="公告详情" v-model="detailVisible" width="600px">
      <div class="detail-content">
        <h3>{{ detailData.title }}</h3>
        <div class="info">
          <span
            >类型：<span
              :class="detailData.noticeType === '紧急消息' ? 'notice-type' : ''"
              >{{ detailData.noticeType }}</span
            ></span
          >
          <span v-if="detailData.isTop" class="top-notice">已置顶</span>
          <span class="notice-time">时间：{{ detailData.ctime }}</span>
        </div>
        <div class="content">
          <div v-html="detailData.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import AnnouncementForm from "@/views/notice/comp/AnnouncementForm.vue";
import { Announcement } from "@/views/notice/type";
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { NoticeService } from "@/api/notice";

// 搜索相关
const searchTitle = ref("");
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const handleSearch = () => {
  getAnnouncementList();
};

// 表格数据
const announceList = ref<Announcement[]>([]);

// 表单组件相关
const formVisible = ref(false);
const isEdit = ref(false);
const announcementRef = ref<any>(null);
const showDialog = (type: string, row: any) => {
  isEdit.value = type === "edit";
  formVisible.value = true;
  if (type === "edit") {
    nextTick(() => {
      announcementRef.value?.getDetail(row.noticeCode);
    });
  } else {
    nextTick(() => {
      announcementRef.value?.getDetail();
    });
  }
};
const getAnnouncementList = async () => {
  isLoading.value = true;
  let params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    title: searchTitle.value
  };
  const res = await NoticeService.getNoticeList(params);
  console.log("res ~ 🚀", res);
  if (res.code === 0) {
    isLoading.value = false;
    announceList.value = res.data.list;
    total.value = res.data.total;
  }
};
const handlePageChange = (page: number) => {
  currentPage.value = page;
  getAnnouncementList();
};
const handleSizeChange = (size: number) => {
  currentPage.value = 1;
  pageSize.value = size;
  getAnnouncementList();
};
// 表单提交
const handleFormSubmit = () => {
  formVisible.value = false;
  getAnnouncementList();
};

// 表单取消
const handleFormCancel = () => {
  formVisible.value = false;
};

// 详情相关
const detailVisible = ref(false);
const detailData = ref<Announcement>({
  noticeCode: "",
  title: "",
  noticeType: "",
  content: "",
  operator: "",
  ctime: ""
});

// 详情按钮
const handleDetail = async (row: Announcement) => {
  let res = await NoticeService.getNoticeDetail({ noticeCode: row.noticeCode });
  if (res.code === 0) {
    detailData.value = res.data;
  }
  detailVisible.value = true;
};

// 删除按钮
const handleDelete = (row: Announcement) => {
  ElMessageBox.confirm("确认删除该公告吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      let res = await NoticeService.deleteNotice(row.noticeCode);
      if (res.code === 0) {
        getAnnouncementList();
        ElMessage.success("删除成功");
      } else {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

onMounted(() => {
  getAnnouncementList();
});
</script>

<style lang="scss" scoped>
.mb-4 {
  margin-bottom: 16px;
}
.detail-content {
  padding: 10px;

  h3 {
    text-align: center;
    margin-bottom: 20px;
  }

  .info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    color: #666;
    font-size: 14px;
  }

  .content {
    padding: 15px;
    background-color: #f8f8f8;
    border-radius: 4px;
    min-height: 200px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
:deep(.el-dialog__body) {
  padding: 0 !important;
}
.notice-type {
  margin-right: 10px;
  color: red;
}
.top-notice {
  margin-bottom: 10px;
  text-align: center;
}
</style>
