<script setup lang="ts">
    import { ref } from "vue";
    import { VueUiStackbar, type VueUiStackbarConfig } from "vue-data-ui";
    import "vue-data-ui/style.css"; // If you are using multiple components, place styles import in your main

    const props = defineProps<{
        fcd: {
            date: string;
            minutes: number;
        }[];
    }>();

    const config = ref<VueUiStackbarConfig>({
        theme: "",
        responsive: false,
        customPalette: [],
        useCssAnimation: true,
        orientation: "vertical",
        table: {
            show: false,
            responsiveBreakpoint: 400,
            columnNames: {
                period: "Period",
                total: "Total",
            },
            th: {
                backgroundColor: "#ffffff00",
                color: "#1A1A1Aff",
                outline: "none",
            },
            td: {
                backgroundColor: "#ffffff00",
                color: "#1A1A1Aff",
                outline: "none",
                roundingValue: 0,
            },
        },
        userOptions: {
            show: false,
            showOnChartHover: false,
            keepStateOnChartLeave: true,
            position: "right",
            buttons: {
                tooltip: true,
                pdf: true,
                csv: true,
                img: true,
                table: true,
                labels: true,
                fullscreen: false,
                sort: false,
                stack: false,
                animation: false,
                annotator: false,
            },
            buttonTitles: {
                open: "Open options",
                close: "Close options",
                tooltip: "Toggle tooltip",
                pdf: "Download PDF",
                csv: "Download CSV",
                img: "Download PNG",
                table: "Toggle table",
                labels: "Toggle labels",
                fullscreen: "Toggle fullscreen",
                annotator: "Toggle annotator",
            },
        },
        style: {
            fontFamily: "inherit",
            chart: {
                backgroundColor: "#FFFFFFff",
                color: "#2D353Cff",
                height: 500,
                width: 800,
                padding: {
                    top: 12,
                    right: 6,
                    bottom: 12,
                    left: 24,
                },
                title: {
                    text: "Title",
                    color: "#1A1A1Aff",
                    fontSize: 0,
                    bold: true,
                    textAlign: "center",
                    paddingLeft: 0,
                    paddingRight: 0,
                    subtitle: {
                        color: "#A1A1A1ff",
                        text: "Subtitle",
                        fontSize: 0,
                        bold: false,
                    },
                },
                legend: {
                    show: true,
                    bold: false,
                    backgroundColor: "#ffffff00",
                    color: "#1A1A1Aff",
                    fontSize: 14,
                },
                zoom: {
                    show: false,
                    color: "#ccccccff",
                    highlightColor: "#4A4A4A",
                    fontSize: 14,
                    useResetSlot: false,
                    startIndex: null,
                    endIndex: null,
                    enableRangeHandles: true,
                    enableSelectionDrag: true,
                },
                tooltip: {
                    show: true,
                    color: "#1A1A1Aff",
                    backgroundColor: "#ffffff00",
                    fontSize: 14,
                    customFormat: null,
                    borderRadius: 4,
                    borderColor: "#e1e5e8",
                    borderWidth: 1,
                    backgroundOpacity: 30,
                    position: "center",
                    offsetY: 24,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showTimeLabel: true,
                },
                highlighter: {
                    color: "#1A1A1Aff",
                    opacity: 5,
                },
                bars: {
                    gapRatio: 0.5,
                    distributed: false,
                    showDistributedPercentage: true,
                    borderRadius: 0,
                    strokeWidth: 1,
                    gradient: {
                        show: true,
                        intensity: 20,
                    },
                    totalValues: {
                        show: true,
                        offsetY: 0,
                        fontSize: 16,
                        bold: false,
                        color: "#1A1A1Aff",
                    },
                    dataLabels: {
                        show: true,
                        hideEmptyValues: true,
                        hideEmptyPercentages: true,
                        adaptColorToBackground: true,
                        color: "#1A1A1Aff",
                        fontSize: 24,
                        bold: false,
                        rounding: 0,
                        prefix: "",
                        suffix: "",
                        formatter: null,
                    },
                },
                grid: {
                    scale: {
                        ticks: 10,
                        scaleMin: null,
                        scaleMax: null,
                    },
                    x: {
                        showAxis: true,
                        showHorizontalLines: false,
                        axisColor: "#E1E5E8",
                        axisThickness: 2,
                        axisName: {
                            show: false,
                            text: "",
                            fontSize: 14,
                            color: "#1A1A1Aff",
                            bold: false,
                            offsetY: 0,
                        },
                        timeLabels: {
                            show: true,
                            values: props.fcd?.map((item) => item.date),
                            offsetY: 0,
                            rotation: 0,
                            fontSize: 12,
                            color: "#1A1A1Aff",
                            bold: false,
                        },
                    },
                    y: {
                        showAxis: true,
                        showVerticalLines: false,
                        axisColor: "#E1E5E8",
                        axisThickness: 2,
                        axisName: {
                            show: false,
                            text: "",
                            fontSize: 14,
                            color: "#1A1A1Aff",
                            bold: false,
                            offsetX: 0,
                        },
                        axisLabels: {
                            show: true,
                            color: "#1A1A1Aff",
                            fontSize: 14,
                            bold: false,
                            rounding: 0,
                        },
                    },
                },
            },
        },
    });

    const dataset = ref([
        {
            name: "专注时长",
            series: props.fcd?.map((item) => item.minutes),
            color: "#39A7B3",
        },
    ]);
</script>
<template>
    <div id="VDUStackbar" :style="{ width: '600px' }">
        <VueUiStackbar class="bg-transparent! text-base-content!" :config="config" :dataset="dataset" />
    </div>
</template>

<style lang="scss">
    div.vue-ui-stackbar svg text {
        fill: var(--color-base-content) !important;
    }

    div.vue-data-ui-legend > div.vue-data-ui-legend-item > div {
        color: var(--color-base-content) !important;
    }
</style>
