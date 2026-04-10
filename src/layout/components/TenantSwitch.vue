<template>
  <div class="tenant-switch" v-if="tenantStore.isMultiTenantUser">
    <Select
      :value="userStore.tenantId"
      @change="handleSwitch"
      size="small"
      style="min-width: 120px"
    >
      <SelectOption
        v-for="t in tenantStore.accessibleTenants"
        :key="t.id"
        :value="t.id"
      >
        {{ t.name }}
      </SelectOption>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { useTenantStore } from '@/store/tenant'
import { useUserStore } from '@/store/user'
import { Select, SelectOption } from 'ant-design-vue'
import { onMounted } from 'vue'

const tenantStore = useTenantStore()
const userStore = useUserStore()

const handleSwitch = (tenantId: string) => {
  tenantStore.switchTenant(tenantId)
}

onMounted(() => {
  tenantStore.loadAccessibleTenants()
})
</script>

<style scoped>
.tenant-switch {
  display: flex;
  align-items: center;
  margin-right: 12px;
}
</style>
