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
      <el-table-column label="公告类型" prop="type" />
      <el-table-column label="公告时间" prop="create_time" />
      <el-table-column label="操作人" prop="operator" />
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
      :current-data="currentAnnouncement"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />

    <!-- 详情弹框 -->
    <el-dialog title="公告详情" v-model="detailVisible" width="600px">
      <div class="detail-content">
        <h3>{{ detailData.title }}</h3>
        <div class="info">
          <span>类型：{{ detailData.type }}</span>
          <span>时间：{{ detailData.create_time }}</span>
          <span>操作人：{{ detailData.operator }}</span>
        </div>
        <div class="content">{{ detailData.content }}</div>
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

// 搜索相关
const searchTitle = ref("");
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const handleSearch = () => {
  // 实际项目中，这里应该调用接口获取数据
  ElMessage.success("搜索功能触发");
};

// 表格数据
const announceList = reactive<Announcement[]>([
  {
    id: "1",
    title: "系统升级通知",
    type: "系统公告",
    content:
      "尊敬的用户，系统将于2023年12月1日22:00-次日02:00进行系统升级，期间系统将暂停服务，请提前做好相关准备工作。",
    operator: "系统管理员",
    create_time: "2023-11-28"
  },
  {
    id: "2",
    title: "元旦活动预告",
    type: "活动公告",
    content: "尊敬的用户，元旦期间系统将开展多项优惠活动，敬请期待！",
    operator: "市场部门",
    create_time: "2023-11-25"
  },
  {
    id: "3",
    title: "安全隐患排查通知",
    type: "紧急通知",
    content:
      "为保障系统安全稳定运行，现进行全面安全隐患排查，请各部门配合工作。",
    operator: "安全管理员",
    create_time: "2023-11-20"
  },
  {
    id: "4",
    title: "新功能上线公告",
    type: "系统公告",
    content: "系统新增数据分析功能，提供更全面的数据支持和决策依据。",
    operator: "产品经理",
    create_time: "2023-11-15"
  },
  {
    id: "5",
    title: "年终总结会议通知",
    type: "紧急通知",
    content: "年终总结会议将于12月20日在三楼会议室举行，请各部门准备工作报告。",
    operator: "行政部门",
    create_time: "2023-11-10"
  }
]);

// 表单组件相关
const formVisible = ref(false);
const isEdit = ref(false);
const currentAnnouncement = ref<Announcement | undefined>(undefined);
const announcementRef = ref(null);
const showDialog = (type: string, row: any) => {
  isEdit.value = type === "edit";
  currentAnnouncement.value = JSON.parse(JSON.stringify(row));
  formVisible.value = true;
  if (type === "edit") {
    nextTick(() => {
      announcementRef.value?.getDetail(row.id);
    });
  } else {
    nextTick(() => {
      announcementRef.value?.getDetail();
    });
  }
};
const getAnnouncementList = async () => {
  isLoading.value = true;
  // const res = await AnnouncementService.getAnnouncementList({
  //   page: currentPage.value,
  //   pageSize: pageSize.value
  // });
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
const handleFormSubmit = (formData: Announcement) => {
  if (!isEdit.value) {
    // 模拟新增操作
    const maxId = Math.max(...announceList.map((item) => parseInt(item.id)));
    const newId = (maxId + 1).toString();
    const newAnnouncement: Announcement = {
      ...formData,
      id: newId
    };
    announceList.unshift(newAnnouncement);
    ElMessage.success("新增成功");
  } else {
    // 模拟编辑操作
    const index = announceList.findIndex((item) => item.id === formData.id);
    if (index !== -1) {
      announceList[index] = { ...formData };
    }
    ElMessage.success("编辑成功");
  }
  formVisible.value = false;
};

// 表单取消
const handleFormCancel = () => {
  formVisible.value = false;
};

// 详情相关
const detailVisible = ref(false);
const detailData = reactive<Announcement>({
  id: "",
  title: "",
  type: "",
  content: "",
  operator: "",
  create_time: ""
});

// 详情按钮
const handleDetail = (row: Announcement) => {
  Object.assign(detailData, JSON.parse(JSON.stringify(row)));
  detailVisible.value = true;
};

// 删除按钮
const handleDelete = (row: Announcement) => {
  ElMessageBox.confirm("确认删除该公告吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      // 模拟删除操作
      const index = announceList.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        announceList.splice(index, 1);
      }
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

onMounted(() => {
  // getAnnouncementList();
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
</style>
