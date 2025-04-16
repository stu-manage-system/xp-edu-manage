<template>
  <div
    style="display: flex; flex-direction: column; gap: 10px"
    v-loading="loading"
  >
    <el-row
      :class="`workflow-node-info ${index === 0 ? '' : 'node-bg'}`"
      :gutter="20"
      v-for="(node, index) in nodes"
      :key="index"
    >
      <el-col :span="2">
        <el-form-item label="" style="height: 40px">
          <el-tag
            style="height: 40px"
            :type="index === 0 ? 'success' : 'warning'"
            >{{ index === 0 ? "申请节点" : `${index}级审批` }}</el-tag
          >
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="节点名称" class="flex" required>
          <el-input
            placeholder="请输入节点名称"
            v-model="node.nodeName"
            clearable
            :disabled="props.disabled"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="类型" class="flex" required>
          <el-select
            v-model="node.approvalType"
            :disabled="index === 0 || props.disabled"
          >
            <el-option
              v-for="item in index === 0
                ? TypeOptions.filter((item) => item.value === 2)
                : TypeOptions.filter((item) => item.value !== 2)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item v-if="index !== 0" label="处理人" class="flex" required>
          <el-select-v2
            v-model="node.approvalInfo"
            :options="approvalOptions(node)"
            @change="handleApprovalChange($event, node)"
            v-loading="loading"
            :disabled="props.disabled"
          />
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-button
          v-if="index !== 0"
          :disabled="index === 0 || props.disabled"
          type="danger"
          @click="deleteNode(index)"
          icon="Delete"
        ></el-button>
      </el-col>
    </el-row>
    <el-button v-if="!disabled" type="primary" @click="addNode"
      >新增节点</el-button
    >
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, onMounted, watch } from "vue";
import { INode } from "@/interface/IApproval";
import { UserService } from "@/api/usersApi";
import { ApprovalService } from "@/api/approvalApi";
import _ from "lodash";
import { nanoid } from "nanoid";
const props = defineProps<{
  nodes: INode[];
  disabled: boolean;
}>();

const TypeOptions = [
  { label: "指定角色", value: 0 },
  { label: "指定人员", value: 1 },
  { label: "全部", value: 2 },
  { label: "超级管理员", value: 3 }
];
//如果审批类型为0，则显示角色列表，如果审批类型为1，则显示人员列表
const ApprovalUserOptions = ref([]);
const ApprovalRoleOptions = ref([]);
const ApprovalSuperAdminOptions = ref([]);
const loading = ref(false);

const emit = defineEmits(["updateNodes"]);

const deleteNode = (index: number) => {
  const newNodes = [...props.nodes];
  newNodes.splice(index, 1);
  emit("updateNodes", newNodes);
};

const addNode = () => {
  // 新增节点:生成8位的md5
  const nodeCode = nanoid(8);

  emit("updateNodes", [
    ...props.nodes,
    {
      nodeName: "",
      approvalType: undefined, //审批类型；0=角色审批，1=人员审批
      approvalInfo: "",
      nodeCode: nodeCode,
      beforeCode: "",
      afterCode: "",
      isLastNode: false
    }
  ]);
};

const approvalOptions = computed(() => (node: INode) => {
  if (_.isNil(node.approvalType)) {
    return [];
  }
  switch (node.approvalType) {
    case 0:
      return ApprovalRoleOptions.value;
    case 1:
      return ApprovalUserOptions.value;
    case 3:
      return ApprovalSuperAdminOptions.value;
    default:
      return [];
  }
});

const queryRoleHasUser = async (roleId: string): Promise<boolean> => {
  try {
    const res = await ApprovalService.queryRoleHasUser(roleId);
    if (res.code === 0) {
      if (!res.data) {
        ElMessage.warning("该角色下无人员，请选择其他角色");
        return false;
      }
      return true;
    }
    ElMessage.error("检查角色人员失败");
    return false;
  } catch (error) {
    ElMessage.error("检查角色人员失败");
    return false;
  }
};

const handleApprovalChange = async (value: string, node: INode) => {
  // 如果是角色审批类型，需要校验角色下是否有用户
  if (node.approvalType === 0) {
    const hasUsers = await queryRoleHasUser(value);
    if (!hasUsers) {
      // 如果没有用户，清空选择
      node.approvalInfo = "";
      return;
    }
  }
  // 如果是人员审批或角色校验通过，保持选中值
  node.approvalInfo = value;
};

// 获取超级管理员列表
const loadSuperAdminList = async () => {
  if (ApprovalSuperAdminOptions.value.length > 0) return;
  loading.value = true;
  try {
    const res = await UserService.queryStoreUserList({
      pageNum: 1,
      pageSize: 100,
      ...{ isSuper: true }
    });
    if (res.code === 0) {
      ApprovalSuperAdminOptions.value =
        res.data?.list?.map((item: { userName: string; account: string }) => ({
          label: item.userName,
          value: item.account
        })) || [];
    }
  } catch (error) {
    ElMessage.error("获取超级管理员列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取普通用户列表
const loadUserList = async () => {
  if (ApprovalUserOptions.value.length > 0) return;
  loading.value = true;
  try {
    const res = await UserService.queryStoreUserList({
      pageNum: 1,
      pageSize: 20000
    });
    if (res.code === 0) {
      ApprovalUserOptions.value =
        res.data?.list?.map((item: { userName: string; account: string }) => ({
          label: item.userName,
          value: item.account
        })) || [];
    }
  } catch (error) {
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取角色列表
const loadRoleList = async () => {
  if (ApprovalRoleOptions.value.length > 0) return;
  loading.value = true;
  try {
    const res = await UserService.queryStoreRoleList({
      pageNum: 1,
      pageSize: 10000
    });
    if (res.code === 0) {
      ApprovalRoleOptions.value =
        res.data?.list?.map((item: { roleName: string; roleId: string }) => ({
          label: item.roleName,
          value: `${item.roleId}`
        })) || [];
    }
  } catch (error) {
    ElMessage.error("获取角色列表失败");
  } finally {
    loading.value = false;
  }
};

// 监听审批类型变化
watch(
  () => props.nodes.map((node) => node.approvalType),
  async (newTypes) => {
    for (const type of newTypes) {
      switch (type) {
        case 0: // 角色审批
          await loadRoleList();
          break;
        case 1: // 人员审批
          await loadUserList();
          break;
        case 3: // 超级管理员
          await loadSuperAdminList();
          break;
      }
    }
  },
  { deep: true }
);

watch(
  () =>
    props.nodes.map((node) => ({
      nodeCode: node.nodeCode,
      approvalType: node.approvalType
    })),
  (newNodes, oldNodes) => {
    newNodes.forEach((newNode, index) => {
      const oldNode = oldNodes.find((n) => n.nodeCode === newNode.nodeCode);
      if (oldNode && oldNode.approvalType !== newNode.approvalType) {
        props.nodes[index].approvalInfo = "";
      }
    });
  }
);
</script>

<style lang="scss" scoped>
.workflow-node-info {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 10px;
  margin: 0 !important;

  :deep(.el-form-item--large) {
    margin: 0;
  }
}

.node-bg {
  background-color: #f0f2f5;
}

.flex {
  flex: 1;
}
</style>
