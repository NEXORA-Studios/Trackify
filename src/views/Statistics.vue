<script setup lang="ts">
    // TODO: 此页面被暂时禁用 - Impl 不完整

    import { ref, computed, onMounted } from "vue";
    import { TaskStore, FocusStore } from "../mods/Store";
    import VDUStackbarFocus from "../components/VDUStackbarFocus.vue";
    import "vue-data-ui/style.css";
    import VDUStackbarComplete from "../components/VDUStackbarComplete.vue";
    import { useI18n } from "vue-i18n"; // 导入i18n

    // 获取i18n实例
    const { t, locale } = useI18n();

    // 获取任务存储实例
    const taskStore = TaskStore.getInstance();
    // 获取专注时间存储实例
    const focusStore = FocusStore.getInstance();
    // 页面加载完毕指示符
    const loaded = ref(false);

    // 任务统计数据
    const taskStats = ref({
        completed: 0,
        pending: 0,
        overdue: 0,
        total: 0,
    });

    // 每日完成任务数量
    const dailyCompletionData = ref<{ date: string; completed: number; pending: number }[]>([]);

    // 专注时间记录
    const focusTimeData = ref<{ date: string; minutes: number }[]>([]);

    // 计算总专注时间
    const totalFocusTime = computed(() => {
        const total = focusTimeData.value.reduce((sum, day) => sum + day.minutes, 0);
        const hours = Math.floor(total / 60);
        const minutes = total % 60;
        return t('statistics.focuschart.counts.total', { h: hours, min: minutes });
    });

    // 计算平均每日专注时间
    const averageFocusTime = computed(() => {
        if (focusTimeData.value.length === 0) return t('statistics.focuschart.counts.average', { h: 0, min: 0 });
        const total = focusTimeData.value.reduce((sum, day) => sum + day.minutes, 0);
        const average = Math.round(total / focusTimeData.value.length);
        const hours = Math.floor(average / 60);
        const minutes = average % 60;
        return t('statistics.focuschart.counts.average', { h: hours, min: minutes });
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
        let endDate: Date;

        switch (range) {
            case "week":
                // 本周开始（周一）
                const dayOfWeek = today.getDay() || 7; // 将周日的0转换为7
                startDate = new Date(today);
                startDate.setDate(today.getDate() - dayOfWeek + 1 + 1);
                endDate = new Date(today);
                endDate.setDate(today.getDate() + 7 - dayOfWeek);
                break;
            case "month":
                // 本月开始
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate.setDate(startDate.getDate() + 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case "year":
                // 本年开始
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
            default:
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 6); // 默认显示最近7天
                endDate = new Date(today);
        }
        return { startDate, endDate };
    };

    // 格式化日期为显示格式
    const formatDate = (date: Date, range: string): string => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // 根据当前语言返回不同格式的日期
        if (locale.value === 'zh-CN') {
            switch (range) {
                case "week":
                case "year":
                default:
                    return `${month}月${day}日`;
                case "month":
                    return `${day}日`;
            }
        } else {
            // 英文格式
            switch (range) {
                case "week":
                case "year":
                default:
                    return `${month}/${day}`;
                case "month":
                    return `${day}`;
            }
        }
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
        currentDate.setDate(currentDate.getDate() - 1);
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
                date: formatDate(date, timeRange.value),
                completed: dayTasks.filter((task) => task.completed).length,
                pending: dayTasks.filter((task) => !task.completed).length,
            };
        });

        // 获取真实的专注时间数据
        await focusStore.init();
        const startDateStr = startDate.toISOString().split("T")[0]; // 格式为YYYY-MM-DD
        const endDateStr = endDate.toISOString().split("T")[0];
        const focusData = await focusStore.getFocusTimeByDateRange(startDateStr, endDateStr);

        // 将获取的专注时间数据转换为图表所需格式
        console.debug(dateRange);
        focusTimeData.value = dateRange.map((date) => {
            function toLocalISOString(date: Date) {
                // 获取本地时区的偏移（单位是分钟）
                const offset = date.getTimezoneOffset();
                // 计算调整后的时间
                const localDate = new Date(date.getTime() - offset * 60000);
                // 获取 ISO 格式（本地时间，类似于 toISOString，但不转换为 UTC）
                return localDate
                    .toISOString()
                    .replace(
                        "Z",
                        `+${String(offset / -60).padStart(2, "0")}:${String(Math.abs(offset % 60)).padStart(2, "0")}`
                    );
            }

            const dateStr = toLocalISOString(date).split("T")[0];
            // 确保从focusData中正确获取专注时间数据
            const minutes = focusData[dateStr] || 0;
            console.debug(date, focusData, dateStr, minutes);

            return {
                date: formatDate(date, timeRange.value),
                minutes: minutes,
            };
        });

        // 确保数据已正确加载
        if (focusTimeData.value.every((item) => item.minutes === 0)) {
            console.warn("警告: 所有专注时间数据为0，可能数据未正确加载");
        }

        console.debug(focusTimeData.value);
    };

    // 切换时间范围并重新加载数据
    const changeTimeRange = async (range: string) => {
        loaded.value = false;
        requestAnimationFrame(async function () {
            timeRange.value = range;
            await loadStatistics();
            loaded.value = true;
        });
    };

    // 组件挂载时加载统计数据
    onMounted(async () => {
        // await focusStore.init();
        await loadStatistics();
        loaded.value = true;
    });
</script>

<template>
    <div class="statistics-page lg:-mx-9">
        <div class="flex justify-between items-center">
            <section class="flex gap-8 items-center">
                <h1 class="text-2xl font-bold mb-6 mt-4">{{ t('statistics.title') }}</h1>
            </section>

            <!-- 时间范围选择 -->
            <div class="flex">
                <div class="btn-group">
                    <button
                        class="btn btn-sm"
                        :class="{ 'btn-active': timeRange === 'week' }"
                        @click="changeTimeRange('week')">
                        {{ t('statistics.timerange.week') }}
                    </button>
                    <button
                        class="btn btn-sm"
                        :class="{ 'btn-active': timeRange === 'month' }"
                        @click="changeTimeRange('month')">
                        {{ t('statistics.timerange.month') }}
                    </button>
                    <button
                        class="btn btn-sm"
                        :class="{ 'btn-active': timeRange === 'year' }"
                        disabled
                        @click="changeTimeRange('year')">
                        {{ t('statistics.timerange.year') }}
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
                <div class="stat-title">{{ t('statistics.cards.total.title') }}</div>
                <div class="stat-value text-primary">{{ taskStats.total }}</div>
                <div class="stat-desc">{{ t('statistics.cards.total.description') }}</div>
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
                <div class="stat-title">{{ t('statistics.cards.finish.title') }}</div>
                <div class="stat-value text-success">{{ taskStats.completed }}</div>
                <div class="stat-desc">{{ t('statistics.cards.finish.description', { rate: taskCompletionRate }) }}</div>
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
                <div class="stat-title">{{ t('statistics.cards.wait.title') }}</div>
                <div class="stat-value text-warning">{{ taskStats.pending }}</div>
                <div class="stat-desc">{{ t('statistics.cards.wait.description') }}</div>
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
                <div class="stat-title">{{ t('statistics.cards.overdue.title') }}</div>
                <div class="stat-value text-error">
                    <div class="stat-value text-error">{{ taskStats.overdue }}</div>
                </div>
                <div class="stat-desc">{{ t('statistics.cards.overdue.description') }}</div>
            </div>
        </div>

        <div class="w-full flex flex-col lg:flex-row gap-6">
            <!-- 任务完成情况统计 -->
            <div class="w-full card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">{{ t('statistics.taskchart.title') }}</h2>
                    <br />
                    <section class="w-full flex justify-center items-center">
                        <VDUStackbarComplete
                            v-if="loaded"
                            :fcd="dailyCompletionData"
                            :show-data-label="timeRange !== 'year'" />
                    </section>
                </div>
            </div>

            <!-- 专注时间统计 -->
            <div class="w-full card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title flex justify-between">
                        {{ t('statistics.focuschart.title') }}
                        <div>
                            <span class="badge badge-primary mr-2">{{ totalFocusTime }}</span>
                            <span class="badge badge-secondary">{{ averageFocusTime }}</span>
                        </div>
                    </h2>
                    <br />
                    <section class="w-full flex justify-center items-center">
                        <VDUStackbarFocus v-if="loaded" :fcd="focusTimeData" />
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>
