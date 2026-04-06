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
      // 平台管理员 = admin 用户且不属于任何租户
      isPlatformAdmin.value = resp.result.username === 'admin' && !resp.result.tenantId
      tenantId.value = resp.result.tenantId
      tenantName.value = resp.result.tenantName
      if (resp.result.tenantId) {
        LocalStore.set('tenantId', resp.result.tenantId)
      } else {
        LocalStore.remove('tenantId')
      }
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

