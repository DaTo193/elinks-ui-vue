<template>
  <j-page-container>
    <pro-search
      :columns="columns"
      target="platform-tenant-access"
      @search="handleParams"
    />
    <FullPage>
      <j-pro-table
        ref="tableRef"
        :columns="columns"
        :request="queryAccessList"
        mode="TABLE"
        :params="queryParams"
        :defaultParams="{
          sorts: [{ name: 'grantTime', order: 'desc' }],
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
              新增授权
            </j-permission-button>
          </a-space>
        </template>
        <template #grantTime="slotProps">
          {{ slotProps.grantTime ? dayjs(slotProps.grantTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
        </template>
        <template #action="slotProps">
          <a-space :size="16">
            <j-permission-button
              :hasPermission="`${permission}:update`"
              type="link"
              :tooltip="{ title: '菜单权限' }"
              @click="openMenuDialog(slotProps)"
            >
              <AIcon type="MenuOutlined" />
            </j-permission-button>
            <j-permission-button
              type="link"
              :hasPermission="`${permission}:delete`"
              danger
              :tooltip="{ title: '撤销授权' }"
              :popConfirm="{
                title: '确认撤销该授权？',
                onConfirm: () => handleRevoke(slotProps.id),
              }"
            >
              <AIcon type="DeleteOutlined" />
            </j-permission-button>
          </a-space>
        </template>
      </j-pro-table>
    </FullPage>

    <!-- 新增授权弹窗 -->
    <GrantDialog
      v-if="grantDialog.visible"
      @close="grantDialog.visible = false"
      @save="handleGrantSave"
    />

    <!-- 菜单权限弹窗 -->
    <MenuPermissionDialog
      v-if="menuDialog.visible"
      :accessId="menuDialog.accessId"
      :userId="menuDialog.userId"
      :userName="menuDialog.userName"
      :tenantId="menuDialog.tenantId"
      :tenantName="menuDialog.tenantName"
      @close="menuDialog.visible = false"
    />
  </j-page-container>
</template>

<script setup lang="ts" name="PlatformTenantAccess">
import dayjs from 'dayjs'
import { onlyMessage } from '@jetlinks-web/utils'
import { queryAccess, revokeAccess } from '../../../api/tenantAccess'
import GrantDialog from './components/GrantDialog.vue'
import MenuPermissionDialog from './components/MenuPermissionDialog.vue'

const permission = 'system/TenantAccess'

const tableRef = ref()
const queryParams = ref({})

const columns = [
  {
    title: '用户名称',
    dataIndex: 'userName',
    key: 'userName',
    ellipsis: true,
    search: { type: 'string' },
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
    ellipsis: true,
    search: { type: 'string' },
  },
  {
    title: '授权租户',
    dataIndex: 'tenantName',
    key: 'tenantName',
    ellipsis: true,
    search: { type: 'string' },
  },
  {
    title: '授权时间',
    dataIndex: 'grantTime',
    key: 'grantTime',
    width: 180,
    scopedSlots: true,
    search: { type: 'date' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    fixed: 'right',
    width: 150,
    scopedSlots: true,
  },
]

const grantDialog = reactive({
  visible: false,
})

const menuDialog = reactive({
  visible: false,
  accessId: '',
  userId: '',
  userName: '',
  tenantId: '',
  tenantName: '',
})

const handleParams = (params: any) => {
  queryParams.value = { terms: params?.terms || [] }
}

// 使用后端 _query 接口查询
const queryAccessList = async (params: any) => {
  return queryAccess(params)
}

const openDialog = () => {
  grantDialog.visible = true
}

const openMenuDialog = (row: any) => {
  menuDialog.accessId = row.id
  menuDialog.userId = row.userId
  menuDialog.userName = row.userName
  menuDialog.tenantId = row.tenantId
  menuDialog.tenantName = row.tenantName
  menuDialog.visible = true
}

const handleRevoke = async (id: string) => {
  const resp = await revokeAccess(id)
  if (resp.success !== false) {
    onlyMessage('操作成功')
    tableRef.value?.reload()
  }
}

const handleGrantSave = () => {
  grantDialog.visible = false
  tableRef.value?.reload()
}
</script>
