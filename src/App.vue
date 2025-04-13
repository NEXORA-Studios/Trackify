<script setup lang="ts">
    import ThemeController from "./components/ThemeController.vue";
    import { useI18n } from "vue-i18n";
    import { onBeforeMount, ref, watch } from "vue";
    import { SettingStore } from "./mods/Store";

    const { t, locale } = useI18n();
    const settingStore = SettingStore.getInstance();

    // 在应用启动时加载语言设置
    onBeforeMount(async () => {
        await settingStore.init();
        const settings = await settingStore.getSettings();
        if (settings && settings.user && settings.theme.language) {
            const appLocale = settings.theme.language;
            locale.value = appLocale;
            localStorage.setItem("language", appLocale);
        }
    });

    // 导航菜单项
    const navItems = ref([
        { name: t("nav.dashboard"), path: "/", icon: "dashboard" },
        { name: t("nav.tasks"), path: "/tasks", icon: "task" },
        { name: t("nav.statistics"), path: "/statistics", icon: "chart" },
        { name: t("nav.focus"), path: "/focus", icon: "timer" },
        { name: t("nav.settings"), path: "/settings", icon: "settings" },
    ]);

    watch(locale, () => {
        navItems.value = [
            { name: t("nav.dashboard"), path: "/", icon: "dashboard" },
            { name: t("nav.tasks"), path: "/tasks", icon: "task" },
            { name: t("nav.statistics"), path: "/statistics", icon: "chart" },
            { name: t("nav.focus"), path: "/focus", icon: "timer" },
            { name: t("nav.settings"), path: "/settings", icon: "settings" },
        ];
    });
</script>

<template>
    <ThemeController />
    <div class="min-h-screen bg-base-100">
        <!-- 顶部导航栏 -->
        <div class="navbar bg-base-200 shadow-md">
            <div class="navbar-start">
                <!-- 移动端菜单按钮 -->
                <div class="dropdown">
                    <label tabindex="0" class="btn btn-ghost lg:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </label>
                    <!-- 移动端下拉菜单 -->
                    <ul
                        tabindex="0"
                        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li v-for="item in navItems" :key="item.path">
                            <router-link :to="item.path">
                                <span>{{ item.name }}</span>
                            </router-link>
                        </li>
                    </ul>
                </div>
                <!-- Logo -->
                <router-link to="/" class="flex items-center px-4 normal-case text-xl text-[#39A7B3] font-bold">
                    <img src="/logo.png" alt="logo" width="32" />
                    <span class="translate-y-0.25 ml-2 hidden lg:block">Trackify</span>
                </router-link>
                <span
                    class="badge badge-warning rounded-sm translate-y-0.25 text-warning-content font-bold text-[16px] px-2 hidden sm:block">
                    Demo
                </span>
            </div>

            <!-- 桌面端导航菜单 -->
            <div class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal px-1">
                    <li v-for="item in navItems" :key="item.path">
                        <router-link :to="item.path">
                            <span>{{ item.name }}</span>
                        </router-link>
                    </li>
                </ul>
            </div>

            <!-- 右侧用户信息 -->
            <div class="navbar-end mr-1">
                <div class="dropdown dropdown-end">
                    <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                        <div
                            class="w-10 rounded-full bg-primary text-primary-content flex! items-center justify-center">
                            <img src="/avatar.png" alt="avatar" />
                        </div>
                    </label>
                    <ul
                        tabindex="0"
                        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <a>{{ t("nav.user.profile") }}</a>
                        </li>
                        <li>
                            <a>{{ t("nav.user.settings") }}</a>
                        </li>
                        <li>
                            <a>{{ t("nav.user.logout") }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- 主内容区域 -->
        <main id="main-container" class="container mx-auto p-4 z-10">
            <Suspense>
                <router-view />
            </Suspense>
        </main>
    </div>
</template>
