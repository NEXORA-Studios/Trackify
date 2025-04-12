// Common content
enum PageTitle {
    Dashboard = "Dashboard",
    Tasks = "Task Management",
    Statistics = "Statistics",
    Focus = "Focus",
    Settings = "Settings",
}

enum Priority {
    Title = "Priority",
    Low = "Low",
    Medium = "Medium",
    High = "High",
}

enum Status {
    Title = "Status",
    Todo = "To Do",
    Doing = "In Progress",
    Finish = "Completed",
}

enum TableTitles {
    Name = "Task Name",
    Priority = "Priority",
    Deadline = "Deadline",
    Progress = "Progress",
    Tag = "Tag",
    Actions = "Actions",
}

// Common field values
const priority = {
    title: Priority.Title,
    low: Priority.Low,
    medium: Priority.Medium,
    high: Priority.High,
};

// Translation fields
export default {
    // Navigation menu
    nav: {
        dashboard: PageTitle.Dashboard,
        tasks: PageTitle.Tasks,
        statistics: PageTitle.Statistics,
        focus: PageTitle.Focus,
        settings: PageTitle.Settings,
        // User menu
        user: {
            profile: "Profile",
            settings: "Settings",
            logout: "Logout",
        },
    },
    // Dashboard
    dashboard: {
        title: PageTitle.Dashboard,
        todays: {
            title: "Today's Tasks",
            count: "{count} pending",
            taskname: TableTitles.Name,
            deadline: TableTitles.Deadline,
            progress: TableTitles.Progress,
            priority,
            actions: {
                title: TableTitles.Actions,
                focus: "Focus",
            },
        },
        focus: {
            title: "Focus",
            now: "Current Task",
            start: "Start Focus",
            stop: "Stop",
        },
    },
    tasks: {
        title: PageTitle.Tasks,
        filter: {
            title: "Filter Tasks",
            form: {
                taskname: {
                    title: "Search",
                    placeholder: "Search task name or description",
                },
                priority,
                status: {
                    title: Status.Title,
                    todo: Status.Todo,
                    doing: Status.Doing,
                    finish: Status.Finish,
                },
                daterange: "Date Range",
                tag: {
                    title: "Tag",
                    button: "Select Tags",
                },
                reset: "Reset",
            },
        },
        actions: {
            add: "Add New Task",
            clean: "Clear Completed Tasks",
        },
        list: {
            title: "Task List",
            taskname: TableTitles.Name,
            priority,
            deadline: TableTitles.Deadline,
            tag: TableTitles.Tag,
            action: {
                title: TableTitles.Actions,
                button: "Details",
            },
        },
        modals: {
            add: {
                title: "Create New Task",
                form: {
                    taskname: {
                        title: "Task Name",
                        placeholder: "Please enter task name",
                    },
                    description: {
                        title: "Task Description",
                        placeholder: "Please enter task description",
                    },
                    priority,
                    deadline: TableTitles.Deadline,
                    tag: {
                        title: TableTitles.Tag,
                        placeholder: "Please enter tag",
                    },
                    subtask: {
                        title: "Subtask",
                        placeholder: "Please enter subtask",
                    },
                },
                actions: {
                    add: "Add",
                    cancel: "Cancel",
                    create: "Create Task",
                },
            },
            details: {
                priority,
                deadline: TableTitles.Deadline,
                nodeadline: "None",
                description: "Task Description",
                nodescription: "None",
                tag: TableTitles.Tag,
                notag: "None",
                subtask: "Subtask",
                nosubtask: "None",
                actions: {
                    close: "Close",
                },
            },
        },
    },
    // Statistics and Analysis
    statistics: {
        title: PageTitle.Statistics,
        cards: {
            total: {
                title: "Total Tasks",
                description: "All created tasks",
            },
            finish: {
                title: "Completed Tasks",
                description: "Completion rate {rate}%",
            },
            wait: {
                title: "Pending Tasks",
                description: "In progress",
            },
            overdue: {
                title: "Overdue Tasks",
                description: "Past deadline",
            },
        },
        taskchart: {
            title: "Task Completion Status",
            labels: {
                finish: "Completed",
                wait: "Pending",
            },
        },
        focuschart: {
            title: "Focus Time Statistics",
            label: "Focus Duration",
            counts: {
                total: "Total: {h} hours {min} minutes",
                average: "Average: {h} hours {min} minutes / day",
            },
        },
        timerange: {
            week: "This Week",
            month: "This Month",
            year: "This Year",
        },
    },
    focus: {
        title: PageTitle.Focus,
        pomodoro: {
            title: "Pomodoro Clock",
            count: "{count} pomodoros completed",
            mode: {
                focus: "Focus",
                shortbreak: "Short Break",
                longbreak: "Long Break",
            },
        },
        taskpad: {
            title: "Task Board",
            available: "Available Tasks",
            now: "Current Focus Task",
            empty: "No pending tasks",
        },
        settings: {
            title: "Focus Settings",
            form: {
                focus: "Focus Duration (minutes)",
                shortbreak: "Short Break Duration (minutes)",
                longbreak: "Long Break Duration (minutes)",
                longbreakinterval: "Long Break Interval (count)",
            },
            notice: "The Pomodoro Technique suggests 25 minutes of focus, 5 minutes of short break, and a 15-minute long break after completing 4 pomodoros.",
        },
    },
    // Settings
    settings: {
        title: PageTitle.Settings,
        menu: "Settings Options",
        saveButton: "Save Settings",
        profile: {
            title: "User Settings",
            form: {
                username: {
                    title: "Username",
                    placeholder: "Please enter username",
                },
                email: {
                    title: "Email",
                    placeholder: "Please enter email",
                },
                changeavatar: "Change Avatar",
            },
        },
        notification: {
            title: "Notification Settings",
            form: {
                taskreminder: "Task Reminders",
                taskRemindersDesc: "Receive reminders for upcoming tasks",
                deadlinealert: "Deadline Alerts",
                deadlineAlertsDesc: "Get notified when tasks are approaching deadlines",
                soundenabled: "Enable Sound",
                soundEnabledDesc: "Play sound for notifications",
                remindertime: {
                    title: "Reminder Time",
                    options: {
                        "5m": "5 minutes before",
                        "10m": "10 minutes before",
                        "15m": "15 minutes before",
                        "30m": "30 minutes before",
                        "1hr": "1 hour before",
                        "2hr": "2 hours before",
                        "1d": "1 day before",
                    },
                },
            },
        },
        theme: {
            title: "Theme & Interface",
            form: {
                theme: "Interface Theme",
                themeoptions: {
                    light: "Light Theme",
                    dark: "Dark Theme",
                    cupcake: "Cupcake Theme",
                    bumblebee: "Bumblebee Theme",
                    emerald: "Emerald Theme",
                    corporate: "Corporate Theme",
                    retro: "Retro Theme",
                    synthwave: "Synthwave",
                    cyberpunk: "Cyberpunk",
                },
                language: "Language",
            },
        },
        integration: {
            title: "Integrations & Sync",
            notice: "Third-party integrations and synchronization are not yet supported and will be available in future versions.",
        },
        savebutton: "Save Settings",
    },
};
