import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useTenantStore = defineStore('tenant', () => {
  const isTenantUser = computed(() => {
    const userStore = useUserStore()
    return !!userStore.tenantId
  })

  /**
   * 检查当前租户是否拥有指定功能模块
   * 后续可扩展为从租户 features 配置中判断
   */
  const hasFeature = (featureKey: string): boolean => {
    // 当前阶段：所有租户用户默认拥有全部功能
    // 后续可根据 tenantEntity.features 列表做精细化控制
    return isTenantUser.value ? true : true
  }

  return {
    isTenantUser,
    hasFeature
  }
})
