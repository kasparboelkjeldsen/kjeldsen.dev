<template>
  <div class="prose text-white">
    <h2 class="text-white">Common</h2>
    <div>Decimal: {{ data.properties?.decimal }}</div>
    <div>Email: {{ data.properties?.email }}</div>
    <div>Numeric: {{ data.properties?.numeric }}</div>
    <div>Slider: {{ data.properties?.slider }}</div>
    <div>Tags: {{ data.properties?.tags?.join(', ') }}</div>
    <div>TextArea: {{ data.properties?.textarea }}</div>
    <div>Toggle: {{ data.properties?.toggle }}</div>
    <h2 class="text-white">Lists</h2>
    <div>CheckboxList: {{ data.properties?.checkboxlist?.join(', ') }}</div>
    <div>Dropdown: {{ data.properties?.dropdown }}</div>
    <div>
      BlockList:
      <BlockModule v-if="data.properties?.blocklist" :data="data.properties?.blocklist" />
    </div>
    <div>DropDownMultiple: {{ data.properties?.dropdownMultiple?.join(', ') }}</div>
    <div>MultipleTextString: {{ data.properties?.multipleTextString?.join(', ') }}</div>
    <div>RadioButtonList: {{ data.properties?.radioButtonList }}</div>
    <h2 class="text-white">Media</h2>
    <div>Media picker: {{ data.properties?.mediaPicker?.at(0)?.url }}</div>
    <div>Multiple Media Picker: {{ data.properties?.multipleMediaPicker?.map(item => item.url).join(', ') }}</div>
    <h2 class="text-white">People</h2>
    <div>User Picker: {{ data.properties?.userPicker }}</div>
    <h2 class="text-white">Pickers</h2>
    <div>Color Picker: {{ data.properties?.colorPicker }}</div>
    <div>Content Picker: {{ data.properties?.contentPicker?.map(item => item.id).join(', ') }}</div>
    <div>Date Picker: {{ data.properties?.datePicker }}</div>
    <div>Date and Time Picker: {{ data.properties?.dateAndTimePicker }}</div>
    <div>Document Picker: {{ data.properties?.documentPicker?.id }}</div>
    <div>Multi Url Picker: {{ data.properties?.multiUrlPicker?.map(item => item.url).join(', ') }}</div>
    <h2 class="text-white">Rich Content</h2>
    <div>Block Grid: <GridModule v-if="data.properties?.blockGrid" :data="data.properties?.blockGrid" /></div>
    <div>Code Editor: {{ data.properties?.codeEditor }}</div>
    <div>Rich Text Editor: {{ data.properties?.richTextEditor }}</div>
  </div>
</template>
<script lang="ts" setup>
import type { TestBlockElementModel} from '~/../server/delivery-api';
import BlockModule from '../blockModule.vue';

defineProps<{
  data: TestBlockElementModel;
}>();
</script>