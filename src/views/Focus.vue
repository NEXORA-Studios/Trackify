<script setup lang="ts">
    import { ref, computed, onBeforeUnmount, onMounted, watch } from "vue";
    import { FocusStore, TaskStore } from "../mods/Store";
    import { type ITaskItem } from "../mods/Interface";

    // 获取专注时间存储实例
    const focusStore = FocusStore.getInstance();
    // 获取任务存储实例
    const taskStore = TaskStore.getInstance();
    
    // 番茄钟设置
    const pomodoroSettings = ref({
        focusTime: 25, // 专注时间（分钟）
        shortBreak: 5, // 短休息（分钟）
        longBreak: 15, // 长休息（分钟）
        longBreakInterval: 4, // 长休息间隔（次数）
    });
    
    // 保存番茄钟设置到本地存储
    const savePomodoroSettings = () => {
        localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings.value));
    };
    
    // 从本地存储加载番茄钟设置
    const loadPomodoroSettings = () => {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            pomodoroSettings.value = settings;
            
            // 根据当前模式更新计时器状态
            if (!timerState.value.isRunning) {
                if (timerState.value.mode === "focus") {
                    timerState.value.minutes = pomodoroSettings.value.focusTime;
                } else if (timerState.value.mode === "shortBreak") {
                    timerState.value.minutes = pomodoroSettings.value.shortBreak;
                } else if (timerState.value.mode === "longBreak") {
                    timerState.value.minutes = pomodoroSettings.value.longBreak;
                }
                timerState.value.seconds = 0;
            }
        }
    };

    // 计时器状态
    const timerState = ref({
        minutes: pomodoroSettings.value.focusTime,
        seconds: 0,
        isRunning: false,
        mode: "focus", // focus, shortBreak, longBreak
        completedSessions: 0,
        timerInterval: null as any,
    });

    // 任务列表
    const tasks = ref<{id: number, name: string, completed: boolean, selected: boolean, originalTask?: ITaskItem, originalIndex?: number}[]>([]);
    
    // 加载任务列表
    const loadTasks = async () => {
        await taskStore.init();
        const storedTasks = await taskStore.getTasks();
        
        if (storedTasks && storedTasks.length > 0) {
            // 将存储的任务转换为视图所需的格式
            tasks.value = storedTasks.map((task, index) => ({
                id: index + 1,
                name: task.title,
                completed: task.completed,
                selected: false,
                originalTask: task,
                originalIndex: index
            }));
        } else {
            tasks.value = [];
        }
    };
    
    // 组件挂载时初始化
    onMounted(async () => {
        // await focusStore.init();
        await loadTasks();
        loadPomodoroSettings();
        
        // 确保计时器状态与当前模式匹配
        switchMode(timerState.value.mode);
    });

    // 当前选中的任务
    const selectedTask = computed(() => {
        return tasks.value.find((task) => task.selected);
    });

    // 选择任务
    const selectTask = (task: any) => {
        // 取消其他任务的选中状态
        tasks.value.forEach((t) => (t.selected = false));
        // 选中当前任务
        task.selected = true;
    };

    // 完成任务
    const completeTask = async (task: any) => {
        task.completed = true;
        task.selected = false;
        
        // 如果任务有原始任务引用，更新TaskStore
        if (task.originalTask && task.originalIndex !== undefined) {
            const originalTask = task.originalTask;
            originalTask.completed = true;
            await taskStore.updateTask(task.originalIndex, originalTask);
        }
    };

    // 开始计时器
    const startTimer = () => {
        if (timerState.value.isRunning) return;

        timerState.value.isRunning = true;
        timerState.value.timerInterval = setInterval(() => {
            if (timerState.value.seconds > 0) {
                timerState.value.seconds--;
            } else if (timerState.value.minutes > 0) {
                timerState.value.minutes--;
                timerState.value.seconds = 59;
            } else {
                // 时间到，切换模式
                clearInterval(timerState.value.timerInterval);
                timerState.value.isRunning = false;

                if (timerState.value.mode === "focus") {
                    // 完成一个专注时段
                    timerState.value.completedSessions++;
                    
                    // 记录专注时间
                    const today = new Date().toISOString().split('T')[0]; // 获取当前日期，格式为YYYY-MM-DD
                    focusStore.addFocusTime(today, pomodoroSettings.value.focusTime);

                    // 判断是短休息还是长休息
                    if (timerState.value.completedSessions % pomodoroSettings.value.longBreakInterval === 0) {
                        switchMode("longBreak");
                    } else {
                        switchMode("shortBreak");
                    }

                    // 如果有选中的任务，标记为完成
                    if (selectedTask.value) {
                        completeTask(selectedTask.value);
                    }
                } else {
                    // 休息结束，回到专注模式
                    switchMode("focus");
                }
            }
        }, 1000);
    };

    // 暂停计时器
    const pauseTimer = () => {
        if (!timerState.value.isRunning) return;

        clearInterval(timerState.value.timerInterval);
        timerState.value.isRunning = false;
    };

    // 重置计时器
    const resetTimer = () => {
        pauseTimer();
        switchMode(timerState.value.mode);
    };

    // 切换模式（专注/休息）
    const switchMode = (mode: string) => {
        timerState.value.mode = mode;

        if (mode === "focus") {
            timerState.value.minutes = pomodoroSettings.value.focusTime;
        } else if (mode === "shortBreak") {
            timerState.value.minutes = pomodoroSettings.value.shortBreak;
        } else if (mode === "longBreak") {
            timerState.value.minutes = pomodoroSettings.value.longBreak;
        }

        timerState.value.seconds = 0;
    };

    // 格式化时间显示
    const formattedTime = computed(() => {
        const minutes = timerState.value.minutes.toString().padStart(2, "0");
        const seconds = timerState.value.seconds.toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    });

    // 计算进度百分比
    const progressPercentage = computed(() => {
        let totalSeconds;
        let elapsedSeconds;

        if (timerState.value.mode === "focus") {
            totalSeconds = pomodoroSettings.value.focusTime * 60;
        } else if (timerState.value.mode === "shortBreak") {
            totalSeconds = pomodoroSettings.value.shortBreak * 60;
        } else {
            totalSeconds = pomodoroSettings.value.longBreak * 60;
        }

        elapsedSeconds = totalSeconds - (timerState.value.minutes * 60 + timerState.value.seconds);
        return (elapsedSeconds / totalSeconds) * 100;
    });

    // 监听番茄钟设置变化，保存到本地存储
    watch(pomodoroSettings, () => {
        savePomodoroSettings();
        // 如果当前模式是focus，则更新计时器时间
        if (timerState.value.mode === "focus" && !timerState.value.isRunning) {
            timerState.value.minutes = pomodoroSettings.value.focusTime;
            timerState.value.seconds = 0;
        } else if (timerState.value.mode === "shortBreak" && !timerState.value.isRunning) {
            timerState.value.minutes = pomodoroSettings.value.shortBreak;
            timerState.value.seconds = 0;
        } else if (timerState.value.mode === "longBreak" && !timerState.value.isRunning) {
            timerState.value.minutes = pomodoroSettings.value.longBreak;
            timerState.value.seconds = 0;
        }
    }, { deep: true });
    
    // 组件卸载前清除计时器
    onBeforeUnmount(() => {
        if (timerState.value.timerInterval) {
            clearInterval(timerState.value.timerInterval);
        }
    });
</script>

<template>
    <div class="focus-page">
        <h1 class="text-2xl font-bold mb-6 mt-4">专注模式</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 番茄钟计时器 -->
            <div class="card bg-base-200 shadow-xl md:col-span-2">
                <div class="card-body flex flex-col items-center">
                    <h2 class="card-title self-start">
                        {{
                            timerState.mode === "focus"
                                ? "专注时间"
                                : timerState.mode === "shortBreak"
                                ? "短休息"
                                : "长休息"
                        }}
                    </h2>

                    <!-- 计时器显示 -->
                    <div class="w-64 h-64 rounded-full bg-base-300 flex items-center justify-center relative my-6">
                        <!-- 进度环 -->
                        <div class="absolute inset-0">
                            <svg class="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="5"
                                    class="opacity-20" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="5"
                                    :stroke-dasharray="283"
                                    :stroke-dashoffset="283 - (283 * progressPercentage) / 100"
                                    transform="rotate(-90 50 50)"
                                    :class="{
                                        'text-primary': timerState.mode === 'focus',
                                        'text-success': timerState.mode === 'shortBreak',
                                        'text-secondary': timerState.mode === 'longBreak',
                                    }" />
                            </svg>
                        </div>

                        <!-- 时间显示 -->
                        <div class="text-center z-10">
                            <div class="text-6xl font-bold">{{ formattedTime }}</div>
                            <div class="text-sm opacity-70 mt-2">{{ timerState.completedSessions }} 个番茄钟已完成</div>
                        </div>
                    </div>

                    <!-- 控制按钮 -->
                    <div class="flex gap-4">
                        <button
                            class="btn btn-circle btn-lg"
                            :class="{
                                'btn-primary': timerState.mode === 'focus',
                                'btn-success': timerState.mode === 'shortBreak',
                                'btn-secondary': timerState.mode === 'longBreak',
                            }"
                            @click="timerState.isRunning ? pauseTimer() : startTimer()">
                            <svg
                                v-if="!timerState.isRunning"
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        <button class="btn btn-circle btn-lg btn-outline" @click="resetTimer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    <!-- 模式切换按钮 -->
                    <div class="flex gap-2 mt-6">
                        <button
                            class="btn"
                            :class="{ 'btn-active': timerState.mode === 'focus' }"
                            @click="switchMode('focus')">
                            专注
                        </button>
                        <button
                            class="btn"
                            :class="{ 'btn-active': timerState.mode === 'shortBreak' }"
                            @click="switchMode('shortBreak')">
                            短休息
                        </button>
                        <button
                            class="btn"
                            :class="{ 'btn-active': timerState.mode === 'longBreak' }"
                            @click="switchMode('longBreak')">
                            长休息
                        </button>
                    </div>
                </div>
            </div>

            <!-- 任务专注 -->
            <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">任务专注</h2>

                    <!-- 当前选中的任务 -->
                    <div class="bg-base-300 p-4 rounded-box mt-4" v-if="selectedTask">
                        <h3 class="font-medium">当前专注任务</h3>
                        <div class="flex items-center gap-2 mt-2">
                            <div class="flex-1">
                                <p>{{ selectedTask.name }}</p>
                            </div>
                            <button class="btn btn-sm btn-ghost" @click="selectedTask.selected = false">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="divider">可选任务</div>

                    <!-- 任务列表 -->
                    <div class="overflow-y-auto w-full">
                        <ul class="menu bg-base-100 rounded-box w-full">
                            <li v-for="task in tasks.filter((t) => !t.completed && !t.selected)" :key="task.id">
                                <a @click="selectTask(task)">
                                    {{ task.name }}
                                </a>
                            </li>
                            <li v-if="tasks.filter((t) => !t.completed && !t.selected).length === 0">
                                <span class="opacity-50 p-4">没有待完成的任务</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 专注设置 -->
            <div class="card bg-base-200 shadow-xl md:col-span-3">
                <div class="card-body">
                    <h2 class="card-title">专注设置</h2>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">专注时间（分钟）</span>
                            </label>
                            <input
                                v-model.number="pomodoroSettings.focusTime"
                                type="number"
                                min="1"
                                max="60"
                                class="input input-bordered w-full" />
                        </div>

                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">短休息（分钟）</span>
                            </label>
                            <input
                                v-model.number="pomodoroSettings.shortBreak"
                                type="number"
                                min="1"
                                max="30"
                                class="input input-bordered w-full" />
                        </div>

                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">长休息（分钟）</span>
                            </label>
                            <input
                                v-model.number="pomodoroSettings.longBreak"
                                type="number"
                                min="1"
                                max="60"
                                class="input input-bordered w-full" />
                        </div>

                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">长休息间隔（次数）</span>
                            </label>
                            <input
                                v-model.number="pomodoroSettings.longBreakInterval"
                                type="number"
                                min="1"
                                max="10"
                                class="input input-bordered w-full" />
                        </div>
                    </div>

                    <div class="alert mt-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            class="stroke-info shrink-0 w-6 h-6">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>番茄工作法建议25分钟专注，5分钟短休息，每完成4个番茄钟后进行15分钟长休息。</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
