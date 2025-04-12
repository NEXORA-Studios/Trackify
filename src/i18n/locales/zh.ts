// 公用内容
enum PageTitle {
    Dashboard = "仪表盘",
    Tasks = "任务管理",
    Statistics = "统计",
    Focus = "专注",
    Settings = "设置",
}

enum Priority {
    Title = "优先级",
    Low = "低",
    Medium = "中",
    High = "高",
}

enum Status {
    Title = "状态",
    Todo = "待完成",
    Doing = "进行中",
    Finish = "已完成",
}

enum TableTitles {
    Name = "任务名称",
    Priority = "优先级",
    Deadline = "截止日期",
    Progress = "进度",
    Tag = "标签",
    Actions = "操作",
}

// 公用字段值
const priority = {
    title: Priority.Title,
    low: Priority.Low,
    medium: Priority.Medium,
    high: Priority.High,
};

// 翻译字段
export default {
    // 导航菜单
    nav: {
        dashboard: PageTitle.Dashboard,
        tasks: PageTitle.Tasks,
        statistics: PageTitle.Statistics,
        focus: PageTitle.Focus,
        settings: PageTitle.Settings,
        // 用户菜单
        user: {
            profile: "个人资料",
            settings: "设置",
            logout: "退出",
        },
    },
    // 仪表盘
    dashboard: {
        title: PageTitle.Dashboard,
        todays: {
            title: "今日任务",
            count: "{count} 待完成",
            taskname: TableTitles.Name,
            deadline: TableTitles.Deadline,
            progress: TableTitles.Progress,
            priority,
            actions: {
                title: TableTitles.Actions,
                focus: "专注",
            },
        },
        focus: {
            title: "专注",
            now: "当前任务",
            start: "开始专注",
            stop: "停止",
        },
    },
    // 任务管理
    tasks: {
        title: PageTitle.Tasks,
        filter: {
            title: "筛选任务",
            form: {
                taskname: {
                    title: "搜索",
                    placeholder: "搜索任务名称或描述",
                },
                priority,
                status: {
                    title: Status.Title,
                    todo: Status.Todo,
                    doing: Status.Doing,
                    finish: Status.Finish,
                },
                daterange: "日期范围",
                tag: {
                    title: "标签",
                    button: "选择标签",
                },
                reset: "重置",
            },
        },
        actions: {
            add: "添加新任务",
            clean: "清理已完成任务",
        },
        list: {
            title: "任务列表",
            taskname: TableTitles.Name,
            priority,
            deadline: TableTitles.Deadline,
            tag: TableTitles.Tag,
            action: {
                title: TableTitles.Actions,
                button: "详情",
            },
        },
        modals: {
            add: {
                title: "创建新任务",
                form: {
                    taskname: {
                        title: "任务名称",
                        placeholder: "请输入任务名称",
                    },
                    description: {
                        title: "任务描述",
                        placeholder: "请输入任务描述",
                    },
                    priority,
                    deadline: TableTitles.Deadline,
                    tag: {
                        title: TableTitles.Tag,
                        placeholder: "请输入标签",
                    },
                    subtask: {
                        title: "子任务",
                        placeholder: "请输入子任务",
                    },
                },
                actions: {
                    add: "添加",
                    cancel: "取消",
                    create: "创建任务",
                },
            },
            details: {
                priority,
                deadline: TableTitles.Deadline,
                nodeadline: "无截止日期",
                description: "任务描述",
                nodescription: "无描述",
                tag: TableTitles.Tag,
                notag: "无标签",
                subtask: "子任务",
                nosubtask: "无子任务",
                actions: {
                    close: "关闭",
                },
            },
        },
    },
    // 统计与分析
    statistics: {
        title: PageTitle.Statistics,
        cards: {
            total: {
                title: "总任务数",
                description: "所有创建的任务",
            },
            finish: {
                title: "已完成任务",
                description: "完成率 {rate}%",
            },
            wait: {
                title: "待完成任务",
                description: "正在进行中",
            },
            overdue: {
                title: "已逾期任务",
                description: "已超过截止时间",
            },
        },
        taskchart: {
            title: "任务完成情况",
            labels: {
                finish: "已完成",
                wait: "待完成",
            },
        },
        focuschart: {
            title: "专注时间统计",
            label: "专注时长",
            counts: {
                total: "总计：{h} 小时 {min} 分钟",
                average: "平均：{h} 小时 {min} 分钟 / 天",
            },
        },
        timerange: {
            week: "本周",
            month: "本月",
            year: "本年",
        },
    },
    // 专注
    focus: {
        title: PageTitle.Focus,
        pomodoro: {
            title: "专注时间",
            count: "{count} 个番茄钟已完成",
            mode: {
                focus: "专注",
                shortbreak: "短休息",
                longbreak: "长休息",
            },
        },
        taskpad: {
            title: "任务板",
            available: "可用任务",
            now: "当前专注任务",
            empty: "没有待完成的任务",
        },
        settings: {
            title: "专注设置",
            form: {
                focus: "专注时长（分钟）",
                shortbreak: "短休息时长（分钟）",
                longbreak: "长休息时长（分钟）",
                longbreakinterval: "长休息间隔（次数）",
            },
            notice: "番茄工作法建议 25 分钟专注，5 分钟短休息，每完成 4 个番茄钟进行一次 15 分钟长休息。",
        },
    },
    // 设置
    settings: {
        title: PageTitle.Settings,
        menu: "设置选项",
        profile: {
            title: "用户设置",
            form: {
                username: {
                    title: "用户名",
                    placeholder: "请输入用户名",
                },
                email: {
                    title: "邮箱",
                    placeholder: "请输入邮箱",
                },
                changeavatar: "更换头像",
            },
        },
        notification: {
            title: "通知设置",
            form: {
                taskreminder: "任务提醒",
                taskRemindersDesc: "接收即将到来的任务提醒",
                deadlinealert: "截止日期提醒",
                deadlineAlertsDesc: "在任务接近截止日期时收到通知",
                soundenabled: "启用声音",
                soundEnabledDesc: "为通知播放声音",
                remindertime: {
                    title: "提醒时间",
                    options: {
                        "5m": "5 分钟前",
                        "10m": "10 分钟前",
                        "15m": "15 分钟前",
                        "30m": "30 分钟前",
                        "1hr": "1 小时前",
                        "2hr": "2 小时前",
                        "1d": "1 天前",
                    },
                },
            },
        },
        theme: {
            title: "主题与界面",
            form: {
                theme: "界面主题",
                themeoptions: {
                    light: "亮色主题",
                    dark: "暗色主题",
                    cupcake: "柔和主题",
                    bumblebee: "黄蜂主题",
                    emerald: "翡翠主题",
                    corporate: "商务主题",
                    retro: "复古主题",
                    synthwave: "复古波浪",
                    cyberpunk: "赛博朋克",
                },
                language: "语言",
            },
        },
        integration: {
            title: "集成与同步",
            notice: "尚未支持第三方集成与同步，将在未来的版本中推出。",
        },
        savebutton: "保存设置",
    },
};
