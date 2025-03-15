<template>
  <div class="member-manage">
    <table-bar :showTop="false" @search="search" @reset="resetForm(searchFormRef)" layout="search,refresh">
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="关键词" prop="keyword">
                <el-input v-model="searchForm.keyword" placeholder="会员名/昵称/手机号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态" prop="status">
                <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button type="primary" @click="handleAdd">新增会员</el-button>
      </template>
    </table-bar>

    <art-table
      :data="memberList"
      :loading="loading"
      :currentPage="searchForm.pageNum"
      :pageSize="searchForm.pageSize"
      :total="total"
      @page-change="changeCurrentPage"
    >
      <template #default>
        <el-table-column prop="memberName" label="会员姓名" width="120" />
        <el-table-column prop="memberNick" label="会员昵称" width="120" />
        <el-table-column prop="telephone" label="手机号" width="120" />
        <el-table-column prop="memberSex" label="性别" width="80">
          <template #default="{ row }">
            <div class="align-center">
              <el-icon v-if="row.memberSex === 1"> <Male color="#409EFF" /></el-icon>
              <el-icon v-else> <Female color="#F56C6C" /></el-icon>
              {{ row.memberSex === 1 ? "男" : "女" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="birthDate" label="生日" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getMemberStatusTag(row.status)">
              {{ useMemberStore().getMemberStatus.find((item) => item.value === row.status)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" width="160">
          <template #default="{ row }">
            {{ row.startDate ? formatDate(row.startDate) : "--" }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束时间" width="160">
          <template #default="{ row }">
            {{ row.endDate ? formatDate(row.endDate) : "--" }}
          </template>
        </el-table-column>
        <el-table-column prop="lastSign" label="最后签到" width="160">
          <template #default="{ row }">
            {{ row.lastSign ? formatDate(row.lastSign) : "--" }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" icon="View" @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="form.memberCode ? '编辑会员' : '新增会员'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="memberEditLoading">
        <el-form-item label="手机号" prop="telephone">
          <el-input v-model="form.telephone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="会员姓名" prop="memberName">
          <el-input v-model="form.memberName" placeholder="请输入会员姓名" />
        </el-form-item>
        <el-form-item label="会员昵称" prop="memberNick">
          <el-input v-model="form.memberNick" placeholder="请输入会员昵称" />
        </el-form-item>
        <el-form-item label="性别" prop="memberSex">
          <el-radio-group v-model="form.memberSex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="经办人" prop="operator">
          <el-select-v2
            v-model="form.operator"
            :options="userList"
            aria-placeholder="请选择经办人"
            :loading="userListLoading"
          />
        </el-form-item>
        <el-form-item label="生日" prop="birthDate">
          <el-date-picker
            v-model="form.birthDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog custom-class="member-detail-dialog" v-model="memberDetailDialogVisible" title="会员详情" width="80%">
      <MemberDetail :memberCode="memberDetailMemberCode" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import type { FormInstance, FormRules } from "element-plus";
  import { ElMessage } from "element-plus";
  import { IMemberSearchForm, IMemberForm, IMemberListItem } from "@/interface/IMember";
  import MemberApi from "@/api/memberApi";
  import _ from "lodash";
  import { UserService } from "@/api/usersApi";
  import { useMemberStore } from "@/store/modules/member";
  import MemberDetail from "./components/MemberDetail.vue";
  import { getMemberStatusTag, formatDate } from "./util";
  import { Male, Female } from "@element-plus/icons-vue";

  // 表单校验规则
  const rules = reactive<FormRules>({
    telephone: [
      { required: true, message: "请输入手机号", trigger: "blur" },
      { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" },
    ],
    memberName: [{ required: true, message: "请输入会员姓名", trigger: "blur" }],
    memberSex: [{ required: true, message: "请选择性别", trigger: "change" }],
  });

  // 搜索表单
  const searchFormRef = ref<FormInstance>();
  const searchForm = reactive<IMemberSearchForm>({
    keyword: "",
    status: "",
    pageNum: 1,
    pageSize: 10,
  });

  // 表单数据
  const formRef = ref<FormInstance>();
  const form = reactive<IMemberForm>({
    memberCode: "",
    telephone: "",
    memberName: "",
    memberNick: "",
    memberSex: 1,
    birthDate: "",
    operator: "",
    remark: "",
  });

  // 表格数据
  const loading = ref(false);
  const memberEditLoading = ref(false);
  const total = ref(0);
  const memberList = ref<IMemberListItem[]>([]);
  const dialogVisible = ref(false);
  const memberDetailDialogVisible = ref(false);
  const memberDetailMemberCode = ref("");
  const userList = ref([]);
  const userListLoading = ref(false);

  // 获取列表数据
  const getList = async () => {
    loading.value = true;
    try {
      const res = await MemberApi.getMemberList(searchForm);
      if (res.code === 0) {
        memberList.value = res.data.list;
        total.value = res.data.total;
      }
    } catch (error) {
      ElMessage.error("获取列表失败");
    }
    loading.value = false;
  };

  // 重置表单
  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    searchForm.pageNum = 1;
    getList();
  };

  // 搜索
  const search = () => {
    searchForm.pageNum = 1;
    getList();
  };

  // 切换页码
  const changeCurrentPage = (page: number) => {
    searchForm.pageNum = page;
    getList();
  };

  // 新增
  const handleAdd = () => {
    Object.assign(form, {
      memberCode: "",
      telephone: "",
      memberName: "",
      memberNick: "",
      memberSex: 1,
      birthDate: "",
      operator: "",
      remark: "",
    });
    loadUserList();
    dialogVisible.value = true;
  };

  // 编辑
  const handleEdit = (row: any) => {
    Object.assign(form, {
      memberCode: row.memberCode,
      telephone: row.telephone,
      memberName: row.memberName,
      memberNick: row.memberNick,
      memberSex: row.memberSex,
      birthDate: row.birthDate,
      operator: row.operator,
      remark: row.remark,
    });
    dialogVisible.value = true;
  };

  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const api = form.memberCode ? MemberApi.updateMember : MemberApi.addMember;
          const res = await api(form.memberCode ? form : _.omit(form, "memberCode"));
          if (res.code === 0) {
            ElMessage.success("操作成功");
            dialogVisible.value = false;
            getList();
          }
        } catch (error) {
          ElMessage.error("操作失败");
        }
      }
    });
  };

  // 获取普通用户列表
  const loadUserList = async () => {
    if (userList.value.length > 0) return;
    userListLoading.value = true;
    try {
      const res = await UserService.queryStoreUserList({
        pageNo: 1,
        pageSize: 20000,
      });
      if (res.code === 0) {
        userList.value =
          res.data?.list?.map((item: { userName: string; account: string }) => ({
            label: item.userName,
            value: item.account,
          })) || [];
      }
    } catch (error) {
      ElMessage.error("获取用户列表失败");
    } finally {
      userListLoading.value = false;
    }
  };

  // 详情
  const handleDetail = (row: any) => {
    memberDetailMemberCode.value = row.memberCode;
    memberDetailDialogVisible.value = true;
  };

  // 初始化
  onMounted(() => {
    getList();
    useMemberStore().loadMemberStatus();
  });
</script>

<style lang="scss" scoped>
  .member-manage {
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
  :deep(.el-dialog) {
    overflow: auto;
    margin: 50px auto !important;
  }
</style>
