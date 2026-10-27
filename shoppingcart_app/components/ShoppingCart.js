import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../productsSlice';
import {
  loadCart,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  setShippingCost,
} from '../cartSlice';
import {
  DISCOUNT_RATES,
  selectCartItems,
  selectDiscountCode,
  selectShipping,
  selectCartSummary,
} from '../cartSelectors';

const money = (n) => `$${n.toFixed(2)}`;

const SHIPPING_OPTIONS = [
  { label: 'Miễn phí', cost: 0 },
  { label: 'Tiêu chuẩn ($10)', cost: 10 },
  { label: 'Nhanh ($25)', cost: 25 },
];

export default function ShoppingCart() {
  const dispatch = useDispatch();
  const products = useSelector((s) => s.products.items);
  const productsStatus = useSelector((s) => s.products.status);
  const productsError = useSelector((s) => s.products.error);
  const cartItems = useSelector(selectCartItems);
  const discountCode = useSelector(selectDiscountCode);
  const shippingCost = useSelector(selectShipping);
  const summary = useSelector(selectCartSummary);

  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  useEffect(() => {
    if (productsStatus === 'idle') dispatch(fetchProducts());
  }, [dispatch, productsStatus]);

  if (productsStatus === 'loading' || productsStatus === 'idle') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Đang tải...</Text>
      </View>
    );
  }
  if (productsStatus === 'failed') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Lỗi tải dữ liệu: {productsError}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => dispatch(fetchProducts())}>
          <Text style={styles.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Sản phẩm */}
      <Text style={styles.h2}>Sản Phẩm Có Sẵn</Text>
      {products.map((p) => (
        <View key={p.id} style={styles.productCard}>
          <Image
            source={{ uri: p.image }}
            style={styles.thumb}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={styles.bold}>
              {p.name}
            </Text>
            <Text>{money(p.price)}</Text>
            <TouchableOpacity
              style={[styles.btn, { marginTop: 6 }]}
              onPress={() => dispatch(addToCart(p))}>
              <Text style={styles.btnText}>Thêm Vào Giỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Giỏ hàng */}
      <Text style={styles.h2}>Giỏ Hàng ({summary.itemCount} sản phẩm)</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.muted}>Giỏ hàng trống</Text>
      ) : (
        <>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Text numberOfLines={1} style={styles.bold}>
                {item.name}
              </Text>
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch(decreaseQuantity(item.id))}>
                    <Text style={styles.btnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch(increaseQuantity(item.id))}>
                    <Text style={styles.btnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.bold}>
                  {money(item.price * item.quantity)}
                </Text>
                <TouchableOpacity
                  onPress={() => dispatch(removeFromCart(item.id))}>
                  <Text style={styles.link}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={() => dispatch(clearCart())}>
            <Text style={[styles.link, { marginTop: 4 }]}>Xóa tất cả</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Mã giảm giá */}
      <Text style={styles.h2}>Mã Giảm Giá</Text>
      <View style={styles.row}>
        {Object.entries(DISCOUNT_RATES).map(([code, rate]) => (
          <TouchableOpacity
            key={code}
            style={[styles.chip, discountCode === code && styles.chipActive]}
            onPress={() =>
              dispatch(applyDiscount(discountCode === code ? null : code))
            }>
            <Text
              style={discountCode === code ? styles.chipTextActive : undefined}>
              {code} (-{rate * 100}%)
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vận chuyển */}
      <Text style={styles.h2}>Phí Vận Chuyển</Text>
      {SHIPPING_OPTIONS.map((o) => (
        <TouchableOpacity
          key={o.cost}
          style={styles.radioRow}
          onPress={() => dispatch(setShippingCost(o.cost))}>
          <View
            style={[
              styles.radio,
              shippingCost === o.cost && styles.radioActive,
            ]}
          />
          <Text>{o.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Tóm tắt */}
      <View style={styles.summary}>
        <Text style={styles.h2}>Tóm Tắt Đơn Hàng</Text>
        <View style={styles.rowBetween}>
          <Text>Tạm tính:</Text>
          <Text>{money(summary.subtotal)}</Text>
        </View>
        {summary.discount > 0 && (
          <View style={styles.rowBetween}>
            <Text style={{ color: 'green' }}>Giảm giá:</Text>
            <Text style={{ color: 'green' }}>-{money(summary.discount)}</Text>
          </View>
        )}
        <View style={styles.rowBetween}>
          <Text>Thuế (10%):</Text>
          <Text>{money(summary.tax)}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text>Vận chuyển:</Text>
          <Text>{money(summary.shipping)}</Text>
        </View>
        <View style={[styles.rowBetween, styles.totalRow]}>
          <Text style={styles.bold}>Thành Tiền:</Text>
          <Text style={styles.bold}>{money(summary.total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, { marginTop: 12, alignItems: 'center' }]}>
          <Text style={styles.btnText}>Thanh Toán</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: 17, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#888' },
  error: { color: 'red', marginBottom: 12 },
  bold: { fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  thumb: { width: 70, height: 70 },
  cartItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  btn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  qtyBtn: {
    backgroundColor: '#2563eb',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 20, textAlign: 'center' },
  link: { color: '#dc2626', fontWeight: '600' },
  chip: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipTextActive: { color: '#fff' },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  radioActive: { backgroundColor: '#2563eb' },
  summary: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginTop: 6,
    paddingTop: 6,
  },
});
