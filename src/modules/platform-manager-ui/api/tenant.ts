import { request } from '@jetlinks-web/core'

const BASE = '/api/platform/tenant'

/**
 * 查询租户列表（分页）
 */
export const queryTenant = (data: any) => request.post(`${BASE}/_query`, data)

/**
 * 查询租户列表（不分页）
 */
export const queryTenantNoPaging = (data?: any) => request.post(`${BASE}/_query/no-paging`, data || { paging: false })

/**
 * 新增租户
 */
export const addTenant = (data: any) => request.post(BASE, data)

/**
 * 修改租户
 */
export const updateTenant = (data: any) => request.patch(BASE, data)

/**
 * 删除租户
 */
export const deleteTenant = (id: string) => request.remove(`${BASE}/${id}`)

/**
 * 获取租户详情
 */
export const getTenantDetail = (id: string) => request.get(`${BASE}/${id}`)

/**
 * 查询可用的角色列表
 */
export const queryAvailableRoles = () => request.get(`${BASE}/roles`)

/**
 * 查询可添加的用户（不在指定租户中的用户）
 */
export const queryAvailableUsers = (tenantId: string, keyword?: string) => {
  let url = `${BASE}/users/available?tenantId=${tenantId}`
  if (keyword && keyword.trim()) {
    url += `&keyword=${encodeURIComponent(keyword.trim())}`
  }
  return request.get(url)
}

/**
 * 查询租户成员列表
 */
export const queryTenantMembers = (tenantId: string) =>
  request.get(`${BASE}/${tenantId}/members`)

/**
 * 添加租户成员
 */
export const addTenantMember = (tenantId: string, data: any) =>
  request.post(`${BASE}/${tenantId}/members`, data)

/**
 * 移除租户成员
 */
export const removeTenantMember = (tenantId: string, memberId: string) =>
  request.remove(`${BASE}/${tenantId}/members/${memberId}`)
