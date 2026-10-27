import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const API = 'https://jsonplaceholder.typicode.com/posts';

// Hàm tiện ích: tự kiểm tra res.ok
const request = async (url, options) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  return res.json();
};
const jsonOptions = (method, data) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// ---------- 4 THUNK ----------
// READ
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  return await request(`${API}?_limit=10`);
});

// CREATE (JSONPlaceholder luôn trả id = 101)
export const addPost = createAsyncThunk('posts/addPost', async (newPost) => {
  return await request(API, jsonOptions('POST', newPost));
});

// UPDATE
export const updatePost = createAsyncThunk('posts/updatePost', async (post) => {
  // API giả chỉ có bài id 1..100. Bài vừa thêm (id 101) không tồn tại thật trên server
  // nên PUT sẽ lỗi 500 -> với bài này ta cập nhật cục bộ cho luồng Redux chạy được.
  if (post.id > 100) return post;
  return await request(`${API}/${post.id}`, jsonOptions('PUT', post));
});

// DELETE: return id để reducer biết xóa phần tử nào
export const deletePost = createAsyncThunk('posts/deletePost', async (id) => {
  await request(`${API}/${id}`, { method: 'DELETE' });
  return id;
});

// ---------- SLICE ----------
const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], status: 'idle', error: null, deletingId: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // READ
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // CREATE: thêm vào đầu mảng
      .addCase(addPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // UPDATE: thay phần tử cùng id
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // DELETE (kèm deletingId để hiện "Đang xóa..." đúng dòng)
      .addCase(deletePost.pending, (state, action) => {
        state.deletingId = action.meta.arg;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.deletingId = null;
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state) => {
        state.deletingId = null;
      });
  },
});

export const selectPosts = (s) => s.posts.items;
export const selectPostsStatus = (s) => s.posts.status;
export const selectPostsError = (s) => s.posts.error;
export const selectDeletingId = (s) => s.posts.deletingId;

export default postsSlice.reducer;
