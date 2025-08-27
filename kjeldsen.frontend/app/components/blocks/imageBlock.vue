<template>
  <div :class="(props.columns ?? 12) < 12 ? 'p-5' : ''">
    <picture v-if="!isBlockPreview && sources.length" class="m-0">
      <source
        v-for="(s, index) in sources"
        :key="index"
        :srcset="s.src"
        :media="s.media"
      />
      <img :src="sources.at(-1)?.src" :alt="altText" class="rounded-lg" :data-guid="image?.id" />
    </picture>

    <img
      v-if="isBlockPreview && sources.length"
      :src="sources.at(-1)?.src?.replace('/api','')"
      :alt="altText"
      :data-guid="image?.id"
      class="w-full"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ImageBlockElementModel } from '~/../server/delivery-api';

const props = defineProps<{
  data: ImageBlockElementModel;
  columns?: number;
}>();
const image = props.data.properties?.image?.at(0);
const cropPref = props.data.properties?.cropPreference ?? 'Ratio';

const altText = props.data.properties?.altText ?? '';

type SourceEntry = { src: string; media?: string };
const sources: SourceEntry[] = [];

function matchesCropPref(crop: { width: number, height: number }) {
  const ratio = crop.width / crop.height;
  if (cropPref === 'Square') return Math.abs(ratio - 1) < 0.05;
  if (cropPref === 'Slim') return ratio >= 3.9;
  return ratio >= 1.75 && ratio <= 1.85; // updated for tighter 16:9 match
}

function matchesColumnWidth(crop: { width: number }) {
  const cols = props.columns ?? 12;
  if (cols >= 9) return crop.width >= 1000;
  if (cols >= 5) return crop.width >= 800 && crop.width < 1000;
  return crop.width < 800;
}

// Build a crop URL using only rxy (focal point), width and height
function buildRxyUrl(baseUrl: string, crop: { width: number; height: number }, focalPoint?: any): string {
  const fx = focalPoint?.x ?? focalPoint?.left;
  const fy = focalPoint?.y ?? focalPoint?.top;
  const params: string[] = [];
  if (typeof fx === 'number' && typeof fy === 'number') {
    params.push(`rxy=${fx},${fy}`);
  }
  params.push(`width=${crop.width}`);
  params.push(`height=${crop.height}`);
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.join('&')}`;
}

if (image?.url) {
  // If no crops or explicit 'None' preference, just use the raw image URL once
  if (!image.crops?.length || cropPref === 'None') {
    sources.push({ src: image.url });
  } else {
    const filteredCrops = image.crops
      .filter(crop => matchesCropPref(crop) && matchesColumnWidth(crop))
      .sort((a, b) => b.width - a.width); // largest first

    // Map crops to sources, with media queries based on the next smaller crop width
    filteredCrops.forEach((crop, i) => {
      const src = buildRxyUrl(image.url, crop, image.focalPoint);
      const next = filteredCrops[i + 1];
      const media = next ? `(min-width: ${next.width}px)` : '';
      sources.push({ src, media });
    });
  }
}

const event = useRequestEvent();
const isBlockPreview = event?.context.blockPreview;
</script>
