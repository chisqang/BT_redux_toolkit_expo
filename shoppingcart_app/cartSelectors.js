import { createSelector } from '@reduxjs/toolkit';

export const DISCOUNT_RATES = { SUMMER10: 0.1, SPECIAL20: 0.2 };

export const selectCartItems = (s) => s.cart.items;
export const selectDiscountCode = (s) => s.cart.discountCode;
export const selectTaxRate = (s) => s.cart.taxRate;
export const selectShipping = (s) => s.cart.shippingCost;

// createSelector: chỉ tính lại khi input đổi, và trả về object ổn định cho useSelector
export const selectCartSummary = createSelector(
  [selectCartItems, selectDiscountCode, selectTaxRate, selectShipping],
  (items, code, taxRate, shipping) => {
    const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
    const discount = subtotal * (DISCOUNT_RATES[code || ''] || 0);
    const tax = subtotal * taxRate;
    const total = items.length === 0 ? 0 : subtotal - discount + tax + shipping;
    const itemCount = items.reduce((c, i) => c + i.quantity, 0);
    return { subtotal, discount, tax, shipping, total, itemCount };
  }
);
