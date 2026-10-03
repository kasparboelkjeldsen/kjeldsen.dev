<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ msg?: string }>();
const count = ref(0);
</script>

<template>
    <div class="hello">
        <p>{{ props.msg ?? "Hello from Vue" }}</p>
        <button type="button" @click="count++">Clicked {{ count }} times</button>
    </div>
</template>

<style>
.hello {
    font-family: system-ui, sans-serif;
    border: 2px dashed #f0f;
    border-radius: 8px;
    padding: 1rem;
    display: inline-block;
}
.hello button {
    cursor: pointer;
}
</style>
