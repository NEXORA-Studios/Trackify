<script setup lang="ts">
    import { ref } from "vue";

    // 用户设置
    const userSettings = ref({
        name: "用户",
        email: "user@example.com",
        avatar: "/avatar.png",
        theme: "light",
        language: "zh-CN",
    });

    // 通知设置
    const notificationSettings = ref({
        taskReminders: true,
        deadlineAlerts: true,
        dailyDigest: false,
        soundEnabled: true,
        reminderTime: 30, // 分钟
    });

    // 主题设置
    const themeSettings = ref({
        currentTheme: "light",
        accentColor: "primary",
        fontSize: "medium",
        compactMode: false,
    });

    // 集成设置
    const integrationSettings = ref({
        googleCalendar: false,
        outlook: false,
        trello: false,
        github: false,
    });

    // 可用主题
    const availableThemes = [
        { id: "light", name: "亮色主题" },
        { id: "dark", name: "暗色主题" },
        { id: "cupcake", name: "柔和主题" },
        { id: "bumblebee", name: "黄蜂主题" },
        { id: "emerald", name: "翡翠主题" },
        { id: "corporate", name: "商务主题" },
        { id: "synthwave", name: "复古波浪" },
        { id: "retro", name: "复古主题" },
        { id: "cyberpunk", name: "赛博朋克" },
    ];

    // 可用语言
    const availableLanguages = [
        { id: "zh-CN", name: "简体中文" },
        { id: "en-US", name: "English" },
        { id: "ja-JP", name: "日本語" },
        { id: "ko-KR", name: "한국어" },
    ];

    // 可用字体大小
    const availableFontSizes = [
        { id: "small", name: "小" },
        { id: "medium", name: "中" },
        { id: "large", name: "大" },
    ];

    // 可用强调色
    const availableAccentColors = [
        { id: "primary", name: "主色调", class: "bg-primary" },
        { id: "secondary", name: "次要色调", class: "bg-secondary" },
        { id: "accent", name: "强调色", class: "bg-accent" },
        { id: "info", name: "信息色", class: "bg-info" },
        { id: "success", name: "成功色", class: "bg-success" },
        { id: "warning", name: "警告色", class: "bg-warning" },
        { id: "error", name: "错误色", class: "bg-error" },
    ];

    // 保存设置
    const saveSettings = () => {
        // 在实际应用中，这里会将设置保存到本地存储或发送到服务器
        alert("设置已保存");
    };

    // 更改主题
    const changeTheme = (themeId: string) => {
        themeSettings.value.currentTheme = themeId;
        // 在实际应用中，这里会应用主题变更
        document.documentElement.setAttribute("data-theme", themeId);
    };

    // 上传头像
    const uploadAvatar = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            // 在实际应用中，这里会处理头像上传
            const reader = new FileReader();
            reader.onload = (e) => {
                userSettings.value.avatar = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };
</script>

<template>
    <div class="settings-page">
        <h1 class="text-2xl font-bold mb-6 mt-4">设置</h1>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- 左侧设置导航 -->
            <div class="md:col-span-1">
                <ul class="menu bg-base-200 w-full rounded-box">
                    <li>
                        <h2 class="menu-title">设置选项</h2>
                        <ul>
                            <li><a href="#user-settings" class="active">用户设置</a></li>
                            <li><a href="#notification-settings">通知设置</a></li>
                            <li><a href="#theme-settings">主题与界面</a></li>
                            <li><a href="#integration-settings">集成与同步</a></li>
                        </ul>
                    </li>
                </ul>
            </div>

            <!-- 右侧设置内容 -->
            <div class="md:col-span-3">
                <!-- 用户设置 -->
                <div id="user-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">用户设置</h2>

                        <div class="flex flex-col md:flex-row gap-6 items-start">
                            <!-- 头像上传 -->
                            <div class="flex flex-col items-center gap-2">
                                <div class="avatar">
                                    <div
                                        class="w-24 rounded-full bg-primary text-primary-content flex! items-center justify-center"
                                        v-if="!userSettings.avatar">
                                        <span class="text-3xl font-bold">{{ userSettings.name.charAt(0) }}</span>
                                    </div>
                                    <div class="w-24 rounded-full" v-else>
                                        <img :src="userSettings.avatar" alt="用户头像" />
                                    </div>
                                </div>
                                <label class="btn btn-sm btn-outline">
                                    更换头像
                                    <input type="file" class="hidden" accept="image/*" @change="uploadAvatar" />
                                </label>
                            </div>

                            <!-- 个人信息表单 -->
                            <div class="flex-1 w-full">
                                <div class="form-control w-full">
                                    <label class="label mb-2">
                                        <span class="label-text">用户名</span>
                                    </label>
                                    <input
                                        v-model="userSettings.name"
                                        type="text"
                                        placeholder="输入用户名"
                                        class="input input-bordered w-full" />
                                </div>

                                <div class="form-control w-full mt-2">
                                    <label class="label mb-2">
                                        <span class="label-text">电子邮箱</span>
                                    </label>
                                    <input
                                        v-model="userSettings.email"
                                        type="email"
                                        placeholder="输入电子邮箱"
                                        class="input input-bordered w-full" />
                                </div>

                                <div class="form-control w-full mt-2">
                                    <label class="label mb-2">
                                        <span class="label-text">语言</span>
                                    </label>
                                    <select v-model="userSettings.language" class="select select-bordered w-full">
                                        <option v-for="lang in availableLanguages" :key="lang.id" :value="lang.id">
                                            {{ lang.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 通知设置 -->
                <div id="notification-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">通知设置</h2>

                        <div class="form-control">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="notificationSettings.taskReminders"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    任务提醒
                                    <p class="text-xs opacity-60">在任务即将到期时发送提醒</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="notificationSettings.deadlineAlerts"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    截止时间提醒
                                    <p class="text-xs opacity-60">在任务截止前提醒</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="notificationSettings.dailyDigest"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    每日摘要
                                    <p class="text-xs opacity-60">每天发送当日任务摘要</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="notificationSettings.soundEnabled"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    提醒声音
                                    <p class="text-xs opacity-60">启用通知声音</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control w-full max-w-xs mt-4">
                            <label class="label mb-2">
                                <span class="label-text">提前提醒时间</span>
                            </label>
                            <select v-model="notificationSettings.reminderTime" class="select select-bordered">
                                <option value="5">5分钟前</option>
                                <option value="10">10分钟前</option>
                                <option value="15">15分钟前</option>
                                <option value="30">30分钟前</option>
                                <option value="60">1小时前</option>
                                <option value="120">2小时前</option>
                                <option value="1440">1天前</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 主题与界面设置 -->
                <div id="theme-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">主题与界面设置</h2>

                        <!-- 主题选择 -->
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text">应用主题</span>
                            </label>
                            <div class="grid grid-cols-3 gap-2 mt-2">
                                <div
                                    v-for="theme in availableThemes"
                                    :key="theme.id"
                                    class="border rounded-lg p-2 cursor-pointer text-center"
                                    :class="{ 'border-primary': themeSettings.currentTheme === theme.id }"
                                    @click="changeTheme(theme.id)">
                                    {{ theme.name }}
                                </div>
                            </div>
                        </div>

                        <!-- 强调色选择 -->
                        <div class="form-control w-full mt-4">
                            <label class="label">
                                <span class="label-text">强调色</span>
                            </label>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <div
                                    v-for="color in availableAccentColors"
                                    :key="color.id"
                                    class="w-8 h-8 rounded-full cursor-pointer border-2"
                                    :class="[
                                        color.class,
                                        {
                                            'border-primary': themeSettings.accentColor === color.id,
                                            'border-transparent': themeSettings.accentColor !== color.id,
                                        },
                                    ]"
                                    @click="themeSettings.accentColor = color.id"></div>
                            </div>
                        </div>

                        <!-- 字体大小 -->
                        <div class="form-control w-full mt-4">
                            <label class="label">
                                <span class="label-text mr-2">字体大小</span>
                            </label>
                            <select v-model="themeSettings.fontSize" class="select select-bordered w-full max-w-xs">
                                <option v-for="size in availableFontSizes" :key="size.id" :value="size.id">
                                    {{ size.name }}
                                </option>
                            </select>
                        </div>

                        <!-- 紧凑模式 -->
                        <div class="form-control mt-4">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="themeSettings.compactMode"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    紧凑模式
                                    <p class="text-xs opacity-60">减少界面间距，显示更多内容</p>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 集成与同步设置 -->
                <div id="integration-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">集成与同步设置</h2>

                        <div class="form-control">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="integrationSettings.googleCalendar"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    Google日历
                                    <p class="text-xs opacity-60">与Google日历同步任务和事件</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="integrationSettings.outlook"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    Outlook
                                    <p class="text-xs opacity-60">与Outlook日历同步任务和事件</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="integrationSettings.trello"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    Trello
                                    <p class="text-xs opacity-60">与Trello看板同步任务</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="integrationSettings.github"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    GitHub
                                    <p class="text-xs opacity-60">与GitHub Issues同步任务</p>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 保存按钮 -->
                <div class="flex justify-end mb-6">
                    <button class="btn btn-primary" @click="saveSettings">保存设置</button>
                </div>
            </div>
        </div>
    </div>
</template>
