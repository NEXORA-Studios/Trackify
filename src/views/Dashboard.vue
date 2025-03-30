<script setup lang="ts">
    import { ref } from "vue";

    // 今日任务列表
    const todayTasks = ref([
        { id: 1, name: "完成Trackify项目设计", priority: "high", deadline: "14:00", progress: 30, completed: false },
        { id: 2, name: "团队会议", priority: "medium", deadline: "16:00", progress: 0, completed: false },
        { id: 3, name: "回复邮件", priority: "low", deadline: "18:00", progress: 0, completed: false },
    ]);

    // 专注模式相关
    const focusMinutes = ref(25);
    const focusSeconds = ref(0);
    const isFocusing = ref(false);
    const focusInterval = ref(null as any);
    const currentTask = ref(null as any);

    // 新任务表单
    const newTask = ref({
        name: "",
        priority: "medium",
        deadline: "",
    });

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

    // 添加新任务
    const addTask = () => {
        if (!newTask.value.name.trim()) return;

        const id = todayTasks.value.length > 0 ? Math.max(...todayTasks.value.map((t) => t.id)) + 1 : 1;

        todayTasks.value.push({
            id,
            name: newTask.value.name,
            priority: newTask.value.priority,
            deadline: newTask.value.deadline || "今天",
            progress: 0,
            completed: false,
        });

        // 重置表单
        newTask.value.name = "";
        newTask.value.priority = "medium";
        newTask.value.deadline = "";
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

            <!-- 快速添加任务 -->
            <div class="card bg-base-200 shadow-xl md:col-span-3">
                <div class="card-body">
                    <h2 class="card-title">快速添加任务</h2>

                    <div class="form-control w-full">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="md:col-span-2">
                                <label class="label mb-2">
                                    <span class="label-text">任务名称</span>
                                </label>
                                <input
                                    v-model="newTask.name"
                                    type="text"
                                    placeholder="输入任务名称"
                                    class="input input-bordered w-full" />
                            </div>

                            <div>
                                <label class="label mb-2">
                                    <span class="label-text">优先级</span>
                                </label>
                                <select v-model="newTask.priority" class="select select-bordered w-full">
                                    <option value="high">高</option>
                                    <option value="medium">中</option>
                                    <option value="low">低</option>
                                </select>
                            </div>

                            <div>
                                <label class="label mb-2">
                                    <span class="label-text">截止时间</span>
                                </label>
                                <input v-model="newTask.deadline" type="time" class="input input-bordered w-full" />
                            </div>
                        </div>

                        <div class="mt-4 flex justify-end">
                            <button class="btn btn-primary" @click="addTask">添加任务</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
