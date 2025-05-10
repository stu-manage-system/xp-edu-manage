<template>
  <div class="teach-feed-form">
    <div class="page-header">
      <div class="header-title">
        {{ route.query.type === "add" ? "新增教学反馈" : "编辑教学反馈" }}
      </div>
      <div class="header-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading"
          >保存</el-button
        >
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="feedback-form"
    >
      <div class="form-grid">
        <el-form-item label="教师" prop="userName">
          <el-select
            v-model="formData.userCode"
            placeholder="请选择教师"
            filterable
            remote
            remote-show-suffix
            clearable
            :remote-method="remoteMethod"
            @change="handleTeacherChange"
          >
            <el-option
              v-for="item in teacherList"
              :key="item.userCode"
              :label="item.userName"
              :value="item.userCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="年级" prop="gradeName">
          <el-select
            v-model="formData.gradeCode"
            placeholder="请选择年级"
            filterable
            clearable
            @change="handleGradeChange"
          >
            <el-option
              v-for="item in gradeList"
              :key="item.gradeCode"
              :label="item.gradeName"
              :value="item.gradeCode"
            />
          </el-select>
        </el-form-item>

        <!-- <el-form-item label="班级" prop="className">
          <el-select
            v-model="formData.classCode"
            placeholder="请选择班级"
            filterable
            clearable
            @change="handleClassChange"
          >
            <el-option
              v-for="item in classList"
              :key="item.classCode"
              :label="item.className"
              :value="item.classCode"
            />
          </el-select>
        </el-form-item> -->

        <el-form-item label="课程体系" prop="curseSystemCode">
          <el-select
            v-model="formData.curseSystemCode"
            placeholder="请选择课程体系"
            filterable
            clearable
          >
            <el-option
              v-for="item in courseSystemList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日期" prop="writeDate">
          <el-date-picker
            v-model="formData.writeDate"
            type="date"
            placeholder="请选择填写日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="本学期第几周" prop="termNumber">
          <el-input-number
            v-model="formData.termNumber"
            :min="1"
            :max="52"
            placeholder="请输入周数"
          />
        </el-form-item>

        <el-form-item
          label="本周所授知识点"
          prop="knowledge"
          class="full-width"
        >
          <el-input
            v-model="formData.knowledge"
            type="textarea"
            placeholder="请输入本周所授知识点"
          />
        </el-form-item>

        <el-form-item label="本学期进度" prop="progressing">
          <el-input-number
            v-model="formData.progressing"
            :min="0"
            :max="100"
            placeholder="请输入进度百分比"
          />
        </el-form-item>

        <el-form-item label="总时长(分钟)" prop="totalTimer">
          <el-input-number
            v-model="formData.totalTimer"
            :min="0"
            placeholder="请输入总时长"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark" class="full-width">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </div>

      <div class="student-section">
        <div class="section-header">
          <h3>周反馈信息</h3>
          <el-button type="primary" @click="addStudent">添加学生</el-button>
        </div>
        <el-scrollbar style="height: 300px">
          <div class="student-table">
            <el-table :data="formData.relationList" border>
              <el-table-column
                label="序号"
                type="index"
                width="80"
                align="center"
              />
              <el-table-column label="学生" width="200">
                <template #default="{ row, $index }">
                  <el-form-item
                    :prop="'relationList.' + $index + '.stuCode'"
                    :rules="{
                      required: true,
                      message: '请选择学生',
                      trigger: 'change'
                    }"
                  >
                    <el-select
                      v-model="row.stuCode"
                      placeholder="请选择学生"
                      filterable
                      clearable
                      @change="(val) => handleStudentChange(val, $index)"
                    >
                      <el-option
                        v-for="item in studentList"
                        :key="item.stuCode"
                        :label="item.stuName"
                        :value="item.stuCode"
                      />
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="表现评分" width="120">
                <template #default="{ row, $index }">
                  <el-form-item
                    :prop="'relationList.' + $index + '.performanceScore'"
                    :rules="{
                      required: true,
                      message: '请输入表现评分',
                      trigger: 'blur'
                    }"
                    class="no-margin"
                  >
                    <el-input-number
                      v-model="row.performanceScore"
                      :min="1"
                      :max="5"
                      placeholder="1-5分"
                      controls-position="right"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="评分原因（低于4必填）">
                <template #default="{ row, $index }">
                  <el-form-item
                    :prop="'relationList.' + $index + '.scoreReason'"
                    :rules="[
                      {
                        required: row.performanceScore < 4,
                        message: '评分低于4分时必须填写原因',
                        trigger: 'blur'
                      }
                    ]"
                    class="no-margin"
                  >
                    <el-input
                      v-model="row.scoreReason"
                      placeholder="请输入评分原因"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="作业结果">
                <template #default="{ row, $index }">
                  <el-form-item
                    :prop="'relationList.' + $index + '.jobResult'"
                    class="no-margin"
                  >
                    <el-input
                      v-model="row.jobResult"
                      placeholder="请输入作业结果"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="考试结果">
                <template #default="{ row, $index }">
                  <el-form-item
                    :prop="'relationList.' + $index + '.testResult'"
                    class="no-margin"
                  >
                    <el-input
                      v-model="row.testResult"
                      placeholder="请输入考试结果"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    @click="removeStudent($index)"
                    v-if="formData.relationList.length > 1"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-scrollbar>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { CourseService } from "@/api/courseApi";
import { UserService } from "@/api/usersApi";
import { debounce } from "lodash";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const emit = defineEmits(["close", "refresh"]);

const formRef = ref(null);
const loading = ref(false);
const teacherList = ref([]);
const courseList = ref([]);
const gradeList = ref([]);
const classList = ref([]);
const studentList = ref([
  { stuCode: "S001", stuName: "张三" },
  { stuCode: "S002", stuName: "李四" },
  { stuCode: "S003", stuName: "王五" }
]);
const courseSystemList = ref([]);

const formData = reactive({
  curseSystemCode: "", // 课程体系编号
  className: "", // 班级名称
  gradeName: "", // 年级名称
  classCode: "", // 班级编号
  termUniqueCode: "", // 唯一编号
  writeDate: "", // 填写日期
  termNumber: "", // 这学期第几周
  courseCode: "", // 课程编号
  courseName: "", // 课程名称
  userCode: "", // 教师编号
  userName: "", // 教师名称
  knowledge: "", // 知识点
  progressing: "", // 进度
  totalTimer: "", // 总时长
  commitTime: "", // 提交日期
  remark: "", // 备注
  relationList: [
    {
      // 关联学生数据
      stuCode: "S001",
      stuName: "11",
      performanceScore: "",
      scoreReason: "",
      jobResult: "",
      testResult: "",
      remark: ""
    },
    {
      // 关联学生数据
      stuCode: "S002",
      stuName: "222",
      performanceScore: "",
      scoreReason: "",
      jobResult: "",
      testResult: "",
      remark: ""
    }
  ]
});

const rules = {
  userName: [{ required: true, message: "请选择教师", trigger: "change" }],
  curseSystemCode: [
    { required: true, message: "请选择课程体系", trigger: "change" }
  ],
  classCode: [{ required: true, message: "请选择班级", trigger: "change" }],
  gradeName: [{ required: true, message: "请选择年级", trigger: "change" }],
  termNumber: [{ required: true, message: "请输入周数", trigger: "blur" }],
  writeDate: [{ required: true, message: "请选择填写日期", trigger: "change" }],
  courseCode: [{ required: true, message: "请选择课程", trigger: "change" }],
  userCode: [{ required: true, message: "请选择教师", trigger: "change" }]
};

// 远程搜索教师
const remoteMethod = debounce(async (query) => {
  if (query) {
    try {
      const res = await UserService.queryStoreUserList({ keyword: query });
      teacherList.value = res.data.list || [];
    } catch (error) {
      console.error("搜索教师失败:", error);
    }
  }
}, 300);

// 远程搜索课程
const remoteMethodCourse = debounce(async (query) => {
  if (query) {
    try {
      const res = await CourseService.queryCourseBasicList({
        courseName: query
      });
      courseList.value = res.data.list || [];
    } catch (error) {
      console.error("搜索课程失败:", error);
    }
  }
}, 300);

// 处理教师选择变化
const handleTeacherChange = (value) => {
  const teacher = teacherList.value.find((item) => item.userCode === value);
  if (teacher) {
    formData.userName = teacher.userName;
  }
};

// 处理年级选择变化
const handleGradeChange = async (value) => {
  const grade = gradeList.value.find((item) => item.gradeCode === value);
  if (grade) {
    formData.gradeName = grade.gradeName;
    // 获取班级列表
    try {
      // TODO: 实际接口替换
      // const res = await ClassService.getClassList({ gradeCode: value });
      // classList.value = res.data || [];
    } catch (error) {
      console.error("获取班级列表失败:", error);
    }
  }
};

// 处理班级选择变化
const handleClassChange = async (value) => {
  const classItem = classList.value.find((item) => item.classCode === value);
  if (classItem) {
    formData.className = classItem.className;

    // 获取班级学生列表
    try {
      // 实际项目中应该调用API
      // const response = await api.getStudentsByClass(value);
      // const studentList = response.data || [];

      // 如果表格为空或只有一行空数据，自动填充所有学生
      if (
        formData.relationList.length === 0 ||
        (formData.relationList.length === 1 &&
          !formData.relationList[0].stuCode)
      ) {
        formData.relationList = studentList.map((student) => ({
          stuCode: student.stuCode,
          stuName: student.stuName,
          performanceScore: "",
          scoreReason: "",
          jobResult: "",
          testResult: "",
          remark: ""
        }));
      }
    } catch (error) {
      console.error("获取班级学生列表失败:", error);
    }
  }
};

// 处理学生选择变化
const handleStudentChange = (value, index) => {
  const student = studentList.value.find((item) => item.stuCode === value);
  if (student) {
    formData.relationList[index].stuName = student.stuName;
  }
};

// 添加学生
const addStudent = () => {
  formData.relationList.push({
    stuCode: "",
    stuName: "",
    performanceScore: "",
    scoreReason: "",
    jobResult: "",
    testResult: "",
    remark: ""
  });
};

// 删除学生
const removeStudent = (index) => {
  formData.relationList.splice(index, 1);
};

// 获取课程体系列表
const getCourseSystemList = async () => {
  try {
    // TODO: 实现获取课程体系列表逻辑
    // const res = await CourseService.getCourseSystemList();
    // courseSystemList.value = res.data || [];
  } catch (error) {
    console.error("获取课程体系列表失败:", error);
  }
};

// 获取年级列表
const getGradeList = async () => {
  try {
    // TODO: 实现获取年级列表逻辑
    // const res = await GradeService.getList();
    // gradeList.value = res.data || [];
  } catch (error) {
    console.error("获取年级列表失败:", error);
  }
};

// 获取详情
const getDetail = async () => {
  if (!route.query.id) return;
  try {
    // TODO: 实现获取详情逻辑
    // const res = await TeachFeedService.getDetail(route.query.id);
    // Object.assign(formData, res.data);
  } catch (error) {
    console.error("获取详情失败:", error);
  }
};

// 取消
const handleCancel = () => {
  router.back();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    // 设置提交时间
    formData.commitTime = new Date().toISOString().split("T")[0];

    // 设置唯一编号
    formData.termUniqueCode = `${formData.courseCode}_${formData.termNumber}`;

    // TODO: 实现提交逻辑
    // const api = route.query.type === 'add' ? TeachFeedService.add : TeachFeedService.update;
    // await api(formData);

    ElMessage.success(route.query.type === "add" ? "新增成功" : "编辑成功");
    router.push("/teach-feed");
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getCourseSystemList();
  getGradeList();
  if (route.query.type === "edit" && route.query.id) {
    getDetail();
  }
});
</script>

<style lang="scss" scoped>
.teach-feed-form {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 48px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);

    .header-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .feedback-form {
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 32px;
      padding: 24px;
      background: var(--el-fill-color-blank);
      border-radius: 8px;
      border: 1px solid var(--el-border-color-lighter);

      :deep(.el-form-item) {
        margin-bottom: 0;

        &.full-width {
          grid-column: span 2;
        }

        .el-form-item__label {
          font-weight: 500;
          color: var(--el-text-color-regular);
        }

        .el-select,
        .el-input,
        .el-input-number,
        .el-date-picker {
          width: 100%;
        }

        .el-input-number {
          .el-input__wrapper {
            width: 100%;
          }
        }

        .el-textarea__inner {
          min-height: 80px;
        }
      }
    }
  }

  .student-section {
    padding: 24px;
    background: var(--el-fill-color-blank);
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .student-table {
      :deep(.el-table) {
        border-radius: 4px;
        overflow: hidden;

        .el-table__header {
          th {
            background-color: var(--el-fill-color-light);
            color: var(--el-text-color-primary);
            font-weight: 600;
          }
        }

        .el-table__body {
          td {
            padding: 12px 0;
          }
        }

        .el-form-item {
          margin: 0;

          .el-form-item__content {
            width: 100%;
            margin-left: 0 !important;
          }

          .el-form-item__label {
            display: none;
          }
        }

        .el-input-number {
          width: 100%;
        }

        .el-button {
          padding: 4px 0;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
