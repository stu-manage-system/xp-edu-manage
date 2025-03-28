<template>
  <div class="page-content">
    <el-row :gutter="15">
      <el-col :xs="19" :sm="12" :lg="6">
        <el-input placeholder="请输入用户名搜索"></el-input>
      </el-col>
      <el-col :xs="4" :sm="12" :lg="4">
        <el-button>搜索</el-button>
      </el-col>
    </el-row>

    <art-table :data="logList">
      <el-table-column label="昵称" prop="username" width="180px" />
      <el-table-column label="姓名" prop="ip" width="180px" fixed="left" />
      <el-table-column
        label="英文名"
        prop="browser"
        width="180px"
        fixed="left"
      />
      <el-table-column label="性别" prop="status" width="180px" />
      <el-table-column label="年龄" prop="create_time" width="180px" />
      <el-table-column label="手机号" prop="create_time" width="180px" />
      <el-table-column label="学生号" prop="create_time" width="180px" />
      <el-table-column label="house信息" prop="create_time" width="180px" />
      <el-table-column label="在读年级" prop="create_time" width="180px" />
      <el-table-column label="在读班级" prop="create_time" width="180px" />
      <el-table-column label="操作员" prop="create_time" width="180px" />
      <el-table-column label="操作时间" prop="create_time" width="180px" />
      <el-table-column
        label="操作"
        prop="create_time"
        width="350px"
        #default="scope"
        fixed="right"
      >
        <div style="display: flex; align-items: center">
          <el-button type="primary" size="default"> 修改 </el-button>
          <el-button type="warning" style="margin-left: 10px" size="default">
            档案
          </el-button>
          <el-button type="danger" style="margin-left: 10px" size="default">
            删除
          </el-button>
        </div>
      </el-table-column>
    </art-table>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from "vue";

  const logList = reactive([
    {
      username: "甜筒",
      sex: 1,
      ip: "127.133.567.675",
      browser: "chrome",
      status: 0,
      create_time: "2020-11-14",
    },
    {
      username: "冷月呆呆",
      sex: 1,
      ip: "127.133.145.545",
      browser: "chrome",
      status: 1,
      create_time: "2020-11-14",
    },
    {
      username: "唐不苦",
      sex: 1,
      ip: "156.133.313.756",
      browser: "chrome",
      status: 1,
      create_time: "2020-11-14",
    },
    {
      username: "笑很甜",
      sex: 0,
      ip: "131.133.234.424",
      browser: "chrome",
      status: 1,
      create_time: "2020-11-14",
    },
    {
      username: "青隐篱",
      sex: 0,
      ip: "167.133.355.534",
      browser: "chrome",
      status: 1,
      create_time: "2020-11-14",
    },
  ]);
</script>

<style lang="scss" scoped></style>
