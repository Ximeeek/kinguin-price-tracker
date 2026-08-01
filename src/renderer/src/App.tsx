import React, { useEffect, useState } from 'react';
import { Product } from '../../shared/types';
import { AddProductBar } from './components/AddProductBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HeroProductDetail } from './components/HeroProductDetail';
import { TitleBar } from './components/TitleBar';
import { BottomNavbar, NavTab } from './components/BottomNavbar';
import { SettingsView } from './components/SettingsView';
import { LanguageSelector } from './components/LanguageSelector';
import { CurrencySelector } from './components/CurrencySelector';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { CurrencyProvider } from './currency/CurrencyContext';
import { ShoppingBag, TrendingUp, Search, RefreshCw, Sparkles, Star } from 'lucide-react';
import './styles/theme.css';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('tracker');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [defaultProductId, setDefaultProductId] = useState<string | null>(() => {
    return localStorage.getItem('kinguin_default_product_id');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [refreshingProductIds, setRefreshingProductIds] = useState<Set<string>>(new Set());
  const [refreshingAll, setRefreshingAll] = useState(false);

  const fetchProducts = async () => {
    try {
      const list = await window.api.getProducts();
      setProducts(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      await fetchProducts();
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: t('toast.refreshSuccess')
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: t('toast.refreshError')
      });
    } finally {
      setRefreshingAll(false);
    }
  };

  const handleSetDefaultProduct = (id: string) => {
    setDefaultProductId(id);
    localStorage.setItem('kinguin_default_product_id', id);
  };

  const handleAddProduct = async (url: string, setAsDefault: boolean) => {
    const res = await window.api.trackProduct(url);
    if (res.success && res.product) {
      await fetchProducts();
      if (setAsDefault) {
        handleSetDefaultProduct(res.product.id);
      }
    }
    return res;
  };

  const handleRefreshProduct = async (id: string) => {
    setRefreshingProductIds((prev) => new Set(prev).add(id));
    try {
      await window.api.refreshProduct(id);
      await fetchProducts();
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: t('toast.refreshSuccess')
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: t('toast.refreshError')
      });
    } finally {
      setRefreshingProductIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await window.api.deleteProduct(id);
    if (selectedProductId === id) setSelectedProductId(null);
    await fetchProducts();
  };

  const handleUnsetDefaultProduct = () => {
    setDefaultProductId('none');
    localStorage.setItem('kinguin_default_product_id', 'none');
  };

  const activeDefaultProduct =
    defaultProductId === 'none'
      ? null
      : products.find((p) => p.id === defaultProductId) || null;

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery)
  );

  return (
    <div className="app-container">
      <TitleBar />
      <div className="main-content">
        {/* Header Bar */}
        <div className="header-bar">
          <div className="app-title">
            <Sparkles color="var(--accent-green)" size={24} />
            <span>{t('header.title')}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                borderRadius: '9999px',
                padding: '6px 14px'
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                  width: 140
                }}
              />
            </div>

            <button
              onClick={handleRefreshAll}
              disabled={refreshingAll}
              className="nav-item-btn"
              style={{ width: 36, height: 36 }}
              title={t('header.refreshListTooltip')}
            >
              <RefreshCw size={16} className={refreshingAll ? 'spinning' : ''} />
            </button>

            <CurrencySelector />
            <LanguageSelector />
          </div>
        </div>

        {activeTab === 'tracker' && (
          <>
            {/* Prominent Track Product Input Bar */}
            <div style={{ marginBottom: 24 }}>
              <AddProductBar onAddProduct={handleAddProduct} />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                {t('productList.loading')}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag className="empty-state-icon" />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {t('productList.emptyTitle')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {t('productList.emptySubtitle')}
                </div>
              </div>
            ) : (
              <>
                {/* Single Default Product Stats View or Placeholder */}
                {activeDefaultProduct ? (
                  <HeroProductDetail
                    productId={activeDefaultProduct.id}
                    onRefresh={handleRefreshProduct}
                    onUnsetDefault={handleUnsetDefaultProduct}
                    isRefreshing={refreshingProductIds.has(activeDefaultProduct.id)}
                  />
                ) : (
                  <div
                    className="glass-card"
                    style={{
                      padding: '32px 24px',
                      marginBottom: 32,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(18, 22, 32, 0.8), rgba(12, 15, 22, 0.9))',
                      border: '1px dashed rgba(245, 158, 11, 0.35)',
                      textAlign: 'center',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--accent-gold)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12
                      }}
                    >
                      <Star size={24} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {t('heroPlaceholder.title')}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
                      {t('heroPlaceholder.subtitle')}
                    </p>
                  </div>
                )}

                {/* All Tracked Products List Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t('productList.trackedCount', { count: filteredProducts.length })}
                  </h3>
                </div>

                {/* Product Grid */}
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isDefault={activeDefaultProduct?.id === product.id}
                      isRefreshing={refreshingProductIds.has(product.id)}
                      onSelect={(p) => setSelectedProductId(p.id)}
                      onRefresh={handleRefreshProduct}
                      onDelete={handleDeleteProduct}
                      onSetDefault={handleSetDefaultProduct}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{t('analytics.title')}</h2>
            {products.length === 0 ? (
              <div className="empty-state">
                <TrendingUp className="empty-state-icon" />
                <div>{t('analytics.emptyText')}</div>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isDefault={activeDefaultProduct?.id === product.id}
                    isRefreshing={refreshingProductIds.has(product.id)}
                    onSelect={(p) => setSelectedProductId(p.id)}
                    onRefresh={handleRefreshProduct}
                    onDelete={handleDeleteProduct}
                    onSetDefault={handleSetDefaultProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && <SettingsView />}
      </div>

      {/* Product Detail Modal */}
      {selectedProductId && (
        <ProductDetailModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
      )}

      {/* Toast Notification Alert */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      {/* Floating Bottom Glass Navigation Bar */}
      <BottomNavbar activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </LanguageProvider>
  );
};
