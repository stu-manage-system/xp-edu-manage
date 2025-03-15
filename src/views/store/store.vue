<template>
  <div class="store-form">
    <el-skeleton :loading="loading" animated :rows="6">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" @submit.prevent
        class="form-container">
        <!-- 表单顶部按钮区域 -->
        <div class="form-buttons">
          <template v-if="isEditing">
            <el-button type="primary" @click="handleSubmit">提交</el-button>
            <el-button @click="resetForm">重置</el-button>
          </template>
          <el-button v-else type="primary" @click="startEditing">编辑</el-button>
        </div>

        <!-- 表单内容 -->
        <div class="form-content">
          <!-- 基本信息 -->
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="门店名称" prop="storeName">
                  <el-input v-model="formData.storeName" placeholder="请输入门店名称" clearable :disabled="!isEditing" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="店长微信" prop="storeManageWx">
                  <el-input v-model="formData.storeManageWx" placeholder="请输入店长微信" clearable :disabled="!isEditing" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="门店电话" prop="storeTel">
                  <el-input v-model="formData.storeTel" placeholder="请输入门店电话" clearable :disabled="!isEditing" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 场地信息 -->
          <div class="form-section">
            <div class="section-title">场地信息</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="容纳人数" prop="storePeopleCount">
                  <el-input-number v-model="formData.storePeopleCount" :min="1" :precision="0" placeholder="请输入容纳人数"
                    clearable :disabled="!isEditing" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="门店面积" prop="storeArea">
                  <el-input v-model="formData.storeArea" placeholder="请输入门店面积" clearable :disabled="!isEditing">
                    <template #append>平方米</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="到期类型" prop="memberExpireType">
                  <el-select v-model="formData.memberExpireType" placeholder="请选择到期类型" clearable style="width: 100%"
                    :disabled="!isEditing">
                    <el-option v-for="item in expireTypeOptions" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 支付配置 -->
          <div class="form-section">
            <div class="section-title">支付配置</div>
            <el-row :gutter="20" class="mb-20">
              <el-col :span="8">
                <el-form-item label="微信支付" prop="wxNeedPay">
                  <el-switch v-model="formData.wxNeedPay" :disabled="!isEditing" :active-value="1"
                    :inactive-value="0" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 微信支付配置项，仅在启用时显示 -->
            <template v-if="formData.wxNeedPay">
              <el-row :gutter="20" class="mb-20">
                <el-col :span="8">
                  <el-form-item label="商户号" prop="wxMerchantId">
                    <el-input v-model="formData.wxMerchantId" placeholder="请输入微信商户号" clearable :disabled="!isEditing" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="商户API私钥" prop="wxPrivateKey">
                    <el-input v-model="formData.wxPrivateKey" type="password" placeholder="请输入商户API私钥" clearable
                      :disabled="!isEditing" show-password />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="证书序列号" prop="wxMerchantSerialNumber">
                    <el-input v-model="formData.wxMerchantSerialNumber" placeholder="请输入商户证书序列号" clearable
                      :disabled="!isEditing" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="APIv3密钥" prop="wxApiV3Key">
                    <el-input v-model="formData.wxApiV3Key" type="password" placeholder="请输入商户APIv3密钥" clearable
                      :disabled="!isEditing" show-password />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="公众号ID" prop="wxAppId">
                    <el-input v-model="formData.wxAppId" placeholder="请输入微信公众号appid" clearable :disabled="!isEditing" />
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </div>

          <!-- 营业时间 -->
          <div class="form-section">
            <div class="section-title">营业时间</div>
            <el-row :gutter="20">
              <el-col :span="24">
                <div class="time-row">
                  <el-form-item label="工作日时间" prop="weekdayTime">
                    <el-time-select v-model="formData.workStartTime" start="00:00" step="00:30" end="23:30"
                      placeholder="开始时间" :disabled="!isEditing" class="time-select" format="HH:mm A" />
                    <span class="time-separator">至</span>
                    <el-time-select v-model="formData.workEndTime" start="00:00" step="00:30" end="23:30"
                      placeholder="结束时间" :disabled="!isEditing" class="time-select" format="HH:mm A" />
                  </el-form-item>
                  <el-form-item label="周末时间" prop="weekendTime" class="weekend-time">
                    <el-time-select v-model="formData.weekendStartTime" start="00:00" step="00:30" end="23:30"
                      placeholder="开始时间" :disabled="!isEditing" class="time-select" format="HH:mm A" />
                    <span class="time-separator">至</span>
                    <el-time-select v-model="formData.weekendEndTime" start="00:00" step="00:30" end="23:30"
                      placeholder="结束时间" :disabled="!isEditing" class="time-select" format="HH:mm A" />
                  </el-form-item>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 地址信息 -->
          <div class="form-section">
            <div class="section-title">地址信息</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="门店地址" prop="regionCodes">
                  <el-cascader ref="cascaderAddr" v-model="formData.regionCodes" :options="pcaData" :props="{
                    value: 'code',
                    label: 'name',
                    children: 'children'
                  }" placeholder="请选择所在地区" @change="handleAddrChange" clearable :disabled="!isEditing" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="详细地址" prop="detailAddress">
                  <el-input type="textarea" v-model="formData.detailAddress" :rows="2" placeholder="请输入详细地址" clearable
                    :disabled="!isEditing" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="经纬度">
                  <el-input v-model="locationText" placeholder="点击选择位置" readonly @click="showMapDialog"
                    :disabled="!isEditing">
                    <template #append>
                      <el-button @click="showMapDialog" :disabled="!isEditing">选择位置</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 门店照片 -->
          <div class="form-section">
            <div class="section-title">门店照片</div>
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <div class="upload-wrapper">
                    <el-upload class="store-photo-uploader" :show-file-list="false" :before-upload="beforePhotoUpload"
                      :action="uploadUrl" :disabled="!isEditing">
                      <template v-if="formData.storePhoto">
                        <div class="image-wrapper">
                          <img :src="formData.storePhoto" class="uploaded-image" />
                          <div class="image-actions">
                            <el-icon class="action-icon" @click.stop="previewImage">
                              <ZoomIn />
                            </el-icon>
                            <el-icon class="action-icon" @click.stop="deleteImage">
                              <Delete />
                            </el-icon>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <div class="upload-placeholder">
                          <el-icon class="upload-icon">
                            <Plus />
                          </el-icon>
                          <div class="upload-tip">点击上传门店照片</div>
                        </div>
                      </template>
                    </el-upload>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
    </el-skeleton>
    <el-dialog v-model="mapVisible" title="选择位置" width="80%" height="40%" destroy-on-close :close-on-click-modal="false"
      class="map-dialog">
      <div class="map-container">
        <div class="map-search">
          <el-input v-model="searchKeyword" placeholder="搜索地址" @keyup.enter="handleSearch">
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
          <div v-if="searchResults.length" class="search-result">
            <div v-for="item in searchResults" :key="item.id" class="result-item" @click="handleSelectLocation(item)">
              {{ item.name }} - {{ item.address }}
            </div>
          </div>
        </div>
        <div id="mapContainer" class="map-content"></div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="mapVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmLocation">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="previewVisible" title="图片预览" width="50%">
      <img :src="formData.storePhoto" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import pcaData from "@/assets/json/pca-code.json"
import dayjs from "dayjs"
import { Plus, ZoomIn, Delete } from "@element-plus/icons-vue"
import { SystemInfo } from "@/config/setting"
import { UserService } from "@/api/usersApi"
import { t } from "@wangeditor/editor"

const formRef = ref(null)
const cascaderAddr = ref(null)
const uploadUrl = ref("/api/store/upload")
const storeCode = ref("")
const loading = ref(true)
// 表单数据
const formData = reactive({
  storeName: "",
  storeTel: "",
  storeManageWx: "",
  address: "",
  detailAddress: "",
  storePeopleCount: 1,
  storeArea: "",
  storePhoto: "", //  图片
  regionCodes: [],
  workStartTime: "",
  workEndTime: "",
  weekendStartTime: "",
  weekendEndTime: "",
  storeAddressLat: "",
  storeAddressLng: "",
  memberExpireType: 0, // 到期类型
  wxNeedPay: 0,
  wxMerchantId: "",
  wxPrivateKey: "",
  wxMerchantSerialNumber: "",
  wxApiV3Key: "",
  wxAppId: ""
})

// 期类型选项
const expireTypeOptions = [
  { label: "激活起算", value: 0 },
  { label: "日期起算", value: 1 }
]

// 表单验证规则
const rules = {
  storeName: [
    { required: true, message: "请输入门店名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  regionCodes: [
    {
      required: true,
      message: "请选择所在地区",
      trigger: "change",
      validator: (rule, value, callback) => {
        if (!value || value.length < 3) {
          callback(new Error("请选择完全的省市区"))
        } else {
          callback()
        }
      }
    }
  ],
  storeManageWx: [
    { required: true, message: "请输入店长微信", trigger: "blur" }
  ],
  storeTel: [{ required: true, message: "请输入门店电话", trigger: "blur" }],
  detailAddress: [
    { required: true, message: "请输入详细地址", trigger: "blur" }
  ],
  storePeopleCount: [
    { required: true, message: "请输入容纳人数", trigger: "blur" },
    { type: "number", min: 1, message: "容纳人数必须大于0", trigger: "blur" }
  ],
  storeArea: [
    { required: true, message: "请输入门店面积", trigger: "blur" },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: "请输入正确的面积数值",
      trigger: "blur"
    }
  ],
  workStartTime: [
    {
      required: true,
      message: "请选择工作日营业开始时间",
      trigger: "change"
    }
  ],
  workEndTime: [
    {
      required: true,
      message: "请选择工作日营业结束时间",
      trigger: "change"
    }
  ],
  weekendStartTime: [
    {
      required: true,
      message: "请选择周末营业开始时间",
      trigger: "change"
    }
  ],
  weekendEndTime: [
    {
      required: true,
      message: "请选择周末营业结束时间",
      trigger: "change"
    }
  ],
  storeAddressLat: [
    { required: true, message: "请选择位置获取纬度", trigger: "change" }
  ],
  memberExpireType: [
    { required: true, message: "请选择到期类型", trigger: "change" }
  ],
  storePhoto: [
    { required: true, message: "请上传门店照片", trigger: "change" }
  ],
  wxMerchantId: [
    { required: true, message: "请输入微信商户号", trigger: "blur" }
  ],
  wxPrivateKey: [
    { required: true, message: "请输入商户API私钥", trigger: "blur" }
  ],
  wxMerchantSerialNumber: [
    { required: true, message: "请输入商户证书序列号", trigger: "blur" }
  ],
  wxApiV3Key: [
    { required: true, message: "请输入商户APIv3密钥", trigger: "blur" }
  ],
  wxAppId: [
    { required: true, message: "请输入微信公众号appid", trigger: "blur" }
  ]
}
const handleAddrChange = (e) => {
  // 获取当前选中节点的数组
  let addrNode = cascaderAddr.value.getCheckedNodes()[0].pathLabels
  let addValue = cascaderAddr.value.getCheckedNodes()[0].pathValues
  formData.address = addrNode
  formData.regionCodes = addValue
  console.log("addrNode", addrNode, addValue)
}

// 提交表单时的处理
const handleSubmit = async () => {
  if (!formRef.value) return
  console.log("formData", formData)
  try {
    await formRef.value.validate()

    // 处理提交数据
    const submitData = {
      sysStoreCode: storeCode.value,
      ...formData,
      provinceCode: formData.regionCodes[0],
      cityCode: formData.regionCodes[1],
      districtCode: formData.regionCodes[2],
      provinceName: formData.address[0],
      cityName: formData.address[1],
      districtName: formData.address[2],
      storeAddressLng: formData.storeAddressLat,
      storeAddressLat: formData.storeAddressLng
    }

    // 删除中间态的数据
    delete submitData.weekdayTime
    delete submitData.weekendTime
    delete submitData.regionCodes
    delete submitData.address
    delete submitData.storeAddressLat
    console.log("提交数据：", submitData)
    let res
    if (storeCode.value) {
      // 编辑
      res = await UserService.editStore(submitData)
    } else {
      // 新增
      res = await UserService.addStore(submitData)
      if (res.code === 0) {
        storeCode.value = res.data // 假设新增接口返回新的门店编码
      }
    }

    if (res.code === 0) {
      ElMessage.success("提交成功")
      SystemInfo.name = formData.storeName
      isEditing.value = false // 提交成功后退出编辑状态
      // 重新获取最新数据
      getStoreDetail(storeCode.value)
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    console.error("表单验证失败：", error)
  }
}
// 如果需要处理回显数据
const handleSetFormData = (data) => {
  if (!data) return

  // 设置基础数据
  Object.keys(formData).forEach((key) => {
    if (data[key] !== undefined) {
      formData[key] = data[key]
    }
  })

  // 处理地址编码
  if (data.provinceCode && data.cityCode && data.districtCode) {
    formData.regionCodes = [data.provinceCode, data.cityCode, data.districtCode]
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  ElMessageBox.confirm("确定要重置表单吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      formRef.value.resetFields()
      formData.weekendTime = ["", ""]
      formData.weekdayTime = ["", ""]
      formData.storeAddressLat = ""
      formData.storeAddressLng = ""
    })
    .catch(() => { })
}

// 地图相关状态
const mapVisible = ref(false)
const map = ref(null)
const marker = ref(null)
const searchKeyword = ref("")
const searchResults = ref([])
const currentLocation = ref(null)

// 计算经纬度显示文本
const locationText = computed(() => {
  if (formData.storeAddressLat && formData.storeAddressLng) {
    return `${formData.storeAddressLat}, ${formData.storeAddressLng}`
  }
  return ""
})

// 修改初始化地图方法
const initMap = () => {
  // 确保地图容器存在
  const container = document.getElementById("mapContainer")
  if (!container) return

  // 如果已经有地图实例，先销毁
  if (map.value) {
    map.value.destroy()
    map.value = null
    marker.value = null
  }

  // 创建新的地图实例
  map.value = new AMap.Map("mapContainer", {
    zoom: 13,
    center:
      formData.storeAddressLat && formData.storeAddressLng
        ? [formData.storeAddressLng, formData.storeAddressLat] // 如果有已选位置，使用已选位置
        : [116.397428, 39.90923] // 默认北京中心点
  })

  // 添加点击事件
  map.value.on("click", (e) => {
    const { lng, lat } = e.lnglat
    updateMarker(lng, lat)
  })

  // 如果已有经纬度，则显示标记
  if (formData.storeAddressLat && formData.storeAddressLng) {
    updateMarker(formData.storeAddressLat, formData.storeAddressLng)
  }
}

// 修改显示地图弹窗方法
const showMapDialog = () => {
  mapVisible.value = true
  // 等待 DOM 更新后初始化地图
  nextTick(() => {
    initMap()
  })
}

// 修改确认位置方法
const confirmLocation = () => {
  if (!currentLocation.value) {
    ElMessage.warning("请先选择位置")
    return
  }

  formData.storeAddressLat = currentLocation.value.lng.toFixed(6)
  formData.storeAddressLng = currentLocation.value.lat.toFixed(6)
  mapVisible.value = false

  // 清理地图实例
  if (map.value) {
    map.value.destroy()
    map.value = null
    marker.value = null
  }
}

// 更新标记点
const updateMarker = (lng, lat) => {
  if (marker.value) {
    marker.value.setPosition([lng, lat])
  } else {
    marker.value = new AMap.Marker({
      position: [lng, lat],
      map: map.value
    })
  }
  currentLocation.value = { lng, lat }
}

// 修改搜索方法
const handleSearch = () => {
  if (!searchKeyword.value) return

  AMap.plugin("AMap.PlaceSearch", () => {
    const placeSearch = new AMap.PlaceSearch({
      city: "全国",
      pageSize: 10,
      pageIndex: 1
    })

    placeSearch.search(searchKeyword.value, (status, result) => {
      if (status === "complete" && result.info === "OK") {
        searchResults.value = result.poiList.pois
      } else {
        searchResults.value = []
        ElMessage.warning("未找到相关地址")
      }
    })
  })
}

// 选择搜索结果
const handleSelectLocation = (item) => {
  const { location } = item
  updateMarker(location.lng, location.lat)
  map.value.setCenter([location.lng, location.lat])
  searchResults.value = []
  searchKeyword.value = ""
}

// 添加上传前验证
const beforePhotoUpload = (file) => {
  const isImage = file.type.startsWith("image/")
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error("只能上传图片文件!")
    return false
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB!")
    return false
  }
  return true
}

// 添加预览相关的状态和方法
const previewVisible = ref(false)

const previewImage = (e) => {
  e.preventDefault()
  previewVisible.value = true
}

const deleteImage = (e) => {
  e.preventDefault()
  ElMessageBox.confirm("确定要删除这张图片吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      formData.storePhoto = ""
      ElMessage.success("删除成功")
    })
    .catch(() => { })
}
// 获取门店列表
const getStoreList = async () => {
  const res = await UserService.getStoreList()
  if (res.code === 0) {
    if (res.data && res.data.length > 0) {
      storeCode.value = res.data[0].sysStoreCode
      getStoreDetail(storeCode.value)
    } else {
      // 没有门店数据时
      loading.value = false
      isEditing.value = true // 自动进入编辑模式
      ElMessage.info("请添加门店信息")
    }
  } else {
    loading.value = false
    ElMessage.error(res.message)
  }
}
// 详情接口
const getStoreDetail = async (storeCode) => {
  loading.value = true
  const res = await UserService.getStoreDetail(storeCode)
  if (res.code === 0) {
    loading.value = false
    handleSetFormData(res.data)
  } else {
    ElMessage.error(res.message)
  }
}

// 组件挂载时获取域数据
onMounted(() => {
  getStoreList()
})

// 在现有的 refs 声明后添加
const isEditing = ref(false)

// 添加编辑控制方法
const startEditing = () => {
  isEditing.value = true
}

// 添加 watch 来监听 wxNeedPay 的变化
watch(
  () => formData.wxNeedPay,
  (newVal) => {
    if (!newVal) {
      // 当关闭微信支付时，清空相关字段
      formData.wxMerchantId = ""
      formData.wxPrivateKey = ""
      formData.wxMerchantSerialNumber = ""
      formData.wxApiV3Key = ""
      formData.wxAppId = ""
    }
  }
)
</script>

<style scoped>
.store-form {
  position: relative;
  padding: 24px;
  background-color: #fff;
  min-height: calc(100vh - 40px);
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 24px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  padding-left: 10px;
  border-left: 4px solid var(--el-color-primary);
}

/* 统一表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

/* 最后一个表单项底部间距清零 */
:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

/* 统一每行的间距 */
.el-row {
  margin-bottom: 0 !important;
}

/* 统一表单项宽度 */
:deep(.el-input),
:deep(.el-select),
:deep(.el-cascader),
:deep(.el-input-number) {
  width: 100%;
}

/* 调整栅格间距 */
:deep(.el-row) {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

:deep(.el-col) {
  padding-right: 12px !important;
  padding-left: 12px !important;
}

/* 时间选择器相关样式 */
.time-separator {
  margin: 0 8px;
  color: #909399;
  display: inline-block;
  vertical-align: middle;
}

.time-label {
  margin: 0 16px;
  font-weight: normal;
  color: #606266;
}

:deep(.time-select) {
  width: 170px !important;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

/* 表单项内容对齐 */
:deep(.el-form-item__content) {
  justify-content: flex-start;
}

/* 文本域样式调整 */
:deep(.el-textarea .el-textarea__inner) {
  min-height: 100px !important;
}

/* 按钮区域样式 */
.form-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

/* 确保表单内容和按钮区域分开 */
.form-content {
  margin-top: 8px;
}

.map-container {
  position: relative;
  width: 100%;
  height: 500px;
}

.map-content {
  width: 100%;
  height: 100%;
}

.map-search {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 300px;
  z-index: 1;
}

.search-result {
  margin-top: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.result-item:hover {
  background-color: #f5f7fa;
}

.map-dialog :deep(.el-dialog) {
  margin-top: 8vh !important;
}

.dialog-footer {
  padding: 10px 0;
}

.upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.store-photo-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration);
  width: 178px;
  height: 178px;
}

.store-photo-uploader:hover {
  border-color: var(--el-color-primary);
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  color: #666;
  font-size: 12px;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

:deep(.el-upload) {
  width: 178px;
  height: 178px;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-wrapper:hover .image-actions {
  opacity: 1;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.action-icon {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: transform 0.2s;
}

.action-icon:hover {
  transform: scale(1.1);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.time-row .el-form-item {
  margin-bottom: 0;
  flex: 1;
}

:deep(.time-select) {
  width: 120px;
}

.time-separator {
  margin: 0 8px;
  color: #909399;
}

.weekend-time {
  margin-left: 20px;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

/* 行间距 */
.mb-20 {
  margin-bottom: 20px !important;
}

/* 支付配置区域样式优化 */
.form-section :deep(.el-form-item) {
  margin-bottom: 0;
  /* 移除表单项默认底部间距 */
}

.form-section :deep(.el-switch) {
  margin-top: 4px;
  /* 微调开关的垂直对齐 */
}
</style>
