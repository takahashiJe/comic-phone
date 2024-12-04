<template>
  <div id="app">
    <!-- ログインしていない場合はログインフォームを表示 -->
    <div v-if="!isLoggedIn" class="login-container">
      <h1>ログイン</h1>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">ユーザー名</label>
          <input 
            type="text" 
            id="username"
            v-model="username"
            required
          >
        </div>
        <button type="submit" class="login-button">ログイン</button>
      </form>
    </div>

    <!-- ログイン済みの場合はImageViewerを表示 -->
    <ImageViewer 
      v-else 
      :pages="pages" 
      :username="username"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ImageViewer from './components/ImageViewer.vue';
import imageList from '@/assets/images.json';

const pages = ref(imageList);  // 画像データのリスト
const isLoggedIn = ref(false); // ログイン状態
const username = ref('');

// ログイン処理
const login = () => {
  // ここに実際の認証ロジックを実装
  if (username.value) {
    isLoggedIn.value = true;
  }
};
</script>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;  /* 上部の見切れを防ぐため、上揃えに変更 */
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;  /* paddingを含めた全体サイズに */
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin-top: 20vh;  /* ログインフォームを上から20%の位置に */
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.login-button {
  background: #007BFF;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background: #0056b3;
}

/* レスポンシブデザイン */
@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
