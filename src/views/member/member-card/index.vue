<template>
  <div class="member-card">
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      :columns="columns"
      layout="search,refresh"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input label="会员卡" prop="cardName" v-model="searchForm.cardName" />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button type="primary" @click="handleAddCard">新增会员卡</el-button>
      </template>
    </table-bar>

    <art-table
      :data="cardList"
      :loading="loading"
      :currentPage="searchForm.pageNum"
      :pageSize="searchForm.pageSize"
      :total="total"
      @page-change="changeCurrentPage"
    >
      <template #default>
        <el-table-column :prop="columns[0].prop" :label="columns[0].label" width="200" />
        <el-table-column :prop="columns[1].prop" :label="columns[1].label" width="200">
          <template #default="{ row }">
            {{ memberCardType.find((item) => item.value === row.startCardType)?.label || "--" }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[2].prop" :label="columns[2].label" width="150">
          <template #default="{ row }">
            {{ formatPrice(row.price) }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[3].prop" :label="columns[3].label" width="150">
          <template #default="{ row }"> {{ row.effectiveDays }} 天 </template>
        </el-table-column>
        <el-table-column :prop="columns[4].prop" :label="columns[4].label" width="150">
          <template #default="{ row }"> {{ row.giftDays }} 天 </template>
        </el-table-column>
        <el-table-column :prop="columns[5].prop" :label="columns[5].label" width="150">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :active-value="0"
              :inactive-value="1"
              @click="handleStatus(row.cardCode, row.status)"
            />
          </template>
        </el-table-column>

        <el-table-column :prop="columns[6].prop" :label="columns[6].label" width="200">
          <template #default="{ row }">
            {{ dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column :prop="columns[7].prop" :label="columns[7].label" width="150"> </el-table-column>
        <el-table-column fixed="right" label="操作" width="240">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)" :icon="View">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)" :icon="EditPen">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="createCardVisible"
      :title="cardForm?.cardCode ? '编辑会员卡' : '新增会员卡'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="cardForm" ref="cardFormRef" :rules="cardRules" label-width="100px">
        <el-form-item label="会员卡名称" prop="cardName">
          <el-input v-model="cardForm.cardName" placeholder="请输入会员卡名称" />
        </el-form-item>
        <el-form-item label="会员卡类型" prop="startCardType">
          <el-select v-model="cardForm.startCardType" placeholder="请选择会员卡类型">
            <el-option v-for="item in memberCardType" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="cardForm.price" :precision="2" :step="1.0" :min="0" />
        </el-form-item>
        <el-form-item label="有效期" prop="effectiveDays">
          <el-input-number v-model="cardForm.effectiveDays" :min="1" :step="1">
            <template #suffix>
              <span>天</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="赠送天数" prop="giftDays">
          <el-input-number v-model="cardForm.giftDays" :min="0" :step="1">
            <template #suffix>
              <span>天</span>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="cardForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createCardVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="viewCardVisible" title="会员卡详情" destroy-on-close>
      <el-descriptions :column="2" border label-width="160">
        <el-descriptions-item label="会员卡名称" label-class-name="member-card-label-class" width="300">
          {{ currentCard?.cardName }}（No:{{ currentCard?.cardCode || "--" }}）
        </el-descriptions-item>
        <el-descriptions-item label="会员卡类型" label-class-name="member-card-label-class" width="300">
          {{ memberCardType.find((item) => item.value === currentCard?.startCardType)?.label || "--" }}
        </el-descriptions-item>
        <el-descriptions-item label="价格" label-class-name="member-card-label-class" width="300">
          {{ formatPrice(currentCard?.price || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" label-class-name="member-card-label-class" width="300">
          <el-tag v-if="currentCard?.status === 0" type="success">已启用</el-tag>
          <el-tag v-else type="danger">已禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="有效期" label-class-name="member-card-label-class" width="300">
          {{ currentCard?.effectiveDays }} 天
        </el-descriptions-item>
        <el-descriptions-item label="赠送天数" label-class-name="member-card-label-class" width="300">
          {{ currentCard?.giftDays }} 天
        </el-descriptions-item>
        <el-descriptions-item label="开卡时间" label-class-name="member-card-label-class" width="300">
          {{ dayjs(currentCard?.createTime).format("YYYY-MM-DD HH:mm:ss") }}
        </el-descriptions-item>
        <el-descriptions-item label="上次更新" label-class-name="member-card-label-class" width="300">
          {{ dayjs(currentCard?.updateTime).format("YYYY-MM-DD HH:mm:ss") }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" label-class-name="member-card-label-class">
          {{ currentCard?.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { Delete, View, EditPen } from "@element-plus/icons-vue";
  import { ref, reactive } from "vue";
  import type { FormInstance } from "element-plus";
  import { ElMessage, ElMessageBox } from "element-plus";
  import { IMemberCardListItem, IMemberCardSearchForm } from "@/interface/IMember";
  import MemberCardApi from "@/api/memberCardApi";
  import _ from "lodash";
  import { useMemberStore } from "@/store/modules/member";
  import dayjs from "dayjs";

  const columns = reactive([
    {
      label: "会员卡名称",
      prop: "cardName",
    },
    {
      label: "会员卡类型",
      prop: "startCardType",
    },
    {
      label: "价格",
      prop: "price",
    },
    {
      label: "有效期",
      prop: "effectiveDays",
    },
    {
      label: "赠送天数",
      prop: "giftDays",
    },
    {
      label: "状态",
      prop: "status",
    },
    {
      label: "创建时间",
      prop: "createTime",
    },
    {
      label: "备注",
      prop: "remark",
    },
  ]);

  const searchFormRef = ref<FormInstance>();
  const cardFormRef = ref<FormInstance>();
  const searchForm = reactive<IMemberCardSearchForm>({
    cardName: "",
    pageNum: 1,
    pageSize: 30,
  });

  const viewCardVisible = ref(false);
  const memberCardType = computed(() => {
    return useMemberStore().getMemberCardType;
  });
  const initCardForm = {
    cardCode: "",
    cardName: "",
    effectiveDays: 1,
    startCardType: "",
    giftDays: 0,
    price: 0,
    remark: "",
  };

  const cardForm = reactive<Omit<IMemberCardListItem, "updateTime" | "createTime" | "status">>(
    _.cloneDeep(initCardForm)
  );

  const cardRules = {
    cardName: [{ required: true, message: "请输入会员卡名称", trigger: "blur" }],
    startCardType: [{ required: true, message: "请选择会员卡类型", trigger: "change" }],
    price: [{ required: true, message: "请输入价格", trigger: "blur" }],
    effectiveDays: [{ required: true, message: "请输入有效期", trigger: "blur" }],
  };

  const loading = ref(false);
  const total = ref(0);
  const cardList = ref<IMemberCardListItem[]>([]);
  const createCardVisible = ref(false);
  const currentCard = ref<IMemberCardListItem | null>(null);

  // 格式化价格
  const formatPrice = (price: number) => {
    return `￥${price.toFixed(2)}`;
  };

  // 重置表单
  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
    searchForm.pageNum = 1;
    getCardList();
  };

  // 搜索
  const search = () => {
    searchForm.pageNum = 1;
    getCardList();
  };

  // 切换页码
  const changeCurrentPage = (page: number) => {
    searchForm.pageNum = page;
    getCardList();
  };

  // 获取列表数据
  const getCardList = async () => {
    loading.value = true;
    try {
      const res = await MemberCardApi.getMemberCardList(searchForm);
      if (res.code === 0) {
        cardList.value = res.data.list.map((item: IMemberCardListItem) => ({
          ...item,
          price: Number(item.price),
        }));
        total.value = res.data.total;
      }
    } catch (error) {
      ElMessage.error("获取列表失败");
    }
    loading.value = false;
  };

  //新增
  const handleAddCard = () => {
    cardForm.cardCode = initCardForm.cardCode;
    cardForm.cardName = initCardForm.cardName;
    cardForm.effectiveDays = initCardForm.effectiveDays;
    cardForm.giftDays = initCardForm.giftDays;
    cardForm.price = initCardForm.price;
    cardForm.remark = initCardForm.remark;
    cardForm.startCardType = initCardForm.startCardType;
    createCardVisible.value = true;
  };

  // 编辑
  const handleEdit = (row: IMemberCardListItem) => {
    Object.assign(cardForm, row);
    createCardVisible.value = true;
  };

  //查看
  const handleView = (row: IMemberCardListItem) => {
    currentCard.value = row;
    viewCardVisible.value = true;
  };

  // 切换状态
  const handleStatus = (id: string, status: number) => {
    try {
      MemberCardApi.switchStatus(id, status).then((res) => {
        if (res.code === 0) {
          ElMessage.success("操作成功");
        }
      });
    } catch (error) {
      ElMessage.error("操作失败");
    }
  };

  // 删除
  const handleDelete = (row: IMemberCardListItem) => {
    ElMessageBox.confirm("确认删除该会员卡吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      try {
        MemberCardApi.delMemberCard(row.cardCode).then((res) => {
          if (res.code === 0) {
            ElMessage.success("删除成功");
            getCardList();
          }
        });
      } catch (error) {
        ElMessage.error("删除失败");
      }
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!cardFormRef.value) return;

    await cardFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (cardForm.cardCode) {
            MemberCardApi.editMemberCard(cardForm).then((res) => {
              if (res.code === 0) {
                ElMessage.success("操作成功");
                createCardVisible.value = false;
                getCardList();
              }
            });
          } else {
            MemberCardApi.addMemberCard(_.omit(cardForm, ["cardCode"])).then((res) => {
              if (res.code === 0) {
                ElMessage.success("操作成功");
                createCardVisible.value = false;
                getCardList();
              }
            });
          }
        } catch (error) {
          ElMessage.error("操作失败");
        }
      }
    });
  };

  onMounted(() => {
    getCardList();
    useMemberStore().loadEnums();
  });
</script>

<style lang="scss">
  .member-card {
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    &-label-class {
      font-weight: bold !important;
    }
  }
</style>
