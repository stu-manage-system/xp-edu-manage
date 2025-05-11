import { useUserStore } from "@/store/modules/user";
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import EmojiText from "../emojo";

const router = useRouter();
const axiosInstance = axios.create({
  timeout: 15000, // 请求超时时间(毫秒)
  baseURL: "/edu", // API地址
  withCredentials: true, // 异步请求携带cookie
  transformRequest: [(data) => JSON.stringify(data)], // 请求数据转换为 JSON 字符串
  validateStatus: (status) => status >= 200 && status < 300, // 只接受 2xx 的状态码
  headers: {
    get: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    post: { "Content-Type": "application/json;charset=utf-8" },
  },
  transformResponse: [
    (data) => {
      // 响应数据转换
      try {
        return typeof data === "string" && data.startsWith("{")
          ? JSON.parse(data)
          : data;
      } catch {
        return data; // 解析失败时返回原数据
      }
    },
  ],
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const token = useUserStore().token;

    // 如果 token 存在，则设置请求头
    if (token) {
      request.headers.set({
        "Content-Type": "application/json",
        Authorization: token,
        "Sys-Route": "S-Authorization",
        "X-App-Request-Flag": "7ffe419073fb67bffaa480fbc6673405",
      });
    }

    return request; // 返回修改后的配置
  },
  (error) => {
    ElMessage.error(`服务器异常！ ${EmojiText[500]}`); // 显示错误消息
    return Promise.reject(error); // 返回拒绝的 Promise
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use((response: AxiosResponse) => {
  // 指定一个错误码  读到时直接退出系统
  const errorCode = 100028;
  if (response.data.code != 0) {
    const msg = response.data.message ? response.data.message : "服务错误";
    if (
      response.data.code === "tokenError" ||
      response.data.code == errorCode
    ) {
      ElMessage.error(msg);
      useUserStore().logOut();
      router.push("/login");
    } else if (response.data.code !== 0) {
      ElMessage.error(msg);
    }
  }
  return response;
});

// 请求
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  // 将 POST | PUT 请求的参数放入 data 中，并清空 params
  // if (config.method === "POST" || config.method === "PUT") {
  //   config.data = config.params;
  //   config.params = {};
  // }
  try {
    const res = await axiosInstance.request<T>({ ...config });
    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      // 可以在这里处理 Axios 错误
    }
    return Promise.reject(e);
  }
}

// API 方法集合
const api = {
  get<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: "GET" }); // GET 请求
  },
  post<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: "POST" }); // POST 请求
  },
  put<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: "PUT" }); // PUT 请求
  },
  del<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: "DELETE" }); // DELETE 请求
  },
};

function isResponseModel(obj: any): boolean {
  return obj && "code" in obj && "message" in obj;
}

export default api;
