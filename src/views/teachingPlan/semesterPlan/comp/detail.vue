<template>
  <div class="semester-detail">
    <div class="detail-header">
      <h2>学期计划详情</h2>
    </div>

    <div class="detail-content">
      <div class="detail-section">
        <div class="detail-row">
          <div class="detail-label">学期名称：</div>
          <div class="detail-value">{{ planInfo.termName || "-" }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">年纪/班级：</div>
          <div class="detail-value">
            {{ planInfo.gradeName || "-" }}/{{ planInfo.className || "-" }}
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">教师：</div>
          <div class="detail-value">{{ planInfo.userName || "-" }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">科目：</div>
          <div class="detail-value">{{ planInfo.courseName || "-" }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">创建人：</div>
          <div class="detail-value">{{ planInfo.creatorName || "-" }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">更新时间：</div>
          <div class="detail-value">{{ planInfo.mtime || "-" }}</div>
        </div>
      </div>

      <div class="detail-table-section">
        <h3>学期计划明细</h3>
        <!-- <div class="tree-section">
          <h4>课程体系选择</h4>
          <el-tree
            ref="treeRef"
            :data="treeData"
            show-checkbox
            node-key="code"
            :props="defaultProps"
            :check-strictly="true"
            :default-expanded-keys="expandedKeys"
            :highlight-current="true"
            @check="handleCheck"
          />
        </div> -->
        <el-table :data="planDetailList" stripe border>
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          />
          <el-table-column label="月" prop="month" align="center" />
          <el-table-column label="周" prop="termNumber" align="center" />
          <el-table-column label="日期" prop="date" align="center" width="300">
            <template #default="scope">
              <span>{{ scope.row.startTime }} 至 {{ scope.row.endTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="课次" prop="courseCount" align="center" />
          <el-table-column label="内容" prop="subjectContext" align="center" />
          <el-table-column label="备注" prop="remark" align="center" />
        </el-table>
      </div>
    </div>

    <div class="detail-footer">
      <el-button type="primary" @click="closeDialog">关闭</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from "vue";
import { TeachPlanService } from "@/api/teachPlan";
import { ElMessage } from "element-plus";
import { CourseService } from "@/api/courseApi";

const props = defineProps({
  id: {
    type: [String, Number],
    default: ""
  }
});

const emit = defineEmits(["close"]);

const planInfo = ref({});
const planDetailList = ref([]);
const treeRef = ref(null);
const treeData = ref([]);
const expandedKeys = ref([]);
const defaultProps = {
  children: "children",
  label: "name"
};

// 获取学期计划详情
const getPlanDetail = async () => {
  if (!props.id) return;

  try {
    const res = await TeachPlanService.queryTermPlanDetail({
      termPlanCode: props.id
    });
    if (res.code === 0) {
      planInfo.value = res.data || {};
      planDetailList.value = res.data.termPlanDetailInfoList || [];
    } else {
      ElMessage.error(res.msg || "获取学期计划详情失败");
    }
  } catch (error) {
    console.error("获取学期计划详情失败:", error);
  }
};

// 获取课程体系树形数据
const getCourseSystemTree = async () => {
  try {
    const res = await CourseService.getCourseSystemTree();
    if (res.code === 0) {
      treeData.value = res.data || [];
      // 默认展开第一级节点
      if (treeData.value.length > 0) {
        expandedKeys.value = treeData.value.map((item) => item.code);
      }
    } else {
      ElMessage.error(res.msg || "获取课程体系失败");
    }
  } catch (error) {
    console.error("获取课程体系失败:", error);
  }
};

const closeDialog = () => {
  emit("close");
};

onMounted(() => {
  getPlanDetail(props.id);
  // getCourseSystemTree();
});

defineExpose({
  getPlanDetail
});
</script>

<style scoped lang="scss">
.semester-detail {
  padding: 20px;

  .detail-header {
    margin-bottom: 20px;
    text-align: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;

    h2 {
      font-size: 20px;
      font-weight: 500;
      color: #303133;
    }
  }

  .detail-content {
    margin-bottom: 20px;

    .detail-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;

      .detail-row {
        display: flex;
        align-items: center;

        .detail-label {
          width: 100px;
          font-weight: bold;
          color: #606266;
        }

        .detail-value {
          flex: 1;
          color: #303133;
        }
      }
    }

    .detail-table-section {
      h3 {
        font-size: 16px;
        margin-bottom: 15px;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .detail-footer {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
}
</style>
