<script setup>
defineProps({
    content: String,
    width: String,
    height: String
})
</script>

<template>
    <button :style="{ width: width, height: height }" class="btn-tmp">{{ content }}</button>
</template>

<style scoped>
.btn-tmp{
    font-family: 'QuickSand';
    font-size: 20px;
    font-weight: 600;
    background-color: purple;
    color: white;

    border: 2px solid white;
    border-radius: 10px;
}
</style>