<template>
    <j-page-container>
        <div class="platform-home-container">
            <a-row :gutter="24">
                <a-col :span="8">
                    <div class="stat-card">
                        <div class="stat-icon tenant-icon">
                            <AIcon type="TeamOutlined" />
                        </div>
                        <div class="stat-info">
                            <div class="stat-label">租户总数</div>
                            <div class="stat-value">{{ tenantCount }}</div>
                        </div>
                    </div>
                </a-col>
                <a-col :span="8">
                    <div class="stat-card">
                        <div class="stat-icon active-icon">
                            <AIcon type="CheckCircleOutlined" />
                        </div>
                        <div class="stat-info">
                            <div class="stat-label">启用租户</div>
                            <div class="stat-value">{{ activeCount }}</div>
                        </div>
                    </div>
                </a-col>
                <a-col :span="8">
                    <div class="stat-card">
                        <div class="stat-icon member-icon">
                            <AIcon type="UserOutlined" />
                        </div>
                        <div class="stat-info">
                            <div class="stat-label">总用户数</div>
                            <div class="stat-value">{{ userCount }}</div>
                        </div>
                    </div>
                </a-col>
            </a-row>

            <a-row :gutter="24" style="margin-top: 24px">
                <a-col :span="12">
                    <div class="quick-card">
                        <h4 class="card-title">快捷操作</h4>
                        <div class="quick-list">
                            <div class="quick-item" @click="jumpTo('system/Tenant')">
                                <AIcon type="PlusCircleOutlined" style="font-size: 24px; color: #1d39c4" />
                                <span>创建租户</span>
                            </div>
                            <div class="quick-item" @click="jumpTo('system/Tenant')">
                                <AIcon type="TeamOutlined" style="font-size: 24px; color: #1890ff" />
                                <span>租户管理</span>
                            </div>
                            <div class="quick-item" @click="jumpTo('system/Role')">
                                <AIcon type="SafetyOutlined" style="font-size: 24px; color: #52c41a" />
                                <span>角色管理</span>
                            </div>
                            <div class="quick-item" @click="jumpTo('system/Log')">
                                <AIcon type="FileTextOutlined" style="font-size: 24px; color: #faad14" />
                                <span>系统日志</span>
                            </div>
                        </div>
                    </div>
                </a-col>
                <a-col :span="12">
                    <div class="quick-card">
                        <h4 class="card-title">系统状态</h4>
                        <div class="system-info">
                            <div class="info-row">
                                <span class="info-label">CPU 使用率</span>
                                <a-progress :percent="cpu" :stroke-color="'#85a5ff'" size="small" />
                            </div>
                            <div class="info-row">
                                <span class="info-label">JVM 堆使用率</span>
                                <a-progress :percent="jvm" :stroke-color="'#d3adf7'" size="small" />
                            </div>
                        </div>
                    </div>
                </a-col>
            </a-row>
        </div>
    </j-page-container>
</template>

<script setup lang="ts" name="PlatformHome">
import { useMenuStore } from '@/store'
import { wsClient } from '@jetlinks-web/core'
import { map } from 'rxjs/operators'
import { queryTenantNoPaging } from '../../../api/tenant'

const { jumpPage } = useMenuStore()

const tenantCount = ref(0)
const activeCount = ref(0)
const userCount = ref(0)
const cpu = ref(0)
const jvm = ref(0)

// 加载租户统计
queryTenantNoPaging().then((resp: any) => {
    if (resp.success && resp.result) {
        const list = Array.isArray(resp.result) ? resp.result : []
        tenantCount.value = list.length
        activeCount.value = list.filter((t: any) => t.status === 1).length
    }
})

// CPU / JVM 监控
const cpuSocket = wsClient.getWebSocket(
    'platform-home-cpu-realTime',
    '/dashboard/systemMonitor/stats/info/realTime',
    { type: 'cpu', interval: '2s', agg: 'avg' }
)?.pipe(map((res: any) => res.payload))
.subscribe((resp: any) => {
    cpu.value = Math.round(resp.value?.systemUsage || 0)
})

const jvmSocket = wsClient.getWebSocket(
    'platform-home-memory-realTime',
    '/dashboard/systemMonitor/stats/info/realTime',
    { type: 'memory', interval: '2s', agg: 'avg' }
)?.pipe(map((res: any) => res.payload))
.subscribe((payload: any) => {
    jvm.value = Math.round(payload.value?.jvmHeapUsage || 0)
})

const jumpTo = (name: string) => {
    jumpPage(name, { params: {} })
}

onUnmounted(() => {
    cpuSocket && cpuSocket.unsubscribe()
    jvmSocket && jvmSocket.unsubscribe()
})
</script>

<style lang="less" scoped>
.platform-home-container {
    .stat-card {
        display: flex;
        align-items: center;
        background: #fff;
        padding: 24px;
        border-radius: 4px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

        .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-right: 20px;
            flex-shrink: 0;

            &.tenant-icon {
                background: #e6f4ff;
                color: #1d39c4;
            }
            &.active-icon {
                background: #f6ffed;
                color: #52c41a;
            }
            &.member-icon {
                background: #fff7e6;
                color: #faad14;
            }
        }

        .stat-info {
            .stat-label {
                color: #8c8c8c;
                font-size: 14px;
            }
            .stat-value {
                font-size: 28px;
                font-weight: 700;
                color: rgba(0, 0, 0, 0.85);
                margin-top: 4px;
            }
        }
    }

    .quick-card {
        background: #fff;
        padding: 24px;
        border-radius: 4px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        min-height: 200px;

        .card-title {
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 20px;
            padding-left: 12px;
            position: relative;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 16px;
                background: #1d39c4;
                border-radius: 2px;
            }
        }

        .quick-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .quick-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: #fafafa;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                    background: #e6f4ff;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                span {
                    font-size: 14px;
                    color: #333;
                }
            }
        }

        .system-info {
            .info-row {
                margin-bottom: 20px;

                .info-label {
                    display: block;
                    color: #8c8c8c;
                    font-size: 14px;
                    margin-bottom: 8px;
                }
            }
        }
    }
}
</style>
