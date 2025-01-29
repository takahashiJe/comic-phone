<template>
  <div id="app">
    <!-- ログインしていない場合はログインフォームを表示 -->
    <div v-if="!isLoggedIn" class="login-container">
      <h1 class="text-black">ログイン</h1>
      <!-- フォームをユーザー選択に変更 -->
      <div class="user-list">
        <h2 class="text-black">名前を選択してください<br>※上から順にM2,M1,B4,B3になっています</h2>
        <div 
          v-for="user in users" 
          :key="user"
          @click="selectUser(user)"
          class="user-item"
          :class="{ 'selected': username === user }"
        >
          {{ user }}
        </div>
      </div>
      <button 
        @click="login" 
        class="login-button"
        :disabled="!username"
      >
        ログイン
      </button>
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
import { ref, onMounted } from 'vue';
import ImageViewer from './components/ImageViewer.vue';
import imageList from '@/assets/images.json';

const pages = ref(imageList);  // 画像データのリスト
const users = ref(
  ['Tomoaki Ohkawa', 
  'Riku Sato', 
  'Miho Hamabe',
  'Kai Yoshida',
  'Hayato Abe',
  'Shoma Sato',
  'Junta Takahashi',
  'Takumi Takahashi',
  'Aoi Yamada',
  'Miu Arai',
  'Haruka Ogawa',
  'Yuto Takahashi',
  'Akane Narita',
  'Takuma Yamane',
  '他のユーザー',
  '井内さん',
  '浄さん']
); // ユーザーリスト

const isLoggedIn = ref(false);// ログイン状態
const username = ref('');

// onMountedフックでlocalStorageからデータを読み込む
onMounted(() => {
  const storedData = localStorage.getItem('isLoggedIn');
  // localStorageにデータがあればそれを使用、なければfalseを設定
  if (storedData !== null) {
    username.value = localStorage.getItem('username');
    isLoggedIn.value = JSON.parse(storedData);
  } else {
    isLoggedIn.value = false;
  }
});

// ユーザー選択処理
const selectUser = (user) => {
  username.value = user;
};

// ログイン処理
const login = () => {
  // ここに実際の認証ロジックを実装
  if (username.value) {
    localStorage.setItem('username', username.value);
    localStorage.setItem('isLoggedIn', true);
    isLoggedIn.value = true;
  }
};
</script>

<style scoped>
/* ダークモードを検知して背景を白に設定 */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #f5f5f5 !important; /* 白っぽい背景 */
    color: #333333; /* テキストを暗めのグレーに */
  }
}
#app {
  background-color: #ffffff; /* デフォルト背景色を白に */
  color: #000000; /* 文字色を黒に */
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

.text-black {
  color: black;
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

.user-list {
  margin: 1rem 0;
}

.user-item {
  padding: 1rem 1.5rem;
  border: 1px solid #e0e0e0; /* 明るいグレーの境界線 */
  border-radius: 12px; /* 丸い角 */
  margin: 0.5rem 0;
  background-color: #ffffff; /* 白背景 */
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #333333; /* ダークグレーの文字 */
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 軽い影 */
}

.user-item:hover {
  background-color: #f7f7f7; /* ホバー時に薄い灰色背景 */
  transform: translateY(-3px); /* 浮き上がり効果 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* ホバー時に影を強調 */
}

.user-item.selected {
  background-color: #4CAF50; /* 選択時の落ち着いたグリーン */
  color: white; /* 文字色を白に */
  transform: scale(1.05); /* 少し大きくなる効果 */
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); /* グリーンの影 */
}

.user-item.selected:hover {
  background-color: #388E3C; /* 選択状態でホバー時に濃いグリーン */
  transform: scale(1.05) translateY(-3px); /* 少し浮き上がる */
}

.user-item:focus {
  outline: none; /* フォーカス時のアウトラインを削除 */
}

.login-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
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
