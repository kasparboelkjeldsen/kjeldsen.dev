<template>
  <div>
    <h2 class="text-white text-2xl font-bold">{{ status }}</h2>
    <div class="h-20 mb-8">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="murders.length" class="prose prose-invert mt-6">
      <h3>💀 Crime Scene Log</h3>
      <ul>
        <li
          v-for="murder in murders"
          :key="murder.username"
          class="flex justify-between items-center border-b border-gray-700 py-2"
        >
          <span class="font-semibold">
            {{ murder.username }}
            <span v-if="murder.count > 1" class="text-sm text-pink-400 ml-2">
              ({{ murder.count }} times — chill 😅)
            </span>
          </span>
          <span class="text-sm text-gray-400">{{
            formatDate(murder.last)
          }}</span>
        </li>
      </ul>
    </div>
    <div v-else class="text-gray-400 mt-6 italic">
      🕊️ No murders on record. Peace reigns, or I'm dead.
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRuntimeConfig } from "#imports";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import type { Murder } from "~/types/murder";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const status = ref("I'm alive! 😄");
const murders = ref<Murder[]>([]);
const config = useRuntimeConfig();
const cmsHost = config.public.cmsHost;

async function fetchMurders() {
  
  const murderData = await $fetch<Murder[]>("/api/murder/list")

  if (murderData) murders.value = murderData;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// 🫀 [EKG stuff below unchanged from your setup]...

const dataPoints = 400;
const chartData = ref({
  responsive: true,
  maintainAspectRatio: false,
  labels: Array(dataPoints).fill(""),
  datasets: [
    {
      label: "Heartbeat",
      data: Array(dataPoints).fill(0),
      borderColor: "rgb(0, 255, 0)",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0,
    },
  ],
});

const chartOptions = {
  responsive: true,
  animation: { duration: 0 },
  scales: {
    x: { display: false },
    y: { min: 0, max: 1.5, display: false },
  },
  plugins: { legend: { display: false } },
};

let interval: ReturnType<typeof setInterval> | null = null;
let animationFrame: number | null = null;
let lastBeatTime = Date.now();

const spikeShape = Array.from({ length: 50 }, (_, i) => {
  const x = i / 49;
  return x < 0.1 ? 1.2 * (x / 0.1) : 1.2 * Math.exp(-5 * (x - 0.1));
});
let spikeQueue: number[] = [];

const fetchHeartbeat = async () => {
  try {
    await $fetch(`${cmsHost}/api/heartbeat/beat`);
    lastBeatTime = Date.now();
    spikeQueue = [...spikeShape];
  } catch {
    // No beat detected
    status.value = "Potential heart failure! 💔";
  }
};

const updateChart = () => {
  const now = Date.now();
  const noHeartbeat = now - lastBeatTime > 2000;
  const nextValue = spikeQueue.length ? spikeQueue.shift()! : 0;

  const newLabels = [...chartData.value.labels.slice(1), ""];
  const newData = [...chartData.value.datasets[0].data.slice(1), nextValue];

  chartData.value = {
    responsive: true,
    maintainAspectRatio: false,
    labels: newLabels,
    datasets: [
      {
        ...chartData.value.datasets[0],
        data: newData,
        borderColor: noHeartbeat ? "rgb(255, 0, 0)" : "rgb(0, 255, 0)",
      },
    ],
  };

  if (noHeartbeat) {
    status.value = "I'm dead! 💀 Who did this?";
    fetchMurders(); // Refresh the murder list when dead
  } else {
    status.value = "I'm alive! 😄";
  }

  animationFrame = requestAnimationFrame(updateChart);
};

onMounted(async () => {
  interval = setInterval(fetchHeartbeat, 1000);
  updateChart();
  await fetchMurders(); // Initial murder log load
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  if (animationFrame) cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
canvas {
  background: rgba(0, 0, 0, 0.5);
}

ul li:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease-in-out;
}
</style>
