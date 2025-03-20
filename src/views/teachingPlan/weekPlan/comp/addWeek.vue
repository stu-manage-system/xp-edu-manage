<template>
  <div class="add-week-container">
    <el-form :model="formData" label-width="80px">
      <el-form-item label="教师" required>
        <el-select v-model="formData.teacher" placeholder="请选择教师">
          <el-option label="李蓉" value="李蓉" />
        </el-select>
      </el-form-item>

      <el-form-item label="年级" required>
        <el-select v-model="formData.grade" placeholder="请选择年级">
          <el-option label="请选择年级" value="" />
        </el-select>
      </el-form-item>

      <el-form-item label="班级" required>
        <el-select v-model="formData.class" placeholder="请选择班级">
          <el-option label="请选择班级" value="" />
        </el-select>
      </el-form-item>

      <el-form-item label="开始日期" required>
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>

      <el-form-item label="结束日期" required>
        <el-date-picker
          v-model="formData.endDate"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>

      <el-form-item label="课程体系" required>
        <el-select v-model="formData.courseSystem" placeholder="请选择课程体系">
          <el-option label="请选择课程体系" value="" />
        </el-select>
      </el-form-item>

      <el-form-item label="计划明细">
        <div class="plan-detail">
          <div class="detail-header">
            <span>序号</span>
            <span>周几</span>
            <span>课时</span>
            <span>内容</span>
            <span>操作</span>
          </div>
          <div
            v-for="(item, index) in formData.planList"
            :key="index"
            class="detail-item"
          >
            <span>{{ index + 1 }}</span>
            <el-input v-model="item.weekday" placeholder="请输入周几" />
            <el-input v-model="item.period" placeholder="请输入课时" />
            <el-input
              v-model="item.content"
              placeholder="请输入内容"
              type="textarea"
              :rows="2"
            />
            <div class="time-slot-delete" v-if="formData.planList.length > 1">
              <el-button
                type="danger"
                :icon="Delete"
                link
                @click="deletePlanItem(index)"
              >
              </el-button>
            </div>
          </div>
          <el-button type="success" @click="addPlanItem">添加</el-button>
        </div>
      </el-form-item>

      <el-form-item label="作业">
        <el-input
          v-model="formData.homework"
          type="textarea"
          placeholder="请输入作业"
          :maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="进度">
        <el-input v-model="formData.progress" placeholder="请输入进度" />
      </el-form-item>

      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Delete } from "@element-plus/icons-vue";
import { reactive } from "vue";
import { FormData } from "../contant";
const formData = reactive<FormData>({
  teacher: "",
  grade: "",
  class: "",
  startDate: "",
  endDate: "",
  courseSystem: "",
  planList: [{ weekday: "", period: "", content: "" }],
  homework: "",
  progress: ""
});

const addPlanItem = () => {
  formData.planList.push({ weekday: "", period: "", content: "" });
};

const deletePlanItem = (index: number) => {
  formData.planList.splice(index, 1);
};

const save = () => {
  console.log("保存数据：", formData);
};

const cancel = () => {
  // 实现取消逻辑
};
</script>

<style scoped lang="scss">
.add-week-container {
  padding: 20px;

  :deep(.el-select),
  :deep(.el-date-picker),
  :deep(.el-input) {
    width: 320px; // 统一设置所有输入框宽度
  }
}

.time-slot-delete {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}
.plan-detail {
  border: 1px solid #dcdfe6;
  padding: 10px;
  border-radius: 4px;
}

.detail-header {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 2fr 80px;
  gap: 10px;
  padding: 10px 0;
  font-weight: bold;
}

.detail-item {
  display: grid;
  grid-template-columns: 60px 120px 120px 2fr 80px;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;

  :deep(.el-textarea .el-input__wrapper) {
    height: 42px;
    padding-top: 1px;
    padding-bottom: 1px;
  }

  :deep(.el-input) {
    width: 100%;
  }
}
</style>
