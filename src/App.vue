<script setup lang="ts">
    // 导航菜单项
    const navItems = [
        { name: "仪表盘", path: "/", icon: "dashboard" },
        { name: "任务", path: "/tasks", icon: "task" },
        { name: "统计", path: "/statistics", icon: "chart" },
        { name: "专注", path: "/focus", icon: "timer" },
        { name: "设置", path: "/settings", icon: "settings" },
    ];
</script>

<template>
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
                <router-link to="/" class="btn btn-ghost normal-case text-xl text-primary font-bold">
                    Trackify
                </router-link>
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
            <div class="navbar-end">
                <div class="dropdown dropdown-end">
                    <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                        <div
                            class="w-10 rounded-full bg-primary text-primary-content flex! items-center justify-center">
                            <!-- <span class="text-lg font-bold">用</span> -->
                            <img src="/avatar.png" alt="avatar" />
                        </div>
                    </label>
                    <ul
                        tabindex="0"
                        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a>个人资料</a></li>
                        <li><a>设置</a></li>
                        <li><a>退出</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- 主内容区域 -->
        <main class="container mx-auto p-4">
            <router-view />
        </main>
    </div>
</template>
