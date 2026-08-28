import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductCatalog } from './components/ProductCatalog';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AuthModal } from './components/AuthModal';
import { ProductFormModal } from './components/ProductFormModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WhatsAppFAB } from './components/WhatsAppFAB';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';
import { Footer } from './components/Footer';
import { productService } from './services/productService';
import { Product, Order } from './types';

function ShopContent() {
  const { user, role, isAdminUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'orders' | 'profile'>('orders');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.warn('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // The site is ALWAYS in shop mode unless an authenticated admin user is logged in and active in admin mode
  const showAdminConsole = Boolean(user && isAdminUser && role === 'admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFE] text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Install PWA Prompt Banner */}
      <InstallPwaPrompt />
      
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => {
          setProfileInitialTab('profile');
          setIsProfileOpen(true);
        }}
        onOpenOrders={() => {
          setProfileInitialTab('orders');
          setIsProfileOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {showAdminConsole ? (
          /* Role View: Authenticated Admin Management Console */
          <AdminDashboard
            products={products}
            onRefreshProducts={loadProducts}
          />
        ) : (
          /* Role View: Customer Boutique Shop */
          <>
            {/* Hero Carousel */}
            {!searchQuery && (
              <HeroBanner
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Horizontal Category Pill Bar */}
            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              products={products}
            />

            {/* Product Catalog Grid & Filters with Skeleton Loading */}
            <div id="catalog-section">
              <ProductCatalog
                isLoading={loading}
                products={products}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onQuickView={(prod) => setQuickViewProduct(prod)}
                onOpenAddProduct={isAdminUser ? () => setIsAddProductOpen(true) : undefined}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={setSelectedCategory}
        onOpenOrders={() => {
          setProfileInitialTab('orders');
          setIsProfileOpen(true);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Product Detail / Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onInstantCheckout={() => setIsCheckoutOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Streamlined Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={(order) => setCompletedOrder(order)}
      />

      {/* Order Placed Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* User Profile & Order History Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        initialTab={profileInitialTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Admin Quick Add Modal */}
      {isAdminUser && (
        <ProductFormModal
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          onSaved={loadProducts}
        />
      )}

      {/* Persistent WhatsApp Floating Action Button */}
      <WhatsAppFAB />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <CartProvider>
          <ShopContent />
        </CartProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}
