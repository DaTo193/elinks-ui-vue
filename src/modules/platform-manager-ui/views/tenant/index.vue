<template>
  <j-page-container>
    <pro-search
      :columns="columns"
      target="platform-tenant"
      @search="handleParams"
    />
    <FullPage>
      <j-pro-table
        ref="tableRef"
        :columns="columns"
        :request="queryTenant"
        mode="TABLE"
        :params="queryParams"
        :defaultParams="{
          sorts: [{ name: 'createTime', order: 'desc' }],
        }"
        :scroll="{ y: 'calc(100% - 60px)' }"
      >
        <template #headerLeftRender>
          <a-space>
            <j-permission-button
              :hasPermission="`${permission}:add`"
              type="primary"
              @click="openDialog('add')"
            >
              <AIcon type="PlusOutlined" />
              新增
            </j-permission-button>
          </a-space>
        </template>
        <template #status="slotProps">
          <j-badge-status
            :status="slotProps.status"
            :text="slotProps.status === 1 ? '正常' : '禁用'"
            :statusNames="{ 1: 'success', 0: 'error' }"
          />
        </template>
        <template #createTime="slotProps">
          {{ slotProps.createTime ? dayjs(slotProps.createTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
        </template>
        <template #action="slotProps">
          <a-space :size="16">
            <j-permission-button
              :hasPermission="`${permission}:update`"
              type="link"
              :tooltip="{ title: '编辑' }"
              @click="openDialog('edit', slotProps)"
            >
              <AIcon type="EditOutlined" />
            </j-permission-button>
            <j-permission-button
              :hasPermission="`${permission}:action`"
              type="link"
              :tooltip="{ title: '成员管理' }"
              @click="openMemberDialog(slotProps)"
            >
              <AIcon type="TeamOutlined" />
            </j-permission-button>
            <j-permission-button
              type="link"
              :hasPermission="`${permission}:delete`"
              danger
              :tooltip="{ title: '删除' }"
              :popConfirm="{
                title: '确认删除该租户？',
                onConfirm: () => handleDelete(slotProps.id),
              }"
            >
              <AIcon type="DeleteOutlined" />
            </j-permission-button>
          </a-space>
        </template>
      </j-pro-table>
    </FullPage>
  </j-page-container>

  <!-- 新增/编辑弹窗 -->
  <TenantSaveDialog
    v-if="dialog.visible"
    :type="dialog.type"
    :data="dialog.selectItem"
    @close="dialog.visible = false"
    @save="handleSave"
  />

  <!-- 成员管理弹窗 -->
  <MemberDialog
    v-if="memberDialog.visible"
    :tenantId="memberDialog.tenantId"
    :tenantName="memberDialog.tenantName"
    @close="memberDialog.visible = false"
  />
</template>

<script setup lang="ts" name="PlatformTenant">
import dayjs from 'dayjs'
import { onlyMessage } from '@jetlinks-web/utils'
import { queryTenant, deleteTenant } from '../../api/tenant'
import TenantSaveDialog from './components/SaveDialog.vue'
import MemberDialog from './components/MemberDialog.vue'

const permission = 'platform/Tenant'

const tableRef = ref()
const queryParams = ref({})

const columns = [
  {
    title: '租户编码',
    dataIndex: 'code',
    key: 'code',
    ellipsis: true,
    search: { type: 'string' },
  },
  {
    title: '租户名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    search: { type: 'string' },
  },
  {
    title: '联系人',
    dataIndex: 'contact',
    key: 'contact',
    ellipsis: true,
    search: { type: 'string' },
  },
  {
    title: '联系电话',
    dataIndex: 'telephone',
    key: 'telephone',
    ellipsis: true,
    search: { type: 'string' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    scopedSlots: true,
    search: {
      type: 'select',
      options: [
        { label: '正常', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    scopedSlots: true,
    search: { type: 'date' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    fixed: 'right',
    width: 200,
    scopedSlots: true,
  },
]

const dialog = reactive({
  visible: false,
  type: '' as 'add' | 'edit',
  selectItem: {} as any,
})

const memberDialog = reactive({
  visible: false,
  tenantId: '',
  tenantName: '',
})

const handleParams = (params: any) => {
  queryParams.value = { terms: params?.terms || [] }
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialog.type = type
  dialog.selectItem = row ? { ...row } : {}
  dialog.visible = true
}

const openMemberDialog = (row: any) => {
  memberDialog.tenantId = row.id
  memberDialog.tenantName = row.name
  memberDialog.visible = true
}

const handleDelete = async (id: string) => {
  const resp = await deleteTenant(id)
  if (resp.success) {
    onlyMessage('操作成功')
    tableRef.value?.reload()
  }
}

const handleSave = () => {
  dialog.visible = false
  tableRef.value?.reload()
}
</script>
