<script setup lang="ts">
    import { ref, onMounted } from "vue";
    import { TaskStore } from "../mods/Store";

    // 获取任务存储实例
    const taskStore = TaskStore.getInstance();

    // 今日任务列表
    const todayTasks = ref<any[]>([]);

    // 从TaskStore加载任务
    const loadTasks = async () => {
        const allTasks = await taskStore.getTasks();

        // 转换任务格式并筛选今日任务
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        todayTasks.value = allTasks
            .filter((task) => {
                // 筛选今日任务（截止日期是今天或已经逾期的未完成任务）
                if (task.completed) return false;

                // 筛选已隐藏的任务
                if (task.hidden) return false;

                const deadlineDate = new Date(task.deadline);
                deadlineDate.setHours(0, 0, 0, 0);

                return deadlineDate <= today;
            })
            .map((task) => {
                // 计算进度（基于已完成的子任务）
                const totalSubtasks = task.subtasks.length;
                const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                // 提取截止时间
                const deadlineDate = new Date(task.deadline);
                const hours = deadlineDate.getHours().toString().padStart(2, "0");
                const minutes = deadlineDate.getMinutes().toString().padStart(2, "0");
                const deadlineTime = `${hours}:${minutes}`;

                return {
                    id: task.id,
                    name: task.title,
                    priority: task.priority === 2 ? "high" : task.priority === 1 ? "medium" : "low",
                    deadline: deadlineTime,
                    progress,
                    completed: task.completed,
                    originalTask: task, // 保存原始任务对象以便更新
                };
            });
    };

    // 组件挂载时加载任务
    onMounted(async () => {
        await taskStore.init();
        await loadTasks();
    });

    // 专注模式相关
    const focusMinutes = ref(25);
    const focusSeconds = ref(0);
    const isFocusing = ref(false);
    const focusInterval = ref(null as any);
    const currentTask = ref(null as any);

    // 开始专注
    const startFocus = (task: any = null) => {
        if (isFocusing.value) return;

        currentTask.value = task;
        isFocusing.value = true;
        focusMinutes.value = 25;
        focusSeconds.value = 0;

        focusInterval.value = setInterval(() => {
            if (focusSeconds.value > 0) {
                focusSeconds.value--;
            } else if (focusMinutes.value > 0) {
                focusMinutes.value--;
                focusSeconds.value = 59;
            } else {
                // 时间到
                clearInterval(focusInterval.value);
                isFocusing.value = false;
                // 如果有关联任务，更新进度
                if (currentTask.value) {
                    const task = todayTasks.value.find((t) => t.id === currentTask.value.id);
                    if (task) {
                        task.progress += 25;
                        if (task.progress >= 100) {
                            task.completed = true;
                            task.progress = 100;
                        }
                    }
                }
            }
        }, 1000);
    };

    // 暂停专注
    const pauseFocus = () => {
        if (!isFocusing.value) return;

        clearInterval(focusInterval.value);
        isFocusing.value = false;
    };

    // 切换任务完成状态
    const toggleTaskComplete = (task: any) => {
        task.completed = !task.completed;
        if (task.completed) {
            task.progress = 100;
        } else if (task.progress === 100) {
            task.progress = 75;
        }
    };

    // 格式化时间显示
    const formatTime = (minutes: number, seconds: number) => {
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };
</script>

<template>
    <div class="dashboard">
        <h1 class="text-2xl font-bold mb-6 mt-4">仪表盘</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 今日任务卡片 -->
            <div class="card bg-base-200 shadow-xl md:col-span-2">
                <div class="card-body">
                    <h2 class="card-title flex justify-between">
                        今日任务
                        <span class="badge badge-primary"
                            >{{ todayTasks.filter((t) => !t.completed).length }} 待完成</span
                        >
                    </h2>

                    <div class="divider my-2"></div>

                    <!-- 任务列表 -->
                    <div class="overflow-x-auto">
                        <table class="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th class="w-12"></th>
                                    <th>任务名称</th>
                                    <th class="w-24">优先级</th>
                                    <th class="w-24">截止时间</th>
                                    <th class="w-32">进度</th>
                                    <th class="w-24">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="task in todayTasks" :key="task.id" :class="{ 'opacity-60': task.completed }">
                                    <td>
                                        <input
                                            type="checkbox"
                                            :checked="task.completed"
                                            @change="toggleTaskComplete(task)"
                                            class="checkbox checkbox-sm" />
                                    </td>
                                    <td>{{ task.name }}</td>
                                    <td>
                                        <div
                                            class="badge"
                                            :class="{
                                                'badge-error': task.priority === 'high',
                                                'badge-warning': task.priority === 'medium',
                                                'badge-info': task.priority === 'low',
                                            }">
                                            {{
                                                task.priority === "high"
                                                    ? "高"
                                                    : task.priority === "medium"
                                                    ? "中"
                                                    : "低"
                                            }}
                                        </div>
                                    </td>
                                    <td>{{ task.deadline }}</td>
                                    <td>
                                        <progress
                                            class="progress"
                                            :class="{
                                                'progress-error': task.priority === 'high',
                                                'progress-warning': task.priority === 'medium',
                                                'progress-info': task.priority === 'low',
                                            }"
                                            :value="task.progress"
                                            max="100"></progress>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-sm btn-primary"
                                            @click="startFocus(task)"
                                            :disabled="isFocusing || task.completed">
                                            专注
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 专注模式卡片 -->
            <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">专注模式</h2>

                    <div class="flex flex-col items-center justify-center py-6 h-full">
                        <div class="text-5xl font-bold mb-6">
                            {{ formatTime(focusMinutes, focusSeconds) }}
                        </div>

                        <div class="text-center mb-4" v-if="currentTask">
                            <p class="text-sm opacity-70">当前任务</p>
                            <p class="font-medium">{{ currentTask.name }}</p>
                        </div>

                        <div class="flex gap-2">
                            <button class="btn btn-primary" @click="startFocus()" v-if="!isFocusing">开始专注</button>
                            <button class="btn btn-error" @click="pauseFocus()" v-else>暂停</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
