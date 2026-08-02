import React, { useEffect, useRef, useState } from 'react';
import { Product, RefreshResult } from '../../shared/types';
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
import { StatusIndicator } from './components/StatusIndicator';
import { ToastNotification, ToastMessage, ToastProductInfo } from './components/ToastNotification';
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [defaultProductId, setDefaultProductId] = useState<string | null>(() => {
    return localStorage.getItem('kinguin_default_product_id');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const [refreshingProductIds, setRefreshingProductIds] = useState<Set<string>>(new Set());
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [isNerdModalOpen, setIsNerdModalOpen] = useState(false);

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleSelectProductFromSearch = (product: Product) => {
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    setSelectedProductId(product.id);
  };

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
    if (!loading) {
      setSplashFading(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [loading]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        handleClearSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery]);

  // Prevent clicks anywhere on screen from un-focusing search input unless clicking game statistics or close button
  useEffect(() => {
    if (!searchQuery.trim() || selectedProductId || isNerdModalOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Allow focus shift if user clicks a product card to open stats, or close/clear button, or action button inside card
      const isProductCard = target.closest('.product-item-card');
      const isCardActionBtn = target.closest('.card-action-btn');
      const isCloseBtn = target.closest('.search-overlay-close-btn') || target.closest('.sticky-search-clear');
      const isModal = target.closest('.modal-overlay') || target.closest('.confirm-modal-overlay');

      if (isProductCard || isCardActionBtn || isCloseBtn || isModal) {
        return;
      }

      // Prevent focus stealing for all other clicks
      e.preventDefault();
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        searchInputRef.current.focus({ preventScroll: true });
      }
    };

    window.addEventListener('mousedown', handlePointerDown, true);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown, true);
    };
  }, [searchQuery, selectedProductId, isNerdModalOpen]);

  // Re-focus search input when returning from game statistics modal if text is still present in search bar
  useEffect(() => {
    if (searchQuery.trim().length > 0 && !selectedProductId && !isNerdModalOpen) {
      if (document.activeElement !== searchInputRef.current) {
        searchInputRef.current?.focus({ preventScroll: true });
      }
    }
  }, [selectedProductId, searchQuery, isNerdModalOpen]);

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
            const fallbackRes: RefreshResult = {
              success: false,
              error: err.message || t('toast.refreshError'),
              errorKey: 'toast.refreshError'
            };
            return {
              product,
              res: fallbackRes
            };
          }
        })
      );

      await fetchProducts();

      const succeededProducts: ToastProductInfo[] = results
        .filter((r) => r.res.success)
        .map((r) => ({
          id: r.product.id,
          title: r.product.title
        }));

      const failedProducts: ToastProductInfo[] = results
        .filter((r) => !r.res.success)
        .map((r) => ({
          id: r.product.id,
          title: r.product.title,
          error: r.res.error,
          errorKey: r.res.errorKey,
          errorParams: r.res.errorParams
        }));

      // 1. Success toast handling
      if (succeededProducts.length === 1) {
        addToast({
          type: 'success',
          text: t('toast.refreshSingleSuccess', { title: succeededProducts[0].title }),
          products: succeededProducts
        });
      } else if (succeededProducts.length > 1) {
        addToast({
          type: 'success',
          text: t('toast.refreshMultipleSuccess', { count: succeededProducts.length }),
          products: succeededProducts
        });
      }

      // 2. Error toast handling
      if (failedProducts.length > 0) {
        addToast({
          type: 'error',
          text: t('toast.refreshSomeFailed', { count: failedProducts.length }),
          products: failedProducts
        });
      }
    } catch {
      addToast({
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
    const product = products.find((p) => p.id === id);
    setRefreshingProductIds((prev) => new Set(prev).add(id));
    try {
      const res = await window.api.refreshProduct(id);
      await fetchProducts();
      if (!res.success) {
        const errorText = res.errorKey
          ? t(res.errorKey as any, res.errorParams)
          : res.error || t('toast.refreshError');
        addToast({
          type: 'error',
          text: errorText,
          products: product ? [{ id: product.id, title: product.title, error: errorText }] : undefined
        });
      } else {
        const title = product ? product.title : '';
        addToast({
          type: 'success',
          text: title ? t('toast.refreshSingleSuccess', { title }) : t('toast.refreshSuccess'),
          products: product ? [{ id: product.id, title: product.title }] : undefined
        });
      }
    } catch {
      addToast({
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
    addToast({
      type: 'success',
      text: t('toast.autoPasted')
    });
  };

  return (
    <div className="app-container">
      {showSplash && (
        <div className={`app-loading-screen ${splashFading ? 'fade-out' : ''}`}>
          <div className="app-loading-content">
            <div className="app-loading-logo-wrapper">
              <img src="/icon-48x48.png" alt="App Logo" className="app-loading-logo" />
              <div className="app-loading-glow" />
            </div>
            <div className="app-loading-title">Kinguin Price Tracker</div>
            <div className="app-loading-dots-container">
              <span className="app-loading-text">Loading</span>
              <span className="app-loading-dots">
                <span className="dot dot-1">.</span>
                <span className="dot dot-2">.</span>
                <span className="dot dot-3">.</span>
              </span>
            </div>
          </div>
        </div>
      )}
      <TitleBar />
      <div className="main-content" ref={mainContentRef}>
        {/* Header Bar */}
        <div className="header-bar">
          <div className="app-title">
            <img src="/icon-48x48.png" alt="App Icon" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span>{t('header.title')}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Minimalist Internet & DB Connection Status Indicator */}
            <StatusIndicator onOpenNerdModal={() => setIsNerdModalOpen(true)} />

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
              title={t('tooltip.systemSpecs')}
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
          {/* Sticky Search Bar Container */}
          {(activeTab === 'tracker' || activeTab === 'analytics') && (
            <div className={`sticky-search-container ${isScrolled ? 'is-scrolled' : ''} mode-${searchScrollMode} ${searchQuery.trim() ? 'has-active-query' : ''}`}>
              <div className="sticky-search-inner">
                <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sticky-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="sticky-search-clear"
                    title={t('tooltip.clearSearch')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Search Overlay attached to sticky search bar (on tracker tab) */}
              {activeTab === 'tracker' && searchQuery.trim().length > 0 && (
                <div className="search-results-overlay">
                  <div className="search-overlay-header">
                    <div className="search-overlay-title-group">
                      <Search size={18} color="var(--accent-green)" />
                      <span className="search-overlay-title">
                        {t('searchOverlay.title', { count: filteredProducts.length })}
                      </span>
                      <span className="search-overlay-query-badge">
                        "{searchQuery.trim()}"
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="search-overlay-close-btn"
                      title={t('searchOverlay.close')}
                    >
                      <X size={14} />
                      <span>{t('searchOverlay.close')}</span>
                    </button>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="search-overlay-empty">
                      <Search className="empty-state-icon" style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.4 }} />
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                        {t('productList.noSearchResults')}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {t('searchOverlay.noResults', { query: searchQuery.trim() })}
                      </div>
                    </div>
                  ) : (
                    <div className="search-overlay-scroll-container">
                      <div className="product-grid">
                        {filteredProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isDefault={activeDefaultProduct?.id === product.id}
                            isRefreshing={refreshingProductIds.has(product.id)}
                            onSelect={handleSelectProductFromSearch}
                            onRefresh={handleRefreshProduct}
                            onDelete={handleDeleteProduct}
                            onSetDefault={handleSetDefaultProduct}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tracker' && (
            <div>

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
                      {t('productList.trackedCount', { count: products.length })}
                    </h3>
                  </div>

                  {/* Product Grid */}
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
                </>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
                {t('analytics.title')}
                {searchQuery.trim() && (
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                    {` | ${searchQuery.trim()}`}
                  </span>
                )}
              </h2>
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

      {/* Toast Notification Alert Stack */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

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
