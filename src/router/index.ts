import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Dashboard",
        component: () => import("../views/Dashboard.vue"),
    },
    {
        path: "/tasks",
        name: "Tasks",
        component: () => import("../views/Tasks.vue"),
    },
    {
        path: "/statistics",
        name: "Statistics",
        component: () => import("../views/Statistics.vue"),
    },
    {
        path: "/settings",
        name: "Settings",
        component: () => import("../views/Settings.vue"),
    },
    {
        path: "/focus",
        name: "Focus",
        component: () => import("../views/Focus.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((_to, _from, next) => {
    document.getElementById("main-container")?.classList.add("fade-out");
    setTimeout(() => {
        next();
    }, 300);
});

router.afterEach((_to, _from) => {
    document.getElementById("main-container")?.classList.remove("fade-out");
});

export default router;
