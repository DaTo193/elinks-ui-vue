<template>
  <a-modal
    :open="true"
    :title="`成员管理 - ${tenantName}`"
    :footer="null"
    @cancel="emit('close')"
    width="800px"
  >
    <!-- 添加成员表单 -->
    <div style="margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 4px">
      <a-form layout="inline">
        <a-form-item label="用户">
          <a-select
            v-model:value="newMember.userId"
            show-search
            :filter-option="false"
            placeholder="搜索用户名/姓名"
            style="width: 200px"
            :not-found-content="userSearching ? undefined : '无匹配用户'"
            @search="handleUserSearch"
          >
            <template v-if="userSearching" #notFoundContent>
              <a-spin size="small" />
            </template>
            <a-select-option v-for="u in userOptions" :key="u.id" :value="u.id">
              {{ u.name || u.username }} ({{ u.username }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-model:value="newMember.roleId"
            placeholder="请选择角色"
            style="width: 180px"
            @change="handleRoleChange"
          >
            <a-select-option v-for="r in roleOptions" :key="r.id" :value="r.id">
              {{ r.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleAddMember" :disabled="!newMember.userId || !newMember.roleId">确定</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 成员列表 -->
    <a-table
      :columns="memberColumns"
      :dataSource="memberList"
      :loading="memberLoading"
      rowKey="id"
      size="small"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'roleName'">
          <a-tag color="blue">{{ getRoleDisplayName(record) }}</a-tag>
        </template>
        <template v-if="column.key === 'createTime'">
          {{ record.createTime ? new Date(record.createTime).toLocaleString() : '--' }}
        </template>
        <template v-if="column.key === 'action'">
          <a-popconfirm
            title="确认移除该成员？移除后将同步解除其角色授权。"
            @confirm="handleRemoveMember(record.id)"
          >
            <a-button type="link" danger size="small">移除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { onlyMessage } from '@jetlinks-web/utils'
import {
  queryTenantMembers,
  addTenantMember,
  removeTenantMember,
  queryAvailableRoles,
  queryAvailableUsers
} from '../../../../api/tenant'

const props = defineProps<{
  tenantId: string
  tenantName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const memberLoading = ref(false)
const memberList = ref<any[]>([])
const roleOptions = ref<any[]>([])
const userOptions = ref<any[]>([])
const userSearching = ref(false)

const getRoleDisplayName = (record: any) => {
  if (record.roleName) return record.roleName
  const role = roleOptions.value.find((r: any) => r.id === record.roleId)
  return role?.name || record.roleId
}

const newMember = reactive({
  userId: undefined as string | undefined,
  userName: undefined as string | undefined,
  roleId: undefined as string | undefined,
  roleName: undefined as string | undefined,
})

const memberColumns = [
  { title: '用户名', dataIndex: 'userName', key: 'userName' },
  { title: '用户ID', dataIndex: 'userId', key: 'userId', ellipsis: true },
  { title: '角色', key: 'roleName' },
  { title: '加入时间', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 100 },
]

// 加载角色列表
const fetchRoles = async () => {
  const resp = await queryAvailableRoles()
  if (resp.success) {
    roleOptions.value = (resp.result as any[]) || []
  }
}

// 搜索可用用户
let userSearchTimer: any = null
const handleUserSearch = (value: string) => {
  if (userSearchTimer) clearTimeout(userSearchTimer)
  userSearchTimer = setTimeout(() => {
    fetchAvailableUsers(value)
  }, 300)
}

const fetchAvailableUsers = async (keyword?: string) => {
  userSearching.value = true
  try {
    const resp = await queryAvailableUsers(props.tenantId, keyword)
    if (resp.success) {
      userOptions.value = (resp.result as any[]) || []
    }
  } finally {
    userSearching.value = false
  }
}

const handleRoleChange = (roleId: string) => {
  const role = roleOptions.value.find(r => r.id === roleId)
  newMember.roleName = role?.name || roleId
}

// 加载成员列表
const fetchMembers = async () => {
  memberLoading.value = true
  try {
    const resp = await queryTenantMembers(props.tenantId)
    if (resp.success) {
      memberList.value = (resp.result as any[]) || []
    }
  } finally {
    memberLoading.value = false
  }
}

// 添加成员
const handleAddMember = async () => {
  if (!newMember.userId || !newMember.roleId) return

  // 从用户选项中找到用户名
  const user = userOptions.value.find(u => u.id === newMember.userId)
  const payload = {
    userId: newMember.userId,
    userName: user?.name || user?.username || newMember.userId,
    roleId: newMember.roleId,
    roleName: newMember.roleName,
  }

  const resp = await addTenantMember(props.tenantId, payload)
  if (resp.success) {
    onlyMessage('添加成功')
    newMember.userId = undefined
    newMember.userName = undefined
    newMember.roleId = undefined
    newMember.roleName = undefined
    fetchMembers()
    fetchAvailableUsers()
  }
}

// 移除成员
const handleRemoveMember = async (memberId: string) => {
  const resp = await removeTenantMember(props.tenantId, memberId)
  if (resp.success !== false) {
    onlyMessage('移除成功')
    fetchMembers()
    fetchAvailableUsers()
  }
}

onMounted(() => {
  fetchRoles()
  fetchMembers()
  fetchAvailableUsers()
})
</script>
