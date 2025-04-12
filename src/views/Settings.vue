<script setup lang="ts">
    import { ref, onBeforeMount } from "vue";
    import { SettingStore } from "../mods/Store";
    import { ILanguage, ITheme, type ISettings } from "../mods/Interface";
    import { EventBus } from "../mods/Eventbus";
    import { useI18n } from "vue-i18n";

    // 获取SettingStore实例
    const settingStore = SettingStore.getInstance();
    const saveButton = ref<HTMLButtonElement>();
    const { locale } = useI18n();

    // 用户设置
    const userSettings = ref({
        name: "用户",
        email: "user@example.com",
        avatar: "/avatar.png",
        theme: "light",
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
        language: "zh-CN",
    });

    // 集成设置
    // const integrationSettings = ref({
    //     googleCalendar: false,
    //     outlook: false,
    //     trello: false,
    //     github: false,
    // });

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
    ];

    // 保存设置
    const saveSettings = async () => {
        // 构建符合ISettings接口的设置对象
        const settings: ISettings = {
            __version__: 0, // Impl for TypeScript
            user: {
                username: userSettings.value.name,
                email: userSettings.value.email,
                avatar: userSettings.value.avatar,
            },
            notifications: {
                task: notificationSettings.value.taskReminders,
                deadline: notificationSettings.value.deadlineAlerts,
                daily_outline: notificationSettings.value.dailyDigest,
                voice: notificationSettings.value.soundEnabled,
                time_notify: notificationSettings.value.reminderTime as 5 | 10 | 15 | 30 | 60 | 120 | 1440,
            },
            theme: {
                value: themeSettings.value.currentTheme as ITheme,
                language: themeSettings.value.language as ILanguage,
            },
        };

        // 保存到SettingStore
        await settingStore.saveSettings(settings);
        if (!saveButton.value) return;
        saveButton.value.classList.remove("btn-info");
        saveButton.value.classList.add("btn-success");
        saveButton.value.innerText = "✓";
        setTimeout(() => {
            if (!saveButton.value) return;
            saveButton.value.classList.remove("btn-success");
            saveButton.value.classList.add("btn-info");
            saveButton.value.innerText = "保存设置";
        }, 500);
    };

    // 更改主题
    const changeTheme = async (themeId: string) => {
        themeSettings.value.currentTheme = themeId;
        // 应用主题变更
        EventBus.emit("theme:change", themeId);

        // 保存主题设置到SettingStore
        await settingStore.updateSettings({
            theme: {
                value: themeId as ITheme,
                language: themeSettings.value.language as ILanguage,
            },
        });
    };

    // 切换语言
    async function changeLanguage() {
        locale.value = themeSettings.value.language;
        localStorage.setItem("language", themeSettings.value.language);

        // 保存语言设置到SettingStore
        await settingStore.updateSettings({
            user: {
                username: userSettings.value.name,
                email: userSettings.value.email,
                avatar: userSettings.value.avatar,
            },
        });
        await settingStore.updateSettings({
            theme: {
                value: themeSettings.value.currentTheme as ITheme,
                language: themeSettings.value.language as ILanguage,
            },
        });
    }

    // 在组件挂载时初始化SettingStore并加载设置
    onBeforeMount(async () => {
        await settingStore.init();
        const storedSettings = await settingStore.getSettings();

        if (storedSettings) {
            // 更新用户设置
            userSettings.value = {
                name: storedSettings.user.username,
                email: storedSettings.user.email,
                avatar: storedSettings.user.avatar || "/avatar.png",
                theme: storedSettings.theme.value,
            };

            // 更新通知设置
            notificationSettings.value = {
                taskReminders: storedSettings.notifications.task,
                deadlineAlerts: storedSettings.notifications.deadline,
                dailyDigest: storedSettings.notifications.daily_outline,
                soundEnabled: storedSettings.notifications.voice,
                reminderTime: storedSettings.notifications.time_notify,
            };

            // 更新主题设置
            themeSettings.value.currentTheme = storedSettings.theme.value;
            themeSettings.value.language = storedSettings.theme.language;

            // 应用主题
            document.documentElement.setAttribute("data-theme", storedSettings.theme.value);
        }
    });

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
        <h1 class="text-2xl font-bold mb-6 mt-4">{{ $t("settings.title") }}</h1>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- 左侧设置导航 -->
            <div class="md:col-span-1">
                <ul class="menu bg-base-200 w-full rounded-box">
                    <li>
                        <h2 class="menu-title">{{ $t("settings.menu") }}</h2>
                        <ul>
                            <li><a href="#user-settings" class="active">{{ $t("settings.profile.title") }}</a></li>
                            <li><a href="#notification-settings">{{ $t("settings.notification.title") }}</a></li>
                            <li><a href="#theme-settings">{{ $t("settings.theme.title") }}</a></li>
                            <li><a href="#integration-settings">{{ $t("settings.integration.title") }}</a></li>
                        </ul>
                    </li>
                </ul>
            </div>

            <!-- 右侧设置内容 -->
            <div class="md:col-span-3">
                <!-- 用户设置 -->
                <div id="user-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">{{ $t("settings.profile.title") }}</h2>

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
                                    {{ $t("settings.profile.form.changeavatar") }}
                                    <input type="file" class="hidden" accept="image/*" @change="uploadAvatar" />
                                </label>
                            </div>

                            <!-- 个人信息表单 -->
                            <div class="flex-1 w-full">
                                <div class="form-control w-full">
                                    <label class="label mb-2">
                                        <span class="label-text">{{ $t("settings.profile.form.username.title") }}</span>
                                    </label>
                                    <input
                                        v-model="userSettings.name"
                                        type="text"
                                        :placeholder="$t('settings.profile.form.username.placeholder')"
                                        class="input input-bordered w-full" />
                                </div>

                                <div class="form-control w-full mt-2">
                                    <label class="label mb-2">
                                        <span class="label-text">{{ $t("settings.profile.form.email.title") }}</span>
                                    </label>
                                    <input
                                        v-model="userSettings.email"
                                        type="email"
                                        :placeholder="$t('settings.profile.form.email.placeholder')"
                                        class="input input-bordered w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 通知设置 -->
                <div id="notification-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">{{ $t("settings.notification.title") }}</h2>

                        <div class="form-control">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="notificationSettings.taskReminders"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    {{ $t("settings.notification.form.taskreminder") }}
                                    <p class="text-xs opacity-60">
                                        {{ $t("settings.notification.form.taskRemindersDesc") }}
                                    </p>
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
                                    {{ $t("settings.notification.form.deadlinealert") }}
                                    <p class="text-xs opacity-60">
                                        {{ $t("settings.notification.form.deadlineAlertsDesc") }}
                                    </p>
                                </span>
                            </label>
                        </div>

                        <!-- <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="notificationSettings.dailyDigest"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    {{ $t('settings.notification.dailyDigest') }}
                                    <p class="text-xs opacity-60">{{ $t('settings.notification.dailyDigestDesc') }}</p>
                                </span>
                            </label>
                        </div> -->

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    v-model="notificationSettings.soundEnabled"
                                    class="toggle toggle-primary" />
                                <span class="label-text">
                                    {{ $t("settings.notification.form.soundenabled") }}
                                    <p class="text-xs opacity-60">{{ $t("settings.notification.form.soundEnabledDesc") }}</p>
                                </span>
                            </label>
                        </div>

                        <div class="form-control w-full max-w-xs mt-4">
                            <label class="label mb-2">
                                <span class="label-text">{{ $t("settings.notification.form.remindertime.title") }}</span>
                            </label>
                            <select v-model="notificationSettings.reminderTime" class="select select-bordered">
                                <option value="5">{{ $t("settings.notification.form.remindertime.options.5m") }}</option>
                                <option value="10">{{ $t("settings.notification.form.remindertime.options.10m") }}</option>
                                <option value="15">{{ $t("settings.notification.form.remindertime.options.15m") }}</option>
                                <option value="30">{{ $t("settings.notification.form.remindertime.options.30m") }}</option>
                                <option value="60">{{ $t("settings.notification.form.remindertime.options.1hr") }}</option>
                                <option value="120">{{ $t("settings.notification.form.remindertime.options.2hr") }}</option>
                                <option value="1440">{{ $t("settings.notification.form.remindertime.options.1d") }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 主题与界面设置 -->
                <div id="theme-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">{{ $t("settings.theme.title") }}</h2>

                        <!-- 主题选择 -->
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text">{{ $t("settings.theme.form.theme") }}</span>
                            </label>
                            <div class="grid grid-cols-3 gap-2 mt-2">
                                <div
                                    v-for="theme in availableThemes"
                                    :key="theme.id"
                                    class="border rounded-lg p-2 cursor-pointer text-center"
                                    :class="{ 'border-primary': themeSettings.currentTheme === theme.id }"
                                    @click="changeTheme(theme.id)">
                                    {{ $t(`settings.theme.form.themeoptions.${theme.id}`) }}
                                </div>
                            </div>
                        </div>

                        <!-- 语言设置 -->
                        <div class="form-control w-full mt-6">
                            <label class="label mb-2">
                                <span class="label-text">{{ $t("settings.theme.form.language") }}</span>
                            </label>
                            <br />
                            <select
                                v-model="themeSettings.language"
                                class="select select-bordered w-full max-w-xs"
                                @change="changeLanguage">
                                <option v-for="lang in availableLanguages" :key="lang.id" :value="lang.id">
                                    {{ lang.name }}
                                </option>
                            </select>
                        </div>

                        <!-- 强调色选择 -->
                        <!-- <div class="form-control w-full mt-4">
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
                        </div> -->

                        <!-- 字体大小 -->
                        <!-- <div class="form-control w-full mt-4">
                            <label class="label">
                                <span class="label-text mr-2">字体大小</span>
                            </label>
                            <select v-model="themeSettings.fontSize" class="select select-bordered w-full max-w-xs">
                                <option v-for="size in availableFontSizes" :key="size.id" :value="size.id">
                                    {{ size.name }}
                                </option>
                            </select>
                        </div> -->

                        <!-- 紧凑模式 -->
                        <!-- <div class="form-control mt-4">
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
                        </div> -->
                    </div>
                </div>

                <!-- 集成与同步设置 -->
                <div id="integration-settings" class="card bg-base-200 shadow-xl mb-6">
                    <div class="card-body">
                        <h2 class="card-title">{{ $t("settings.integration.title") }}</h2>

                        <div role="alert" class="alert alert-warning alert-outline flex">
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
                            <span class="mb-0.5">{{ $t("settings.integration.notice") }}</span>
                        </div>
                        <!-- <div class="form-control">
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
                        </div> -->
                    </div>
                </div>

                <!-- 保存按钮 -->
                <div class="flex justify-end mb-6">
                    <button ref="saveButton" class="btn btn-info" @click="saveSettings">{{ $t("settings.savebutton") }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
