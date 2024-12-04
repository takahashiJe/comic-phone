<script setup>
import { ref } from 'vue';
import imageList from '@/assets/images.json';

// 画像を静的にインポートする方法
const pages = ref(imageList.map(image => {
  const imagePath = new URL(`@/assets/onepieceEpisode/${image.name}`, import.meta.url).href;
  return {
    id: image.id,
    src: imagePath
  };
}));
</script>

<template>
  <div class="outer-container">
    <div class="comic-view">
      <img v-for="page in pages" :key="page.id" :src="page.src" alt="Comic Page" />
    </div>
  </div>
</template>

<style scoped>
.outer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.comic-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.comic-view img {
  margin: 10px;
  width: 100%;
  max-width: 500px;
}
</style>
