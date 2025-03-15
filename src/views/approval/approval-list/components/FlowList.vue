<template>
  <div class="flow-list">
    <div class="flow-list-header">
      <div class="flow-list-header-item">
        <el-icon size="20" color="#67C23A">
          <CircleCheckFilled />
        </el-icon>
        <div>已通过</div>
      </div>
      <div class="flow-list-header-item">
        <el-icon size="20" color="#909399">
          <MoreFilled />
        </el-icon>
        <div>等待中</div>
      </div>
      <div class="flow-list-header-item">
        <el-icon size="20" color="#E6A23C">
          <Comment />
        </el-icon>
        <div>审批中</div>
      </div>
    </div>
    <div class="flow-list-content" v-for="(item, index) in props.flowList" :key="index">
      <div class="flow-list-content-item">
        <div style="position: relative">
          <el-avatar style="background-color: var(--el-color-primary)">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <div class="flow-list-content-item-avatar-check">
            <!-- 已完成 -->
            <el-icon v-if="index < currentNodeIndex" size="20" color="#67C23A">
              <CircleCheckFilled />
            </el-icon>
            <!-- 审批中 -->
            <el-icon v-else-if="currentNodeIndex === index" size="20" color="#E6A23C">
              <Comment />
            </el-icon>
            <!-- 等待中 -->
            <el-icon v-else size="20" color="#909399">
              <MoreFilled />
            </el-icon>
          </div>
        </div>
        <div class="flow-list-content-item-content">
          <div class="flow-list-content-item-content-header">
            <div class="flow-list-content-item-content-header-left">
              <div style="font-size: 14px; color: #333">
                {{ item.nodeName }}
              </div>
            </div>
          </div>
          <div class="flow-list-content-item-content-bottom">
            {{ item.approvalPerson }}
          </div>
        </div>
      </div>
      <!-- 连接线 -->
      <div v-if="index !== props.flowList.length - 1" class="flow-list-connector-line">
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
  import { IApprovalFlowDetailFlow } from "@/interface/IApproval";

  const props = defineProps<{
    flowList: Array<IApprovalFlowDetailFlow>;
  }>();
  const currentNodeIndex = ref<number>(0);

  const findCurrentNodeIndex = (flowList: Array<IApprovalFlowDetailFlow>) => {
    return flowList.findIndex((item) => item.isCurrentNode);
  };

  watch(
    () => props.flowList,
    (newVal) => {
      const curIndex = findCurrentNodeIndex(newVal);
      if (curIndex !== -1) {
        currentNodeIndex.value = curIndex;
      } else {
        currentNodeIndex.value = newVal.length; //默认表示全部审批了
      }
    },
    { immediate: true }
  );
</script>
<style lang="scss" scoped>
  .flow-list {
    display: flex;
    flex-direction: column;
    gap: 40px;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      font-size: 14px;
      color: #909399;
      &-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
    }

    &-content {
      position: relative;
      margin-left: 40%;

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
          }
          &-bottom {
            font-size: 14px;
            color: #999;
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
