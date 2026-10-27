import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CART_KEY = 'cartItems';

// Đọc giỏ hàng đã lưu (bất đồng bộ nên dùng thunk)
export const loadCart = createAsyncThunk('cart/loadCart', async () => {
  const saved = await AsyncStorage.getItem(CART_KEY);
  return saved ? JSON.parse(saved) : [];
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    hydrated: false,      // đã đọc xong dữ liệu đã lưu chưa
    discountCode: null,
    taxRate: 0.1,         // 10%
    shippingCost: 10,
  },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) existing.quantity += 1;
      else state.items.push({ ...action.payload, quantity: 1 });
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    applyDiscount: (state, action) => {
      state.discountCode = action.payload; // null = bỏ mã
    },
    setShippingCost: (state, action) => {
      state.shippingCost = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.hydrated = true;
    });
    builder.addCase(loadCart.rejected, (state) => {
      state.hydrated = true; // lỗi đọc thì vẫn cho dùng giỏ trống
    });
  },
});

export const {
  addToCart, increaseQuantity, decreaseQuantity,
  removeFromCart, clearCart, applyDiscount, setShippingCost,
} = cartSlice.actions;

export default cartSlice.reducer;