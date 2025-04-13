<template>
  <div class="any-table">
    <el-table
      :data="props.data"
      style="width: 100%"
      :row-key="rowKey"
      v-loading="props.loading"
      :span-method="props.objectSpanMethod"
    >
      <slot></slot>
    </el-table>
    <div
      style="display: flex; justify-content: flex-end; margin-top: 20px"
      v-if="props.data.length && props.total"
    >
      <el-pagination
        size="default"
        background
        v-model:current-page="localCurrentPage"
        v-model:page-size="localPageSize"
        :pager-count="9"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import type { TreeNode } from "element-plus";

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  rowKey: {
    type: String,
    default: "id"
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  },
  loading: {
    type: Boolean,
    default: false
  },
  objectSpanMethod: {
    type: Function as PropType<
      (data: {
        row: any;
        rowIndex: number;
        column: any;
        columnIndex: number;
      }) => { rowspan: number; colspan: number } | number[] | undefined
    >,
    default: undefined
  }
});
const emit = defineEmits(["update:currentPage", "pageChange", "sizeChange"]);

const list = ref([]);

const localCurrentPage = ref(props.currentPage);
const localPageSize = ref(props.pageSize);
watch(
  () => props.currentPage,
  (newVal) => {
    localCurrentPage.value = newVal;
  }
);

watch(
  () => props.pageSize,
  (newVal) => {
    localPageSize.value = newVal;
  }
);
onMounted(() => {
  initData();
});

const initData = () => {
  list.value = props.data as [];
};

const handleCurrentChange = (val: number) => {
  localCurrentPage.value = val;
  emit("update:currentPage", val);
  emit("pageChange", val);
};

const handleSizeChange = (val: number) => {
  localPageSize.value = val;
  emit("sizeChange", val);
};
</script>

<style lang="scss">
.any-table {
  .el-table--enable-row-transition .el-table__body td.el-table__cell {
    transition: none;
  }

  .el-table {
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
}
</style>

<style lang="scss" scoped>
.any-table {
  overflow: hidden;
  border-radius: 10px;
}
</style>
