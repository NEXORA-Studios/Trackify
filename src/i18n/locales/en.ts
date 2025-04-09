export default {
    // Navigation menu
    nav: {
        dashboard: "Dashboard",
        tasks: "Tasks",
        statistics: "Statistics",
        focus: "Focus",
        settings: "Settings",
    },
    // Top navigation bar
    header: {
        demo: "Demo",
    },
    // User menu
    user: {
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
    },
    // Settings page
    settings: {
        title: "Settings",
        profile: {
            title: "Profile",
            name: "Username",
            email: "Email",
            avatar: "Avatar",
            save: "Save Changes",
        },
        notification: {
            title: "Notification Settings",
            taskReminders: "Task Reminders",
            taskRemindersDesc: "Receive reminders about upcoming tasks",
            deadlineAlerts: "Deadline Alerts",
            deadlineAlertsDesc: "Receive alerts about tasks nearing their deadline",
            dailyDigest: "Daily Digest",
            dailyDigestDesc: "Receive a daily summary of your tasks",
            soundEnabled: "Enable Sound",
            soundEnabledDesc: "Enable sound notifications",
            reminderTime: "Reminder Time",
            reminderOptions: {
                "5min": "5 minutes",
                "10min": "10 minutes",
                "15min": "15 minutes",
                "30min": "30 minutes",
                "1hour": "1 hour",
                "2hours": "2 hours",
                "1day": "1 day"
            }
        },
        theme: {
            title: "Theme & Interface Settings",
            appTheme: "Application Theme",
            themes: {
                light: "Light Theme",
                dark: "Dark Theme",
                cupcake: "Cupcake Theme",
                bumblebee: "Bumblebee Theme",
                emerald: "Emerald Theme",
                corporate: "Corporate Theme",
                retro: "Retro Theme",
                synthwave: "Synthwave Theme",
                cyberpunk: "Cyberpunk Theme"
            },
        },
        language: {
            title: "Language Settings",
            selectLanguage: "Select Language",
            languages: {
                zh: "中文",
                en: "English",
            },
        },
        integration: {
            title: "Integration & Sync Settings",
            notSupported: "Note: Integration and synchronization are not yet supported"
        },
    },
};
