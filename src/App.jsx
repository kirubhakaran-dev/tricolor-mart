import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ToastContainer from './components/common/ToastContainer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrdersPage from './pages/OrdersPage'
import WishlistPage from './pages/WishlistPage'
import ProfilePage from './pages/ProfilePage'
import AddressPage from './pages/AddressPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import ScrollToTop from './components/common/ScrollToTop'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Navbar />
            <main id="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/address" element={<AddressPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
