<!-- @format -->

<template>
  <div class="page-content">
    <el-row :gutter="15">
      <el-col :xs="19" :sm="12" :lg="6">
        <el-input v-model="termQuery.termName" placeholder="请输入学期名称" />
      </el-col>
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <art-table
      :data="processedTermList"
      :total="total"
      :current-page="termQuery.pageNum"
      :page-size="termQuery.pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      :loading="isLoading"
      :objectSpanMethod="handleSpanMethod"
    >
      <el-table-column label="学期名称" prop="termName" />
      <el-table-column label="周数" prop="weekNum" />
      <el-table-column label="开始时间" prop="startTime" />
      <el-table-column label="结束时间" prop="endTime" />
      <el-table-column label="排课" width="100px" fixed="right">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-button
              type="warning"
              style="margin-left: 10px"
              size="default"
              @click="handleArchive(scope.row)"
            >
              排课
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100px" fixed="right" prop="action">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-button
              type="primary"
              size="default"
              @click="handleEdit(scope.row)"
            >
              修改
            </el-button>
          </div>
        </template>
      </el-table-column>
    </art-table>

    <el-dialog v-model="addSemesterDialogVisible" title="新增学期" width="70%">
      <el-form :model="addSemesterForm" label-width="100px">
        <el-form-item label="学期名称" prop="semester">
          <el-input
            v-model="addSemesterForm.termName"
            placeholder="请输入学期名称"
          />
        </el-form-item>

        <!-- 动态表单列表 -->
        <div
          v-for="(item, index) in addSemesterForm.termWeekInfoList"
          :key="index"
          class="time-list-item"
        >
          <el-form-item :label="'第' + (index + 1) + '周'"></el-form-item>

          <el-form-item
            label="时间段"
            :prop="'termWeekInfoList.' + index + '.timeRange'"
            label-width="max-content"
          >
            <el-date-picker
              v-model="item.timeRange"
              value-format="YYYY-MM-DD"
              @change="(val: any) => handleTimeRangeUpdate(index, val)"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>

          <el-form-item
            label="备注"
            :prop="'termWeekInfoList.' + index + '.remark'"
            label-width="max-content"
          >
            <el-input v-model="item.remark" placeholder="请输入备注" />
          </el-form-item>

          <el-button
            type="danger"
            @click="removeTimeItem(index)"
            :disabled="addSemesterForm.termWeekInfoList.length === 1"
            >删除</el-button
          >
        </div>

        <el-button
          type="primary"
          @click="addTimeItem(addSemesterForm.termWeekInfoList.length)"
          >添加时间段</el-button
        >
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addSemesterDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { TermService } from "@/api/termApi";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();
const termQuery = ref({
  termName: "",
  pageNum: 1,
  pageSize: 10
});

const termList = ref([]);
const total = ref(0);
const isLoading = ref(false);
const addSemesterDialogVisible = ref(false);
const addSemesterForm = ref<any>({
  termName: "",
  termWeekInfoList: [
    {
      weekNum: 1,
      startTime: null,
      endTime: null,
      remark: ""
    }
  ]
});
const actionType = ref("add");

const processedTermList = computed(() => {
  const result: any = [];
  termList.value.forEach((term: any) => {
    term.termWeekInfoList.forEach((week: any, index: number) => {
      result.push({
        ...term,
        ...week,
        isFirstRow: index === 0
      });
    });
  });
  console.log(result);
  return result;
});

const handleSearch = () => {
  TermService.getTermList(termQuery.value).then((res: any) => {
    termList.value = res.data.list;
    total.value = res.data.total;
  });
};

const handleAdd = () => {
  actionType.value = "add";
  addSemesterForm.value = {
    termName: "",
    termWeekInfoList: [
      {
        weekNum: 1,
        startTime: null,
        endTime: null,
        remark: ""
      }
    ]
  };
  addSemesterDialogVisible.value = true;
};

const handlePageChange = (pageNum: number, pageSize: number) => {
  termQuery.value.pageNum = pageNum;
  termQuery.value.pageSize = pageSize;
  handleSearch();
};

const handleSizeChange = (pageSize: number) => {
  termQuery.value.pageSize = pageSize;
  handleSearch();
};

const handleEdit = (row: any) => {
  // 找到完整的学期数据
  const termData = termList.value.find(
    (term: any) => term.termCode === row.termCode
  );

  // 处理时间范围回显
  const formData = {
    ...(termData ?? {}),
    termWeekInfoList:
      termData?.termWeekInfoList?.map((week: any) => ({
        ...week,
        timeRange: [week.startTime, week.endTime],
        weekNum: Number(week.weekNum)
      })) ?? []
  };

  addSemesterForm.value = formData;
  addSemesterDialogVisible.value = true;
  actionType.value = "edit";
};

const handleArchive = (row: any) => {
  console.log(row);
  router.push({
    path: "/termManage/courseList",
    query: {
      termCode: row.termCode,
      termUniqueCode: row.termUniqueCode,
      startTime: row.startTime
    }
  });
};

const handleDelete = (row: any) => {
  console.log(row);
};

const addTimeItem = (index: number) => {
  addSemesterForm.value.termWeekInfoList.push({
    weekNum: index + 1,
    startTime: null,
    endTime: null,
    remark: ""
  });
};

const removeTimeItem = (index: number) => {
  addSemesterForm.value.termWeekInfoList.splice(index, 1);
};

const handleTimeRangeUpdate = (index: number, value: any) => {
  console.log(value);
  addSemesterForm.value.termWeekInfoList[index].startTime = value[0];
  addSemesterForm.value.termWeekInfoList[index].endTime = value[1];
};

const handleSubmit = () => {
  if (actionType.value === "add") {
    const data = addSemesterForm.value.termWeekInfoList.map(
      (item: any, index: number) => {
        return {
          startTime: item.startTime,
          endTime: item.endTime,
          remark: item.remark,
          weekNum: index + 1
        };
      }
    );
    addSemesterForm.value.termWeekInfoList = data;
    console.log(addSemesterForm.value);
    TermService.addTerm(addSemesterForm.value).then((res: any) => {
      if (res.code === 0) {
        ElMessage.success("新增成功");
        addSemesterDialogVisible.value = false;
        handleSearch();
      }
    });
  } else {
    const data = addSemesterForm.value.termWeekInfoList.map(
      (item: any, index: number) => {
        return {
          startTime: item.startTime,
          endTime: item.endTime,
          remark: item.remark,
          weekNum: index + 1,
          termUniqueCode: addSemesterForm.value.termUniqueCode
        };
      }
    );
    addSemesterForm.value.termWeekInfoList = data;
    TermService.editTerm(addSemesterForm.value).then((res: any) => {
      console.log(res);
      if (res.code === 0) {
        ElMessage.success("编辑成功");
        addSemesterDialogVisible.value = false;
        handleSearch();
      }
    });
  }
};

const handleSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  if (column.property === "termName" || column.property === "action") {
    if (row.isFirstRow) {
      const rowSpan =
        termList.value.find((term: any) => term.termCode === row.termCode)
          ?.termWeekInfoList.length || 1;
      return {
        rowspan: rowSpan,
        colspan: 1
      };
    } else {
      return {
        rowspan: 0,
        colspan: 0
      };
    }
  }
};

onMounted(() => {
  handleSearch();
});
</script>

<style lang="scss" scoped>
.parents-info {
  h3 {
    margin-bottom: 16px;
    font-weight: 500;
    color: #303133;
  }
}

.el-select {
  width: 100%;
}

.time-list-item {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}
</style>
