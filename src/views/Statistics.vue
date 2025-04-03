<script setup lang="ts">
    // TODO: 此页面被暂时禁用 - Impl 不完整

    import { ref, computed, onMounted } from "vue";
    import { TaskStore, FocusStore } from "../mods/Store";

    // 获取任务存储实例
    const taskStore = TaskStore.getInstance();
    // 获取专注时间存储实例
    const focusStore = FocusStore.getInstance();

    // 任务统计数据
    const taskStats = ref({
        completed: 0,
        pending: 0,
        overdue: 0,
        total: 0,
    });

    // 每日完成任务数量
    const dailyCompletionData = ref<{ date: string; completed: number; pending: number }[]>([]);

    // 时间使用分析（按任务标签分类）
    const timeUsageData = ref<{ category: string; hours: number; color: string }[]>([]);

    // 专注时间记录
    const focusTimeData = ref<{ date: string; minutes: number }[]>([]);

    // 计算总专注时间
    const totalFocusTime = computed(() => {
        const total = focusTimeData.value.reduce((sum, day) => sum + day.minutes, 0);
        const hours = Math.floor(total / 60);
        const minutes = total % 60;
        return `${hours}小时${minutes}分钟`;
    });

    // 计算平均每日专注时间
    const averageFocusTime = computed(() => {
        if (focusTimeData.value.length === 0) return "0小时0分钟";
        const total = focusTimeData.value.reduce((sum, day) => sum + day.minutes, 0);
        const average = Math.round(total / focusTimeData.value.length);
        const hours = Math.floor(average / 60);
        const minutes = average % 60;
        return `${hours}小时${minutes}分钟`;
    });

    // 计算任务完成率
    const taskCompletionRate = computed(() => {
        if (taskStats.value.total === 0) return 0;
        return Math.round((taskStats.value.completed / taskStats.value.total) * 100);
    });

    // 时间段选择
    const timeRange = ref("week");

    // 获取日期范围
    const getDateRange = (range: string) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate: Date;

        switch (range) {
            case "week":
                // 本周开始（周一）
                const dayOfWeek = today.getDay() || 7; // 将周日的0转换为7
                startDate = new Date(today);
                startDate.setDate(today.getDate() - dayOfWeek + 1);
                break;
            case "month":
                // 本月开始
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case "year":
                // 本年开始
                startDate = new Date(today.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 6); // 默认显示最近7天
        }

        return { startDate, endDate: today };
    };

    // 格式化日期为显示格式
    const formatDate = (date: Date): string => {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    // 加载任务数据并计算统计信息
    const loadStatistics = async () => {
        await taskStore.init();
        const allTasks = await taskStore.getTasks();

        // 获取当前选择的日期范围
        const { startDate, endDate } = getDateRange(timeRange.value);

        // 重置统计数据
        taskStats.value = {
            completed: 0,
            pending: 0,
            overdue: 0,
            total: 0,
        };

        // 筛选日期范围内的任务（包括隐藏的任务，以便统计所有任务）
        const tasksInRange = allTasks.filter((task) => {
            const taskDate = new Date(task.deadline);
            return taskDate >= startDate && taskDate <= endDate;
        });

        // 计算任务统计数据
        taskStats.value.total = tasksInRange.length;
        taskStats.value.completed = tasksInRange.filter((task) => task.completed).length;
        taskStats.value.pending = tasksInRange.filter(
            (task) => !task.completed && new Date(task.deadline) >= new Date()
        ).length;
        taskStats.value.overdue = tasksInRange.filter(
            (task) => !task.completed && new Date(task.deadline) < new Date()
        ).length;

        // 生成日期范围内的所有日期
        const dateRange: Date[] = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 计算每日任务完成情况
        dailyCompletionData.value = dateRange.map((date) => {
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

            const dayTasks = allTasks.filter((task) => {
                const taskDate = new Date(task.deadline);
                return taskDate >= dayStart && taskDate <= dayEnd;
            });

            return {
                date: formatDate(date),
                completed: dayTasks.filter((task) => task.completed).length,
                pending: dayTasks.filter((task) => !task.completed).length,
            };
        });

        // 按标签统计任务时间使用情况（模拟数据，实际应用中可能需要更复杂的逻辑）
        // 收集所有任务标签
        const allTags = new Set<string>();
        tasksInRange.forEach((task) => {
            task.tags.forEach((tag) => allTags.add(tag));
        });

        // 如果没有标签，添加一个默认标签
        if (allTags.size === 0) {
            allTags.add("未分类");
        }

        // 为每个标签分配颜色和时间
        const colors = [
            "hsl(215, 70%, 60%)",
            "hsl(145, 70%, 60%)",
            "hsl(45, 70%, 60%)",
            "hsl(325, 70%, 60%)",
            "hsl(275, 70%, 60%)",
            "hsl(185, 70%, 60%)",
            "hsl(95, 70%, 60%)",
        ];

        timeUsageData.value = Array.from(allTags).map((tag, index) => {
            // 计算该标签下的任务数量
            const tagTasks = tasksInRange.filter((task) => task.tags.includes(tag));
            // 模拟每个任务的平均时间（实际应用中应该有真实数据）
            const avgHoursPerTask = 2;
            const hours = tagTasks.length * avgHoursPerTask;

            return {
                category: tag,
                hours: hours || 0, // 如果没有任务，则显示0小时
                color: colors[index % colors.length],
            };
        });

        // 获取真实的专注时间数据
        await focusStore.init();
        const startDateStr = startDate.toISOString().split("T")[0]; // 格式为YYYY-MM-DD
        const endDateStr = endDate.toISOString().split("T")[0];
        const focusData = await focusStore.getFocusTimeByDateRange(startDateStr, endDateStr);

        console.log("专注时间数据:", focusData); // 调试输出
        console.log("日期范围:", startDateStr, endDateStr); // 调试输出

        // 将获取的专注时间数据转换为图表所需格式
        focusTimeData.value = dateRange.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            // 确保从focusData中正确获取专注时间数据
            const minutes = focusData[dateStr] || 0;
            console.log("处理日期:", dateStr, "分钟:", minutes, "原始数据中是否存在:", dateStr in focusData); // 增强调试输出

            return {
                date: formatDate(date),
                minutes: minutes,
            };
        });

        // 确保数据已正确加载
        if (focusTimeData.value.every((item) => item.minutes === 0)) {
            console.log("警告: 所有专注时间数据为0，可能数据未正确加载");
            console.log("原始数据键值:", Object.keys(focusData));
        }

        console.log("处理后的专注时间数据:", focusTimeData.value); // 调试输出
    };

    // 切换时间范围并重新加载数据
    const changeTimeRange = async (range: string) => {
        timeRange.value = range;
        await loadStatistics();
    };

    // 组件挂载时加载统计数据
    onMounted(async () => {
        // await focusStore.init();
        await loadStatistics();
    });
</script>

<template>
    <div class="statistics-page">
        <div class="flex justify-between items-center">
            <section class="flex gap-8 items-center">
                <h1 class="text-2xl font-bold mb-6 mt-4">统计与分析</h1>
                <div role="alert" class="alert alert-warning alert-outline -translate-y-0.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>提示：页面功能仍在制作中，本页面大部分内容不可用或不准确</span>
                </div>
            </section>

            <!-- 时间范围选择 -->
            <div class="flex">
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
                                <div class="text-xs mt-2 w-full text-center truncate" title="{{ day.date }}">
                                    {{ day.date }}
                                </div>
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
                    <div class="h-64 flex flex-col justify-center">
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
                                        :style="{ height: Math.max((day.minutes / 180) * 100, 1) + '%' }"></div>
                                    <!-- 确保即使专注时间很少也能显示一点高度 -->
                                    <div class="text-xs mt-2 w-full text-center truncate" title="{{ day.date }}">
                                        {{ day.date }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
