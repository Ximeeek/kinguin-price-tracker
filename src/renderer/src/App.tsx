import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../../shared/types';
import { AddProductBar } from './components/AddProductBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HeroProductDetail } from './components/HeroProductDetail';
import { TitleBar } from './components/TitleBar';
import { BottomNavbar, NavTab } from './components/BottomNavbar';
import { SettingsView, SearchScrollMode } from './components/SettingsView';
import { LanguageSelector } from './components/LanguageSelector';
import { CurrencySelector } from './components/CurrencySelector';
import { NerdInfoModal } from './components/NerdInfoModal';
import { ToastNotification, ToastMessage, FailedProductInfo } from './components/ToastNotification';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { CurrencyProvider } from './currency/CurrencyContext';
import { ShoppingBag, TrendingUp, Search, RefreshCw, Sparkles, Star, X, Info } from 'lucide-react';
import './styles/theme.css';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchScrollMode, setSearchScrollMode] = useState<SearchScrollMode>(() => {
    return (localStorage.getItem('kinguin_search_bar_scroll_mode') as SearchScrollMode) || 'translucent';
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('tracker');
  const [slideDirection, setSlideDirection] = useState<'slide-from-right' | 'slide-from-left'>('slide-from-right');

  const handleSelectTab = (newTab: NavTab) => {
    if (newTab === activeTab) return;
    const tabIndexes: Record<NavTab, number> = { tracker: 0, analytics: 1, settings: 2 };
    const prevIdx = tabIndexes[activeTab];
    const newIdx = tabIndexes[newTab];
    setSlideDirection(newIdx > prevIdx ? 'slide-from-right' : 'slide-from-left');
    setActiveTab(newTab);
  };
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [defaultProductId, setDefaultProductId] = useState<string | null>(() => {
    return localStorage.getItem('kinguin_default_product_id');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [refreshingProductIds, setRefreshingProductIds] = useState<Set<string>>(new Set());
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [isNerdModalOpen, setIsNerdModalOpen] = useState(false);

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

  useEffect(() => {
    const mainEl = mainContentRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
      setIsScrolled(mainEl.scrollTop > 15);
    };

    mainEl.addEventListener('scroll', handleScroll);
    return () => {
      mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleRefreshAll = async () => {
    if (products.length === 0) return;
    setRefreshingAll(true);
    const allIds = new Set(products.map((p) => p.id));
    setRefreshingProductIds(allIds);

    try {
      const results = await Promise.all(
        products.map(async (product) => {
          try {
            const res = await window.api.refreshProduct(product.id);
            return { product, res };
          } catch (err: any) {
            return {
              product,
              res: { success: false, error: err.message || t('toast.refreshError') }
            };
          }
        })
      );

      await fetchProducts();

      const failedProducts: FailedProductInfo[] = results
        .filter((r) => !r.res.success)
        .map((r) => ({
          id: r.product.id,
          title: r.product.title,
          error: r.res.error
        }));

      if (failedProducts.length === 0) {
        setToast({
          id: Date.now().toString(),
          type: 'success',
          text: t('toast.refreshAllSuccess')
        });
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          text: t('toast.refreshSomeFailed').replace('{count}', failedProducts.length.toString()),
          failedProducts
        });
      }
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: t('toast.refreshError')
      });
    } finally {
      setRefreshingAll(false);
      setRefreshingProductIds(new Set());
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
      const res = await window.api.refreshProduct(id);
      await fetchProducts();
      if (!res.success) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          text: res.error || t('toast.refreshError')
        });
      } else {
        setToast({
          id: Date.now().toString(),
          type: 'success',
          text: t('toast.refreshSuccess')
        });
      }
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

  const handleAutoPasted = () => {
    setToast({
      id: Date.now().toString(),
      type: 'success',
      text: t('toast.autoPasted')
    });
  };

  return (
    <div className="app-container">
      <TitleBar />
      <div className="main-content" ref={mainContentRef}>
        {/* Header Bar */}
        <div className="header-bar">
          <div className="app-title">
            <img src="/icon-48x48.png" alt="App Icon" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span>{t('header.title')}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* System Specs Info Button */}
            <button
              type="button"
              onClick={() => setIsNerdModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(6, 182, 212, 0.15))',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                color: 'var(--accent-green)',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.15)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none'
              }}
              className="nerd-info-btn"
              title="System Architecture & App Specs"
            >
              <Info size={18} />
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={refreshingAll}
              className="card-action-btn card-action-refresh"
              style={{ width: 36, height: 36, borderRadius: '50%' }}
              title={t('header.refreshListTooltip')}
            >
              <RefreshCw size={16} className={refreshingAll ? 'spinning' : ''} />
            </button>

            <CurrencySelector />
            <LanguageSelector />
          </div>
        </div>

        {/* Animated Section Content Container */}
        <div key={activeTab} className={`section-view-container ${slideDirection}`}>
          {/* Sticky Search Bar */}
          {(activeTab === 'tracker' || activeTab === 'analytics') && (
            <div className={`sticky-search-container ${isScrolled ? 'is-scrolled' : ''} mode-${searchScrollMode}`}>
              <div className="sticky-search-inner">
                <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sticky-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="sticky-search-clear"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <>
              {/* Prominent Track Product Input Bar */}
              <div style={{ marginBottom: 24 }}>
                <AddProductBar onAddProduct={handleAddProduct} onAutoPasted={handleAutoPasted} />
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
                  {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                      <Search className="empty-state-icon" />
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {t('productList.noSearchResults')}
                      </div>
                    </div>
                  ) : (
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
                  )}
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
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <Search className="empty-state-icon" />
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {t('productList.noSearchResults')}
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              searchScrollMode={searchScrollMode}
              onSearchScrollModeChange={setSearchScrollMode}
              defaultProductId={defaultProductId}
              onUnsetDefaultProduct={handleUnsetDefaultProduct}
            />
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProductId && (
        <ProductDetailModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
      )}

      {/* Nerd Technical Specs Info Modal */}
      {isNerdModalOpen && (
        <NerdInfoModal onClose={() => setIsNerdModalOpen(false)} />
      )}

      {/* Toast Notification Alert */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      {/* Floating Bottom Glass Navigation Bar */}
      <BottomNavbar activeTab={activeTab} onSelectTab={handleSelectTab} />
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
