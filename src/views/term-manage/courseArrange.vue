<template>
  <div class="schedule-container">
    <div class="header">
      <el-row :gutter="15">
        <el-col :xs="24" :sm="12" :lg="6" style="width: 600px">
          <el-select
            v-model="termCode"
            placeholder="请选择学期"
            class="form-input"
            @change="handleTermCodeChange"
          >
            <el-option
              v-for="item in termList"
              :key="item.termCode"
              :label="item.termName"
              :value="item.termCode"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-select
            v-model="termUniqueCode"
            placeholder="请选择周"
            class="form-input"
            :disabled="!termCode"
          >
            <el-option
              v-for="item in weekList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-select
            v-model="classCode"
            placeholder="请选择年级"
            class="form-input"
            @change="handleClassCodeChange"
            :disabled="!termUniqueCode"
          >
            <el-option
              v-for="item in gradeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="4">
          <!-- <el-button plain @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="handleAdd">新增</el-button> -->
        </el-col>
      </el-row>
    </div>
    <div class="schedule-table">
      <!-- <el-scrollbar height="100%"> -->
      <div class="no-data" v-if="!classCode"></div>
      <el-table v-else :data="scheduleData" border style="width: 100%">
        <!-- 课时列 -->
        <el-table-column
          prop="classSettingName"
          label="课时"
          width="350"
          fixed="left"
        >
          <template #default="{ row }">
            <div class="time-slot-cell">
              <span>{{ row.classSettingName }}</span>
              <div class="time-range">
                <el-time-picker
                  v-model="row.timeRange[0]"
                  value-format="HH:mm"
                  placeholder="开始时间"
                  size="small"
                  style="width: 120px"
                  disabled
                />
                <span class="separator">-</span>
                <el-time-picker
                  v-model="row.timeRange[1]"
                  value-format="HH:mm"
                  placeholder="结束时间"
                  size="small"
                  style="width: 120px"
                  disabled
                />
              </div>
              <!-- <el-select
                v-if="row.isActivity"
                v-model="row.activity"
                placeholder="选择活动"
                size="small"
                class="activity-select"
              >
                <el-option label="早自习" value="morning_study" />
                <el-option label="午休" value="noon_break" />
                <el-option label="课外活动" value="extra_activity" />
                <el-option label="班会" value="class_meeting" />
                <el-option label="升旗仪式" value="flag_raising" />
              </el-select> -->
            </div>
          </template>
        </el-table-column>

        <!-- 星期几的列 -->
        <el-table-column
          v-for="(day, idx) in weekDays"
          :key="day.value"
          min-width="200"
        >
          <template #header>
            <div
              style="display: flex; flex-direction: column; align-items: center"
            >
              <span
                :class="
                  weekDates[idx] === route.query.startTime ? 'active' : ''
                "
                >{{ day.label }}</span
              >
              <span
                style="font-size: 12px; color: #888"
                :class="
                  weekDates[idx] === route.query.startTime ? 'active' : ''
                "
              >
                {{ weekDates[idx] || "" }}
              </span>
            </div>
          </template>
          <template #default="{ row, $index: rowIndex }">
            <div class="course-cell" v-if="!row.isActivity">
              <el-select
                v-model="row[day.value].courseCode"
                placeholder="课程"
                size="small"
                @change="handleChange($event, rowIndex, day.value, 'course')"
                disabled
              >
                <el-option
                  v-for="course in courseList"
                  :key="course.courseCode"
                  :label="course.courseName"
                  :value="course.courseCode"
                />
              </el-select>
              <el-input
                v-model="row[day.value].userName"
                placeholder="教师"
                size="small"
                readonly
                disabled
                @click="handleSelectTeacher(rowIndex, day.value)"
              >
              </el-input>
              <el-select
                v-model="row[day.value].roomCode"
                placeholder="教室"
                size="small"
                disabled
                @change="handleChange($event, rowIndex, day.value, 'room')"
              >
                <el-option
                  v-for="room in roomList"
                  :key="room.roomCode"
                  :label="room.roomName"
                  :value="room.roomCode"
                />
              </el-select>
            </div>
            <div v-else class="activity-cell">
              <!-- {{ isDayDisabled(day.value) ? "暂无活动" : row.activity }} -->
              {{ isDayDisabled(day.value) ? "暂无活动" : "活动课" }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- </el-scrollbar> -->
    </div>
    <SelectTeacher
      ref="selectTeacherRef"
      :multiple="false"
      @confirm="(teacher) => handleTeacherSelected(teacher, currentCell)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CourseService } from "@/api/courseApi";
import SelectTeacher from "@/components/user/select.vue";
import { ClassRoomService } from "@/api/classRoom";
import { GradeService } from "@/api/gradeApi";
import { CourseArrangeService } from "@/api/courseArrange";
import { TermService } from "@/api/termApi";
const currentDateTime = ref("");
const route = useRoute();
// 更新当前时间
const updateDateTime = () => {
  const now = new Date();
  currentDateTime.value = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
};

// 星期定义
const weekDays = [
  { label: "星期一", value: "monday" },
  { label: "星期二", value: "tuesday" },
  { label: "星期三", value: "wednesday" },
  { label: "星期四", value: "thursday" },
  { label: "星期五", value: "friday" }
  // { label: "星期六", value: "saturday" },
  // { label: "星期日", value: "sunday" }
];

// 新增：禁用的星期
const disabledDays = ref<string[]>([]);

// 新增：判断某天是否禁用
const isDayDisabled = (dayValue: string) => {
  return disabledDays.value.includes(dayValue);
};
const updateDisabledDays = () => {
  const startDate = route.query.startTime as string;
  if (!startDate) {
    disabledDays.value = [];
    return;
  }
  const date = new Date(startDate);
  let day = date.getDay(); // 0=周日, 1=周一, ..., 6=周六
  // weekDays顺序是周一到周日
  // day=1时，index=0，day=2时，index=1，day=0时，index=6
  let startIndex = day === 0 ? 6 : day - 1;
  disabledDays.value = weekDays.slice(0, startIndex).map((d) => d.value);
};

// 初始化一个时间段的数据
const initTimeSlotData = () => {
  const dayData = {
    courseName: "",
    courseCode: "",
    userName: "",
    userCode: "",
    roomCode: "",
    roomName: "",
    activity: ""
  };

  return weekDays.reduce((acc, day) => {
    acc[day.value] = { ...dayData };
    return acc;
  }, {});
};
// 年级列表
const gradeList = ref<any[]>([]);
const classCode = ref("");
const getGradeList = async () => {
  const res = await GradeService.getGradeList({});
  if (res.code === 0) {
    gradeList.value = res.data.list.map((item: any) => {
      return {
        label: `${item.gradeName}/${item.className}`,
        value: item.code
      };
    });
  }
};
// 重置清空表格数据，只保留时间
const resetScheduleData = () => {
  scheduleData.value.forEach((row) => {
    // 保留时间和活动类型相关信息
    const { classSettingName, timeRange, isActivity, activity } = row;

    // 重置每一天的数据
    weekDays.forEach((day) => {
      row[day.value] = {
        courseName: "",
        courseCode: "",
        userName: "",
        userCode: "",
        roomCode: "",
        roomName: "",
        activity: ""
      };
    });

    // 保留原有的时间和活动类型信息
    Object.assign(row, { classSettingName, timeRange, isActivity, activity });
  });
};
// 在年级变更时重置表格数据
watch(
  () => classCode.value,
  () => {
    resetScheduleData();
  }
);
const getDefaultScheduleData = () => [
  {
    classSettingName: "上午1",
    timeRange: ["08:30", "09:00"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  },
  {
    classSettingName: "上午2",
    timeRange: ["09:10", "09:40"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  },
  {
    classSettingName: "活动",
    timeRange: ["09:50", "10:10"],
    isActivity: true,
    activity: "",
    ...initTimeSlotData()
  },
  {
    classSettingName: "上午3",
    timeRange: ["10:20", "10:50"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  },
  {
    classSettingName: "上午4",
    timeRange: ["11:00", "11:30"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  },
  {
    classSettingName: "下午1",
    timeRange: ["14:00", "14:30"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  },
  // 如有更多课时，继续补充
  {
    classSettingName: "下午2",
    timeRange: ["15:10", "15:40"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  },
  {
    classSettingName: "下午3",
    timeRange: ["15:50", "16:10"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  },
  {
    classSettingName: "下午4",
    timeRange: ["16:20", "16:50"],
    isActivity: false,
    activity: "",
    ...initTimeSlotData()
  }
];
// 课程表数据
const scheduleData = ref<any[]>(getDefaultScheduleData());
// 获取课程列表
const courseList = ref<{ courseName: string; courseCode: string }[]>([]);
const getCourseList = () => {
  CourseService.queryCourseBasicList({ pageNum: 1, pageSize: 1000 }).then(
    (res) => {
      courseList.value = res.data.list;
    }
  );
};
// 学期列表
const termCode = ref("");
const termUniqueCode = ref("");
const termList = ref<any[]>([]);
const weekList = ref<any[]>([]);
const getTermList = () => {
  TermService.getTermList({ pageNum: 1, pageSize: 1000 }).then((res) => {
    termList.value = res.data.list;
  });
};
const handleTermCodeChange = (value: string) => {
  weekList.value = termList.value
    .find((item) => item.termCode === value)
    ?.termWeekInfoList.map((item: any) => {
      return {
        label: `第${item.weekNum}周`,
        value: item.termUniqueCode
      };
    });
};

const selectTeacherRef = ref(null);
const teacherList = ref<any>({});
const currentCell = ref<{ rowIndex: number; dayValue: string } | null>(null);

const handleSelectTeacher = (rowIndex: number, dayValue: string) => {
  currentCell.value = { rowIndex, dayValue };
  let userCode = scheduleData.value[rowIndex][dayValue].userCode || "";
  nextTick(() => {
    (selectTeacherRef.value as any)?.show({ userCode });
  });
};

const handleTeacherSelected = (teacher: any, currentCell: any) => {
  teacherList.value = teacher;
  if (currentCell) {
    const { rowIndex, dayValue } = currentCell;
    scheduleData.value[rowIndex][dayValue].userName = teacher.userName;
    scheduleData.value[rowIndex][dayValue].userCode = teacher.userCode;
  }
};

const handleChange = (
  value: string,
  rowIndex: number,
  dayValue: string,
  type: string
) => {
  if (type === "course") {
    const course = courseList.value.find((c) => c.courseCode === value);
    scheduleData.value[rowIndex][dayValue].courseName =
      course?.courseName || "";
    scheduleData.value[rowIndex][dayValue].courseCode =
      course?.courseCode || "";
  } else if (type === "room") {
    const room = roomList.value.find((r) => r.roomCode === value);
    scheduleData.value[rowIndex][dayValue].roomName = room?.roomName || "";
    scheduleData.value[rowIndex][dayValue].roomCode = room?.roomCode || "";
  }
};
// 获取教室列表
const roomList = ref<any[]>([]);
const getRoomList = () => {
  ClassRoomService.getClassRoomList({ pageNum: 1, pageSize: 1000 }).then(
    (res) => {
      roomList.value = res.data.list;
    }
  );
};

// 显示新增还是编辑按钮
const handleClassCodeChange = (value: string) => {
  CourseArrangeService.getCourseArrangeDetail({
    termUniqueCode: termUniqueCode.value,
    classCode: value
  }).then((res) => {
    if (res.code === 0 && Array.isArray(res.data)) {
      scheduleData.value =
        res.data.map((item: any) => ({
          ...item,
          isActivity: item.activity
        })) || [];
    }
  });
};
// 监听路由变化
watch(
  () => route.query,
  () => {
    updateDisabledDays();
    if (route.query.termCode) {
      // classCode.value = route.query.classCode as string;
    }
  },
  { immediate: true }
);

// 计算本周每天的日期
const getWeekDates = (startDateStr: string) => {
  const weekDates: string[] = [];
  const startDate = new Date(startDateStr);
  // 获取 startDate 是星期几（0=周日，1=周一...）
  let day = startDate.getDay();
  // 计算本周一的日期
  let monday = new Date(startDate);
  if (day === 0) {
    // 周日，往前推6天
    monday.setDate(startDate.getDate() - 6);
  } else {
    // 其它，往前推 day-1 天
    monday.setDate(startDate.getDate() - (day - 1));
  }
  // 依次推算本周一到周五
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().slice(0, 10)); // yyyy-mm-dd
  }
  return weekDates;
};

const weekDates = ref<string[]>([]);

watch(
  () => route.query.startTime,
  (newVal) => {
    if (newVal) {
      weekDates.value = getWeekDates(newVal as string);
    }
  },
  { immediate: true }
);

onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  getCourseList();
  getRoomList();
  getGradeList();
  getTermList();
});
</script>

<style lang="scss" scoped>
.schedule-container {
  padding: 20px;
  background-color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  height: 50px;
}
.active {
  color: #409eff !important;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.date {
  color: #666;
}

.schedule-table {
  flex: 1;
  height: 0;
  overflow: auto;
}

.time-slot-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 5px;

  .el-time-picker {
    width: 90px;
  }

  .separator {
    color: #909399;
  }
}

.activity-select {
  width: 120px;
}

.course-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;

  .el-select {
    width: 100%;
  }
}

.activity-cell {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f5f7fa;
  padding: 20px 0;
}

.footer {
  margin-top: 20px;
  text-align: center;
  height: 50px;
}

:deep(.el-table) {
  .el-table__cell {
    padding: 4px;
  }
}

:deep(.el-select .el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-select .el-input__inner) {
  height: 28px;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
</style>
