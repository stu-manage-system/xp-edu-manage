<template>
  <div class="add-semester">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="学期名称" prop="termName">
        <el-input v-model="formData.termName" placeholder="请输入学期名称" />
      </el-form-item>

      <el-form-item label="日期">
        <el-date-picker
          v-model="formData.dateTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY/MM/DD"
        />
      </el-form-item>

      <el-form-item label="教师" prop="userCode" required>
        <el-input v-model="formData.userCode" placeholder="请输入教师编号" />
      </el-form-item>

      <el-form-item label="课程体系" prop="gradeName" required>
        <el-input v-model="formData.gradeName" placeholder="请输入课程体系" />
      </el-form-item>

      <div class="plan-table">
        <div class="table-header">
          <span>学期计划明细</span>
        </div>
        <el-table :data="tableData" border>
          <el-table-column
            label="序号"
            type="index"
            width="70"
            align="center"
          />
          <el-table-column label="月" prop="month" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.month" placeholder="请输入月" />
            </template>
          </el-table-column>
          <el-table-column label="周" prop="termNumber" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.termNumber" placeholder="请输入周" />
            </template>
          </el-table-column>
          <el-table-column label="时间段" width="300" align="center">
            <template #default="scope">
              <el-time-picker
                v-model="scope.row.timeRange"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="HH:mm"
                style="width: 260px"
              />
            </template>
          </el-table-column>
          <el-table-column label="课次" prop="subjectCount" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.subjectCount" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column label="内容" prop="subjectContext" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.subjectContext"
                type="textarea"
                placeholder="请输入"
              />
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.remark"
                type="textarea"
                placeholder="请输入"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                @click="deleteRow(scope.$index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <div class="table-footer">
          <el-button type="primary" @click="addRow">添加</el-button>
        </div>
      </div>

      <div class="form-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const formRef = ref(null);
const formData = reactive({
  termName: "",
  dateTime: [],
  userCode: "",
  gradeName: ""
});

const rules = {
  termName: [{ required: true, message: "请输入学期名称", trigger: "blur" }],
  userCode: [{ required: true, message: "请输入教师编号", trigger: "blur" }],
  gradeName: [{ required: true, message: "请输入年级名称", trigger: "blur" }],
  className: [{ required: true, message: "请输入班级名称", trigger: "blur" }],
  subjectName: [{ required: true, message: "请输入科目名称", trigger: "blur" }],
  termCode: [{ required: true, message: "请输入学期编号", trigger: "blur" }]
};

const tableData = ref([
  {
    month: "",
    termNumber: "",
    timeRange: [],
    subjectCount: "",
    subjectContext: "",
    remark: ""
  }
]);

const addRow = () => {
  tableData.value.push({
    month: "",
    termNumber: "",
    timeRange: [],
    subjectCount: "",
    subjectContext: "",
    remark: ""
  });
};

const deleteRow = (index) => {
  tableData.value.splice(index, 1);
};

const save = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      // 保存逻辑
      console.log("保存成功", formData, tableData.value);
    }
  });
};

const cancel = () => {
  // 取消逻辑
  formData.termName = "";
  formData.dateTime = [];
  formData.userCode = "";
  formData.gradeName = "";
  tableData.value = [];
  emit("close");
};
</script>

<style scoped>
.add-semester {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.el-form {
  .el-form-item {
    width: 100%;
    max-width: 400px; /* 限制表单项的最大宽度 */

    .el-input,
    .el-date-picker,
    .el-select {
      width: 100%;
    }
  }
}

.plan-table {
  margin: 20px 0;

  .el-table {
    width: 100%;
    margin-top: 10px;

    /* 调整表格内输入框的宽度 */
    .el-input {
      width: 100%;
    }

    /* 调整时间选择器的宽度 */
    .el-time-picker {
      width: 100%;
    }

    /* 调整文本域的高度 */
    .el-textarea__inner {
      min-height: 32px;
    }
  }
}

.table-header {
  margin-bottom: 10px;
  font-weight: bold;
}

.table-footer {
  margin-top: 10px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}
</style>
