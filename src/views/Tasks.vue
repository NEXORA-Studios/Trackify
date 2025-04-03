<script setup lang="ts">
    import { ref, computed, onMounted } from "vue";
    import { TaskStore } from "../mods/Store";
    import { type ITaskItem, type ITaskList } from "../mods/Interface";

    // 获取TaskStore实例
    const taskStore = TaskStore.getInstance();

    // 任务列表数据
    const tasks = ref<ITaskList>();

    // 筛选条件
    const filters = ref({
        search: "",
        priority: "all",
        status: "all",
        tags: [] as string[],
        dateRange: {
            start: "",
            end: "",
        },
    });

    // 当前选中的任务
    const selectedTask = ref(null as any);

    // 新任务表单
    const newTask = ref({
        title: "",
        description: "",
        priority: 1,
        deadline: "",
        tags: [] as string[],
        subtasks: [] as { id: number; title: string; completed: boolean }[],
    });

    // 新标签输入
    const newTag = ref("");

    // 新子任务输入
    const newSubtask = ref("");

    // 是否显示新建任务表单
    const showNewTaskForm = ref(false);

    const loadHook = async () => {
        await taskStore.init();
        const storedTasks = await taskStore.getTasks();

        if (storedTasks && storedTasks.length > 0) {
            // 过滤掉隐藏的任务，只显示未隐藏的任务
            const visibleTasks = storedTasks.filter(task => !task.hidden);
            
            // 将存储的任务转换为视图所需的格式
            const viewTasks = visibleTasks.map((task, index) => ({
                id: index + 1, // 确保每个任务有唯一ID
                title: task.title,
                description: task.description,
                priority: task.priority,
                deadline: task.deadline,
                tags: task.tags,
                completed:
                    task.completed ?? task.subtasks.length > 0 ? task.subtasks.every((st) => st.completed) : false,
                subtasks: task.subtasks.map((st, stIndex) => ({
                    id: stIndex + 1, // 确保每个子任务有唯一ID
                    title: st.title,
                    completed: st.completed,
                })),
            }));

            tasks.value = viewTasks;
        } else {
            // 初始化为空数组而不是undefined
            tasks.value = [];
        }
    };
    // 在组件挂载时初始化TaskStore并加载任务
    onMounted(loadHook);

    // 所有标签列表（用于筛选）
    const allTags = computed(() => {
        const tagSet = new Set<string>();
        tasks.value?.forEach((task) => {
            task.tags.forEach((tag) => tagSet.add(tag));
        });
        return Array.from(tagSet);
    });

    // 筛选后的任务列表
    const filteredTasks = computed(() => {
        return tasks.value?.filter((task) => {
            // 搜索筛选
            if (
                filters.value.search &&
                !task.title.toLowerCase().includes(filters.value.search.toLowerCase()) &&
                !task.description.toLowerCase().includes(filters.value.search.toLowerCase())
            ) {
                return false;
            }

            // 优先级筛选
            if (filters.value.priority !== "all" && String(task.priority) !== filters.value.priority) {
                return false;
            }

            // 状态筛选
            if (filters.value.status === "completed" && !task.completed) {
                return false;
            }
            if (filters.value.status === "pending" && task.completed) {
                return false;
            }

            // 标签筛选
            if (filters.value.tags.length > 0 && !filters.value.tags.some((tag) => task.tags.includes(tag))) {
                return false;
            }

            // 日期范围筛选
            if (filters.value.dateRange.start && filters.value.dateRange.end) {
                const taskDate = new Date(task.deadline);
                const startDate = new Date(filters.value.dateRange.start);
                const endDate = new Date(filters.value.dateRange.end);

                if (taskDate < startDate || taskDate > endDate) {
                    return false;
                }
            }

            return true;
        });
    });

    // 选择任务
    const selectTask = (task: any) => {
        selectedTask.value = task;
    };

    // 关闭任务详情
    const closeTaskDetail = () => {
        selectedTask.value = null;
    };

    // 添加新任务
    const addTask = async () => {
        if (!newTask.value.title.trim()) return;

        if (!tasks.value) return;
        const id = tasks.value.length > 0 ? Math.max(...tasks.value.map((t) => t.id)) + 1 : 1;

        const newTaskItem: ITaskItem = {
            id,
            title: newTask.value.title,
            description: newTask.value.description,
            priority: newTask.value.priority === 2 ? 2 : newTask.value.priority === 1 ? 1 : 0,
            deadline: newTask.value.deadline,
            tags: [...newTask.value.tags],
            subtasks: newTask.value.subtasks.map((st) => ({ id: st.id, title: st.title, completed: st.completed })),
            completed: false,
        };

        // 添加到本地状态
        tasks.value?.push({
            id,
            title: newTask.value.title,
            description: newTask.value.description,
            priority: newTask.value.priority as 0 | 1 | 2,
            deadline: newTask.value.deadline,
            tags: [...newTask.value.tags],
            completed: false,
            subtasks: [...newTask.value.subtasks],
        });

        // 保存到TaskStore
        await taskStore.addTask(newTaskItem);

        // 重置表单
        newTask.value = {
            title: "",
            description: "",
            priority: 1,
            deadline: "",
            tags: [],
            subtasks: [],
        };

        showNewTaskForm.value = false;
    };

    // 添加标签到新任务
    const addTagToNewTask = () => {
        if (!newTag.value.trim() || newTask.value.tags.includes(newTag.value)) return;

        newTask.value.tags.push(newTag.value);
        newTag.value = "";
    };

    // 添加子任务到新任务
    const addSubtaskToNewTask = () => {
        if (!newSubtask.value.trim()) return;

        const id = newTask.value.subtasks.length > 0 ? Math.max(...newTask.value.subtasks.map((t) => t.id)) + 1 : 1;

        newTask.value.subtasks.push({
            id,
            title: newSubtask.value,
            completed: false,
        });

        newSubtask.value = "";
    };

    // 移除标签
    const removeTag = (index: number) => {
        newTask.value.tags.splice(index, 1);
    };

    // 移除子任务
    const removeSubtask = (index: number) => {
        newTask.value.subtasks.splice(index, 1);
    };

    // 切换任务完成状态
    const toggleTaskComplete = async (task: any) => {
        task.completed = !task.completed;

        // 更新TaskStore中的数据
        const storedTasks = await taskStore.getTasks();
        const taskIndex = storedTasks.findIndex((t) => t.title === task.title);

        if (taskIndex !== -1) {
            const updatedTask = {
                ...storedTasks[taskIndex],
                // 更新主任务完成状态
                completed: task.completed,
                // 更新子任务完成状态
                subtasks: task.subtasks.map((st: any) => ({
                    title: st.name,
                    completed: st.completed,
                })),
            };

            await taskStore.updateTask(taskIndex, updatedTask);
        }
    };

    // 切换子任务完成状态
    const toggleSubtaskComplete = async (subtask: any) => {
        subtask.completed = !subtask.completed;

        // 更新父任务状态
        if (selectedTask.value) {
            const allCompleted = selectedTask.value.subtasks.every((st: any) => st.completed);
            if (allCompleted && selectedTask.value.subtasks.length > 0) {
                selectedTask.value.completed = true;
            } else {
                selectedTask.value.completed = false;
            }

            // 更新TaskStore中的数据
            const storedTasks = await taskStore.getTasks();
            const taskIndex = storedTasks.findIndex((t) => t.title === selectedTask.value.title);

            if (taskIndex !== -1) {
                const updatedTask = {
                    ...storedTasks[taskIndex],
                    // 更新主任务完成状态
                    completed: selectedTask.value.completed,
                    // 更新子任务完成状态
                    subtasks: selectedTask.value.subtasks.map((st: any) => ({
                        title: st.name,
                        completed: st.completed,
                    })),
                };

                await taskStore.updateTask(taskIndex, updatedTask);
            }
        }
    };

    // 添加标签筛选
    const addTagFilter = (tag: string) => {
        if (!filters.value.tags.includes(tag)) {
            filters.value.tags.push(tag);
        }
    };

    // 移除标签筛选
    const removeTagFilter = (index: number) => {
        filters.value.tags.splice(index, 1);
    };

    // 重置筛选条件
    const resetFilters = () => {
        filters.value = {
            search: "",
            priority: "all",
            status: "all",
            tags: [],
            dateRange: {
                start: "",
                end: "",
            },
        };
    };

    // 清理已完成任务
    const clearCompletedTasks = async () => {
        if (!tasks.value) return;

        // 获取所有任务
        const storedTasks = await taskStore.getTasks();
        
        // 将已完成的任务标记为隐藏，而不是删除
        storedTasks.forEach(task => {
            if (task.completed) {
                task.hidden = true;
            }
        });

        // 更新本地状态（只显示未隐藏的任务）
        tasks.value = storedTasks.filter(task => !task.hidden);

        // 保存到TaskStore（保存所有任务，包括隐藏的）
        await taskStore.saveTasks(storedTasks);
    };
</script>

<template>
    <div class="tasks-page">
        <h1 class="text-2xl font-bold mb-6 mt-4">任务管理</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 左侧：筛选和任务列表 -->
            <div class="lg:col-span-1">
                <!-- 筛选卡片 -->
                <div class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">筛选任务</h2>

                        <!-- 搜索框 -->
                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">搜索</span>
                            </label>
                            <input
                                v-model="filters.search"
                                type="text"
                                placeholder="搜索任务名称或描述"
                                class="input input-bordered w-full" />
                        </div>

                        <!-- 优先级筛选 -->
                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">优先级</span>
                            </label>
                            <select v-model="filters.priority" class="select select-bordered w-full">
                                <option value="all">全部</option>
                                <option value="high">高</option>
                                <option value="medium">中</option>
                                <option value="low">低</option>
                            </select>
                        </div>

                        <!-- 状态筛选 -->
                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">状态</span>
                            </label>
                            <select v-model="filters.status" class="select select-bordered w-full">
                                <option value="all">全部</option>
                                <option value="pending">待完成</option>
                                <option value="completed">已完成</option>
                            </select>
                        </div>

                        <!-- 日期范围筛选 -->
                        <div class="form-control">
                            <label class="label mb-2">
                                <span class="label-text">日期范围</span>
                            </label>
                            <div class="grid grid-cols-2 gap-2">
                                <input v-model="filters.dateRange.start" type="date" class="input input-bordered" />
                                <input v-model="filters.dateRange.end" type="date" class="input input-bordered" />
                            </div>
                        </div>

                        <!-- 标签筛选 -->
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">标签</span>
                            </label>
                            <div class="flex flex-wrap gap-2 mb-2">
                                <div
                                    v-for="(tag, index) in filters.tags"
                                    :key="index"
                                    class="badge badge-primary gap-1">
                                    {{ tag }}
                                    <button @click="removeTagFilter(index)" class="btn btn-xs btn-ghost btn-circle">
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div class="dropdown w-full">
                                <label tabindex="0" class="btn btn-outline btn-info btn-sm w-full">选择标签</label>
                                <ul
                                    tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                                    <li v-for="tag in allTags" :key="tag">
                                        <a @click="addTagFilter(tag)">{{ tag }}</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- 重置按钮 -->
                        <div class="mt-4">
                            <button @click="resetFilters" class="btn btn-outline btn-error w-full">重置筛选</button>
                        </div>
                    </div>
                </div>

                <!-- 添加任务按钮 -->
                <button @click="showNewTaskForm = true" class="btn btn-info w-full mb-2">添加新任务</button>
                <button @click="clearCompletedTasks" class="btn btn-success btn-outline w-full mb-6">
                    清理已完成任务
                </button>
            </div>

            <!-- 中间：任务列表 -->
            <div class="lg:col-span-2">
                <!-- 任务列表卡片 -->
                <div class="card bg-base-200 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title flex justify-between">
                            任务列表
                            <span class="badge badge-primary">{{ filteredTasks?.length }} 个任务</span>
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
                                        <th class="w-32">截止时间</th>
                                        <th class="w-32">标签</th>
                                        <th class="w-24">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="task in filteredTasks"
                                        :key="task.id"
                                        :class="{ 'opacity-60': task.completed }">
                                        <td>
                                            <input
                                                type="checkbox"
                                                :checked="task.completed"
                                                @change="toggleTaskComplete(task)"
                                                class="checkbox checkbox-sm" />
                                        </td>
                                        <td>{{ task.title }}</td>
                                        <td>
                                            <div
                                                class="badge"
                                                :class="{
                                                    'badge-error': task.priority === 2,
                                                    'badge-warning': task.priority === 1,
                                                    'badge-info': task.priority === 0,
                                                }">
                                                {{ task.priority === 2 ? "高" : task.priority === 1 ? "中" : "低" }}
                                            </div>
                                        </td>
                                        <td>
                                            {{
                                                task.deadline
                                                    ? new Date(task.deadline).toLocaleString("zh-CN", {
                                                          month: "short",
                                                          day: "numeric",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      })
                                                    : "未设置"
                                            }}
                                        </td>
                                        <td>
                                            <div class="flex flex-wrap gap-1">
                                                <div
                                                    v-for="(tag, index) in task.tags.slice(0, 2)"
                                                    :key="index"
                                                    class="badge badge-outline badge-sm">
                                                    {{ tag }}
                                                </div>
                                                <div v-if="task.tags.length > 2" class="badge badge-sm">
                                                    +{{ task.tags.length - 2 }}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-ghost" @click="selectTask(task)">详情</button>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredTasks?.length === 0">
                                        <td colspan="6" class="text-center py-4">没有找到符合条件的任务</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 任务详情模态框 -->
        <div class="modal" :class="{ 'modal-open': selectedTask }">
            <div class="modal-box w-11/12 max-w-3xl">
                <div v-if="selectedTask">
                    <h3 class="font-bold text-lg flex items-center gap-2">
                        <input
                            type="checkbox"
                            :checked="selectedTask.completed"
                            @change="toggleTaskComplete(selectedTask)"
                            class="checkbox" />
                        <span :class="{ 'line-through': selectedTask.completed }">{{ selectedTask.title }}</span>
                        <div
                            class="badge ml-2"
                            :class="{
                                'badge-error': selectedTask.priority === 2,
                                'badge-warning': selectedTask.priority === 1,
                                'badge-info': selectedTask.priority === 0,
                            }">
                            {{ selectedTask.priority === 2 ? "高" : selectedTask.priority === 1 ? "中" : "低" }}
                        </div>
                    </h3>

                    <div class="py-4">
                        <p class="text-sm opacity-70 mb-1">截止时间</p>
                        <p>
                            {{ selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleString() : "未设置" }}
                        </p>

                        <p class="text-sm opacity-70 mt-4 mb-1">描述</p>
                        <p>{{ selectedTask.description }}</p>

                        <p class="text-sm opacity-70 mt-4 mb-1">标签</p>
                        <div class="flex flex-wrap gap-2">
                            <div v-for="(tag, index) in selectedTask.tags" :key="index" class="badge badge-outline">
                                {{ tag }}
                            </div>
                            <div v-if="selectedTask.tags.length === 0" class="text-sm opacity-50">无标签</div>
                        </div>

                        <p class="text-sm opacity-70 mt-4 mb-1">子任务</p>
                        <div class="flex flex-col gap-2">
                            <div
                                v-for="subtask in selectedTask.subtasks"
                                :key="subtask.id"
                                class="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    :checked="subtask.completed"
                                    @change="toggleSubtaskComplete(subtask)"
                                    class="checkbox checkbox-sm" />
                                <span :class="{ 'line-through': subtask.completed }">{{ subtask.name }}</span>
                            </div>
                            <div v-if="selectedTask.subtasks.length === 0" class="text-sm opacity-50">无子任务</div>
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeTaskDetail">关闭</button>
                </div>
            </div>
        </div>

        <!-- 新建任务模态框 -->
        <div class="modal" :class="{ 'modal-open': showNewTaskForm }">
            <div class="modal-box w-11/12 max-w-3xl">
                <h3 class="font-bold text-lg">创建新任务</h3>

                <div class="py-4">
                    <div class="form-control w-full">
                        <label class="label mb-2">
                            <span class="label-text">任务名称</span>
                        </label>
                        <input
                            v-model="newTask.title"
                            type="text"
                            placeholder="输入任务名称"
                            class="input input-bordered w-full" />
                    </div>

                    <div class="form-control w-full mt-2">
                        <label class="label mb-2">
                            <span class="label-text">任务描述</span>
                        </label>
                        <textarea
                            v-model="newTask.description"
                            placeholder="输入任务描述"
                            class="textarea textarea-bordered w-full"
                            rows="3"></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div class="form-control w-full">
                            <label class="label mb-2">
                                <span class="label-text">优先级</span>
                            </label>
                            <select v-model="newTask.priority" class="select select-bordered w-full">
                                <option :value="2">高</option>
                                <option :value="1">中</option>
                                <option :value="0">低</option>
                            </select>
                        </div>

                        <div class="form-control w-full">
                            <label class="label mb-2">
                                <span class="label-text">截止时间</span>
                            </label>
                            <input
                                v-model="newTask.deadline"
                                type="datetime-local"
                                class="input input-bordered w-full" />
                        </div>
                    </div>

                    <div class="form-control w-full mt-2">
                        <label class="label">
                            <span class="label-text">标签</span>
                        </label>
                        <div class="flex flex-wrap gap-2 mb-2">
                            <div v-for="(tag, index) in newTask.tags" :key="index" class="badge badge-primary gap-1">
                                {{ tag }}
                                <button @click="removeTag(index)" class="btn btn-xs btn-ghost btn-circle">×</button>
                            </div>
                        </div>
                        <div class="join w-full">
                            <input
                                v-model="newTag"
                                type="text"
                                placeholder="添加标签"
                                class="input input-bordered join-item w-full"
                                @keyup.enter="addTagToNewTask" />
                            <button class="btn join-item" @click="addTagToNewTask">添加</button>
                        </div>
                    </div>

                    <div class="form-control w-full mt-2">
                        <label class="label">
                            <span class="label-text">子任务</span>
                        </label>
                        <div class="flex flex-col gap-2 mb-2">
                            <div
                                v-for="(subtask, index) in newTask.subtasks"
                                :key="subtask.id"
                                class="flex items-center gap-2">
                                <span>{{ subtask.title }}</span>
                                <button @click="removeSubtask(index)" class="btn btn-xs btn-ghost btn-circle ml-auto">
                                    ×
                                </button>
                            </div>
                        </div>
                        <div class="join w-full">
                            <input
                                v-model="newSubtask"
                                type="text"
                                placeholder="添加子任务"
                                class="input input-bordered join-item w-full"
                                @keyup.enter="addSubtaskToNewTask" />
                            <button class="btn join-item" @click="addSubtaskToNewTask">添加</button>
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button class="btn btn-ghost" @click="showNewTaskForm = false">取消</button>
                    <button class="btn btn-primary" @click="addTask" :disabled="!newTask.title.trim()">创建任务</button>
                </div>
            </div>
        </div>
    </div>
</template>
