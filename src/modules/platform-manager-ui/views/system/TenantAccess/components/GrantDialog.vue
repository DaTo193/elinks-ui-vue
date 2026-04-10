<template>
  <a-modal
    :open="true"
    title="新增跨租户授权"
    :confirmLoading="loading"
    @ok="handleSubmit"
    @cancel="emit('close')"
    width="500px"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :labelCol="{ span: 5 }"
      :wrapperCol="{ span: 18 }"
    >
      <a-form-item label="选择用户" name="userId">
        <a-select
          v-model:value="formData.userId"
          placeholder="请搜索并选择用户"
          show-search
          :filter-option="false"
          :options="userOptions"
          :field-names="{ label: 'name', value: 'id' }"
          @search="handleUserSearch"
          @change="onUserChange"
        />
      </a-form-item>
      <a-form-item label="授权租户" name="tenantId">
        <a-select
          v-model:value="formData.tenantId"
          placeholder="请选择租户"
          :options="tenantOptions"
          :field-names="{ label: 'name', value: 'id' }"
          show-search
          :filter-option="filterTenant"
          @change="onTenantChange"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { onlyMessage } from '@jetlinks-web/utils'
import { grantAccess } from '../../../../api/tenantAccess'
import { queryTenantNoPaging } from '../../../../api/tenant'
import { request } from '@jetlinks-web/core'

const emit = defineEmits(['close', 'save'])

const formRef = ref()
const loading = ref(false)
const userOptions = ref<any[]>([])
const tenantOptions = ref<any[]>([])

const formData = reactive({
  userId: undefined as string | undefined,
  userName: '',
  tenantId: undefined as string | undefined,
  tenantName: '',
})

const rules = {
  userId: [{ required: true, message: '请选择用户' }],
  tenantId: [{ required: true, message: '请选择租户' }],
}

// 加载租户列表
queryTenantNoPaging().then((resp: any) => {
  if (resp.success !== false && resp.result) {
    tenantOptions.value = Array.isArray(resp.result) ? resp.result : []
  }
})

// 初始加载用户列表
const loadUsers = async (keyword?: string) => {
  const terms: any = { paging: false }
  if (keyword) {
    terms.terms = [{ terms: [{ column: 'name', termType: 'like', value: `%${keyword}%` }] }]
  }
  const resp = await request.post('/user/_query/no-paging', terms)
  if (resp.result) {
    userOptions.value = (Array.isArray(resp.result) ? resp.result : []).map((u: any) => ({
      id: u.id,
      name: `${u.name || u.username} (${u.username})`,
      username: u.username,
      rawName: u.name,
    }))
  }
}
loadUsers()

let searchTimer: any = null
const handleUserSearch = (value: string) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadUsers(value), 300)
}

const onUserChange = (value: string) => {
  const user = userOptions.value.find((u: any) => u.id === value)
  formData.userName = user?.rawName || user?.username || ''
}

const filterTenant = (input: string, option: any) => {
  return option.name?.toLowerCase().includes(input.toLowerCase())
}

const onTenantChange = (value: string) => {
  const tenant = tenantOptions.value.find((t: any) => t.id === value)
  formData.tenantName = tenant?.name || ''
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  loading.value = true
  try {
    const resp = await grantAccess({
      userId: formData.userId!,
      userName: formData.userName,
      tenantId: formData.tenantId!,
      tenantName: formData.tenantName,
    })
    if (resp.success !== false) {
      onlyMessage('授权成功')
      emit('save')
    }
  } finally {
    loading.value = false
  }
}
</script>
