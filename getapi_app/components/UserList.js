import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, selectUsers, selectUsersStatus, selectUsersError } from '../userSlice';

export default function UserList() {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const status = useSelector(selectUsersStatus);
  const error = useSelector(selectUsersError);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchUsers());
  }, [status, dispatch]);

  if (status === 'loading' && users.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Đang tải...</Text>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Lỗi: {error}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => dispatch(fetchUsers())}>
          <Text style={styles.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(u) => String(u.id)}
      refreshing={status === 'loading'}
      onRefresh={() => dispatch(fetchUsers())}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.email}</Text>
          <Text style={styles.sub}>{item.company?.name}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#666', marginTop: 2 },
  error: { color: 'red', marginBottom: 12 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});