export default {
    // 导航菜单
    nav: {
        dashboard: "仪表盘",
        tasks: "任务",
        statistics: "统计",
        focus: "专注",
        settings: "设置",
    },
    // 顶部导航栏
    header: {
        demo: "演示",
    },
    // 用户菜单
    user: {
        profile: "个人资料",
        settings: "设置",
        logout: "退出",
    },
    // 设置页面
    settings: {
        title: "设置",
        profile: {
            title: "个人资料",
            name: "用户名",
            email: "电子邮箱",
            avatar: "头像", 
            save: "保存更改",
        },
        notification: {
            title: "通知设置",
            taskReminders: "任务提醒",
            taskRemindersDesc: "接收关于即将到来任务的提醒",
            deadlineAlerts: "截止日期提醒",
            deadlineAlertsDesc: "接收关于即将到期任务的提醒",
            dailyDigest: "每日摘要",
            dailyDigestDesc: "每天接收一次任务摘要",
            soundEnabled: "启用声音",
            soundEnabledDesc: "为通知启用声音提示",
            reminderTime: "提前提醒时间",
            reminderOptions: {
                "5min": "5分钟",
                "10min": "10分钟",
                "15min": "15分钟",
                "30min": "30分钟",
                "1hour": "1小时",
                "2hours": "2小时",
                "1day": "1天"
            }
        },
        theme: {
            title: "主题与界面设置",
            appTheme: "应用主题",
            themes: {
                light: "亮色主题",
                dark: "暗色主题",
                cupcake: "柔和主题",
                bumblebee: "黄蜂主题",
                emerald: "翡翠主题",
                corporate: "商务主题",
                retro: "复古主题",
                synthwave: "复古波浪",
                cyberpunk: "赛博朋克"
            },
        },
        language: {
            title: "语言设置",
            selectLanguage: "选择语言",
            languages: {
                zh: "中文",
                en: "English",
            },
        },
        integration: {
            title: "集成与同步设置",
            notSupported: "提示：集成与同步尚未支持"
        },
    },
};
