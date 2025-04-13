<template>
  <div class="page-content">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input
          v-model="searchForm.keyWord"
          placeholder="请输入年级/班级名称"
          clearable
        ></el-input>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-select v-model="searchForm.classType" placeholder="请选择班级类型">
          <el-option label="班级制" value="CLASS_SYSTEM"></el-option>
          <el-option label="跑班制" value="RUNNING_SYSTEM"></el-option>
        </el-select>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="search">搜索</el-button>
        <el-button @click="showDialog('add', {})">添加</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
    >
      <template #default>
        <el-table-column label="序号" type="index" width="90px" />
        <el-table-column
          label="年级名称"
          prop="gradeName"
          show-overflow-tooltip
        />
        <el-table-column
          label="班级名称"
          prop="className"
          show-overflow-tooltip
        />
        <el-table-column
          label="年级类型"
          prop="classType"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{ getEnumName(gradeTypeList, scope.row.classType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="班主任"
          prop="headTeacherName"
          show-overflow-tooltip
        />
        <el-table-column
          label="副班主任"
          prop="deputyHeadName"
          show-overflow-tooltip
        />
        <el-table-column
          fixed="right"
          label="操作"
          width="150px"
          #default="scope"
          align="center"
        >
          <div style="display: flex; justify-content: center">
            <el-button
              link
              :icon="EditPen"
              type="primary"
              @click="showDialog('edit', scope.row)"
            >
              编辑
            </el-button>
          </div>
        </el-table-column>
      </template>
    </art-table>

    <add-edit ref="addEditRef" :dialog-type="dialogType" @update="getList()" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { EditPen } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { GradeService } from "@/api/gradeApi";
import AddEdit from "./comp/addEdit.vue";
import { getEnumName } from "@/utils/utils";
import { gradeTypeList } from "@/mock/configData";

const router = useRouter();
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const tableData = ref([]);
const dialogType = ref("add");

const searchForm = reactive({
  keyWord: "",
  classType: ""
});

const addEditRef = ref();

// 搜索方法
const search = () => {
  currentPage.value = 1;
  getList();
};

// 获取列表数据
const getList = async (page = 1, size = 10) => {
  isLoading.value = true;
  try {
    const res = await GradeService.getGradeList({
      pageNum: page,
      pageSize: size,
      ...searchForm
    });
    if (res.code === 0) {
      tableData.value = res.data.list;
      total.value = res.data.total;
    }
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  getList(page, pageSize.value);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  getList(currentPage.value, size);
};

const showDialog = (type: string, row?: any) => {
  dialogType.value = type;
  addEditRef.value?.show({
    type,
    data: row
  });
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: 100%;
}
</style>
