import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { TaskStore, SettingStore } from "./Store";
import { EventBus } from "./Eventbus";
import { ITaskItem } from "./Interface";

/**
 * 通知模块 - 负责检查任务截止时间并发送通知
 */
export class NotificationManager {
    private static instance: NotificationManager;
    private taskStore: TaskStore;
    private settingStore: SettingStore;
    private checkInterval: number = 1000; // 默认每 1s 检查一次
    private intervalId: number | null = null;
    private notifiedTaskIds: Set<number> = new Set(); // 已通知的任务ID集合，避免重复通知

    private constructor() {
        this.taskStore = TaskStore.getInstance();
        this.settingStore = SettingStore.getInstance();
    }

    public static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    /**
     * 初始化通知管理器
     */
    public async init(): Promise<void> {
        try {
            // 确保存储已初始化
            await this.taskStore.init();
            await this.settingStore.init();

            // 启动定时检查
            this.startChecking();

            // 监听任务变更事件，重置已通知状态
            EventBus.on("task-updated", () => {
                this.notifiedTaskIds.clear();
            });

            console.log("通知管理器初始化成功");
        } catch (error) {
            console.error("初始化通知管理器失败:", error);
        }
    }

    /**
     * 开始定时检查任务截止时间
     */
    public startChecking(): void {
        if (this.intervalId !== null) {
            this.stopChecking(); // 如果已经在运行，先停止
        }

        // 设置定时器，定期检查任务
        this.intervalId = window.setInterval(() => {
            this.checkTaskDeadlines();
        }, this.checkInterval);

        console.log("开始定时检查任务截止时间");
    }

    /**
     * 停止定时检查
     */
    public stopChecking(): void {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("停止定时检查任务截止时间");
        }
    }

    /**
     * 检查所有任务的截止时间
     */
    private async checkTaskDeadlines(): Promise<void> {
        try {
            const settings = await this.settingStore.getSettings();
            if (!settings || !settings.notifications.deadline || !settings.notifications.time_notify) {
                return; // 如果通知功能被禁用，直接返回
            }

            const tasks = await this.taskStore.getTasks();
            const now = new Date();
            const notifyMinutes = settings.notifications.time_notify;

            // 遍历所有任务
            for (const task of tasks) {
                // 跳过已完成或没有截止时间的任务
                if (task.completed || !task.deadline || this.notifiedTaskIds.has(task.id)) {
                    continue;
                }

                const deadlineDate = new Date(task.deadline);
                const timeDiff = deadlineDate.getTime() - now.getTime();
                const minutesDiff = Math.floor(timeDiff / (1000 * 60));

                // 如果时间差小于设置的提醒时间，且大于0（未过期），则发送通知
                if (minutesDiff <= notifyMinutes && minutesDiff > 0) {
                    await this.sendTaskNotification(task, minutesDiff);
                    this.notifiedTaskIds.add(task.id); // 标记为已通知
                }
            }
        } catch (error) {
            console.error("检查任务截止时间失败:", error);
        }
    }

    /**
     * 发送任务截止时间通知
     * @param task 任务信息
     * @param minutesLeft 剩余分钟数
     */
    private async sendTaskNotification(task: ITaskItem, minutesLeft: number): Promise<void> {
        try {
            let timeText = "";
            if (minutesLeft >= 60) {
                const hours = Math.floor(minutesLeft / 60);
                timeText = `${hours}小时`;
                const remainingMinutes = minutesLeft % 60;
                if (remainingMinutes > 0) {
                    timeText += `${remainingMinutes}分钟`;
                }
            } else {
                timeText = `${minutesLeft}分钟`;
            }

            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === "granted";
            }
            if (permissionGranted) {
                sendNotification({
                    title: `任务即将到期: ${task.title}`,
                    body: `任务「${task.title}」将在${timeText}后到期，请及时处理！`,
                    icon: "public/logo.png",
                });
            }

            console.log(`已发送任务「${task.title}」截止时间通知，剩余${timeText}`);
        } catch (error) {
            console.error("发送任务通知失败:", error);
        }
    }

    /**
     * 手动检查任务截止时间（可从外部调用）
     */
    public async manualCheck(): Promise<void> {
        await this.checkTaskDeadlines();
    }

    /**
     * 重置通知状态（清除已通知记录）
     */
    public resetNotificationStatus(): void {
        this.notifiedTaskIds.clear();
    }
}
