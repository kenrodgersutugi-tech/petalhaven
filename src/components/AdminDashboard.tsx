import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  ShoppingBag, 
  Coins, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Truck, 
  CheckCheck, 
  Eye, 
  Sparkles, 
  Layers, 
  Calendar,
  Image as ImageIcon,
  Palette,
  Megaphone,
  Save,
  RotateCcw,
  Sliders,
  Check,
  Store,
  Phone,
  ArrowRight,
  Key
} from 'lucide-react';
import { Product, Order, OrderStatus } from '../types';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { ProductFormModal } from './ProductFormModal';
import { GoogleAuthGuideModal } from './GoogleAuthGuideModal';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings, HeroSlide } from '../context/StoreSettingsContext';
import { formatPrice } from '../utils/formatters';
import { CATEGORIES } from '../data/initialProducts';

interface AdminDashboardProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onRefreshProducts,
}) => {
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } = useStoreSettings();
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'orders' | 'branding'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthGuideOpen, setIsAuthGuideOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [quickStockEditId, setQuickStockEditId] = useState<string | null>(null);
  const [quickStockValue, setQuickStockValue] = useState<number>(0);

  // Branding Form State
  const [brandingForm, setBrandingForm] = useState({
    siteLogoUrl: settings.siteLogoUrl,
    siteName: settings.siteName,
    siteTagline: settings.siteTagline,
    locationText: settings.topBarPromo.locationText,
    supportName: settings.topBarPromo.supportName,
    supportPhoneDisplay: settings.topBarPromo.supportPhoneDisplay,
    supportPhoneRaw: settings.topBarPromo.supportPhoneRaw,
    promoCode: settings.topBarPromo.promoCode,
    promoText: settings.topBarPromo.promoText,
    instagramHandle: settings.topBarPromo.instagramHandle,
    instagramUrl: settings.topBarPromo.instagramUrl,
    topBarEnabled: settings.topBarPromo.enabled,
  });

  const [heroSlidesEdit, setHeroSlidesEdit] = useState<HeroSlide[]>(settings.heroSlides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [brandingSaved, setBrandingSaved] = useState(false);

  // Sync settings when settings change externally
  useEffect(() => {
    setBrandingForm({
      siteLogoUrl: settings.siteLogoUrl,
      siteName: settings.siteName,
      siteTagline: settings.siteTagline,
      locationText: settings.topBarPromo.locationText,
      supportName: settings.topBarPromo.supportName,
      supportPhoneDisplay: settings.topBarPromo.supportPhoneDisplay,
      supportPhoneRaw: settings.topBarPromo.supportPhoneRaw,
      promoCode: settings.topBarPromo.promoCode,
      promoText: settings.topBarPromo.promoText,
      instagramHandle: settings.topBarPromo.instagramHandle,
      instagramUrl: settings.topBarPromo.instagramUrl,
      topBarEnabled: settings.topBarPromo.enabled,
    });
    setHeroSlidesEdit(settings.heroSlides);
  }, [settings]);

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (e) {
      console.warn('Orders fetch error', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    await productService.deleteProduct(id);
    setDeleteConfirmId(null);
    onRefreshProducts();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, newStatus);
    fetchOrders();
  };

  const handleSaveQuickStock = async (productId: string) => {
    await productService.updateProduct(productId, { stock_quantity: quickStockValue });
    setQuickStockEditId(null);
    onRefreshProducts();
  };

  const handleRestockIncrement = async (productId: string, currentStock: number, increment: number) => {
    const newQty = Math.max(0, currentStock + increment);
    await productService.updateProduct(productId, { stock_quantity: newQty });
    onRefreshProducts();
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteLogoUrl: brandingForm.siteLogoUrl,
      siteName: brandingForm.siteName,
      siteTagline: brandingForm.siteTagline,
      topBarPromo: {
        enabled: brandingForm.topBarEnabled,
        locationText: brandingForm.locationText,
        supportName: brandingForm.supportName,
        supportPhoneDisplay: brandingForm.supportPhoneDisplay,
        supportPhoneRaw: brandingForm.supportPhoneRaw,
        promoCode: brandingForm.promoCode,
        promoText: brandingForm.promoText,
        instagramHandle: brandingForm.instagramHandle,
        instagramUrl: brandingForm.instagramUrl,
      },
      heroSlides: heroSlidesEdit,
    });
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 3000);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  const lowStockItems = products.filter(p => p.stock_quantity <= 5);
  const outOfStockItems = products.filter(p => p.stock_quantity <= 0);
  const totalStockCount = products.reduce((sum, p) => sum + p.stock_quantity, 0);

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl mb-5 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-pink-950/60 border border-pink-800/40 text-[#FFB6C1] text-[11px] sm:text-xs font-medium">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E75480]" />
              <span>Store Administrator Portal</span>
            </div>
            {user?.email && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[11px] sm:text-xs font-medium">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span className="truncate max-w-[180px] sm:max-w-none">{user.email}</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-3xl font-semibold text-white mb-1.5 sm:mb-2 tracking-tight font-serif">
            {settings.siteName} Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your boutique inventory, update stock levels, configure site branding, and process customer orders in real time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="admin-auth-guide-btn"
            onClick={() => setIsAuthGuideOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full transition flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-[#E75480]" />
            <span>Google & Admin Setup</span>
          </button>
          <button
            id="admin-add-product-btn"
            onClick={() => { setProductToEdit(null); setIsFormOpen(true); }}
            className="bg-[#E75480] hover:bg-[#D6336C] text-white font-medium text-xs px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-md shadow-pink-950 transition flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Gift Item</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Total Sales</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-2xl font-bold text-slate-900">{formatPrice(totalRevenue)}</p>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 mt-1 font-medium">{orders.length} total orders</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Inventory</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-2xl font-bold text-slate-900">{products.length} Products</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">{totalStockCount} units in stock</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Orders</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-2xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-[10px] sm:text-[11px] text-[#E75480] mt-1 font-medium">{orders.filter(o => o.status === 'processing').length} in prep</p>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Stock Alerts</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-base sm:text-2xl font-bold text-slate-900">{lowStockItems.length + outOfStockItems.length}</p>
          <p className="text-[10px] sm:text-[11px] text-amber-600 mt-1 font-medium">
            {outOfStockItems.length} out • {lowStockItems.length} low
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-5 overflow-x-auto no-scrollbar">
        <div className="flex bg-slate-100 p-1 rounded-full gap-1 shrink-0">
          <button
            id="tab-product-management"
            onClick={() => setActiveTab('products')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-white text-[#E75480] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({products.length})</span>
          </button>

          <button
            id="tab-inventory-management"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-white text-[#E75480] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stock</span>
          </button>

          <button
            id="tab-order-management"
            onClick={() => { setActiveTab('orders'); fetchOrders(); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-[#E75480] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            id="tab-branding-management"
            onClick={() => setActiveTab('branding')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'branding' ? 'bg-white text-[#E75480] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Branding</span>
          </button>
        </div>

        {/* Action helper buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'products' && (
            <button
              onClick={onRefreshProducts}
              className="text-xs font-medium text-slate-600 hover:text-[#E75480] bg-slate-50 hover:bg-pink-50 px-3.5 py-2 rounded-full border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Refresh product list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Catalog</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Product Management (CRUD) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title or category..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#FFB6C1] focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-full px-3 py-2.5 focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                onClick={() => { setProductToEdit(null); setIsFormOpen(true); }}
                className="w-full sm:w-auto bg-[#E75480] hover:bg-[#D6336C] text-white text-xs font-medium px-4 py-2.5 rounded-full transition flex items-center justify-center gap-1.5 shadow-md shadow-pink-100 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Gift</span>
              </button>
            </div>
          </div>

          {/* Table of products */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Gift Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (KES)</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#E75480]" />
                        <p className="font-medium">No gift items found</p>
                        <p className="text-[11px] mt-1">Click "Add New Gift" to add your first boutique arrangement.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Thumbnail & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image_url}
                              alt={prod.title}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="max-w-xs">
                              <p className="font-medium text-slate-900 line-clamp-1">{prod.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{prod.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-pink-50 text-[#E75480] font-medium text-[11px]">
                            {prod.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {formatPrice(prod.price)}
                          {prod.original_price && prod.original_price > prod.price && (
                            <span className="text-[10px] text-slate-400 line-through block">
                              {formatPrice(prod.original_price)}
                            </span>
                          )}
                        </td>

                        {/* Stock & Quick Adjust */}
                        <td className="py-3 px-4">
                          {quickStockEditId === prod.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={quickStockValue}
                                onChange={(e) => setQuickStockValue(Number(e.target.value))}
                                className="w-16 text-xs bg-white border border-pink-300 rounded px-1.5 py-1"
                              />
                              <button
                                onClick={() => handleSaveQuickStock(prod.id)}
                                className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 cursor-pointer"
                                title="Save"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setQuickStockEditId(prod.id);
                                setQuickStockValue(prod.stock_quantity);
                              }}
                              className="group font-medium flex items-center gap-1 text-slate-700 hover:text-[#E75480] cursor-pointer"
                              title="Click to quickly adjust stock"
                            >
                              <span>{prod.stock_quantity} units</span>
                              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#E75480]" />
                            </button>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-4">
                          {prod.stock_quantity <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700">
                              Out of Stock
                            </span>
                          ) : prod.stock_quantity <= 5 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                              Low Stock ({prod.stock_quantity})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setProductToEdit(prod); setIsFormOpen(true); }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#E75480] hover:bg-pink-50 transition cursor-pointer"
                              title="Edit Gift Item"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {deleteConfirmId === prod.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="px-2 py-1 bg-[#E75480] text-white text-[10px] font-medium rounded hover:bg-[#D6336C] cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] rounded hover:bg-slate-300 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(prod.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#E75480] hover:bg-pink-50 transition cursor-pointer"
                                title="Delete Gift"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory & Stock Replenishment */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Quick Stock Replenishment Tool</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add incoming fresh floral shipments or restock luxury gift boxes with one click.
              </p>
            </div>
            <button
              onClick={() => { setProductToEdit(null); setIsFormOpen(true); }}
              className="bg-[#E75480] text-white text-xs font-medium px-4 py-2 rounded-full flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Stock Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:border-pink-200 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-xs truncate">{prod.title}</p>
                    <p className="text-[11px] text-[#E75480] font-medium">{prod.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-800">{formatPrice(prod.price)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.stock_quantity <= 0 ? 'bg-rose-100 text-rose-700' :
                        prod.stock_quantity <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {prod.stock_quantity} in stock
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Stock Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <span className="text-[11px] font-medium text-slate-400">Restock:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRestockIncrement(prod.id, prod.stock_quantity, 1)}
                      className="px-2 py-1 bg-slate-100 hover:bg-pink-100 hover:text-[#E75480] text-slate-700 rounded text-xs font-semibold transition"
                      title="Add 1 unit"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleRestockIncrement(prod.id, prod.stock_quantity, 5)}
                      className="px-2 py-1 bg-slate-100 hover:bg-pink-100 hover:text-[#E75480] text-slate-700 rounded text-xs font-semibold transition"
                      title="Add 5 units"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleRestockIncrement(prod.id, prod.stock_quantity, 10)}
                      className="px-2 py-1 bg-slate-100 hover:bg-pink-100 hover:text-[#E75480] text-slate-700 rounded text-xs font-semibold transition"
                      title="Add 10 units"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleRestockIncrement(prod.id, prod.stock_quantity, 25)}
                      className="px-2.5 py-1 bg-[#E75480] text-white hover:bg-[#D6336C] rounded text-xs font-semibold transition"
                      title="Add 25 units"
                    >
                      +25
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-lg font-serif">Customer Gift Orders</h3>
            <button
              onClick={fetchOrders}
              className="text-xs font-medium text-[#E75480] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-100 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-[#FFB6C1]" />
                <p className="font-semibold text-slate-700">No customer orders placed yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Orders placed by customers in Meru and Kenya will appear here in real time.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-xs text-slate-900">Order #{order.id.slice(0, 8)}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 mt-0.5">
                        {order.customer_name} ({order.customer_email}) • {order.customer_phone}
                      </p>
                    </div>

                    {/* Status badge & selector */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium uppercase ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status}
                      </span>

                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Scheduled Delivery Timing & Working Hours Slot */}
                  {order.delivery_date && (
                    <div className="bg-pink-50/70 p-2.5 rounded-lg border border-pink-100 my-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-bold text-[#E75480]">
                          <Calendar className="w-3.5 h-3.5" />
                          Delivery Date: {order.delivery_date}
                        </span>
                        {order.delivery_time_slot && (
                          <span className="flex items-center gap-1 text-slate-700 bg-white px-2 py-0.5 rounded border border-pink-100 font-medium text-[11px]">
                            <Clock className="w-3 h-3 text-[#E75480]" />
                            {order.delivery_time_slot}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Meru Dispatch: Mwitu Centre
                      </span>
                    </div>
                  )}

                  {/* Destination & Gift Note */}
                  <div className="py-3 text-xs grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100">
                    <div>
                      <span className="font-medium text-slate-500 block">Delivery Address:</span>
                      <p className="text-slate-800 font-medium">
                        {order.shipping_address}, {order.city} {order.postal_code}
                      </p>
                      <span className="text-[11px] text-[#E75480] capitalize">
                        Speed: {order.delivery_type.replace('_', ' ')}
                      </span>
                      {order.delivery_instructions && (
                        <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                          <strong className="text-slate-700">Driver Note:</strong> {order.delivery_instructions}
                        </p>
                      )}
                    </div>

                    {order.gift_message && (
                      <div className="bg-pink-50/50 p-2.5 rounded-lg border border-pink-100">
                        <span className="font-medium text-[#E75480] block text-[11px]">Gift Note to Recipient:</span>
                        <p className="text-slate-700 italic text-[11px] mt-0.5">"{order.gift_message}"</p>
                      </div>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg text-xs">
                          {it.product_image && (
                            <img src={it.product_image} alt="" className="w-5 h-5 rounded object-cover" />
                          )}
                          <span className="font-medium text-slate-700">{it.product_title || 'Gift'}</span>
                          <span className="text-slate-400">×{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 mr-2">Paid via {order.payment_method.toUpperCase()}:</span>
                      <span className="font-bold text-base text-[#E75480]">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Branding & Promotional Data Manager */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="space-y-8 animate-in fade-in duration-200">
          
          {/* Notification Alert when saved */}
          {brandingSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Branding and promotional banners updated live across the entire storefront!</span>
            </div>
          )}

          {/* Section 1: Logo & Store Identity */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E75480] flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Store Identity & Site Logo</h3>
                  <p className="text-xs text-slate-400">Customize your boutique name, tagline, and brand logo</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Site Name / Brand Title</label>
                <input
                  type="text"
                  required
                  value={brandingForm.siteName}
                  onChange={(e) => setBrandingForm({ ...brandingForm, siteName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                  placeholder="e.g. Petals Haven"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Store Tagline</label>
                <input
                  type="text"
                  value={brandingForm.siteTagline}
                  onChange={(e) => setBrandingForm({ ...brandingForm, siteTagline: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                  placeholder="e.g. Luxury Gift Boutique & Florist"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Custom Site Logo Image URL (Optional)</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={brandingForm.siteLogoUrl}
                      onChange={(e) => setBrandingForm({ ...brandingForm, siteLogoUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or cloud image URL (leave empty for monogram emblem)"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                    />
                  </div>

                  {/* Logo Preview */}
                  <div className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                    {brandingForm.siteLogoUrl ? (
                      <img src={brandingForm.siteLogoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E75480] to-[#FFB6C1] text-white font-serif font-bold text-sm flex items-center justify-center">
                        {brandingForm.siteName.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Top Promotional Announcement Bar */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E75480] flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Top Promotional Announcement Bar</h3>
                  <p className="text-xs text-slate-400">Configure the top notification banner, active promo coupons, and WhatsApp hotline</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={brandingForm.topBarEnabled}
                  onChange={(e) => setBrandingForm({ ...brandingForm, topBarEnabled: e.target.checked })}
                  className="rounded text-[#E75480] focus:ring-[#FFB6C1] w-4 h-4"
                />
                <span>Enable Top Announcement Bar</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shop Location Announcement</label>
                <input
                  type="text"
                  value={brandingForm.locationText}
                  onChange={(e) => setBrandingForm({ ...brandingForm, locationText: e.target.value })}
                  placeholder="📍 Meru: Mwitu Centre Building (Below Sayen Hyperstore)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Support Concierge Name</label>
                <input
                  type="text"
                  value={brandingForm.supportName}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportName: e.target.value })}
                  placeholder="e.g. Winnie"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">WhatsApp / Phone Display</label>
                <input
                  type="text"
                  value={brandingForm.supportPhoneDisplay}
                  onChange={(e) => setBrandingForm({ ...brandingForm, supportPhoneDisplay: e.target.value })}
                  placeholder="e.g. +254 729 228 364"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Promotional Discount Coupon Code</label>
                <input
                  type="text"
                  value={brandingForm.promoCode}
                  onChange={(e) => setBrandingForm({ ...brandingForm, promoCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. MERU10"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold focus:outline-none focus:border-[#E75480]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Promo Offer Description</label>
                <input
                  type="text"
                  value={brandingForm.promoText}
                  onChange={(e) => setBrandingForm({ ...brandingForm, promoText: e.target.value })}
                  placeholder="e.g. 10% off your order"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Instagram Handle</label>
                <input
                  type="text"
                  value={brandingForm.instagramHandle}
                  onChange={(e) => setBrandingForm({ ...brandingForm, instagramHandle: e.target.value })}
                  placeholder="@petalhaven_meru"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Instagram Web Profile URL</label>
                <input
                  type="url"
                  value={brandingForm.instagramUrl}
                  onChange={(e) => setBrandingForm({ ...brandingForm, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/petalhaven_meru"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E75480]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Hero Carousel Promotional Slides */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E75480] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Hero Carousel Promotional Slides</h3>
                  <p className="text-xs text-slate-400">Edit headline banners, imagery, and call-to-action buttons displayed on the homepage</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {heroSlidesEdit.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      activeSlideIndex === idx
                        ? 'bg-[#E75480] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Slide {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {heroSlidesEdit[activeSlideIndex] && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Slide Badge Tag</label>
                    <input
                      type="text"
                      value={heroSlidesEdit[activeSlideIndex].badge}
                      onChange={(e) => {
                        const updated = [...heroSlidesEdit];
                        updated[activeSlideIndex].badge = e.target.value;
                        setHeroSlidesEdit(updated);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Corner Highlight Tag</label>
                    <input
                      type="text"
                      value={heroSlidesEdit[activeSlideIndex].tag}
                      onChange={(e) => {
                        const updated = [...heroSlidesEdit];
                        updated[activeSlideIndex].tag = e.target.value;
                        setHeroSlidesEdit(updated);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Main Headline Title</label>
                    <input
                      type="text"
                      value={heroSlidesEdit[activeSlideIndex].title}
                      onChange={(e) => {
                        const updated = [...heroSlidesEdit];
                        updated[activeSlideIndex].title = e.target.value;
                        setHeroSlidesEdit(updated);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-serif font-bold text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Supporting Description</label>
                    <textarea
                      rows={2}
                      value={heroSlidesEdit[activeSlideIndex].subtitle}
                      onChange={(e) => {
                        const updated = [...heroSlidesEdit];
                        updated[activeSlideIndex].subtitle = e.target.value;
                        setHeroSlidesEdit(updated);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={heroSlidesEdit[activeSlideIndex].ctaText}
                      onChange={(e) => {
                        const updated = [...heroSlidesEdit];
                        updated[activeSlideIndex].ctaText = e.target.value;
                        setHeroSlidesEdit(updated);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Category Filter</label>
                    <select
                      value={heroSlidesEdit[activeSlideIndex].category}
                      onChange={(e) => {
                        const updated = [...heroSlidesEdit];
                        updated[activeSlideIndex].category = e.target.value;
                        setHeroSlidesEdit(updated);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Slide Background Image URL</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="url"
                        value={heroSlidesEdit[activeSlideIndex].image}
                        onChange={(e) => {
                          const updated = [...heroSlidesEdit];
                          updated[activeSlideIndex].image = e.target.value;
                          setHeroSlidesEdit(updated);
                        }}
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                      />
                      <img
                        src={heroSlidesEdit[activeSlideIndex].image}
                        alt="Preview"
                        className="w-16 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions Save Bar */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={resetSettings}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Branding to Meru Defaults</span>
            </button>

            <button
              type="submit"
              className="bg-[#E75480] hover:bg-[#D6336C] text-white font-semibold text-xs px-6 py-3 rounded-full shadow-lg shadow-pink-200 transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live Changes</span>
            </button>
          </div>

        </form>
      )}

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setProductToEdit(null); }}
        productToEdit={productToEdit}
        onSaved={onRefreshProducts}
      />

      {/* Google Auth & Admin Setup Guide */}
      <GoogleAuthGuideModal
        isOpen={isAuthGuideOpen}
        onClose={() => setIsAuthGuideOpen(false)}
      />

    </div>
  );
};
