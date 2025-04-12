import { createI18n } from "vue-i18n";
import { SettingStore } from "../mods/Store";
import { ISettings } from "../mods/Interface";
import zh from "./locales/zh";
import en from "./locales/en";

// 从localStorage获取语言设置，如果没有则尝试从settings.bin获取
const settingStore = SettingStore.getInstance();

let defaultLocale = "zh-CN";
(async function () {
    defaultLocale =
        ((await settingStore.getSettings()) as ISettings)["theme"]["language"] ||
        localStorage.getItem("language") ||
        "zh-CN";
})();

// 创建i18n实例
const i18n = createI18n({
    legacy: false, // 使用组合式API
    locale: defaultLocale, // 默认语言
    fallbackLocale: "zh-CN", // 回退语言
    messages: {
        zh,
        en,
    },
});

export default i18n;
