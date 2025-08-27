<template>
  <div class="cache-keys">
    <table v-if="cacheKeysArray.length" class="table m-0 mb-5">
      <caption style="padding-left: 2px">Cache Keys</caption>
      <thead>
        <tr>
          <th scope="col" class="col-index">(index)</th>
          <th scope="col" class="col-num">#</th>
          <th scope="col">Cache Key</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(key, idx) in cacheKeysArray" :key="`ck-${idx}`">
          <td class="mono">{{ idx }}</td>
          <td class="mono">{{ idx + 1 }}</td>
          <td class="mono">'{{ key }}'</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="empty">No cache keys</p>
  </div>
  
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { CacheKeyExampleBlockElementModel, IApiContentResponseModel } from "~/../server/delivery-api";

const props = defineProps<{
  data: CacheKeyExampleBlockElementModel;
}>();

const route = useRoute();
const slugArray = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
const cleanSlug = slugArray.filter(Boolean).join("/");
const apiPath = "/api/content/" + cleanSlug + "/";

const result = await useFetch<IApiContentResponseModel>(apiPath, {
    server: true,
    cache: "no-cache",
  });

// Normalize to an array for rendering
const cacheKeysArray = computed<string[]>(() => {
  const maybe = result.data.value?.properties?.cacheKeys as unknown;
  return Array.isArray(maybe) ? maybe : [];
});

</script>

<style scoped>
.cache-keys {
  --tbl-border: #d0d7de;
  --tbl-head-bg: #f6f8fa;
  --tbl-head-fg: #24292f;
  --tbl-row-alt: #f9fafb;
  max-width: 100%;
}

@media (prefers-color-scheme: dark) {
  .cache-keys {
    --tbl-border: #30363d;
    --tbl-head-bg: #161b22;
    --tbl-head-fg: #e6edf3;
    --tbl-row-alt: #0d1117;
    color: #c9d1d9;
  }
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 0.95rem;
  border: 1px solid var(--tbl-border);
  border-radius: 8px;
  overflow: hidden;
}

.table caption {
  text-align: left;
  padding: 8px 0;
  font-weight: 600;
}

.table thead th {
  background: var(--tbl-head-bg);
  color: var(--tbl-head-fg);
  text-align: left;
}

.table th,
.table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--tbl-border);
}

.table tbody tr:nth-child(even) {
  background: var(--tbl-row-alt);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.mono {
  white-space: nowrap;
}

.col-index,
.col-num {
  width: 1%;
  white-space: nowrap;
}

.empty {
  margin-top: 8px;
  color: #6b7280;
}
</style>
