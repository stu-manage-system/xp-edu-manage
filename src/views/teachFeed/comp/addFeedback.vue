<template>
  <div class="add-feedback">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="feedback-form"
    >
      <el-form-item label="反馈教师" prop="userName">
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

      <el-form-item label="班级" prop="className">
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
      </el-form-item>

      <el-form-item label="课程" prop="courseName">
        <el-select
          v-model="formData.courseCode"
          placeholder="请选择课程"
          filterable
          remote
          remote-show-suffix
          clearable
          :remote-method="remoteMethodCourse"
          @change="handleCourseChange"
        >
          <el-option
            v-for="item in courseList"
            :key="item.courseCode"
            :label="item.courseName"
            :value="item.courseCode"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="本学期第几周" prop="termNumber">
        <el-input-number
          v-model="formData.termNumber"
          :min="1"
          :max="52"
          placeholder="请输入周数"
        />
      </el-form-item>

      <el-form-item label="填写日期" prop="writeDate">
        <el-date-picker
          v-model="formData.writeDate"
          type="date"
          placeholder="请选择填写日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="本周所授知识点" prop="knowledge">
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

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>

      <el-divider>学生反馈信息</el-divider>

      <div
        v-for="(student, index) in formData.relationList"
        :key="index"
        class="student-feedback"
      >
        <el-divider>学生 {{ index + 1 }}</el-divider>
        <el-form-item
          :label="'学生'"
          :prop="'relationList.' + index + '.stuCode'"
          :rules="{ required: true, message: '请选择学生', trigger: 'change' }"
        >
          <el-select
            v-model="student.stuCode"
            placeholder="请选择学生"
            filterable
            clearable
            @change="(val) => handleStudentChange(val, index)"
          >
            <el-option
              v-for="item in studentList"
              :key="item.stuCode"
              :label="item.stuName"
              :value="item.stuCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="'表现评分'"
          :prop="'relationList.' + index + '.performanceScore'"
          :rules="{
            required: true,
            message: '请输入表现评分',
            trigger: 'blur'
          }"
        >
          <el-input-number
            v-model="student.performanceScore"
            :min="1"
            :max="5"
            placeholder="请输入表现评分(1-5分)"
          />
        </el-form-item>

        <el-form-item
          :label="'评分原因'"
          :prop="'relationList.' + index + '.scoreReason'"
          :rules="[
            {
              required: student.performanceScore < 4,
              message: '评分低于4分时必须填写原因',
              trigger: 'blur'
            }
          ]"
        >
          <el-input
            v-model="student.scoreReason"
            type="textarea"
            placeholder="请输入评分原因"
          />
        </el-form-item>

        <el-form-item
          :label="'作业结果'"
          :prop="'relationList.' + index + '.jobResult'"
        >
          <el-input v-model="student.jobResult" placeholder="请输入作业结果" />
        </el-form-item>

        <el-form-item
          :label="'考试结果'"
          :prop="'relationList.' + index + '.testResult'"
        >
          <el-input v-model="student.testResult" placeholder="请输入考试结果" />
        </el-form-item>

        <el-form-item
          :label="'备注'"
          :prop="'relationList.' + index + '.remark'"
        >
          <el-input
            v-model="student.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>

        <el-button
          type="danger"
          @click="removeStudent(index)"
          v-if="formData.relationList.length > 1"
        >
          删除该学生
        </el-button>
      </div>

      <el-button type="primary" @click="addStudent">添加学生</el-button>
    </el-form>

    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading"
        >确定</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { CourseService } from "@/api/courseApi";
import { UserService } from "@/api/usersApi";
import { debounce } from "lodash";

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  id: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(["close", "refresh"]);

const formRef = ref(null);
const loading = ref(false);
const teacherList = ref([]);
const courseList = ref([]);
const gradeList = ref([]);
const classList = ref([]);
const studentList = ref([]);
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
      stuCode: "",
      stuName: "",
      performanceScore: "",
      scoreReason: "",
      jobResult: "",
      testResult: "",
      remark: ""
    }
  ]
});

const rules = {
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
    // TODO: 获取班级列表
    // const res = await ClassService.getClassList({ gradeCode: value });
    // classList.value = res.data || [];
  }
};

// 处理班级选择变化
const handleClassChange = (value) => {
  const classItem = classList.value.find((item) => item.classCode === value);
  if (classItem) {
    formData.className = classItem.className;
    // TODO: 获取班级学生列表
    // const res = await StudentService.getStudentList({ classCode: value });
    // studentList.value = res.data || [];
  }
};

// 处理课程选择变化
const handleCourseChange = (value) => {
  const course = courseList.value.find((item) => item.courseCode === value);
  if (course) {
    formData.courseName = course.courseName;
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
  if (!props.id) return;
  try {
    // TODO: 实现获取详情逻辑
    // const res = await TeachFeedService.getDetail(props.id);
    // Object.assign(formData, res.data);
  } catch (error) {
    console.error("获取详情失败:", error);
  }
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
    // const api = props.type === 'add' ? TeachFeedService.add : TeachFeedService.update;
    // await api(formData);

    ElMessage.success(props.type === "add" ? "新增成功" : "编辑成功");
    emit("refresh");
    emit("close");
  } catch (error) {
    console.error("提交失败:", error);
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  emit("close");
};

onMounted(() => {
  getCourseSystemList();
  getGradeList();
  if (props.type === "edit") {
    getDetail();
  }
});
</script>

<style lang="scss" scoped>
.add-feedback {
  padding: 20px;

  .feedback-form {
    max-width: 800px;
    margin: 0 auto;
  }

  .form-footer {
    text-align: center;
    margin-top: 20px;
  }

  .student-feedback {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }
}
</style>
