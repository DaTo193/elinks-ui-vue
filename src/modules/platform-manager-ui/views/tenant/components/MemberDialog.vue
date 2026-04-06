<template>
  <a-modal
    :open="true"
    :title="`成员管理 - ${tenantName}`"
    :footer="null"
    @cancel="emit('close')"
    width="800px"
  >
    <div style="margin-bottom: 16px">
      <a-space>
        <a-button type="primary" @click="showAddMember = true">添加成员</a-button>
      </a-space>
    </div>

    <div v-if="showAddMember" style="margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 4px">
      <a-form layout="inline">
        <a-form-item label="用户ID">
          <a-input v-model:value="newMember.userId" placeholder="请输入用户ID" style="width: 200px" />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="newMember.userName" placeholder="请输入用户名" style="width: 200px" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="newMember.role" style="width: 120px">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="member">成员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleAddMember">确定</a-button>
            <a-button @click="showAddMember = false">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <a-table
      :columns="memberColumns"
      :dataSource="memberList"
      :loading="memberLoading"
      rowKey="id"
      size="small"
      :pagination="false"
    >
      <template #role="text">
        <a-tag :color="text === 'admin' ? 'blue' : 'default'">
          {{ text === 'admin' ? '管理员' : '成员' }}
        </a-tag>
      </template>
      <template #action="record">
        <a-popconfirm
          title="确认移除该成员？"
          @confirm="handleRemoveMember(record.id)"
        >
          <a-button type="link" danger size="small">移除</a-button>
        </a-popconfirm>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { onlyMessage } from '@jetlinks-web/utils'
import { queryTenantMembers, addTenantMember, removeTenantMember } from '../../../api/tenant'

const props = defineProps<{
  tenantId: string
  tenantName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const memberLoading = ref(false)
const memberList = ref<any[]>([])
const showAddMember = ref(false)

const newMember = reactive({
  userId: '',
  userName: '',
  role: 'member',
})

const memberColumns = [
  { title: '用户ID', dataIndex: 'userId', key: 'userId' },
  { title: '用户名', dataIndex: 'userName', key: 'userName' },
  { title: '角色', dataIndex: 'role', key: 'role', scopedSlots: { customRender: 'role' } },
  { title: '加入时间', dataIndex: 'createTime', key: 'createTime', customRender: ({ text }: any) => text ? new Date(text).toLocaleString() : '--' },
  { title: '操作', key: 'action', width: 100 },
]

const fetchMembers = async () => {
  memberLoading.value = true
  try {
    const resp = await queryTenantMembers(props.tenantId)
    if (resp.success) {
      memberList.value = resp.result || []
    }
  } finally {
    memberLoading.value = false
  }
}

const handleAddMember = async () => {
  if (!newMember.userId) {
    onlyMessage('请输入用户ID', 'warning')
    return
  }
  const resp = await addTenantMember(props.tenantId, { ...newMember })
  if (resp.success) {
    onlyMessage('添加成功')
    showAddMember.value = false
    newMember.userId = ''
    newMember.userName = ''
    newMember.role = 'member'
    fetchMembers()
  }
}

const handleRemoveMember = async (memberId: string) => {
  const resp = await removeTenantMember(props.tenantId, memberId)
  if (resp.success !== false) {
    onlyMessage('移除成功')
    fetchMembers()
  }
}

onMounted(() => {
  fetchMembers()
})
</script>
