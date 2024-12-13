<template>
  <div class="comment-section">
    <div class="input-container">
      <textarea
        v-model="comment"
        placeholder="この漫画どう？"
        class="comment-input"
        rows="1"
        @input="adjustHeight"
      ></textarea>
    </div>
    <button @click="postComment" class="comment-button">Post</button>

    <div class="comment-list">
      <p class="comment-count">{{ currentComments.length }}件のコメント</p>
      <div v-for="(c, index) in currentComments" :key="c.id || index" class="comment">
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-username">{{ c.username }}</span>
            <span class="comment-userid">{{ c.userid }}</span>
            <!-- タイムスタンプをTwitter風にユーザーIDの後ろに表示 -->
            <span class="comment-timestamp">・{{ formatTimestamp(c.timestamp) }}</span>
          </div>
          <div class="comment-text">
            {{ c.text }}
          </div>
          <div class="comment-actions">
            <span class="reply-link" @click="toggleReplyForm(index)">返信</span>
          </div>

          <div v-if="c.showReplyForm" class="reply-form">
            <textarea
              v-model="c.replyText"
              placeholder="返信を入力..."
              class="reply-input"
              rows="1"
              @input="adjustReplyHeight"
            ></textarea>
            <button @click="postReply(index)" class="reply-submit">Post</button>
          </div>

          <div v-if="c.replies && c.replies.length > 0" class="replies">
            <div v-for="(reply, replyIndex) in c.replies" :key="replyIndex" class="reply">
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-username">{{ reply.username }}</span>
                  <span class="reply-userid">{{ reply.userid }}</span>
                  <!-- 返信にもタイムスタンプを表示 -->
                  <span class="reply-timestamp">・{{ formatTimestamp(reply.timestamp) }}</span>
                </div>
                <div class="reply-text">{{ reply.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from "axios";

const props = defineProps({
  username: {
    type: String,
    default: '匿名ユーザー'
  }
});

const comment = ref('');
const currentComments = ref([]);
const baseURL = 'https://ibera.cps.akita-pu.ac.jp';

// 日時フォーマット関数（日本時間）
const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo'  // 日本時間に設定
  };
  return new Intl.DateTimeFormat('ja-JP', options).format(date).replace(/\//g, '/').replace(',', '');
};

const postComment = async () => {
  if (comment.value.trim()) {
    try {
      const payload = {
        page: 1,  // 必要に応じて変更
        user: props.username, 
        user_comment: comment.value
      };
      const response = await axios.post(`${baseURL}/comments`, payload);
      
      comment.value = '';
      adjustHeight();

      const newComment = {
        ...response.data.comment,
        showReplyForm: false,
        replyText: ''
      };
      // 最新コメントを上に表示
      currentComments.value.unshift(newComment);
    } catch (error) {
      console.error('コメント投稿エラー:', error);
      alert('コメントの投稿に失敗しました。もう一度お試しください。');
    }
  }
};

const loadComments = async () => {
  try {
    const response = await axios.get(`${baseURL}/comments`);
    currentComments.value = response.data
      .map(c => ({
        ...c,
        showReplyForm: false,
        replyText: ''
      }))
      .reverse();  // 最新を上に表示
  } catch (error) {
    console.error('コメント取得エラー:', error);
    alert('コメントの取得に失敗しました。');
  }
};

onMounted(() => {
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
  const targetComment = currentComments.value[commentIndex];
  if (targetComment.replyText.trim()) {
    try {
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
      const response = await axios.post(`${baseURL}/replies`, payload);

      targetComment.showReplyForm = false;
      targetComment.replyText = '';
      // 新しい返信をコメント内に追加
      const updatedComment = response.data.comment;
      // 更新されたコメントを取得
      const updatedIndex = currentComments.value.findIndex(c => c.id === updatedComment.id);
      if (updatedIndex !== -1) {
        currentComments.value.splice(updatedIndex, 1, updatedComment);
      }
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
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  font-family: "Helvetica Neue", Arial, sans-serif;
  color: #0f1419;
}

.input-container {
  margin-bottom: 10px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
  resize: none;
  overflow-y: hidden;
  font-family: inherit;
  outline: none;
}

.comment-input::placeholder {
  color: #657786;
}

.comment-button {
  padding: 8px 16px;
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 20px;
}
.comment-button:hover {
  background: #1480ba;
}

.comment-list {
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.comment-list p {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 15px;
}

.comment {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment:last-child {
  border-bottom: none;
}

.comment-content {
  margin-left: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #657786;
  margin-bottom: 5px;
}

.comment-username {
  font-weight: bold;
  color: #0f1419;
  margin-right: 5px;
}

.comment-userid {
  margin-right: 5px;
}

.comment-timestamp {
  margin-left: 5px;
  color: #657786;
  font-size: 13px;
}

.comment-text {
  font-size: 16px;
  color: #0f1419;
  margin-bottom: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  font-size: 14px;
  color: #657786;
}

.reply-link {
  cursor: pointer;
  color: #657786;
}
.reply-link:hover {
  text-decoration: underline;
}

.reply-form {
  margin-top: 10px;
}

.reply-input {
  width: 100%;
  padding: 8px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-family: inherit;
  resize: none;
  outline: none;
  font-size: 14px;
  margin-bottom: 5px;
}

.reply-input::placeholder {
  color: #657786;
}

.reply-submit {
  padding: 5px 10px;
  background: #1DA1F2;
  color: #fff;
  border: none;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}
.reply-submit:hover {
  background: #1480ba;
}

.replies {
  margin-top: 10px;
  border-left: 2px solid #e6ecf0;
  padding-left: 10px;
}

.reply {
  margin-bottom: 10px;
}

.reply-content {
  font-size: 14px;
  color: #0f1419;
}

.reply-header {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #657786;
  margin-bottom: 3px;
}

.reply-username {
  font-weight: bold;
  color: #0f1419;
  margin-right: 5px;
}

.reply-userid {
  color: #657786;
  margin-right: 5px;
}

.reply-timestamp {
  margin-left: 5px;
  color: #657786;
  font-size: 12px;
}

.reply-text {
  font-size: 14px;
  color: #0f1419;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
