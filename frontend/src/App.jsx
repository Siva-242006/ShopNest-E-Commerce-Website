import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/home/home';
import Login from './components/login/index';
import Signup from './components/signup/index';
import NotFound from './components/notFound/notFound';
import './App.css';

const ProductsPage = lazy(() => import('./components/products/products'));
const ProductsItem = lazy(
  () => import('./components/productsItem/ProductsItem'),
);
const CartPage = lazy(() => import('./components/cart/cart'));
const CheckoutPage = lazy(
  () => import('./components/checkoutPage/checkoutPage'),
);
const AddOrUpdateProductForm = lazy(
  () => import('./components/addOrUpdateProduct/addOrUpdateProduct'),
);
const OrdersPage = lazy(() => import('./components/ordersPage/ordersPage'));
const ProfilePage = lazy(() => import('./components/profilePage/profilePage'));
const Logs = lazy(() => import('./components/logsPage/logsPage'));

const App = () => {
  return (
    <Suspense fallback={<div role="status">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductsItem />} />
        <Route
          path="/admin/products/add"
          element={<AddOrUpdateProductForm />}
        />
        <Route
          path="/admin/products/update/:id"
          element={<AddOrUpdateProductForm />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
