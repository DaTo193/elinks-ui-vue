<template>
  <a-modal
    :open="true"
    :title="`菜单权限 - ${userName} 访问 ${tenantName}`"
    :confirmLoading="saving"
    @ok="handleSave"
    @cancel="emit('close')"
    width="600px"
  >
    <a-spin :spinning="loading">
      <a-tree
        v-model:checkedKeys="checkedKeys"
        :tree-data="menuTree"
        :field-names="{ title: 'name', key: 'id', children: 'children' }"
        checkable
        default-expand-all
      />
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { onlyMessage } from '@jetlinks-web/utils'
import { getAccessMenus, setAccessMenus } from '../../../../api/tenantAccess'
import { getOwnMenuThree } from '@/api/system/menu'

const props = defineProps<{
  accessId: string
  userId: string
  userName: string
  tenantId: string
  tenantName: string
}>()

const emit = defineEmits(['close'])

const loading = ref(false)
const saving = ref(false)
const menuTree = ref<any[]>([])
const checkedKeys = ref<string[]>([])

// 加载租户可见菜单树
const loadMenus = async () => {
  loading.value = true
  try {
    const resp = await getOwnMenuThree({
      paging: false,
      terms: [
        {
          terms: [
            {
              column: 'owner',
              termType: 'nlike',
              value: 'platform',
            },
          ],
        },
      ],
      sorts: [{ name: 'sortIndex', order: 'asc' }],
    })
    if (resp.result) {
      menuTree.value = buildTree(resp.result)
    }

    // 加载已配置的菜单权限
    const menuResp = await getAccessMenus(props.accessId)
    if (menuResp && menuResp.menuIds) {
      checkedKeys.value = menuResp.menuIds
    }
  } finally {
    loading.value = false
  }
}

// 将扁平菜单列表构建为树结构
const buildTree = (list: any[]) => {
  const map = new Map<string, any>()
  const roots: any[] = []

  list.forEach((item: any) => {
    map.set(item.id, { ...item, children: [] })
  })

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

const handleSave = async () => {
  saving.value = true
  try {
    const resp = await setAccessMenus(props.accessId, {
      menuIds: checkedKeys.value,
    })
    if (resp.success !== false) {
      onlyMessage('保存成功')
      emit('close')
    }
  } finally {
    saving.value = false
  }
}

loadMenus()
</script>
