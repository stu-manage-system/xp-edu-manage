import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

const piniaInstance = createPinia();

piniaInstance.use(
  createPersistedState({
    storage: window.localStorage,
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  }),
);

export default piniaInstance;
export { useUserStore } from "./modules/user";
