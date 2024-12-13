<template>
  <div class="image-viewer">
    <!-- 左カラム（メイン画像とコメントセクション） -->
    <div class="main-content" ref="mainContentRef">
      <div class="main-image-container">
        <!-- 次のページへボタン（左側） -->
        <button
          class="navigation-button next-button"
          @click="nextPage"
          :disabled="currentIndex === pages.length - 1"
          aria-label="次のページへ"
        >
          <span class="arrow">◀️<br>【次のページへ】</span>
        </button>

        <!-- メイン画像 -->
        <img
          v-if="currentPage"
          :src="currentPage.src"
          alt="Comic Page"
          class="main-image"
          loading="lazy"
        />

        <!-- 前のページへボタン（右側） -->
        <button
          class="navigation-button prev-button"
          @click="prevPage"
          :disabled="currentIndex === 0"
          aria-label="前のページへ"
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

    <!-- 右カラム（サムネイルリスト） -->
    <div class="thumbnail-list-container">
      <p class="thumbnail-title">ページ一覧</p>
      <div class="thumbnail-list">
        <div
          v-for="(page, index) in pages"
          :key="page.id"
          class="thumbnail-container"
          :class="{ active: index === currentIndex }"
        >
          <img
            :src="page.src"
            :alt="'Page ' + (index + 1)"
            class="thumbnail"
            @click="goToPage(index)"
            loading="lazy"
          />
          <p class="thumbnail-page-number">ページ {{ index + 1 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import CommentSection from './CommentSection.vue';
import axios from 'axios';
import Hammer from 'hammerjs';

// プロパティの定義
const props = defineProps({
  pages: {
    type: Array,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

// リアクティブなデータ
const currentIndex = ref(0);
const currentPage = computed(() => props.pages[currentIndex.value]);

// 現在のページに対応するコメント
const currentComments = ref([]);

// リファレンス
const mainContentRef = ref(null);

// スワイプジェスチャー用のHammerインスタンス
let hammer = null;

// スクロールのスロットル用
let lastScrollTime = 0;
const scrollThrottle = 1000; // ミリ秒

// 次のページへ進む関数
const nextPage = () => {
  if (currentIndex.value < props.pages.length - 1) {
    currentIndex.value++;
  }
};

// 前のページへ戻る関数
const prevPage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// 特定のページへ移動する関数
const goToPage = (index) => {
  currentIndex.value = index;
};

// コメントをロードする関数
const loadComments = async (pageId) => {
  try {
    const response = await axios.get(`http://localhost:8888/comments`);
    // フィルタリングして現在のページのコメントを取得
    const pageComments = response.data.filter(c => c.pageId === pageId);
    currentComments.value = pageComments
      .map(c => ({
        ...c,
        showReplyForm: false,
        replyText: '',
        replyInputRefs: null, // 返信入力用のref
      }))
      .reverse();  // 最新を上に表示
  } catch (error) {
    console.error('コメント取得エラー:', error);
    alert('コメントの取得に失敗しました。');
  }
};

// 初期ロード時にコメントをロード
const loadInitialComments = async () => {
  await loadComments(currentIndex.value);
};

// スワイプジェスチャーを初期化
const initializeHammer = () => {
  if (mainContentRef.value) {
    hammer = new Hammer(mainContentRef.value);
    hammer.on('swipeleft', () => {
      nextPage();
    });
    hammer.on('swiperight', () => {
      prevPage();
    });
  }
};

// スワイプジェスチャーを破棄
const destroyHammer = () => {
  if (hammer) {
    hammer.destroy();
    hammer = null;
  }
};

// スクロールイベントハンドラー
const handleWheel = (event) => {
  const currentTime = new Date().getTime();
  if (currentTime - lastScrollTime < scrollThrottle) {
    return; // スロットル
  }

  // 水平スクロールを検出
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    if (event.deltaX < -50) { // 左にスクロール
      nextPage();
      lastScrollTime = currentTime;
    } else if (event.deltaX > 50) { // 右にスクロール
      prevPage();
      lastScrollTime = currentTime;
    }
  }
};

// ページが変更されたらコメントをロード
watch(currentIndex, async (newIndex) => {
  await loadComments(newIndex);
});

// コンポーネントのマウント時
onMounted(() => {
  loadInitialComments();
  initializeHammer();

  // ホイールイベントのリスナーを追加
  if (mainContentRef.value) {
    mainContentRef.value.addEventListener('wheel', handleWheel, { passive: true });
  }
});

// コンポーネントのアンマウント時
onBeforeUnmount(() => {
  destroyHammer();

  // ホイールイベントのリスナーを削除
  if (mainContentRef.value) {
    mainContentRef.value.removeEventListener('wheel', handleWheel);
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
  box-sizing: border-box;
}

/* 左側のメインコンテンツ */
.main-content {
  display: flex;
  flex-direction: column;
  width: 65%;
  margin-right: 20px;
  overflow: hidden; /* コメントが増えてもメインコンテンツが押し出されないように */
  flex-grow: 1; /* メインコンテンツが可変で他の要素が押し出されないようにする */
  position: relative; /* スワイプジェスチャーのために相対位置に設定 */
}

/* メイン画像コンテナ */
.main-image-container {
  display: flex;
  justify-content: center; /* 画像を中央に配置 */
  align-items: center;
  height: 80vh; /* 画像表示エリアの高さを設定 */
  overflow: hidden;
  position: relative; /* 画像の位置を調整するため */
}

/* ナビゲーションボタンの共通スタイル */
.navigation-button {
  position: absolute;
  top: 50%; /* ボタンを上下中央に配置 */
  transform: translateY(-50%);
  width: 10%; /* ボタンの幅を調整 */
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* 透明度0.3の黒 */
  color: white;
  border: none;
  font-size: 1em;
  display: flex; /* ボタン内のコンテンツを中央に配置 */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10; /* ボタンが画像の上に表示されるように */
  border-radius: 5px;
  transition: background 0.3s;
}

.navigation-button:hover {
  background-color: rgba(0, 0, 0, 0.5); /* ホバー時の透明度を0.5に */
}

.navigation-button:disabled {
  background-color: rgba(0, 0, 0, 0.1); /* 非アクティブ時の色 */
  cursor: not-allowed;
}

/* 次のページボタン（左側） */
.next-button {
  left: 5%; /* 左側に配置 */
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

/* 前のページボタン（右側） */
.prev-button {
  right: 5%; /* 右側に配置 */
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

/* メイン画像 */
.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 上部が切れないように調整 */
}

/* ページ情報 */
.page-info {
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
}

/* 右カラム（サムネイルリスト） */
.thumbnail-list-container {
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 80vh;  /* サムネイルリストの最大高さ */
  overflow-y: auto; /* サムネイルリストにスクロールを追加 */
  box-sizing: border-box;
}

/* コメントリスト */
.comment-list {
  max-height: 50vh;  /* コメントの最大高さを制限 */
  overflow-y: auto;  /* コメントリストにスクロールを追加 */
  margin-top: 10px;
}

/* サムネイルタイトル */
.thumbnail-title {
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 10px;
  text-align: center;
}

/* サムネイルリスト */
.thumbnail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 80vh;  /* サムネイルリストが縦いっぱいにスクロール可能 */
  overflow-y: auto;
  width: 100%;
}

/* サムネイルコンテナ */
.thumbnail-container {
  text-align: center;
  position: relative; /* ページ番号を左上に配置するため */
  cursor: pointer;
}

/* サムネイル画像 */
.thumbnail {
  width: 60%; /* 画像のサイズを小さくする */
  height: auto;
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

/* レスポンシブデザイン */
@media (max-width: 1024px) {
  .image-viewer {
    flex-direction: column;
  }

  .main-content, .thumbnail-list-container {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
  }

  .thumbnail-list-container {
    height: auto;
  }

  .thumbnail-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .thumbnail-container {
    width: 45%;
  }

  .navigation-button {
    width: 15%;
    font-size: 0.8em;
  }
}

@media (max-width: 768px) {
  .navigation-button {
    width: 20%;
    font-size: 0.7em;
  }

  .thumbnail-container {
    width: 30%;
  }
}
</style>
