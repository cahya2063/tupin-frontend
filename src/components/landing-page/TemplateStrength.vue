<script setup>
defineProps({
  src: String,
  alt: String,
  width: {
    type: String,
    default: '100px',
  },
  text: String,
})
</script>

<template>
  <div class="strength">
    <div class="item">
      <img
        :src="src"
        :alt="alt"
        :width="width"
      />
      <p
        class="text"
        v-html="text"
      ></p>
    </div>
  </div>
</template>

<style scoped>
.item {
  display: flex;
  gap: 20px;
  padding: 15px;
  margin-block: 10px;

  border: 3px solid grey;
  border-radius: 15px;
}
.text {
  font-size: 18px;
}
</style>
