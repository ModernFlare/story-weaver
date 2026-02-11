// Simple global store for cart state
import { useState, useEffect } from 'react';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  description: string;
  origin: string;
  weight: string;
  rating: number;
  promoThreshold?: number; // e.g. buy 3+ get 20% off
  promoDiscount?: number;  // percentage
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Mock product data
export const products: Product[] = [
  { id: 1, name: "Йогурт Греческий", category: "Молочные", price: 89, oldPrice: 119, image: "🥛", badge: "-25%", description: "Натуральный греческий йогурт без добавок", origin: "Россия", weight: "200 г", rating: 4.8, promoThreshold: 3, promoDiscount: 20 },
  { id: 2, name: "Авокадо Хасс", category: "Овощи и фрукты", price: 149, image: "🥑", description: "Спелый авокадо сорта Хасс, готов к употреблению", origin: "Мексика", weight: "180 г", rating: 4.5 },
  { id: 3, name: "Хлеб Бородинский", category: "Хлеб", price: 65, image: "🍞", description: "Классический бородинский хлеб на заварке", origin: "Россия", weight: "400 г", rating: 4.9 },
  { id: 4, name: "Сыр Маасдам", category: "Молочные", price: 320, oldPrice: 399, image: "🧀", badge: "2 по цене 1", description: "Полутвёрдый сыр с ореховым вкусом", origin: "Нидерланды", weight: "300 г", rating: 4.7, promoThreshold: 2, promoDiscount: 50 },
  { id: 5, name: "Бананы", category: "Овощи и фрукты", price: 79, image: "🍌", description: "Свежие бананы высшей категории", origin: "Эквадор", weight: "1 кг", rating: 4.6 },
  { id: 6, name: "Филе куриное", category: "Мясо", price: 289, image: "🍗", description: "Охлаждённое куриное филе без кости", origin: "Россия", weight: "500 г", rating: 4.4 },
  { id: 7, name: "Молоко 3.2%", category: "Молочные", price: 95, oldPrice: 110, image: "🥛", badge: "-15%", description: "Пастеризованное молоко 3.2% жирности", origin: "Россия", weight: "1 л", rating: 4.8 },
  { id: 8, name: "Помидоры Черри", category: "Овощи и фрукты", price: 199, image: "🍅", description: "Сладкие помидоры черри на ветке", origin: "Россия", weight: "250 г", rating: 4.3, promoThreshold: 3, promoDiscount: 15 },
  { id: 9, name: "Макароны Барилла", category: "Бакалея", price: 159, image: "🍝", description: "Спагетти из твёрдых сортов пшеницы", origin: "Италия", weight: "500 г", rating: 4.7 },
  { id: 10, name: "Сок Апельсиновый", category: "Напитки", price: 129, oldPrice: 159, image: "🧃", badge: "-20%", description: "100% натуральный апельсиновый сок прямого отжима", origin: "Россия", weight: "1 л", rating: 4.5 },
  { id: 11, name: "Масло сливочное", category: "Молочные", price: 189, image: "🧈", description: "Сливочное масло 82.5% жирности", origin: "Россия", weight: "180 г", rating: 4.9 },
  { id: 12, name: "Рис Басмати", category: "Бакалея", price: 199, image: "🍚", description: "Ароматный рис басмати длиннозёрный", origin: "Индия", weight: "900 г", rating: 4.6 },
];

export const categories = ["Все", "Молочные", "Овощи и фрукты", "Хлеб", "Мясо", "Бакалея", "Напитки"];

// Simple event-based cart
let cartItems: CartItem[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(l => l());
}

export function useCart() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  const addToCart = (product: Product) => {
    const existing = cartItems.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({ product, quantity: 1 });
    }
    notify();
  };

  const removeFromCart = (productId: number) => {
    cartItems = cartItems.filter(i => i.product.id !== productId);
    notify();
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cartItems.find(i => i.product.id === productId);
    if (item) item.quantity = qty;
    notify();
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => {
      const discount = item.product.promoThreshold && item.quantity >= item.product.promoThreshold
        ? item.product.promoDiscount! / 100 : 0;
      return sum + item.product.price * item.quantity * (1 - discount);
    }, 0);
  };

  const getOriginalTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getTotalItems = () => cartItems.reduce((s, i) => s + i.quantity, 0);

  return { items: [...cartItems], addToCart, removeFromCart, updateQuantity, getTotal, getOriginalTotal, getTotalItems };
}
