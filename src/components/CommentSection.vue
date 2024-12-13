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
      <div v-for="(c, index) in currentComments" :key="index" class="comment">
        <p>{{ c.username }}:{{ c.text }} - ページ {{ c.pageId }}</p>
        <div class="reply-section">
          <button 
            @click="toggleReplyForm(index)" 
            class="reply-button"
          >
            返信する
          </button>
          <div v-if="c.showReplyForm" class="reply-form">
            <textarea
              v-model="c.replyText"
              placeholder="返信を入力..."
              class="reply-input"
              rows="1"
              @input="adjustReplyHeight"
            ></textarea>
            <button @click="postReply(index)" class="reply-submit">送信</button>
          </div>
          <div v-if="c.replies && c.replies.length > 0" class="replies">
            <div v-for="(reply, replyIndex) in c.replies" 
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

const props = defineProps({
  pageId: Number,
  comments: {
    type: Array,
    default: () => []
  },
  username: {
    type: String,
    default: '匿名ユーザー'
  }
});

const comment = ref('');
const currentComments = ref([]);

// バックエンドのベースURL（適宜変更）
const baseURL = 'https://ibera.cps.akita-pu.ac.jp';

// コメント投稿
const postComment = async () => {
  if (comment.value.trim()) {
    try {
      // バックエンドへコメント投稿
      const payload = {
        page: props.pageId, 
        user: props.username, 
        user_comment: comment.value
      };
      await axios.post(`${baseURL}/comments`, payload);
      
      // コメント入力欄をクリア
      comment.value = '';
      adjustHeight();

      // 再読込
      loadComments();
    } catch (error) {
      console.error('コメント投稿エラー:', error);
      alert('コメントの投稿に失敗しました。もう一度お試しください。');
    }
  }
};

// コメントデータをバックエンドから取得
const loadComments = async () => {
  try {
    const response = await axios.get(`${baseURL}/comments?page=${props.pageId}`);
    currentComments.value = response.data.map(c => ({
      ...c,
      showReplyForm: c.showReplyForm ?? false,
      replyText: c.replyText ?? ''
    }));
  } catch (error) {
    console.error('コメント取得エラー:', error);
    alert('コメントの取得に失敗しました。');
  }
};

// ページマウント時にコメントを読み込む
onMounted(() => {
  loadComments();
});

// ページIDが変わったら再読み込み
watch(() => props.pageId, () => {
  loadComments();
});

// テキストエリアの高さ自動調整
const adjustHeight = () => {
  const textarea = document.querySelector('.comment-input');
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};

// 返信フォーム表示切り替え
const toggleReplyForm = (index) => {
  currentComments.value[index].showReplyForm = !currentComments.value[index].showReplyForm;
};

// 返信投稿
const postReply = async (commentIndex) => {
  console.log('postReply開始');
  const targetComment = currentComments.value[commentIndex];
  if (targetComment.replyText.trim()) {
    try {
      // 返信対象コメントIDを特定する必要があります。
      // ここではバックエンド側でコメントIDも返すようにするか、現在の実装でIDがないならバックエンドにIDを含めるよう修正が必要。
      // 現在のバックエンド例ではコメントIDを返していないため、返すようにバックエンドを修正することを推奨します。
      // ここでは、フロントで保持しているコメント配列に"id"を格納していると仮定:
      // 例: backendから返す時に comment に id フィールドも付与するようにしておく
      if (!targetComment.id) {
        console.error("コメントIDが不明なため返信を投稿できません。");
        alert("コメントIDが不明です。バックエンドでIDを返すようにしてください。");
        return;
      }

      const payload = {
        comment_id: targetComment.id,
        reply_user: props.username,
        reply_user_comment: targetComment.replyText
      };
      await axios.post(`${baseURL}/replies`, payload);

      // 成功したら返信フォームを閉じてコメント再読込
      targetComment.showReplyForm = false;
      targetComment.replyText = '';
      loadComments();

    } catch (error) {
      console.error('返信投稿エラー:', error);
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
