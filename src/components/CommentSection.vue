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
        <div class="reply-section">
          <button 
            @click="toggleReplyForm(index)" 
            class="reply-button"
          >
            返信する
          </button>
          <div v-if="comment.showReplyForm" class="reply-form">
            <textarea
              v-model="comment.replyText"
              placeholder="返信を入力..."
              class="reply-input"
              rows="1"
              @input="adjustReplyHeight"
            ></textarea>
            <button @click="postReply(index)" class="reply-submit">送信</button>
          </div>
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div v-for="(reply, replyIndex) in comment.replies" 
                 :key="replyIndex" 
                 class="reply">
              <p>↳ {{ reply.username }}: {{ reply.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from "axios";

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

// コメント投稿
const postComment = () => {
  if (comment.value.trim()) {
    const newComment = { 
      text: comment.value, 
      pageId: props.pageId + 1,
      username: props.username,
      replies: [],  // 返信配列を追加
      showReplyForm: false,  // 返信フォームの表示状態
      replyText: ''  // 返信テキスト
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

// コメントデータを読み込む共通関数を更新
const loadComments = () => {
  const allComments = getAllComments();
  // コメントの各フィールドを初期化して表示
  currentComments.value = allComments.map(comment => ({
    ...comment,
    showReplyForm: false,
    replyText: '',
    replies: comment.replies || [] // repliesが未定義の場合は空配列を設定
  }));
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

// 返信フォームの表示切り替え
const toggleReplyForm = (index) => {
  currentComments.value[index].showReplyForm = !currentComments.value[index].showReplyForm;
};

// 返信を投稿
const postReply = async (commentIndex) => {
  console.log('postReply開始');
  const targetComment = currentComments.value[commentIndex];
  if (targetComment.replyText.trim()) {
    const UserComment = {
      text: targetComment.replyText
    };

    try {
      const response = await axios.post('https://ibera.cps.akita-pu.ac.jp/conversion_with_elyza', UserComment);
      console.log('API叩いた');
      console.log('response:', response);

      // APIから返ってきた修正後コメントを格納
      const replyComment = response.data.modified_message;
      console.log('replyComment:', replyComment);

      // 新しい返信オブジェクトを作成
      const newReply = {
        username: props.username,
        text: replyComment,
        timestamp: new Date().toISOString()
      };

      // 全コメントを取得して更新
      const allComments = getAllComments();

      // ここで allComments と currentComments が同じ順番で格納されていることが前提
      // commentIndex が allComments と currentComments で同じであることを確認
      // (本実装ではずれないようにする、コメントの並びに依存しない設計なども考慮が必要ですが、ここでは既存コードを前提とします)
      const originalComment = allComments[commentIndex];

      allComments[commentIndex] = {
        ...originalComment,
        // 既存のreplies配列に新しい返信を追加
        replies: [...(originalComment.replies || []), newReply],
        showReplyForm: false,
        replyText: ''
      };

      // ローカルストレージを更新
      localStorage.setItem('all_comments', JSON.stringify(allComments));

      // コメント一覧を再読み込み
      loadComments();

    } catch (error) {
      console.error('返信の投稿中にエラーが発生しました:', error);
      alert('返信の投稿に失敗しました。もう一度お試しください。');
    }
  }
};





// 返信テキストエリアの高さ調整
const adjustReplyHeight = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
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

.reply-section {
  margin-left: 20px;
  margin-top: 10px;
}

.reply-button {
  font-size: 0.9em;
  padding: 5px 10px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}

.reply-form {
  margin-top: 10px;
}

.reply-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
}

.reply-submit {
  padding: 5px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}
</style>
