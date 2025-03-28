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
      <el-table-column label="姓名" prop="ip" />
      <el-table-column label="性别" prop="status" />
      <el-table-column label="联系方式" prop="create_time" />
      <el-table-column label="更新时间" prop="create_time" />
      <el-table-column label="操作" prop="create_time" fixed="right">
        <div style="display: flex; align-items: center">
          <el-button type="primary" size="default"> 查看信息 </el-button>
          <el-button type="primary" size="default"> 绑定学生 </el-button>
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
      username: "青隐篱",
      sex: 1,
      ip: "571.133.313.423",
      browser: "chrome",
      status: 1,
      create_time: "2020-11-14",
    },
  ]);
</script>

<style lang="scss" scoped></style>
