<template>
  <div class="member-detail" v-loading="loading">
    <!-- 基本信息 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="会员姓名">
          {{ memberInfo?.memberName || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="会员昵称">
          {{ memberInfo?.memberNick || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ memberInfo?.telephone || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          <div class="align-center">
            <el-icon v-if="memberInfo?.memberSex === 1"> <Male color="#409EFF" /></el-icon>
            <el-icon v-else> <Female color="#F56C6C" /></el-icon>
            {{ memberInfo?.memberSex === 1 ? "男" : "女" }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="生日">
          {{ memberInfo?.birthDate || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="会员卡号">
          {{ memberInfo?.cardCode || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="会员类型">
          {{ memberInfo?.memberType || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="是否关注">
          <el-tag :type="memberInfo?.isFollow === 1 ? 'success' : 'danger'">
            {{ memberInfo?.isFollow === 1 ? "跟进中" : "不跟进" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="跟进人">
          {{ memberInfo?.followPerson || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="证件号">
          {{ memberInfo?.numberCard || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getMemberStatusTag(memberInfo?.status)">
            {{ useMemberStore().getMemberStatus.find((item) => item.value === memberInfo?.status)?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后签到">
          {{ memberInfo?.lastSign ? formatDate(memberInfo?.lastSign) : "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ memberInfo?.startDate ? formatDate(memberInfo?.startDate) : "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ memberInfo?.endDate ? formatDate(memberInfo?.endDate) : "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ memberInfo?.creator || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ memberInfo?.createTime ? formatDate(memberInfo?.createTime) : "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">
          {{ memberInfo?.remark || "无" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 会员卡记录 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>会员卡记录</span>
        </div>
      </template>
      <art-table :data="memberCardRecords" :show-pagination="false">
        <template #default>
          <el-table-column prop="businessName" label="业务名称" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === 0 ? 'success' : 'danger'">
                {{ row.status === 0 ? "正常" : "已过期" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始时间">
            <template #default="{ row }">
              {{ row.startDate ? formatDate(row.startDate) : "--" }}
            </template>
          </el-table-column>
          <el-table-column prop="endDate" label="结束时间">
            <template #default="{ row }">
              {{ row.endDate ? formatDate(row.endDate) : "--" }}
            </template>
          </el-table-column>
          <el-table-column prop="salesperson" label="销售人员" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间">
            <template #default="{ row }">
              {{ row.createTime ? formatDate(row.createTime) : "--" }}
            </template>
          </el-table-column>
        </template>
      </art-table>
    </el-card>

    <!-- 课程记录 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>课程记录</span>
        </div>
      </template>
      <art-table :data="courseRecords" :show-pagination="false">
        <template #default>
          <el-table-column prop="businessName" label="业务名称" />
          <el-table-column prop="businessType" label="业务类型" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === 0 ? 'success' : 'danger'">
                {{ row.status === 0 ? "正常" : "已过期" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="courseRule" label="课程规则" />
          <el-table-column prop="surplus" label="剩余次数" />
          <el-table-column prop="salesperson" label="销售人员" />
          <el-table-column prop="startDate" label="开始时间">
            <template #default="{ row }">
              {{ row.startDate ? formatDate(row.startDate) : "--" }}
            </template>
          </el-table-column>
          <el-table-column prop="endDate" label="结束时间">
            <template #default="{ row }">
              {{ row.endDate ? formatDate(row.endDate) : "--" }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间">
            <template #default="{ row }">
              {{ row.createTime ? formatDate(row.createTime) : "--" }}
            </template>
          </el-table-column>
        </template>
      </art-table>
    </el-card>

    <!-- 出入记录 -->
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>出入记录</span>
        </div>
      </template>
      <art-table
        :data="accessList"
        :currentPage="accessSearchForm.pageNum"
        :pageSize="accessSearchForm.pageSize"
        :total="accessSearchForm.total"
        @page-change="handleAccessPageChange"
      >
        <template #default>
          <el-table-column prop="storeName" label="门店名称" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === 0 ? 'success' : 'info'">
                {{ row.status === 0 ? "进店" : "离店" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间">
            <template #default="{ row }">
              {{ row.createTime ? formatDate(row.createTime) : "--" }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间">
            <template #default="{ row }">
              {{ row.updateTime ? formatDate(row.updateTime) : "--" }}
            </template>
          </el-table-column>
        </template>
      </art-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from "vue";
  import { ElMessage } from "element-plus";
  import type {
    IMemberAccessRecord,
    IMemberBasicInfo,
    IMemberCardRecord,
    IMemberCourseRecord,
  } from "@/interface/IMember";
  import MemberApi from "@/api/memberApi";
  import { useMemberStore } from "@/store/modules/member";
  import { getMemberStatusTag, formatDate } from "@/views/member/member-manage/util";

  const props = defineProps<{
    memberCode: string;
  }>();
  const loading = ref(false);
  const memberInfo = ref<IMemberBasicInfo>();
  const memberCardRecords = ref<IMemberCardRecord[]>([]);
  const courseRecords = ref<IMemberCourseRecord[]>([]);

  // 将 accessRecords 拆分为 list 和 searchForm
  const accessList = ref<IMemberAccessRecord[]>([]);
  const accessSearchForm = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取会员详情
  const getMemberDetail = async () => {
    if (!props.memberCode) return;

    loading.value = true;
    try {
      const res = await MemberApi.getMemberDetail(props.memberCode);
      if (res.code === 0) {
        memberInfo.value = res.data.memberBasicInfo;
        memberCardRecords.value = res.data?.memberCardRecords || [];
        courseRecords.value = res.data?.courseRecords || [];
        // 更新访问记录数据
        accessList.value = res.data?.accessRecords?.list || [];
        accessSearchForm.total = res.data?.accessRecords?.total || 0;
      }
    } catch (error) {
      console.log(error);
      ElMessage.error("获取会员详情失败");
    }
    loading.value = false;
  };

  // 处理出入记录分页
  const handleAccessPageChange = async (page: number) => {
    accessSearchForm.pageNum = page;
    // 单独请求出入记录数据
    try {
      const res = await MemberApi.getMemberAccessRecords(props.memberCode, {
        pageNum: accessSearchForm.pageNum,
        pageSize: accessSearchForm.pageSize,
      });
      if (res.code === 0) {
        accessList.value = res.data.list;
        accessSearchForm.total = res.data.total;
      }
    } catch (error) {
      ElMessage.error("获取出入记录失败");
    }
  };

  // 监听 memberCode 变化并获取详情
  watch(
    () => props.memberCode,
    (newVal) => {
      if (newVal) {
        getMemberDetail();
      } else {
        // 当 memberCode 为空时，清空所有数据
        memberInfo.value = undefined;
        memberCardRecords.value = [];
        courseRecords.value = [];
        accessList.value = [];
        accessSearchForm.total = 0;
        accessSearchForm.pageNum = 1;
      }
    }
  );

  onMounted(() => {
    getMemberDetail();
  });
</script>

<style lang="scss" scoped>
  .member-detail {
    overflow: auto;
    height: 70vh;
    .detail-card {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
          font-size: 16px;
          font-weight: bold;
        }
      }
    }

    :deep(.el-descriptions__label) {
      font-weight: bold;
      width: 120px;
    }
  }
</style>
