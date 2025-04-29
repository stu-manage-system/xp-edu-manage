<template>
  <div class="schedule-container">
    <div class="header">
      <div class="title">同步排课管理列表</div>
      <div class="date">{{ currentDateTime }}</div>
    </div>

    <div class="schedule-table">
      <!-- <el-scrollbar height="100%"> -->
      <el-table
        :data="scheduleData"
        border
        style="width: 100%"
        height="calc(100vh - 260px)"
      >
        <!-- 课时列 -->
        <el-table-column prop="timeSlot" label="课时" width="500" fixed="left">
          <template #default="{ row }">
            <div class="time-slot-cell">
              <span>{{ row.timeSlot }}</span>
              <div class="time-range">
                <el-time-picker
                  v-model="row.timeRange[0]"
                  format="HH:mm"
                  placeholder="开始时间"
                  size="small"
                  style="width: 120px"
                />
                <span class="separator">-</span>
                <el-time-picker
                  v-model="row.timeRange[1]"
                  format="HH:mm"
                  placeholder="结束时间"
                  size="small"
                  style="width: 120px"
                />
              </div>
              <el-select
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
              </el-select>
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
          <template #default="{ row }">
            <div class="course-cell" v-if="!row.isActivity">
              <el-select
                v-model="row[day.value].course"
                placeholder="课程"
                size="small"
              >
                <el-option label="语文" value="chinese" />
                <el-option label="数学" value="math" />
                <el-option label="英语" value="english" />
              </el-select>
              <el-select
                v-model="row[day.value].teacher"
                placeholder="教师"
                size="small"
              >
                <el-option label="张老师" value="zhang" />
                <el-option label="李老师" value="li" />
              </el-select>
              <el-select
                v-model="row[day.value].classroom"
                placeholder="教室"
                size="small"
              >
                <el-option label="101" value="101" />
                <el-option label="102" value="102" />
              </el-select>
            </div>
            <div v-else class="activity-cell">
              {{ row.activity || "暂无活动" }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- </el-scrollbar> -->
    </div>

    <div class="footer">
      <el-button type="primary" @click="saveSchedule">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";

  const currentDateTime = ref("");

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
      hour12: false,
    });
  };

  // 星期定义
  const weekDays = [
    { label: "星期一", value: "monday" },
    { label: "星期二", value: "tuesday" },
    { label: "星期三", value: "wednesday" },
    { label: "星期四", value: "thursday" },
    { label: "星期五", value: "friday" },
  ];

  // 初始化一个时间段的数据
  const initTimeSlotData = () => {
    const dayData = {
      course: "",
      teacher: "",
      classroom: "",
      activity: "",
    };

    return weekDays.reduce((acc, day) => {
      acc[day.value] = { ...dayData };
      return acc;
    }, {});
  };

  // 课程表数据
  const scheduleData = ref([
    {
      timeSlot: "上午1",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "上午2",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "活动",
      timeRange: ["", ""],
      isActivity: true,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "上午3",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "上午4",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "活动",
      timeRange: ["", ""],
      isActivity: true,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "下午1",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "活动",
      timeRange: ["", ""],
      isActivity: true,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "下午2",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "下午3",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
    {
      timeSlot: "下午4",
      timeRange: ["", ""],
      isActivity: false,
      activity: "",
      ...initTimeSlotData(),
    },
  ]);

  // 保存课程表
  const saveSchedule = () => {
    console.log("保存课程表", scheduleData.value);
  };

  // 取消
  const cancel = () => {
    console.log("取消操作");
  };

  onMounted(() => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
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
