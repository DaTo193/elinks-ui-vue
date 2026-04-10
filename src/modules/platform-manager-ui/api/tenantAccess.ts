import { request } from '@jetlinks-web/core'

const BASE = '/platform/tenant-access'

/**
 * 分页查询跨租户授权列表
 */
export const queryAccess = (data: any) => request.post(`${BASE}/_query`, data)

/**
 * 为用户授权访问租户
 */
export const grantAccess = (data: {
  userId: string
  userName?: string
  tenantId: string
  tenantName?: string
}) => request.post(BASE, data)

/**
 * 撤销跨租户访问授权
 */
export const revokeAccess = (id: string) => request.remove(`${BASE}/${id}`)

/**
 * 查询用户的跨租户授权列表
 */
export const getUserAccess = (userId: string) => request.get(`${BASE}/user/${userId}`)

/**
 * 设置用户在指定租户下的菜单权限
 */
export const setAccessMenus = (accessId: string, data: {
  menuIds?: string[]
  buttons?: any[]
}) => request.put(`${BASE}/${accessId}/menus`, data)

/**
 * 获取用户在指定租户下的菜单权限
 */
export const getAccessMenus = (accessId: string) => request.get(`${BASE}/${accessId}/menus`)
