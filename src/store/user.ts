import { defineStore } from 'pinia'
import { detail } from '@/api/system/user'
import { tabList } from "@/views/account/center/data";
import {LocalStore} from "@jetlinks-web/utils/src/storage";

type UserInfo = {
  name: string
  icon: string
  tenantId?: string
  tenantName?: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<Partial<UserInfo>>({})
  const isAdmin = ref(false)
  const isApplicationUser = ref(false)
  const isPlatformAdmin = ref(false)
  const tenantId = ref<string | undefined>(undefined)
  const tenantName = ref<string | undefined>(undefined)
  const tabKey = ref(tabList?.[0]?.key || 'HomeView') // 个人中心的tabKey,
  const other = {
    tabKey: '' // 站内信的tabkey
  }
  const alarmUpdateCount = ref(0)
  /**
   * 设置用户信息
   * @param data
   */
  const setUserInfo = (data: Partial<UserInfo>) => {
    userInfo.value = data
  }

  /**
   * 获取用户信息
   */
  const getUserInfo = async () => {
    const resp = await detail()
    if (resp.success) {
      setUserInfo(resp.result)
      isAdmin.value = resp.result.username === 'admin'
      isApplicationUser.value = resp.result.type?.id === 'application'
      // 租户信息仅用于前端展示，不再用于请求头注入
      tenantId.value = resp.result.tenantId
      tenantName.value = resp.result.tenantName
      // 平台管理员 = admin 用户且无租户
      isPlatformAdmin.value = resp.result.username === 'admin' && !resp.result.tenantId
      LocalStore.set('userId', resp.result?.id)
    }
  }
  const updateAlarm = () => {
    alarmUpdateCount.value += 1
  }

  return {
    tabKey,
    other,
    userInfo,
    alarmUpdateCount,
    isAdmin,
    isApplicationUser,
    isPlatformAdmin,
    tenantId,
    tenantName,
    getUserInfo,
    setUserInfo,
    updateAlarm
  }
})

