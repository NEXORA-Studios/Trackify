<script setup lang="ts">
    import { ref, computed } from "vue";

    // 模拟数据 - 任务完成情况
    const taskStats = ref({
        completed: 15,
        pending: 8,
        overdue: 3,
        total: 26,
    });

    // 模拟数据 - 每日完成任务数量（最近7天）
    const dailyCompletionData = ref([
        { date: "6月10日", completed: 3, pending: 2 },
        { date: "6月11日", completed: 5, pending: 1 },
        { date: "6月12日", completed: 2, pending: 4 },
        { date: "6月13日", completed: 4, pending: 2 },
        { date: "6月14日", completed: 6, pending: 1 },
        { date: "6月15日", completed: 3, pending: 3 },
        { date: "6月16日", completed: 4, pending: 2 },
    ]);

    // 模拟数据 - 时间使用分析（按类别）
    const timeUsageData = ref([
        { category: "工作", hours: 28, color: "hsl(215, 70%, 60%)" },
        { category: "学习", hours: 12, color: "hsl(145, 70%, 60%)" },
        { category: "会议", hours: 8, color: "hsl(45, 70%, 60%)" },
        { category: "个人", hours: 6, color: "hsl(325, 70%, 60%)" },
        { category: "其他", hours: 4, color: "hsl(275, 70%, 60%)" },
    ]);

    // 模拟数据 - 专注时间记录（最近7天）
    const focusTimeData = ref([
        { date: "6月10日", minutes: 95 },
        { date: "6月11日", minutes: 120 },
        { date: "6月12日", minutes: 75 },
        { date: "6月13日", minutes: 150 },
        { date: "6月14日", minutes: 180 },
        { date: "6月15日", minutes: 135 },
        { date: "6月16日", minutes: 105 },
    ]);

    // 计算总专注时间
    const totalFocusTime = computed(() => {
        const total = focusTimeData.value.reduce((sum, day) => sum + day.minutes, 0);
        const hours = Math.floor(total / 60);
        const minutes = total % 60;
        return `${hours}小时${minutes}分钟`;
    });

    // 计算平均每日专注时间
    const averageFocusTime = computed(() => {
        const total = focusTimeData.value.reduce((sum, day) => sum + day.minutes, 0);
        const average = Math.round(total / focusTimeData.value.length);
        const hours = Math.floor(average / 60);
        const minutes = average % 60;
        return `${hours}小时${minutes}分钟`;
    });

    // 计算任务完成率
    const taskCompletionRate = computed(() => {
        return Math.round((taskStats.value.completed / taskStats.value.total) * 100);
    });

    // 时间段选择
    const timeRange = ref("week");

    // 切换时间范围
    const changeTimeRange = (range: string) => {
        timeRange.value = range;
        // 在实际应用中，这里会根据选择的时间范围重新获取数据
    };
</script>

<template>
    <div class="statistics-page">
        <h1 class="text-2xl font-bold mb-6 mt-4">统计与分析</h1>

        <!-- 时间范围选择 -->
        <div class="flex justify-end mb-6">
            <div class="btn-group">
                <button
                    class="btn btn-sm"
                    :class="{ 'btn-active': timeRange === 'week' }"
                    @click="changeTimeRange('week')">
                    本周
                </button>
                <button
                    class="btn btn-sm"
                    :class="{ 'btn-active': timeRange === 'month' }"
                    @click="changeTimeRange('month')">
                    本月
                </button>
                <button
                    class="btn btn-sm"
                    :class="{ 'btn-active': timeRange === 'year' }"
                    @click="changeTimeRange('year')">
                    本年
                </button>
            </div>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <!-- 总任务数 -->
            <div class="stat bg-base-200 shadow rounded-box">
                <div class="stat-figure text-primary">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <div class="stat-title">总任务数</div>
                <div class="stat-value text-primary">{{ taskStats.total }}</div>
                <div class="stat-desc">所有创建的任务</div>
            </div>

            <!-- 已完成任务 -->
            <div class="stat bg-base-200 shadow rounded-box">
                <div class="stat-figure text-success">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div class="stat-title">已完成任务</div>
                <div class="stat-value text-success">{{ taskStats.completed }}</div>
                <div class="stat-desc">完成率 {{ taskCompletionRate }}%</div>
            </div>

            <!-- 待完成任务 -->
            <div class="stat bg-base-200 shadow rounded-box">
                <div class="stat-figure text-warning">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="stat-title">待完成任务</div>
                <div class="stat-value text-warning">{{ taskStats.pending }}</div>
                <div class="stat-desc">正在进行中</div>
            </div>

            <!-- 逾期任务 -->
            <div class="stat bg-base-200 shadow rounded-box">
                <div class="stat-figure text-error">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div class="stat-title">逾期任务</div>
                <div class="stat-value text-error">{{ taskStats.overdue }}</div>
                <div class="stat-desc">已超过截止时间</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 任务完成情况统计 -->
            <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">任务完成情况</h2>

                    <!-- 这里在实际应用中会使用图表库如Chart.js或ECharts -->
                    <div class="h-64 flex flex-col">
                        <!-- 模拟柱状图 -->
                        <div class="flex items-end h-48 gap-2 mt-4">
                            <div
                                v-for="(day, index) in dailyCompletionData"
                                :key="index"
                                class="flex-1 flex flex-col items-center">
                                <div class="w-full flex flex-col items-center">
                                    <div
                                        class="w-full bg-success opacity-80"
                                        :style="{ height: (day.completed / 8) * 100 + '%' }"></div>
                                    <div
                                        class="w-full bg-warning opacity-80 mt-1"
                                        :style="{ height: (day.pending / 8) * 100 + '%' }"></div>
                                </div>
                                <div class="text-xs mt-2">{{ day.date }}</div>
                            </div>
                        </div>

                        <!-- 图例 -->
                        <div class="flex justify-center gap-4 mt-4">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 bg-success opacity-80"></div>
                                <span class="text-xs">已完成</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 bg-warning opacity-80"></div>
                                <span class="text-xs">待完成</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 时间使用分析 -->
            <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">时间使用分析</h2>

                    <!-- 这里在实际应用中会使用图表库如Chart.js或ECharts -->
                    <div class="h-64 flex items-center justify-center">
                        <!-- 模拟饼图 -->
                        <div class="relative w-40 h-40">
                            <!-- 计算每个扇区的角度和位置 -->
                            <svg viewBox="0 0 100 100" class="w-full h-full">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="hsl(215, 70%, 60%)"
                                    stroke="white"
                                    stroke-width="1" />
                                <!-- 在实际应用中，这里会根据数据动态生成饼图扇区 -->
                            </svg>

                            <!-- 图例 -->
                            <div class="absolute top-0 right-0 translate-x-full -translate-y-1/2">
                                <div class="flex flex-col gap-2">
                                    <div
                                        v-for="(item, index) in timeUsageData"
                                        :key="index"
                                        class="flex items-center gap-2">
                                        <div class="w-3 h-3" :style="{ backgroundColor: item.color }"></div>
                                        <span class="text-xs">{{ item.category }}: {{ item.hours }}小时</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 专注时间统计 -->
            <div class="card bg-base-200 shadow-xl lg:col-span-2">
                <div class="card-body">
                    <h2 class="card-title flex justify-between">
                        专注时间统计
                        <div>
                            <span class="badge badge-primary mr-2">总计: {{ totalFocusTime }}</span>
                            <span class="badge badge-secondary">平均: {{ averageFocusTime }}/天</span>
                        </div>
                    </h2>

                    <!-- 这里在实际应用中会使用图表库如Chart.js或ECharts -->
                    <div class="h-64 flex flex-col">
                        <!-- 模拟折线图 -->
                        <div class="flex items-end h-48 gap-2 mt-4 relative">
                            <!-- Y轴刻度 -->
                            <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs opacity-60">
                                <div>3h</div>
                                <div>2h</div>
                                <div>1h</div>
                                <div>0</div>
                            </div>

                            <!-- 图表区域 -->
                            <div class="w-full h-full pl-8 flex">
                                <div
                                    v-for="(day, index) in focusTimeData"
                                    :key="index"
                                    class="flex-1 flex flex-col items-center justify-end">
                                    <div
                                        class="w-4 bg-primary rounded-t-sm"
                                        :style="{ height: (day.minutes / 180) * 100 + '%' }"></div>
                                    <div class="text-xs mt-2">{{ day.date }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
