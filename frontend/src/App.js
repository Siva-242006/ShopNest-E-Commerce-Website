import {Routes, Route} from 'react-router-dom';
import Home from "./components/home/home";
import ProductsPage from "./components/products/products";
import ProductsItem from "./components/productsItem/ProductsItem";
import CartPage from "./components/cart/cart";
import CheckoutPage from "./components/checkoutPage/checkoutPage";
import Login from "./components/login/index"
import Signup from "./components/signup/index"
import AddOrUpdateProductForm from "./components/addOrUpdateProduct/addOrUpdateProduct"
import OrdersPage from "./components/ordersPage/ordersPage";
import ProfilePage from './components/profilePage/profilePage';
import Logs from './components/logsPage/logsPage';
import './App.css';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/products" element={<ProductsPage/>} />
            <Route path="/products/:id" element={<ProductsItem/>} />
            <Route path="/admin/products/add" element={<AddOrUpdateProductForm />} />
            <Route path="/admin/products/update/:id" element={<AddOrUpdateProductForm />} />
            <Route path="/profile" element={<ProfilePage />} /> 
            <Route path="/cart" element={<CartPage/>} />
            <Route path="/checkout" element={<CheckoutPage/>} />
            <Route path="/orders" element={<OrdersPage/>} />
            <Route path="/logs" element={<Logs />} />
            <Route path="*" element={<h1>Page Not Found</h1>} />
        </Routes>
    );
}


export default App;