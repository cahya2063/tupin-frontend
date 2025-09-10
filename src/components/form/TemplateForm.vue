<script setup>
const model = defineModel()
defineProps({
    name: String,
    id: String,
    placeholder: String,
    type: {
        type: String,
        default: 'text'
    },
    width: String
})
</script>

<template>
    <input v-model="model" :type="type" :name="name" :id="id" class="form-input" :style="{ width: width }" :placeholder="placeholder">
</template>

<style scoped>
.form-input{
    height: 50px;
    font-family: 'Poppins';
    font-size: 15px;
    background-color: white;
    border-radius: 10px;
    border: 1px solid blue;
    padding: 5px 15px;
    margin-block: 15px;
}
</style>
