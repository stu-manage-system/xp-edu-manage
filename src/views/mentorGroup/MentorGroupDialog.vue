<template>
  <el-dialog
    :title="type === 'add' ? '新增导师组' : '编辑导师组'"
    v-model="visibleInner"
    width="900px"
    :close-on-click-modal="false"
    @close="onCancel"
  >
    <el-form
      :model="form"
      label-width="100px"
      :rules="rules"
      ref="formRef"
      v-loading="loading"
    >
      <el-form-item label="班级类型" prop="classType">
        <el-radio-group v-model="form.classType">
          <!-- <el-radio
            v-for="item in classTypeOptions"
            :key="item.code"
            :label="item.code"
            :value="item.code"
            >{{ item.name }}</el-radio
          > -->
          <el-radio label="班级制" value="班级制">班级制</el-radio>
          <el-radio label="跑班制" value="跑班制">跑班制</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="导师组名" prop="groupName">
        <el-input v-model="form.groupName" placeholder="请输入导师组名" />
      </el-form-item>
      <el-form-item label="导师组长" prop="leaderCode">
        <el-select
          v-model="form.leaderCode"
          placeholder="请选择导师组长"
          filterable
          @change="handleLeaderChange"
        >
          <el-option
            v-for="item in mentorOptions"
            :key="item.userCode"
            :label="item.userName"
            :value="item.userCode"
          />
        </el-select>
      </el-form-item>
      <div style="margin-bottom: 12px; font-weight: bold">导师组列表：</div>
      <el-table :data="form.mentorList" border style="margin-bottom: 12px">
        <el-table-column label="组别" type="index" width="80" align="center" />
        <el-table-column label="导师" width="180">
          <template #default="{ row, $index }">
            <el-select
              v-model="row.mentor"
              placeholder="请选择导师"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in mentorOptions"
                :key="item.userCode"
                :label="item.userName"
                :value="item.userCode"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="学生">
          <template #default="{ row, $index }">
            <el-select
              v-model="row.students"
              multiple
              filterable
              collapse-tags
              placeholder="请选择学生"
              style="width: 100%"
            >
              <el-option
                v-for="item in studentOptions"
                :key="item.userCode"
                :label="item.userName"
                :value="item.userCode"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeMentor($index)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-button type="success" @click="addMentor" style="margin-bottom: 16px"
        >添加</el-button
      >
    </el-form>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, defineProps, defineEmits } from "vue";
import { ApiService } from "@/api/apiApi";
import { UserService } from "@/api/usersApi";
import { StudentService } from "@/api/studentApi";

const props = defineProps({
  visible: Boolean,
  type: {
    type: String,
    default: "add"
  },
  editData: {
    type: Object,
    default: null
  }
});
const emit = defineEmits(["update:visible", "save", "cancel"]);
const visibleInner = ref(props.visible);
const loading = ref(false);

const mentorOptions = ref<any[]>([]); // 示例导师
function getMentorOptions() {
  UserService.queryStoreUserList({
    pageNum: 1,
    pageSize: 10000
  }).then((res) => {
    mentorOptions.value = res.data.list;
  });
}
const studentOptions = ref<any[]>([]);
async function getStudentOptions() {
  // TODO 是不是获取全部的学生
  const res = await StudentService.getStuNotPageList({
    gradeClasCode: props.editData?.gradeClassCode
  });
  if (res.code === 0) {
    studentOptions.value = res.data.map((item: any) => item.studentName);
  }
}
const form = reactive({
  classType: "跑班制",
  groupName: "",
  leaderName: "",
  leaderCode: "",
  mentorList: [{ mentor: "", students: [1, 2, 3] }]
});
const rules = {
  groupName: [{ required: true, message: "导师组名不能为空", trigger: "blur" }],
  leaderCode: [
    { required: true, message: "导师组组长不能为空", trigger: "change" }
  ],
  classType: [
    { required: true, message: "班级类型不能为空", trigger: "change" }
  ],
  mentorList: [{ validator: validateMentorList, trigger: "change" }]
};
const formRef = ref();

// 班级类型
const classTypeOptions = ref<{ code: string; name: string }[]>([]);
function getDictConfig() {
  ApiService.getDictConfig("EduClassTypeEnum").then((res) => {
    classTypeOptions.value = res.data;
  });
}

function handleLeaderChange(val: string) {
  form.leaderName = mentorOptions.value.find(
    (item) => item.userCode === val
  )?.userName;
}

function addMentor() {
  form.mentorList.push({ mentor: "", students: [] });
}
function removeMentor(idx: number) {
  form.mentorList.splice(idx, 1);
}

function validateMentorList(rule: any, value: any, callback: any) {
  if (!value || value.length === 0) {
    callback(new Error("导师组成员集合不能为空"));
    return;
  }
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (!item.mentor) {
      callback(new Error(`第${i + 1}组导师不能为空`));
      return;
    }
    if (!item.students || item.students.length === 0) {
      callback(new Error(`第${i + 1}组学生不能为空`));
      return;
    }
  }
  callback();
}

async function onSave() {
  // 校验后emit
  await formRef.value
    .validate()
    .then(() => {
      // 组装relationDTOList
      const relationDTOList = form.mentorList.map((item) => {
        console.log("item", item);
        return {
          userCode: item.mentor, // 导师的编号
          gradeClassCode: item.students, // 直接传递学生数组
          remark: ""
        };
      });
      let params = {
        mentorName: form.groupName,
        mentorLeaderCode: form.leaderCode,
        mentorLeaderName: form.leaderName,
        classType: form.classType,
        relationDTOList
      };
      console.log("params", params);
      // emit("save", params);
    })
    .catch(() => {
      // 校验失败
    });
}

function onCancel() {
  emit("cancel");
}

watch(
  () => props.editData,
  (val) => {
    if (val) {
      form.classType = val.classType || "跑班制";
      form.groupName = val.groupName || "";
      form.leaderName = val.leaderName || "";
      form.mentorList = val.mentorList
        ? JSON.parse(JSON.stringify(val.mentorList))
        : [{ mentor: "", students: [] }];
    } else {
      form.classType = "跑班制";
      form.groupName = "";
      form.leaderName = "";
      form.mentorList = [{ mentor: "", students: [] }];
    }
  },
  { immediate: true }
);
watch(
  () => props.visible,
  async (v) => {
    visibleInner.value = v;
    if (v) {
      loading.value = true;
      await getStudentOptions();
      await getMentorOptions();
      await getDictConfig();
      loading.value = false;
    } else {
      loading.value = false;
    }
  },
  { immediate: true }
);
watch(visibleInner, (v) => emit("update:visible", v));
</script>
