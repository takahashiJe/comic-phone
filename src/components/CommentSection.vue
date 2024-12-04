<template>
  <div class="comment-section">
    <textarea
      v-model="comment"
      placeholder="コメントする．．．"
      class="comment-input"
      rows="1"
      @input="adjustHeight"
    ></textarea>
    <button @click="postComment" class="comment-button">コメント</button>
    <div class="comment-list">
      <p>{{ currentComments.length }}件のコメント</p>
      <div v-for="(comment, index) in currentComments" :key="index" class="comment">
        <p>{{ comment.username }}:{{ comment.text }} - ページ {{ comment.pageId }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// コメントデータを保持する変数
const props = defineProps({
  pageId: Number,  // 親から渡された現在のページID
  comments: {
    type: Array,
    default: () => []  // デフォルト値を空配列に設定
  },
  username: {  // 追加
    type: String,
    default: '匿名ユーザー'
  }
});

const comment = ref('');
const currentComments = ref([]);  // このページに対するコメント

/*
修正内容の説明：
1. 以前はページごとに別々のlocalStorageキーを使用していましたが、
   これを'all_comments'という1つのキーにまとめました。

2. getAllComments()関数を追加し、全てのコメントを一括で管理するようにしました。

3. loadComments()関数では、全コメントを表示するように変更しました。

4. postComment()関数では、新しいコメントを追加する際に、
   全コメントを取得→新コメント追加→保存→全コメント表示
   という流れに修正しました。
*/

// コメント投稿
const postComment = () => {
  if (comment.value.trim()) {
    const newComment = { 
      text: comment.value, 
      pageId: props.pageId + 1,
      username: props.username  //
    };
    
    // 全コメントを取得
    let allComments = getAllComments();
    // 新しいコメントを追加
    allComments.push(newComment);
    // 全コメントを保存
    localStorage.setItem('all_comments', JSON.stringify(allComments));
    
    // 全てのコメントを更新
    loadComments();
    
    // コメント入力欄をリセット
    comment.value = '';
    // テキストエリアの高さをリセット
    adjustHeight();
  }
};

// 全コメントを取得する関数
const getAllComments = () => {
  const storedComments = localStorage.getItem('all_comments');
  return storedComments ? JSON.parse(storedComments) : [];
};

// コメントデータを読み込む共通関数
const loadComments = () => {
  const allComments = getAllComments();
  // 全てのコメントを表示
  currentComments.value = allComments;
};

// ページ遷移時に全てのコメントデータを読み込む
onMounted(() => {
  loadComments();
});

// ページ変更時にコメントデータを更新
watch(() => props.pageId, () => {
  loadComments();
});

// テキストエリアの高さを自動調整
const adjustHeight = () => {
  const textarea = document.querySelector('.comment-input');
  if (textarea) {  // null チェックを追加
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
  text-align: left;
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
}

.comment-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  resize: none;
  overflow-y: hidden;
  box-sizing: border-box;
}

.comment-button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.comment-button:hover {
  background-color: #0056b3;
}

.comment-list {
  max-height: 40vh;
  overflow-y: auto;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.comment-list p {
  font-weight: bold;
  margin-bottom: 10px;
}

.comment {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.comment p {
  margin: 0;
  line-height: 1.5;
}
</style>
