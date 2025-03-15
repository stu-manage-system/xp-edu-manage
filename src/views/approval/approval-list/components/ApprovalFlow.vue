<template>
  <div class="approval-flow">
    <div class="approval-flow-content" v-for="(item, index) in props.approvalFlow" :key="index">
      <div class="approval-flow-content-item">
        <div style="position: relative">
          <el-avatar style="background-color: var(--el-color-primary)">
            {{ (item.approvalName || item.approvalPerson)?.slice(-2) }}
          </el-avatar>
          <div class="approval-flow-content-item-avatar-check">
            <!-- 已完成 -->
            <el-icon v-if="item.approvalStatus === 1" size="20" color="#67C23A">
              <CircleCheckFilled />
            </el-icon>
            <!-- 审批中 -->
            <el-icon v-else-if="item.approvalStatus === 0" size="20" color="#E6A23C">
              <Comment />
            </el-icon>
            <!-- 已拒绝 -->
            <el-icon v-else-if="item.approvalStatus === 2" size="20" color="#F56C6C">
              <CircleCloseFilled />
            </el-icon>
            <!-- 等待中 -->
            <el-icon v-else size="20" color="#909399">
              <MoreFilled />
            </el-icon>
          </div>
        </div>
        <div class="approval-flow-content-item-content">
          <div class="approval-flow-content-item-content-header">
            <div class="approval-flow-content-item-content-header-left">
              <div style="font-size: 14px; color: #333">
                {{ item.nodeName }}
              </div>
              <div style="font-size: 14px; color: #999">
                {{ item.approvalName || item.approvalPerson }}
                ({{ approvalNodeStatusEnum.find((status) => status.value === item.approvalStatus)?.label }})
              </div>
            </div>
            <div class="approval-flow-content-item-content-header-right">
              {{ dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss") }}
            </div>
          </div>
          <div v-if="item.remark" class="approval-flow-content-item-content-remark">备注信息：{{ item.remark }}</div>
        </div>
      </div>
      <!-- 连接线 -->
      <div v-if="index !== approvalFlow.length - 1" class="approval-flow-connector-line">
        <el-divider
          direction="vertical"
          border-style="solid"
          style="border-left: 4px var(--el-border-color) var(--el-border-style); height: 100%"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IRecord } from "@/interface/IApproval";
  import dayjs from "dayjs";
  import { useApprovalStore } from "@/store/modules/approval";

  const approvalStore = useApprovalStore();
  const approvalNodeStatusEnum = computed(() => {
    return approvalStore.getApprovalNodeStatusEnum;
  });

  const props = defineProps<{
    approvalFlow: Array<IRecord>;
  }>();
</script>
<style lang="scss" scoped>
  .approval-flow {
    display: flex;
    flex-direction: column;
    gap: 40px;

    &-content {
      position: relative;

      &-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;

        &-avatar-check {
          position: absolute;
          bottom: -5px;
          right: -5px;
          display: flex;
          border-radius: 50%;
          background-color: #fff;
          border: 1px solid #e4e7ed;
        }

        &-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;

          &-header {
            display: flex;
            align-items: flex-start;
            gap: 10px;

            &-left {
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            }

            &-right {
              font-size: 14px;
              color: #999;
            }
          }

          &-remark {
            padding: 10px;
            border-radius: 10px;
            background-color: #f2f3f5;
            color: #333;
            font-size: 14px;
            line-height: 1.5;
          }
        }
      }
    }

    &-connector-line {
      position: absolute;
      top: 50px;
      left: 0;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100% - 20px);
    }
  }
</style>
