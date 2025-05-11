<template>
  <div class="semester-detail">
    <div class="detail-header">
      <h2>成绩详情</h2>
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
          <div class="detail-label">课程体系：</div>
          <div class="detail-value">{{ planInfo.courseSystemName || "-" }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">考试阶段：</div>
          <div class="detail-value">{{ planInfo.examName || "-" }}</div>
        </div>
      </div>

      <div class="detail-table-section">
        <h3>成绩明细</h3>
        <el-table :data="planDetailList" stripe border>
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          />
          <el-table-column label="姓名" prop="stuName" align="center" />
          <el-table-column label="成绩" prop="score" align="center" />
          <el-table-column label="等级" prop="level" align="center" />
          <el-table-column label="评语" prop="comment" align="center" />
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
import { ScoreService } from "@/api/score";
import { ElMessage } from "element-plus";

const props = defineProps({
  id: {
    type: [String, Number],
    default: ""
  }
});

const emit = defineEmits(["close"]);

const planInfo = ref({});
const planDetailList = ref([]);

// 获取学期计划详情
const getPlanDetail = async () => {
  if (!props.id) return;

  try {
    const res = await ScoreService.getScoreDetail({
      uniqueCode: props.id
    });
    if (res.code === 0) {
      planInfo.value = res.data || {};
      planDetailList.value = res.data.relationDTOList || [];
    } else {
      ElMessage.error(res.msg || "获取学期计划详情失败");
    }
  } catch (error) {
    console.error("获取学期计划详情失败:", error);
  }
};

const closeDialog = () => {
  emit("close");
};

onMounted(() => {
  getPlanDetail(props.id);
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
