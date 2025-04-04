<script setup lang="ts">
    import { ref } from "vue";
    import { EventBus } from "../mods/Eventbus";
    import { SettingStore } from "../mods/Store";

    interface IOption {
        text: string;
        value: string;
    }
    const ThemeOptions: IOption[] = [
        // 自动
        { text: "自动（跟随系统）", value: "__auto__" },
        // DaisyUI v5 所有颜色主题
        { text: "Light", value: "light" },
        { text: "Dark", value: "dark" },
        { text: "Cupcake", value: "cupcake" },
        { text: "Bumblebee", value: "bumblebee" },
        { text: "Emerald", value: "emerald" },
        { text: "Corporate", value: "corporate" },
        { text: "Synthwave", value: "synthwave" },
        { text: "Retro", value: "retro" },
        { text: "Cyberpunk", value: "cyberpunk" },
        { text: "Valentine", value: "valentine" },
        { text: "Halloween", value: "halloween" },
        { text: "Garden", value: "garden" },
        { text: "Forest", value: "forest" },
        { text: "Aqua", value: "aqua" },
        { text: "Lofi", value: "lofi" },
        { text: "Pastel", value: "pastel" },
        { text: "Fantasy", value: "fantasy" },
        { text: "Wireframe", value: "wireframe" },
        { text: "Luxury", value: "luxury" },
        { text: "Dracula", value: "dracula" },
        { text: "CMYK", value: "cmyk" },
        { text: "Business", value: "business" },
        { text: "Lemonade", value: "lemonade" },
        { text: "Night", value: "night" },
        { text: "Coffee", value: "coffee" },
        { text: "Winter", value: "winter" },
        { text: "Dim", value: "dim" },
        { text: "Nord", value: "nord" },
        { text: "Sunset", value: "sunset" },
        { text: "Caramellatte", value: "caramellatte" },
        { text: "Silk", value: "silk" },
    ];

    const settingStore = SettingStore.getInstance();
    const theme = ref<string>();
    (async () => {
        const _s = await settingStore.getSettings();
        if (!_s) return;
        theme.value = _s["theme"]["value"];
    })();
    EventBus.on("theme:change", (e: string) => {
        theme.value = e;
    });
</script>

<template>
    <section data-region-for="theme-controller" class="hidden">
        <input
            v-for="option in ThemeOptions"
            type="checkbox"
            :name="option.text"
            :value="option.value"
            class="toggle theme-controller"
            :checked="theme === option.value" />
    </section>
</template>
