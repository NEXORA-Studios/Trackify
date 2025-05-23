export type ITaskList = ITaskItem[];

export interface ITaskItem {
    id: number;
    title: string;
    description: string;
    priority: 0 | 1 | 2;
    deadline: string;
    tags: string[];
    subtasks: ISubTaskItem[];
    completed: boolean;
    hidden?: boolean;
}

export interface ISubTaskItem {
    id: number;
    title: string;
    completed: boolean;
}

export type ITheme =
    | "light"
    | "dark"
    | "cupcake"
    | "bumblebee"
    | "emerald"
    | "corporate"
    | "synthwave"
    | "retro"
    | "cyberpunk";

export type ILanguage = "zh-CN" | "en-US";

export interface ISettings {
    __version__: number;
    user: {
        avatar?: string;
        username: string;
        email: string;
    };
    notifications: {
        task: boolean;
        deadline: boolean;
        daily_outline: boolean;
        voice: boolean;
        time_notify: 5 | 10 | 15 | 30 | 60 | 120 | 1440; // 1440 = 1 day before
    };
    theme: {
        value: ITheme;
        language: ILanguage;
    };
}

export interface IFocus {
    [key: string]: number;
}
