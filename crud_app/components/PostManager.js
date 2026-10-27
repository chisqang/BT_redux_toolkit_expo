import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPosts,
  addPost,
  updatePost,
  deletePost,
  selectPosts,
  selectPostsStatus,
  selectPostsError,
  selectDeletingId,
} from '../postsSlice';

export default function PostManager() {
  const dispatch = useDispatch();
  const posts = useSelector(selectPosts);
  const status = useSelector(selectPostsStatus);
  const error = useSelector(selectPostsError);
  const deletingId = useSelector(selectDeletingId);

  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchPosts());
  }, [status, dispatch]);

  // CREATE hoặc UPDATE
  const handleSubmit = async () => {
    if (!title.trim()) return;
    setMessage('');
    try {
      if (editingId) {
        await dispatch(
          updatePost({ id: editingId, title, body: '...', userId: 1 })
        ).unwrap();
      } else {
        await dispatch(addPost({ title, body: '...', userId: 1 })).unwrap();
      }
      setTitle('');
      setEditingId(null);
    } catch (err) {
      setMessage('Thao tác thất bại: ' + (err.message || err));
    }
  };

  const handleDelete = async (id) => {
    setMessage('');
    try {
      await dispatch(deletePost(id)).unwrap();
    } catch (err) {
      setMessage('Xóa thất bại: ' + (err.message || err));
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
  };

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (status === 'failed') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Lỗi: {error}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => dispatch(fetchPosts())}>
          <Text style={styles.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Tiêu đề bài viết"
      />
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>{editingId ? 'Cập nhật' : 'Thêm'}</Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity
            style={[styles.btn, styles.gray]}
            onPress={cancelEdit}>
            <Text style={styles.btnText}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!message && <Text style={styles.error}>{message}</Text>}

      <FlatList
        data={posts}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.postTitle}>
              #{item.id} {item.title}
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btnSm, styles.orange]}
                onPress={() => startEdit(item)}>
                <Text style={styles.btnText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnSm,
                  styles.red,
                  deletingId === item.id && { opacity: 0.5 },
                ]}
                disabled={deletingId === item.id}
                onPress={() => handleDelete(item.id)}>
                <Text style={styles.btnText}>
                  {deletingId === item.id ? 'Đang xóa...' : 'Xóa'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: { fontSize: 15, marginBottom: 8 },
  error: { color: 'red', marginBottom: 8 },
  btn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSm: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '600' },
  gray: { backgroundColor: '#6b7280' },
  orange: { backgroundColor: '#f59e0b' },
  red: { backgroundColor: '#dc2626' },
});
