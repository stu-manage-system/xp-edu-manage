<template>
  <div class="page-content">
    <el-row>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-input v-model="searchForm.courseName" placeholder="课程名称" clearable></el-input>
      </el-col>
      <div style="width: 12px"></div>
      <el-col :xs="24" :sm="12" :lg="6" class="el-col2">
        <el-button @click="search">搜索</el-button>
        <el-button @click="showDialog('add', {})">新增课程</el-button>
      </el-col>
    </el-row>

    <art-table :data="tableData" :total="total" :current-page="currentPage" :page-size="pageSize" :loading="isLoading"
      @page-change="handlePageChange" @size-change="handleSizeChange">
      <template #default>
        <el-table-column label="课程名称" prop="courseName" width="150" />
        <el-table-column label="课程地点" prop="courseSite" width="120" />
        <!-- <el-table-column label="课程类型" prop="courseType" width="120">
          <template #default="{ row }">
            {{ row.courseType === "1" ? "团体课" : "私教课" }}
          </template>
</el-table-column>
<el-table-column label="课程规则" prop="courseRule" width="120">
  <template #default="{ row }">
            {{ row.courseRule === "1" ? "周期课" : "套餐课" }}
          </template>
</el-table-column>
<el-table-column label="课程策略" prop="courseStrategy" width="120">
  <template #default="{ row }">
            {{ row.courseStrategy === "1" ? "固定教练" : "不固定教练" }}
          </template>
</el-table-column> -->
        <el-table-column label="课程时长" prop="courseDuration" width="100">
          <template #default="{ row }"> {{ row.courseDuration }}分钟 </template>
        </el-table-column>
        <!-- <el-table-column label="课程数量" prop="courseCount" width="100">
          <template #default="{ row }"> {{ row.courseCount }}节 </template>
        </el-table-column> -->
        <el-table-column label="单课价格" prop="coursePrice" width="100">
          <template #default="{ row }"> ¥{{ row.coursePrice }} </template>
        </el-table-column>
        <el-table-column label="课程总价" prop="courseTotalPrice" width="100">
          <template #default="{ row }"> ¥{{ row.courseTotalPrice }} </template>
        </el-table-column>
        <el-table-column label="有效天数" prop="validDays" width="110">
          <template #default="{ row }"> {{ row.validDays }}天 </template>
        </el-table-column>
        <el-table-column label="课程强度" prop="courseIntensity" width="150">
          <template #default="{ row }">
            <el-rate v-model="row.courseIntensity" disabled show-score text-color="#ff9900" :max="5" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="课程图片" prop="picture" width="120">
          <template #default="{ row }">
            <el-image v-if="row.picture" :src="row.picture" :preview-src-list="[row.picture]" fit="cover"
              class="table-image" />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" width="120" /> -->
        <el-table-column label="创建人" prop="creator" width="100" />
        <el-table-column label="创建时间" prop="createTime" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime, "YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="240" #default="scope">
          <el-button link :icon="View" type="success" @click="showPermissionDialog(scope.row)">
            详情
          </el-button>
          <el-button link :icon="EditPen" type="primary" @click="showDialog('edit', scope.row)">
            编辑
          </el-button>
          <el-button link :icon="Delete" style="color: #fa6962" @click="deleteRole(scope.row)">
            删除
          </el-button>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增课程' : '编辑课程'" width="70%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="form.courseName" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程地点" prop="courseSite">
              <el-input v-model="form.courseSite" placeholder="请输入课程地点" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程类型" prop="courseType">
              <el-select v-model="form.courseType" placeholder="请选择课程类型" style="width: 100%">
                <el-option v-for="item in typeConfig" :label="item.label" :value="item.value"
                  :key="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程规则" prop="courseRule">
              <el-select v-model="form.courseRule" placeholder="请选择课程规则" style="width: 100%">
                <el-option v-for="item in ruleConfig" :label="item.label" :value="item.value"
                  :key="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程时长" prop="courseDuration">
              <el-input v-model="form.courseDuration" placeholder="请输入课程时长">
                <template #append>分钟</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单课价格" prop="coursePrice">
              <el-input-number v-model="form.coursePrice" :min="1" :precision="2" :step="0.1" :controls="true"
                placeholder="请输入单课价格" style="width: 100%">
                <template #prefix>¥</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <template v-if="form.courseRule === 'CLASS_RULE'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="课程策略" prop="courseStrategy">
                <el-select v-model="form.courseStrategy" placeholder="请选择课程策略" style="width: 100%">
                  <el-option v-for="item in strategyConfig" :label="item.label" :value="item.value"
                    :key="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="课程数量" prop="courseCount">
                <el-input-number v-model="form.courseCount" :min="1" :controls="true" placeholder="请输入课程数量"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程总价" prop="courseTotalPrice">
              <el-input-number v-model="form.courseTotalPrice" :min="1" :precision="2" :step="0.1" :controls="true"
                placeholder="请输入课程总价" style="width: 100%">
                <template #prefix>¥</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效天数" prop="validDays">
              <el-input-number v-model="form.validDays" :min="1" :controls="true" placeholder="请输入课程有效期"
                style="width: 100%">
                <template #prefix>天</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程强度" prop="courseIntensity">
          <el-rate v-model="form.courseIntensity" show-score text-color="#ff9900" :max="5" />
        </el-form-item>

        <el-form-item label="课程图片" prop="picture">
          <el-upload class="avatar-uploader" action="/api/upload" :show-file-list="false"
            :on-success="handleAvatarSuccess">
            <img v-if="form.picture" :src="form.picture" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialog" title="课程详情" width="80%">
      <el-skeleton :loading="loading" animated :rows="6">
        <template #default>
          <div class="permission-detail">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="课程名称" label-class-name="my-label">
                {{ form.courseName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="课程地点" label-class-name="my-label">
                {{ form.courseSite || "-" }}
              </el-descriptions-item>

              <el-descriptions-item label="课程类型" label-class-name="my-label">
                {{ form.courseTypeName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="课程规则" label-class-name="my-label">
                {{ form.courseRuleName || "-" }}
              </el-descriptions-item>

              <el-descriptions-item label="课程策略" label-class-name="my-label" v-if="form.courseStrategy">
                {{ form.courseStrategyName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="课程时长" label-class-name="my-label">
                {{ form.courseDuration || "-" }}分钟
              </el-descriptions-item>

              <el-descriptions-item label="课程数量" label-class-name="my-label" v-if="form.courseCount">
                {{ form.courseCount || "-" }}节
              </el-descriptions-item>
              <el-descriptions-item label="单课价格" label-class-name="my-label">
                ¥{{ form.coursePrice || "-" }}
              </el-descriptions-item>

              <el-descriptions-item label="课程总价" label-class-name="my-label">
                ¥{{ form.courseTotalPrice || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="有效天数" label-class-name="my-label">
                {{ form.validDays || "-" }}天
              </el-descriptions-item>

              <el-descriptions-item label="课程强度" label-class-name="my-label">
                <el-rate v-model="form.courseIntensity" disabled show-score text-color="#ff9900" :max="5" />
              </el-descriptions-item>

              <el-descriptions-item label="课程图片" :span="2" label-class-name="my-label">
                <img v-if="form.picture" :src="form.picture" class="detail-image" />
              </el-descriptions-item>
              <el-descriptions-item label="创建人" label-class-name="my-label">
                {{ form.creator || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间" :span="2" label-class-name="my-label">
                {{ formatDate(form.createTime, "YYYY-MM-DD HH:mm:ss") }}
              </el-descriptions-item>

              <el-descriptions-item label="备注" :span="2" label-class-name="my-label">
                {{ form.remark || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </el-skeleton>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Delete, EditPen, View } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { UserService } from "@/api/courseApi"
import { ApiService } from "@/api/apiApi"
import { nextTick, ref, watch } from "vue"
import { formatDate } from "@/utils/utils"

const dialogVisible = ref(false)
const permissionDialog = ref(false)
const searchForm = reactive({
  courseName: ""
})

const form = ref({
  courseCode: "",
  courseName: "",
  courseSite: "",
  courseType: "",
  courseRule: "",
  courseStrategy: "",
  courseDuration: "",
  courseCount: 0,
  coursePrice: 0,
  courseTotalPrice: 0,
  validDays: 1,
  courseIntensity: 0,
  picture: "",
  remark: "",
  creator: "",
  createTime: ""
})

const dialogType = ref("add")
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(true)
const loading = ref(true)
const tableData = ref([])
// 列表接口
const getCourseList = async (pageNo = 1, pageSize = 10) => {
  isLoading.value = true
  const data = {
    pageNo,
    pageSize,
    ...searchForm
  }
  const res = await UserService.queryCourseList(data)
  if (res.code === 0) {
    isLoading.value = false
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const search = () => {
  currentPage.value = 1
  getCourseList(1, pageSize.value)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  getCourseList(page, pageSize.value)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  getCourseList(currentPage.value, size)
}
// 添加转换函数
const convertLabelToValue = (label: string, options: any[]) => {
  return options.find((item) => item.label === label)?.value
}

const initForm = () => {
  form.value = {
    courseCode: "",
    courseName: "",
    courseSite: "",
    courseType: "",
    courseRule: "",
    courseStrategy: "",
    courseDuration: "",
    courseCount: 0,
    coursePrice: 0,
    courseTotalPrice: 0,
    validDays: 1,
    courseIntensity: 0,
    picture: "",
    remark: "",
    creator: "",
    createTime: ""
  }
}
// 获取详情接口
const getRoleDetail = async (courseCode: string) => {
  const res = await UserService.queryCourseDetail(courseCode)
  if (res.code === 0) {
    const formData = res.data
    form.value = formData
  }
}
const addDisabled = (data: any) => {
  data.forEach((item: any) => {
    item.disabled = true
    if (item.children && item.children.length > 0) {
      addDisabled(item.children)
    }
  })
}
// 显示详情
const showPermissionDialog = async (row: { courseCode: string }) => {
  loading.value = true
  permissionDialog.value = true
  dialogType.value = ""
  await getRoleDetail(row.courseCode)
  loading.value = false
}
const showDialog = (type: string, row: any) => {
  dialogVisible.value = true
  dialogType.value = type
  nextTick(() => {
    if (type === "edit") {
      getRoleDetail(row.courseCode)
    } else {
      initForm()
    }
    formRef.value?.resetFields()
  })
}

const deleteRole = async (row: any) => {
  try {
    ElMessageBox.confirm("确定删除该课程吗？", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(async () => {
      try {
        const res = await UserService.deleteCourse(row.courseCode)
        if (res.code === 0) {
          ElMessage.success("删除成功")
          getCourseList()
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试")
      }
    })
  } catch (err) {
    console.log("删除取消", err)
  }
}

// 添加表单校验规则
const rules = {
  courseName: [
    { required: true, message: "请输入课程名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  courseSite: [{ required: true, message: "请输入课程地点", trigger: "blur" }],
  courseType: [
    { required: true, message: "请选择课程类型", trigger: "change" }
  ],
  courseRule: [
    { required: true, message: "请选择课程规则", trigger: "change" }
  ],
  courseStrategy: [
    { required: true, message: "请选择课程策略", trigger: "change" }
  ],
  courseDuration: [
    { required: true, message: "请输入课程时长", trigger: "blur" }
  ],
  courseCount: [{ required: true, message: "请输入课程数量", trigger: "blur" }],
  coursePrice: [{ required: true, message: "请输入单课价格", trigger: "blur" }],
  courseTotalPrice: [
    { required: true, message: "请输入课程总价", trigger: "blur" }
  ],
  validDays: [{ required: true, message: "请输入课程有效期", trigger: "blur" }],
  courseIntensity: [
    { required: true, message: "请选择课程强度", trigger: "change" }
  ]
  // picture: [{ required: true, message: "请上传课程图片", trigger: "blur" }]
}

// 获取表单ref
const formRef = ref()
// 修改提交按钮处理
const handleSubmit = async () => {
  let checked: any = []
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // TODO: 调用提交接口
      const data = {
        ...form.value
      }
      const res =
        dialogType.value === "add"
          ? await UserService.addCourse(data)
          : await UserService.updateCourse(data)
      if (res.code === 0) {
        ElMessage.success(dialogType.value === "add" ? "添加成功" : "编辑成功")
        dialogVisible.value = false
        getCourseList()
      }
    }
  })
}

// 添加类型定义
interface ConfigItem {
  label: string
  value: string
}

// 修改ref定义
const typeConfig = ref<ConfigItem[]>([])
const ruleConfig = ref<ConfigItem[]>([])
const strategyConfig = ref<ConfigItem[]>([])
const getDictConfig = async () => {
  const res = await ApiService.getDictConfig("courseTypeEnum")
  const data = await ApiService.getDictConfig("courseRuleEnum")
  const strategy = await ApiService.getDictConfig("courseStrategyEnum")
  typeConfig.value = res.data
  ruleConfig.value = data.data
  strategyConfig.value = strategy.data
}

const handleAvatarSuccess = (response: any) => {
  form.value.picture = response.url
}

// 使用 watchEffect 监听表单变化
watchEffect(() => {
  const { courseCount, coursePrice, courseRule } = form.value
  if (courseRule === "TIME_RULE") {
    // 时间范围
    form.value.courseCount = 0
    form.value.courseTotalPrice = Number(coursePrice)
  } else if (courseRule === "CLASS_RULE") {
    // 课时数
    form.value.courseTotalPrice = Number((courseCount * coursePrice).toFixed(2))
  }
})

onMounted(() => {
  getCourseList()
  getDictConfig()
})
</script>

<style lang="scss" scoped>
.page-content {
  .svg-icon {
    width: 1.8em;
    height: 1.8em;
    overflow: hidden;
    vertical-align: -8px;
    fill: currentcolor;
  }
}

.permission-detail {
  padding: 20px;

  :deep(.el-descriptions__cell) {
    padding: 16px;
  }

  :deep(.el-descriptions__label) {
    width: 120px;
    font-weight: bold;
    background-color: #f5f7fa;
  }

  .detail-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
  }

  :deep(.my-label) {
    background-color: #f5f7fa;
    font-weight: 700 !important;
  }
}

:deep(.el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

/* 骨架屏样式 */
:deep(.el-skeleton) {
  padding: 20px;
}

:deep(.my-label) {
  font-weight: 700 !important;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

.el-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 20px;

  :deep(.el-form-item) {
    margin-bottom: 22px; // 统一表单项间距
  }

  :deep(.el-select),
  :deep(.el-input-number) {
    width: 100%; // 确保选择器和数字输入框宽度一致
  }
}

.el-row {
  margin-bottom: 0; // 移除行间距，使用表单项间距控制
}

.table-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
