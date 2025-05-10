<template>
  <div class="schedule-container">
    <div class="header">
      <div class="title">同步排课管理列表</div>
      <div class="date">{{ currentDateTime }}</div>
    </div>
    <div class="header" style="width: 300px">
      <el-select
        v-model="classCode"
        placeholder="请选择年级"
        class="form-input"
      >
        <el-option
          v-for="item in gradeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="schedule-table">
      <!-- <el-scrollbar height="100%"> -->
      <div class="no-data" v-if="!classCode"></div>
      <el-table
        v-else
        :data="scheduleData"
        border
        style="width: 100%"
        height="calc(100vh - 260px)"
      >
        <!-- 课时列 -->
        <el-table-column
          prop="classSettingName"
          label="课时"
          width="500"
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
          v-for="day in weekDays"
          :key="day.value"
          :label="day.label"
          min-width="200"
        >
          <template #default="{ row, $index: rowIndex }">
            <div class="course-cell" v-if="!row.isActivity">
              <el-select
                v-model="row[day.value].courseCode"
                placeholder="课程"
                size="small"
                :disabled="isDayDisabled(day.value)"
                @change="handleChange($event, rowIndex, day.value, 'course')"
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
                :disabled="isDayDisabled(day.value)"
                @click="handleSelectTeacher(rowIndex, day.value)"
              >
              </el-input>
              <el-select
                v-model="row[day.value].roomCode"
                placeholder="教室"
                size="small"
                :disabled="isDayDisabled(day.value)"
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

    <div class="footer" v-if="classCode">
      <el-button type="primary" @click="saveSchedule">保存</el-button>
      <el-button @click="cancel">取消</el-button>
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
import { useRoute } from "vue-router";
import { CourseService } from "@/api/courseApi";
import SelectTeacher from "@/components/user/select.vue";
import { ClassRoomService } from "@/api/classRoom";
import { GradeService } from "@/api/gradeApi";
import { CourseArrangeService } from "@/api/courseArrange";

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
// 课程表数据
const scheduleData = ref<any[]>([
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
    classSettingName: "活动",
    timeRange: ["11:40", "12:00"],
    isActivity: true,
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
  {
    classSettingName: "活动",
    timeRange: ["14:40", "15:00"],
    isActivity: true,
    activity: "",
    ...initTimeSlotData()
  },
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
]);
const flattenWeekData = (row: any) => {
  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  return weekDays.map((day) => {
    const dayData = row[day] || {};
    return {
      weekday: day,
      type: row.isActivity ? "ACTIVITY" : "CLASSIC",
      classSettingName: row.classSettingName,
      startTime: row.timeRange[0],
      endTime: row.timeRange[1],
      ...dayData
    };
  });
};

// 保存课程表
const saveSchedule = () => {
  let params: any = {
    termCode: route.query.termCode,
    termUniqueCode: route.query.termUniqueCode,
    classCode: classCode.value,
    arrangeInfoList: []
  };
  scheduleData.value.forEach((row) => {
    const data = flattenWeekData(row);
    params.arrangeInfoList.push(...data);
  });
  console.log("保存课程表", params);
  CourseArrangeService.saveCourseArrange(params).then((res) => {
    if (res.code === 0) {
      ElMessage.success("保存成功");
    } else {
      ElMessage.error(res.message);
    }
  });
};

// 取消
const cancel = () => {
  console.log("取消操作");
};
// 获取课程列表
const courseList = ref<{ courseName: string; courseCode: string }[]>([]);
const getCourseList = () => {
  CourseService.queryCourseBasicList({ pageNum: 1, pageSize: 1000 }).then(
    (res) => {
      courseList.value = res.data.list;
    }
  );
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
// 监听路由变化
watch(
  () => route.query,
  () => {
    updateDisabledDays();
  },
  { immediate: true }
);

onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  getCourseList();
  getRoomList();
  getGradeList();
});
</script>

<style lang="scss" scoped>
.schedule-container {
  padding: 20px;
  background-color: #fff;
  min-height: calc(100vh - 120px) !important;
  max-height: calc(100vh - 120px) !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  height: 50px;
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
