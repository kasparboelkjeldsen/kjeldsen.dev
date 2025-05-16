import { defineComponent, ref, unref } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { Line } from "vue-chartjs";
import { Chart, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { useRuntimeConfig } from "../../node_modules/nuxt/dist/app/nuxt.mjs";
const dataPoints = 400;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "funTimeWebEkg",
  __ssrInlineRender: true,
  setup(__props) {
    Chart.register(
      Title,
      Tooltip,
      Legend,
      LineElement,
      CategoryScale,
      LinearScale,
      PointElement
    );
    const status = ref("I'm alive! 😄");
    const murders = ref([]);
    const config = useRuntimeConfig();
    config.public.cmsHost;
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleString();
    };
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
          pointRadius: 0
        }
      ]
    });
    const chartOptions = {
      responsive: true,
      animation: { duration: 0 },
      scales: {
        x: { display: false },
        y: { min: 0, max: 1.5, display: false }
      },
      plugins: { legend: { display: false } }
    };
    Array.from({ length: 50 }, (_, i) => {
      const x = i / 49;
      return x < 0.1 ? 1.2 * (x / 0.1) : 1.2 * Math.exp(-5 * (x - 0.1));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-6ffea522><h2 class="text-white text-2xl font-bold" data-v-6ffea522>${ssrInterpolate(status.value)}</h2><div class="h-20 mb-8" data-v-6ffea522>`);
      _push(ssrRenderComponent(unref(Line), {
        data: chartData.value,
        options: chartOptions
      }, null, _parent));
      _push(`</div>`);
      if (murders.value.length) {
        _push(`<div class="prose prose-invert mt-6" data-v-6ffea522><h3 data-v-6ffea522>💀 Crime Scene Log</h3><ul data-v-6ffea522><!--[-->`);
        ssrRenderList(murders.value, (murder) => {
          _push(`<li class="flex justify-between items-center border-b border-gray-700 py-2" data-v-6ffea522><span class="font-semibold" data-v-6ffea522>${ssrInterpolate(murder.username)} `);
          if (murder.count > 1) {
            _push(`<span class="text-sm text-pink-400 ml-2" data-v-6ffea522> (${ssrInterpolate(murder.count)} times — chill 😅) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span><span class="text-sm text-gray-400" data-v-6ffea522>${ssrInterpolate(formatDate(murder.last))}</span></li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<div class="text-gray-400 mt-6 italic" data-v-6ffea522> 🕊️ No murders on record. Peace reigns, or I&#39;m dead. </div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=funTimeWebEkg.vue2.mjs.map
