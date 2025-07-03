<template>
  <div>
    <picture v-if="!isBlockPreview && sources.length" class="m-0">
      <source
        v-for="(src, index) in sources"
        :key="index"
        :srcset="src"
        :media="getMediaQuery(index)"
      />
      <img :src="sources.at(-1)" :alt="altText" class="rounded-lg" />
    </picture>

    <img
      v-if="isBlockPreview && sources.length"
      :src="sources.at(-1)?.replace('/api','')"
      :alt="altText"
      class="w-full"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ImageBlockElementModel } from '~/server/delivery-api';
import buildCropUrl from '~/utils/buildCropUrl';

const props = defineProps<{
  data: ImageBlockElementModel;
  columns?: number;
}>();

const image = props.data.properties?.image?.at(0);
const cropPref = props.data.properties?.cropPreference ?? 'Ratio';

const altText = props.data.properties?.altText ?? '';
const sources: string[] = [];

const breakpoints = [1600, 1200, 800, 320];

// Matches Umbraco-style crop name logic
function matchesCropPref(crop: { width: number, height: number }) {
  const ratio = crop.width / crop.height;
  if (cropPref === 'Square') return Math.abs(ratio - 1) < 0.05;
  if (cropPref === 'Slim') return ratio >= 3.5;
  return ratio >= 1.6 && ratio <= 1.85; // default: 16:9-ish
}

function matchesColumnWidth(crop: { width: number }) {
  const cols = props.columns ?? 12;
  if (cols >= 9) return crop.width >= 1200;
  if (cols >= 5) return crop.width >= 800 && crop.width < 1200;
  return crop.width < 800;
}

if (image?.url && image.crops?.length) {
  const filteredCrops = image.crops
    .filter(crop => matchesCropPref(crop) && matchesColumnWidth(crop))
    .sort((a, b) => b.width - a.width); // largest first

  filteredCrops.forEach((crop, index) => {
    if(cropPref === 'None') {
      // If no crop preference, use the original image URL
      sources.push(image.url);
      return;
    }
    const cropUrl = buildCropUrl(image.url, crop, crop.width, image.focalPoint);
    sources.push(cropUrl);
  });
}

function getMediaQuery(index: number): string {
  const min = breakpoints[index + 1];
  return min ? `(min-width: ${min}px)` : '';
}

const event = useRequestEvent();
const isBlockPreview = event?.context.blockPreview;
</script>