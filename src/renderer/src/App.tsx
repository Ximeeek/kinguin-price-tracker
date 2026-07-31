import React, { useEffect, useState } from 'react';
import { Product } from '../shared/types';
import { AddProductBar } from './components/AddProductBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BottomNavbar, NavTab } from './components/BottomNavbar';
import { SettingsView } from './components/SettingsView';
import { LanguageSelector } from './components/LanguageSelector';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { ShoppingBag, TrendingUp, Search, RefreshCw, Sparkles } from 'lucide-react';
import './styles/theme.css';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('tracker');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleAddProduct = async (url: string) => {
    const res = await window.api.trackProduct(url);
    if (res.success && res.product) {
      await fetchProducts();
      setSelectedProductId(res.product.id);
    }
    return res;
  };

  const handleRefreshProduct = async (id: string) => {
    await window.api.refreshProduct(id);
    await fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    await window.api.deleteProduct(id);
    if (selectedProductId === id) setSelectedProductId(null);
    await fetchProducts();
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery)
  );

  return (
    <div className="app-container">
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
              onClick={fetchProducts}
              className="nav-item-btn"
              style={{ width: 36, height: 36 }}
              title={t('header.refreshListTooltip')}
            >
              <RefreshCw size={16} />
            </button>

            <LanguageSelector />
          </div>
        </div>

        {activeTab === 'tracker' && (
          <>
            {/* Prominent Track Product Input Bar */}
            <div style={{ marginBottom: 28 }}>
              <AddProductBar onAddProduct={handleAddProduct} />
            </div>

            {/* List Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('productList.trackedCount', { count: filteredProducts.length })}
              </h3>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                {t('productList.loading')}
              </div>
            ) : filteredProducts.length === 0 ? (
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
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProductId(p.id)}
                    onRefresh={handleRefreshProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
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
                    onSelect={(p) => setSelectedProductId(p.id)}
                    onRefresh={handleRefreshProduct}
                    onDelete={handleDeleteProduct}
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

      {/* Floating Bottom Glass Navigation Bar */}
      <BottomNavbar activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};
