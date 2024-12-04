<template>
  <div class="image-viewer">
    <!-- 左カラム（メイン画像とコメントセクション） -->
    <div class="main-content">
      <div class="main-image-container">
        <button
          class="navigation-button prev-button"
          @click="nextPage"
          :disabled="currentIndex === pages.length - 1"
        >
          <span class="arrow">◀️<br>【次のページへ】</span>
        </button>
        <img v-if="currentPage" :src="currentPage.src" alt="Comic Page" class="main-image" />
        <button
          class="navigation-button next-button"
          @click="prevPage"
          :disabled="currentIndex === 0"
        >
          <span class="arrow">▶️<br>【前のページへ】</span>
        </button>
      </div>

      <div class="page-info">
        <p>ページ {{ currentIndex + 1 }} / {{ pages.length }}</p>
      </div>

      <CommentSection
        v-if="currentPage"
        :pageId="currentIndex"
        :comments="currentComments"
        :username="username"
      />
    </div>

    <div class="thumbnail-list-container">
      <p class="thumbnail-title">ページ一覧</p>
      <div class="thumbnail-list">
        <div
          v-for="(page, index) in pages"
          :key="page.id"
          class="thumbnail-container"
        >
          <img
            :src="page.src"
            :alt="'Page ' + (index + 1)"
            class="thumbnail"
            @click="goToPage(index)"
          />
          <p class="thumbnail-page-number">ページ {{ index + 1 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import CommentSection from './CommentSection.vue';

const props = defineProps({
  pages: Array,
  username: {  // 追加
    type: String,
    required: true
  }
});

const currentIndex = ref(0);
const currentPage = computed(() => props.pages[currentIndex.value]);

// 現在のページに対応するコメント
const currentComments = ref([]);

// 次のページへ進む
const nextPage = () => {
  if (currentIndex.value < props.pages.length - 1) currentIndex.value++;
};

// 前のページへ戻る
const prevPage = () => {
  if (currentIndex.value > 0) currentIndex.value--;
};

const goToPage = (index) => {
  currentIndex.value = index;
};

// コメントの更新を監視して、ページに対応するコメントを更新
watch(currentIndex, (newIndex) => {
  const storedComments = localStorage.getItem(`comments_page_${newIndex}`);
  if (storedComments) {
    currentComments.value = JSON.parse(storedComments);
  }
});
</script>


<style scoped>
.image-viewer {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 20px;
  justify-content: space-between; /* 左右のコンテンツを分ける */
}

/* 左側のメインコンテンツ */
.main-content {
  display: flex;
  flex-direction: column;
  width: 65%;
  margin-right: 20px;
  overflow: hidden; /* コメントが増えてもメインコンテンツが押し出されないように */
  flex-grow: 1; /* メインコンテンツが可変で他の要素が押し出されないようにする */
}

.main-image-container {
  display: flex;
  justify-content: flex-start; /* 画像を左寄せに */
  align-items: center;
  height: 80vh; /* 画像表示エリアの高さを少し大きく */
  overflow: hidden;
  position: relative; /* 画像の位置を調整するため */
}

/* ボタンはデフォルトで非表示 */
.navigation-button {
  position: absolute;
  top: 50%; /* ボタンを上下中央に配置 */
  transform: translateY(-50%);
  width: 50%; /* ボタンの幅を画像の半分に */
  height: 100%; /* ボタンの高さを画像の高さと同じに */
  background-color: rgba(0, 0, 0, 0.3); /* 透明度0.3の黒 */
  color: white;
  border: none;
  font-size: 3em; /* 矢印のサイズを大きくする */
  display: none; /* 初期状態で非表示 */
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10; /* ボタンが画像の上に表示されるように */
}

/* 画像上にカーソルを置いた時にボタンを表示 */
.main-image-container:hover .navigation-button {
  display: flex; /* カーソルが画像上にある時に表示 */
}

.navigation-button:hover {
  background-color: rgba(0, 0, 0, 0.5); /* ホバー時の透明度を0.5に */
}

/* 右矢印ボタン */
.next-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* 透明度0.3の黒 */
  color: white;
  border: none;
  font-size: 3em;
  display: none;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  border-top-left-radius: 40%;  /* 左上の角を円形に */
  border-bottom-left-radius: 40%;  /* 左下の角を円形に */
  border-top-right-radius: 0;  /* 右上の角はそのまま */
  border-bottom-right-radius: 0;  /* 右下の角はそのまま */
  right: 8%; /* 右側に配置（位置変更なし） */
}

/* 左矢印ボタン */
.prev-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* 透明度0.3の黒 */
  color: white;
  border: none;
  font-size: 3em;
  display: none;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  border-top-left-radius: 0;  /* 左上の角はそのまま */
  border-bottom-left-radius: 0;  /* 左下の角はそのまま */
  border-top-right-radius: 40%;  /* 右上の角を円形に */
  border-bottom-right-radius: 40%;  /* 右下の角を円形に */
}

/* 右矢印（次のページへ） */
.prev-button .arrow {
  transform: scaleX(1); /* 矢印を元の方向（◀️）にする */
}

/* 左矢印（前のページへ） */
.next-button .arrow {
  transform: scaleX(1); /* 矢印を反転させず（▶️）そのまま */
}


/* メイン画像 */
.main-image {
  max-width: 95%; /* 画像の幅をさらに大きくする */
  max-height: 95%; /* 高さをさらに大きくする */
  object-fit: contain; /* 上部が切れないように調整 */
}

.page-info {
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 10px;
}

.thumbnail-list-container {
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 80vh;  /* サムネイルリストの最大高さ */
  overflow-y: auto; /* サムネイルリストにスクロールを追加 */
}

.comment-list {
  max-height: 50vh;  /* コメントの最大高さを制限 */
  overflow-y: auto;  /* コメントリストにスクロールを追加 */
  margin-top: 10px;
}

.thumbnail-title {
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.thumbnail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 80vh;  /* サムネイルリストが縦いっぱいにスクロール可能 */
  overflow-y: auto;
  width: 100%;
}

.thumbnail-container {
  text-align: center;
  position: relative; /* ページ番号を左上に配置するため */
}

.thumbnail {
  width: 60%; /* 画像のサイズを小さくする */
  height: auto;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.thumbnail:hover {
  transform: scale(1.1);
}

/* サムネイルの左上にページ番号を配置 */
.thumbnail-page-number {
  position: absolute;
  top: 0; /* 上部に配置 */
  left: 0; /* 左寄せに配置 */
  font-size: 1em;
  color: #fff;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.6); /* 背景色を設定して視認性を高める */
  padding: 3px 5px;
  border-radius: 3px;
}
</style>