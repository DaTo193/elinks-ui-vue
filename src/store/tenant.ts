import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { request } from '@jetlinks-web/core'
import { LocalStore, setToken } from '@jetlinks-web/utils'

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
   * 切换租户
   * 设置新的 tenantId 到 store 和 LocalStore，然后刷新页面
   */
  const switchTenant = (tenantId: string) => {
    userStore.tenantId = tenantId
    LocalStore.set('tenantId', tenantId)
    // 刷新页面使新的租户上下文生效
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
