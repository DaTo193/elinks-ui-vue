import { getModuleRoutesMap } from '@jetlinks-web/utils'
import { moduleRegistry } from '@/utils/module-registry'
import { name } from './package.json'

const routerModules = import.meta.glob('./views/**/index.vue')

const register = () => {
  moduleRegistry.register(name, {})
}

export default {
  getAsyncRoutesMap: () => getModuleRoutesMap(routerModules),
  register
}
