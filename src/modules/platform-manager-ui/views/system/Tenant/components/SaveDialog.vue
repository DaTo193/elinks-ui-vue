<template>
  <a-modal
    :open="true"
    :title="type === 'add' ? '新增租户' : '编辑租户'"
    :confirmLoading="loading"
    @ok="handleSubmit"
    @cancel="emit('close')"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :labelCol="{ span: 5 }"
      :wrapperCol="{ span: 18 }"
    >
      <a-form-item label="租户编码" name="code">
        <a-input v-model:value="formData.code" :disabled="type === 'edit'" placeholder="请输入租户编码" />
      </a-form-item>
      <a-form-item label="租户名称" name="name">
        <a-input v-model:value="formData.name" placeholder="请输入租户名称" />
      </a-form-item>
      <a-form-item label="联系人" name="contact">
        <a-input v-model:value="formData.contact" placeholder="请输入联系人" />
      </a-form-item>
      <a-form-item label="联系电话" name="telephone">
        <a-input v-model:value="formData.telephone" placeholder="请输入联系电话" />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio :value="1">正常</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="说明" name="describe">
        <a-textarea v-model:value="formData.describe" placeholder="请输入说明" :rows="3" />
      </a-form-item>
      <a-form-item label="最大设备数" name="maxDeviceCount">
        <a-input-number v-model:value="formData.maxDeviceCount" :min="0" placeholder="0 表示不限制" style="width: 100%" />
      </a-form-item>
      <a-form-item label="最大产品数" name="maxProductCount">
        <a-input-number v-model:value="formData.maxProductCount" :min="0" placeholder="0 表示不限制" style="width: 100%" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { onlyMessage } from '@jetlinks-web/utils'
import { addTenant, updateTenant } from '../../../../api/tenant'

const props = defineProps<{
  type: 'add' | 'edit'
  data: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const formRef = ref()
const loading = ref(false)

const formData = reactive({
  id: undefined as string | undefined,
  code: '',
  name: '',
  contact: '',
  telephone: '',
  status: 1,
  describe: '',
  maxDeviceCount: undefined as number | undefined,
  maxProductCount: undefined as number | undefined,
})

const rules = {
  code: [{ required: true, message: '请输入租户编码' }],
  name: [{ required: true, message: '请输入租户名称' }],
}

onMounted(() => {
  if (props.type === 'edit' && props.data) {
    Object.assign(formData, {
      id: props.data.id,
      code: props.data.code || '',
      name: props.data.name || '',
      contact: props.data.contact || '',
      telephone: props.data.telephone || '',
      status: props.data.status ?? 1,
      describe: props.data.describe || '',
      maxDeviceCount: props.data.quota?.maxDeviceCount,
      maxProductCount: props.data.quota?.maxProductCount,
    })
  }
})

const handleSubmit = async () => {
  await formRef.value?.validate()
  loading.value = true

  try {
    const payload: any = {
      ...formData,
      quota: {
        maxDeviceCount: formData.maxDeviceCount || 0,
        maxProductCount: formData.maxProductCount || 0,
      },
    }
    delete payload.maxDeviceCount
    delete payload.maxProductCount

    const resp = props.type === 'add'
      ? await addTenant(payload)
      : await updateTenant(payload)

    if (resp.success) {
      onlyMessage('操作成功')
      emit('save')
    }
  } finally {
    loading.value = false
  }
}
</script>
