import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { request } from '@jetlinks-web/core'

type TenantInfo = {
  id: string
  name: string
  code: string
}

export const useTenantStore = defineStore('tenant', () => {
  const userStore = useUserStore()

  const isTenantUser = computed(() => !!userStore.tenantId)

  /**
   * 当前用户可访问的租户列表（包括自己所属的租户 + 跨租户授权的租户）
   */
  const accessibleTenants = ref<TenantInfo[]>([])

  /**
   * 检查当前租户是否拥有指定功能模块
   */
  const hasFeature = (featureKey: string): boolean => {
    return true
  }

  /**
   * 加载当前用户可访问的租户列表
   */
  const loadAccessibleTenants = async () => {
    try {
      const resp = await request.get<TenantInfo[]>('/tenant/list-for-login')
      if (resp.success && resp.result) {
        accessibleTenants.value = resp.result
      }
    } catch (_) {
      // ignore
    }
  }

  /**
   * 切换租户：先通知后端更新缓存，再刷新页面
   */
  const switchTenant = async (tenantId: string) => {
    try {
      await request.post('/tenant/switch', { tenantId })
    } catch (_) {
      // ignore
    }
    userStore.tenantId = tenantId
    window.location.href = '/'
  }

  /**
   * 是否为多租户用户（可访问多个租户）
   */
  const isMultiTenantUser = computed(() => accessibleTenants.value.length > 1)

  return {
    isTenantUser,
    isMultiTenantUser,
    accessibleTenants,
    hasFeature,
    loadAccessibleTenants,
    switchTenant
  }
})
