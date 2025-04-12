import { Store, load } from "@tauri-apps/plugin-store";
import { type ITaskList, type ISettings, type IFocus, ITaskItem } from "./Interface";

// 任务存储类
export class TaskStore {
    private static instance: TaskStore;
    private store?: Store;
    private readonly path = "tasks.bin";
    private readonly defaultData = {
        __version__: 1,
        tasks: [] as ITaskList,
    };

    private constructor() {
        (async () => {
            this.store = await load(this.path);
        })();
    }

    public static getInstance(): TaskStore {
        if (!TaskStore.instance) {
            TaskStore.instance = new TaskStore();
        }
        return TaskStore.instance;
    }

    // 初始化存储
    public async init(): Promise<void> {
        if (!this.store) this.store = await load(this.path);
        try {
            // 尝试加载数据
            const version = await this.store.get("__version__");
            if (!version) {
                // 如果没有版本号，说明是新存储，初始化默认数据
                await this.store.set("__version__", this.defaultData.__version__);
                await this.store.set("tasks", this.defaultData.tasks);
                await this.store.save();
            }
        } catch (error) {
            console.error("初始化任务存储失败:", error);
            // 初始化默认数据
            await this.store.set("__version__", this.defaultData.__version__);
            await this.store.set("tasks", this.defaultData.tasks);
            await this.store.save();
        }
    }

    // 获取所有任务
    public async getTasks(): Promise<ITaskList> {
        if (!this.store) this.store = await load(this.path);
        try {
            const tasks = (await this.store.get("tasks")) as ITaskList;
            return tasks || [];
        } catch (error) {
            console.error("获取任务列表失败:", error);
            return [];
        }
    }

    // 保存任务列表
    public async saveTasks(tasks: ITaskList): Promise<void> {
        if (!this.store) this.store = await load(this.path);
        try {
            await this.store.set("tasks", tasks);
            await this.store.save();
        } catch (error) {
            console.error("保存任务列表失败:", error);
        }
    }

    // 添加任务
    public async addTask(task: ITaskList[0]): Promise<void> {
        try {
            const tasks = await this.getTasks();
            tasks.push(task);
            await this.saveTasks(tasks);
        } catch (error) {
            console.error("添加任务失败:", error);
        }
    }

    // 更新任务
    public async updateTask(index: number, task: ITaskItem): Promise<void> {
        try {
            const tasks = await this.getTasks();
            if (index >= 0 && index < tasks.length) {
                tasks[index] = task;
                await this.saveTasks(tasks);
            }
        } catch (error) {
            console.error("更新任务失败:", error);
        }
    }

    // 删除任务
    public async deleteTask(index: number): Promise<void> {
        try {
            const tasks = await this.getTasks();
            if (index >= 0 && index < tasks.length) {
                tasks.splice(index, 1);
                await this.saveTasks(tasks);
            }
        } catch (error) {
            console.error("删除任务失败:", error);
        }
    }
}

// 专注时间存储类
export class FocusStore {
    private static instance: FocusStore;
    private store?: Store;
    private readonly path = "focus.bin";
    private readonly defaultData = {
        __version__: 1,
        focus: {} as IFocus,
    };

    private constructor() {
        (async () => {
            this.store = await load(this.path);
        })();
    }

    public static getInstance(): FocusStore {
        if (!FocusStore.instance) {
            FocusStore.instance = new FocusStore();
        }
        return FocusStore.instance;
    }

    // 初始化存储
    public async init(): Promise<void> {
        if (!this.store) this.store = await load(this.path);
        try {
            // 尝试加载数据
            const version = await this.store.get("__version__");
            if (!version) {
                // 如果没有版本号，说明是新存储，初始化默认数据
                await this.store.set("__version__", this.defaultData.__version__);
                await this.store.set("focus", this.defaultData.focus);
                await this.store.save();
            }
        } catch (error) {
            console.error("初始化专注时间存储失败:", error);
            // 初始化默认数据
            await this.store.set("__version__", this.defaultData.__version__);
            await this.store.set("focus", this.defaultData.focus);
            await this.store.save();
        }
    }

    // 获取所有专注时间记录
    public async getFocusData(): Promise<IFocus> {
        if (!this.store) this.store = await load(this.path);
        try {
            const focus = (await this.store.get("focus")) as IFocus;
            return focus || {};
        } catch (error) {
            console.error("获取专注时间记录失败:", error);
            return {};
        }
    }

    // 保存专注时间记录
    public async saveFocusData(focus: IFocus): Promise<void> {
        if (!this.store) this.store = await load(this.path);
        try {
            await this.store.set("focus", focus);
            await this.store.save();
        } catch (error) {
            console.error("保存专注时间记录失败:", error);
        }
    }

    // 添加专注时间记录
    public async addFocusTime(date: string, minutes: number): Promise<void> {
        try {
            const focusData = await this.getFocusData();
            // 如果当天已有记录，则累加时间
            if (focusData[date]) {
                focusData[date] += minutes;
            } else {
                focusData[date] = minutes;
            }
            await this.saveFocusData(focusData);
        } catch (error) {
            console.error("添加专注时间记录失败:", error);
        }
    }

    // 获取指定日期的专注时间
    public async getFocusTimeByDate(date: string): Promise<number> {
        try {
            const focusData = await this.getFocusData();
            return focusData[date] || 0;
        } catch (error) {
            console.error("获取指定日期专注时间失败:", error);
            return 0;
        }
    }

    // 获取日期范围内的专注时间数据
    public async getFocusTimeByDateRange(startDate: string, endDate: string): Promise<IFocus> {
        try {
            const focusData = await this.getFocusData();
            const result: IFocus = {};

            // 将日期字符串转换为Date对象，以便比较
            // 确保日期比较时不考虑时间部分
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            console.log("查询日期范围:", startDate, "至", endDate);
            console.log("所有专注时间数据:", focusData);

            // 筛选日期范围内的数据
            for (const [date, minutes] of Object.entries(focusData)) {
                // 确保日期格式一致，并且不考虑时间部分
                const currentDate = new Date(date);
                currentDate.setHours(0, 0, 0, 0);

                console.log(
                    "比较日期:",
                    date,
                    "当前日期时间戳:",
                    currentDate.getTime(),
                    "开始日期时间戳:",
                    start.getTime(),
                    "结束日期时间戳:",
                    end.getTime()
                );

                if (currentDate >= start && currentDate <= end) {
                    console.log("日期在范围内:", date, "分钟:", minutes);
                    // 使用原始日期字符串作为键，确保与Statistics.vue中的查询匹配
                    result[date] = minutes;
                }
            }

            return result;
        } catch (error) {
            console.error("获取日期范围内专注时间数据失败:", error);
            return {};
        }
    }

    // 获取总专注时间（分钟）
    public async getTotalFocusTime(): Promise<number> {
        try {
            const focusData = await this.getFocusData();
            return Object.values(focusData).reduce((total, minutes) => total + minutes, 0);
        } catch (error) {
            console.error("获取总专注时间失败:", error);
            return 0;
        }
    }

    // 清除所有专注时间记录
    public async clearAllFocusData(): Promise<void> {
        try {
            await this.saveFocusData({});
        } catch (error) {
            console.error("清除专注时间记录失败:", error);
        }
    }
}

// 设置存储类
export class SettingStore {
    private static instance: SettingStore;
    private store?: Store;
    private readonly path = "settings.bin";
    private readonly defaultSettings: ISettings = {
        __version__: 2,
        user: {
            username: "用户",
            email: "user@example.com",
        },
        notifications: {
            task: true,
            deadline: true,
            daily_outline: true,
            voice: false,
            time_notify: 30,
        },
        theme: {
            value: "light",
            language: "zh-CN",
        },
    };

    private constructor() {
        (async () => {
            this.store = await load(this.path);
        })();
    }

    public static getInstance(): SettingStore {
        if (!SettingStore.instance) {
            SettingStore.instance = new SettingStore();
        }
        return SettingStore.instance;
    }

    // 初始化设置
    public async init(): Promise<void> {
        try {
            // 尝试获取设置
            const settings = await this.getSettings();
            if (!settings) {
                // 如果没有设置，初始化默认设置
                await this.saveSettings(this.defaultSettings);
            }
        } catch (error) {
            console.error("初始化设置存储失败:", error);
            // 初始化默认设置
            await this.saveSettings(this.defaultSettings);
        }
    }

    // 获取所有设置
    public async getSettings(): Promise<ISettings | null> {
        if (!this.store) this.store = await load(this.path);
        try {
            const settings = (await this.store.get("settings")) as ISettings;
            return settings || null;
        } catch (error) {
            console.error("获取设置失败:", error);
            return null;
        }
    }

    // 保存设置
    public async saveSettings(settings: ISettings): Promise<void> {
        if (!this.store) this.store = await load(this.path);
        try {
            await this.store.set("settings", settings);
            await this.store.save();
        } catch (error) {
            console.error("保存设置失败:", error);
        }
    }

    // 更新部分设置
    public async updateSettings(partialSettings: Partial<ISettings>): Promise<void> {
        try {
            const currentSettings = (await this.getSettings()) || this.defaultSettings;
            const newSettings = { ...currentSettings, ...partialSettings };
            await this.saveSettings(newSettings);
        } catch (error) {
            console.error("更新设置失败:", error);
        }
    }

    // 重置设置为默认值
    public async resetSettings(): Promise<void> {
        try {
            await this.saveSettings(this.defaultSettings);
        } catch (error) {
            console.error("重置设置失败:", error);
        }
    }
}
