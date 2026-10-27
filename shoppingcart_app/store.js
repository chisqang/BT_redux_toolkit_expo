import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cartReducer, { CART_KEY } from './cartSlice';
import productsReducer from './productsSlice';

const store = configureStore({
  reducer: { cart: cartReducer, products: productsReducer },
});

// Lưu vào AsyncStorage mỗi khi items thay đổi (đặt ngoài reducer để reducer luôn "thuần")
let prevItems = store.getState().cart.items;
store.subscribe(() => {
  const { items, hydrated } = store.getState().cart;
  if (hydrated && items !== prevItems) {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
  }
  prevItems = items;
});

export default store;