<template>
  <ul class="card-list" :style="{ marginTop: showWorkTab ? '0' : '10px' }">
    <li class="console-box-2" v-for="(item, index) in dataList" :key="index">
      <div style="margin-top: 10px">
        <span class="des custom-text subtitle">{{ item.des }}</span>
        <div>
          <CountTo
            class="number custom-text box-title"
            :endVal="item.totalCount"
            :duration="1000"
            separator=""
          ></CountTo>
        </div>
      </div>
      <div class="console-box-2-right">
        <div>
          <div class="custom-text1 subtitle">本日新增：{{ item.todayAdd }}</div>
          <div class="custom-text2 subtitle">本月新增：{{ item.monthAdd }}</div>
        </div>
      </div>
    </li>
    <li class="console-box-2">
      <div style="margin-top: 10px">
        <span class="des custom-text subtitle">过期会员数</span>
        <div>
          <CountTo
            class="number custom-text box-title"
            :endVal="soonExpireCount"
            :duration="1000"
            separator=""
          ></CountTo>
        </div>
      </div>
      <div class="console-box-2-right"></div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ApiService } from "@/api/apiApi";
import { SystemMainColor } from "@/config/setting";
import { useSettingStore } from "@/store/modules/setting";
import { computed, ref } from "vue";
import { CountTo } from "vue3-count-to";

const settingStore = useSettingStore();
const showWorkTab = computed(() => settingStore.showWorkTab);
const colorIndex = computed(() =>
  SystemMainColor.indexOf(settingStore.systemThemeColor)
);
const showData = ref({
  memberCount: {
    totalCount: 0,
    todayAdd: 0,
    monthAdd: 0
  },
  vipMemberCount: {
    totalCount: 0,
    todayAdd: 0,
    monthAdd: 0
  }
});
const soonExpireCount = ref(0);

// 定义卡片配置
const cardConfigs = [
  {
    des: "会员数",
    icon: "\ue721",
    dataKey: "memberCount"
  },
  {
    des: "VIP会员数",
    icon: "\ue724",
    dataKey: "vipMemberCount"
  }
] as const;

const dataList = ref<any[]>([]);

// 获取数据接口
const getCardList = async () => {
  const res = await ApiService.getWorkbenchData();
  showData.value = res.data;

  // 根据配置生成数据列表
  dataList.value = cardConfigs.map((config) => ({
    des: config.des,
    icon: config.icon,
    startVal: 0,
    duration: 1000,
    totalCount: showData.value[config.dataKey].totalCount,
    todayAdd: showData.value[config.dataKey].todayAdd,
    monthAdd: showData.value[config.dataKey].monthAdd
  }));

  soonExpireCount.value = res.data.soonExpireCount;
};

// getCardList()
</script>

<style lang="scss" scoped>
.card-list {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: calc(100% + var(--console-margin));
  // margin-top: 0 !important;
  margin-left: calc(0px - var(--console-margin));
  background-color: transparent !important;

  .console-box-2 {
    display: flex;
    align-items: center;
    justify-content: space-around;
    .console-box-2-right {
      font-size: 14px !important;
      .custom-text1 {
        color: #2c9 !important;
        margin-bottom: 8px;
      }
      .custom-text2 {
        color: rgb(208, 223, 10) !important;
      }
    }
  }

  li {
    position: relative;
    box-sizing: border-box;
    width: calc(25% - var(--console-margin));
    height: 90px;
    padding: 0 18px;
    margin: 0 0 0 var(--console-margin);
    background: var(--art-main-bg-color);
    border-radius: 14px;

    $icon-size: 46px;

    .iconfont-sys {
      position: absolute;
      top: 0;
      right: 15px;
      bottom: 0;
      width: $icon-size;
      height: $icon-size;
      margin: auto;
      overflow: hidden;
      font-size: 20px;
      line-height: $icon-size;
      color: #fff !important;
      text-align: center;
      background-color: #2c90ff;
      border-radius: 12px;
    }

    .des {
      display: block;
      height: 14px;
      font-size: 16px;
      font-weight: 500;
      line-height: 14px;
    }

    > div {
      // display: flex;
      // align-items: center;

      .number {
        display: block;
        margin-top: 5px;
        font-size: 28px;
        font-weight: 400;
      }

      .change {
        display: block;
        margin: 13px 0 0 10px;
        font-size: 13px;
        font-weight: bold;
      }
    }
  }
}
</style>
