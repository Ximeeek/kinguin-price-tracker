export const translations = {
  en: {
    // Header
    'header.title': 'Kinguin Tracker',
    'header.searchPlaceholder': 'Search list...',
    'header.refreshListTooltip': 'Refresh list',

    // Add Product Bar
    'addProduct.placeholder': 'Paste Kinguin product URL (e.g. https://www.kinguin.net/category/123456/...)',
    'addProduct.pasteBtn': 'Paste',
    'addProduct.fetchingBtn': 'Fetching...',
    'addProduct.trackBtn': 'Track product',
    'addProduct.setAsDefault': 'Set as default product',
    'addProduct.defaultError': 'Failed to add product.',
    'addProduct.genericError': 'An error occurred while adding the product.',

    // Product List & Grid
    'productList.trackedCount': 'Tracked products ({count})',
    'productList.loading': 'Loading tracked products...',
    'productList.emptyTitle': 'No tracked games',
    'productList.emptySubtitle': 'Paste a Kinguin deal URL in the field above to start tracking its price history.',
    'productList.neverChecked': 'Never checked',
    'productList.refreshTooltip': 'Refresh price',
    'productList.deleteTooltip': 'Delete tracking',
    'productList.setDefaultTooltip': 'Set as default product',
    'productList.isDefaultBadge': 'Default',
    'productList.deleteConfirm': 'Are you sure you want to delete "{title}"?',

    // Navigation Tabs
    'nav.tracker': 'Tracked Products',
    'nav.analytics': 'Analytics & Statistics',
    'nav.settings': 'App Settings',

    // Modal Details & Delete Modal
    'modal.loading': 'Loading price analysis...',
    'modal.firstTracked': 'First tracked: {date}',
    'modal.visitStore': 'Kinguin.net',
    'modal.currentPrice': 'Current price',
    'modal.averagePrice': 'Average price in period',
    'modal.relationToAverage': 'Relation to average',
    'modal.chartTitle': 'Price history chart',
    'modal.trendTitle': 'Trend & stability analysis (last 14 days)',
    'modal.linearDrift': 'Linear drift',
    'modal.volatilityRange': 'Volatility range',
    'modal.noChartData': 'No price history to display',
    'modal.averageLineLabel': 'Average: {amount}',
    'deleteModal.title': 'Delete Tracking?',
    'deleteModal.confirmText': 'Are you sure you want to stop tracking "{title}"? Historical price data will be removed.',
    'deleteModal.cancel': 'Cancel',
    'deleteModal.delete': 'Delete',

    // Toast Notifications
    'toast.refreshSuccess': 'Price updated successfully',
    'toast.refreshError': 'Failed to update price',

    // Analytics View
    'analytics.title': 'Statistical Overview',
    'analytics.emptyText': 'Add products to your tracking list first to see statistical summaries.',

    // Settings View
    'settings.title': 'Settings & System Status',
    'settings.sqliteTitle': 'Phase 1 Mode — Local Database (SQLite)',
    'settings.sqliteDesc': 'Application runs natively without external backend. All data is stored locally on device.',
    'settings.ttlTitle': 'Price Refresh Interval (TTL)',
    'settings.ttlDesc': 'Default price refresh interval is 6 hours (with a 30-minute minimum throttle per product).',
    'settings.repoTitle': 'Repository Abstraction (PriceRepository)',
    'settings.repoDesc': 'Architecturally prepared for seamless integration with a synchronized Node.js + Postgres backend (Phase 2).',

    // Period selector
    'period.week': 'Weekly',
    'period.month': 'Monthly',
    'period.six_months': '6 Months',
    'period.year': 'Yearly',

    // Trend badges & descriptions
    'trend.Stable': 'Stable',
    'trend.Fluctuating': 'Fluctuating',
    'trend.Steady increase': 'Steady increase',
    'trend.Increasing (volatile)': 'Increasing (volatile)',
    'trend.Steady decrease': 'Steady decrease',
    'trend.Decreasing (volatile)': 'Decreasing (volatile)',
    'trend.Not enough data yet': 'Not enough data yet',

    // Languages
    'lang.en': 'EN',
    'lang.pl': 'PL'
  },
  pl: {
    // Header
    'header.title': 'Kinguin Tracker',
    'header.searchPlaceholder': 'Szukaj na liście...',
    'header.refreshListTooltip': 'Odśwież listę',

    // Add Product Bar
    'addProduct.placeholder': 'Wklej link do produktu Kinguin (np. https://www.kinguin.net/category/123456/...)',
    'addProduct.pasteBtn': 'Wklej',
    'addProduct.fetchingBtn': 'Pobieranie...',
    'addProduct.trackBtn': 'Śledź produkt',
    'addProduct.setAsDefault': 'Ustaw jako domyślny produkt',
    'addProduct.defaultError': 'Nie udało się dodać produktu.',
    'addProduct.genericError': 'Wystąpił błąd podczas dodawania.',

    // Product List & Grid
    'productList.trackedCount': 'Śledzone produkty ({count})',
    'productList.loading': 'Wczytywanie śledzonych produktów...',
    'productList.emptyTitle': 'Brak śledzonych gier',
    'productList.emptySubtitle': 'Wklej link do oferty z Kinguin w polu powyżej, aby zacząć śledzić jej historię cen.',
    'productList.neverChecked': 'Nie sprawdzano',
    'productList.refreshTooltip': 'Odśwież cenę',
    'productList.deleteTooltip': 'Usuń śledzenie',
    'productList.setDefaultTooltip': 'Ustaw jako domyślny produkt',
    'productList.isDefaultBadge': 'Domyślny',
    'productList.deleteConfirm': 'Czy na pewno chcesz usunąć "{title}"?',

    // Navigation Tabs
    'nav.tracker': 'Śledzenie produktów',
    'nav.analytics': 'Statystyki i analizy',
    'nav.settings': 'Ustawienia aplikacji',

    // Modal Details & Delete Modal
    'modal.loading': 'Ładowanie analizy cenowej...',
    'modal.firstTracked': 'Pierwsza rejestracja: {date}',
    'modal.visitStore': 'Kinguin.net',
    'modal.currentPrice': 'Obecna cena',
    'modal.averagePrice': 'Średnia cena w wybranym okresie',
    'modal.relationToAverage': 'Stosunek do średniej',
    'modal.chartTitle': 'Wykres historii cen',
    'modal.trendTitle': 'Analiza trendu i stabilności (ostatnie 14 dni)',
    'modal.linearDrift': 'Dryf liniowy',
    'modal.volatilityRange': 'Zmienność (zakres)',
    'modal.noChartData': 'Brak historii cen do wyświetlenia',
    'modal.averageLineLabel': 'Średnia: {amount}',
    'deleteModal.title': 'Usunąć śledzenie?',
    'deleteModal.confirmText': 'Czy na pewno chcesz przestać śledzić "{title}"? Historia cen tego produktu zostanie usunięta.',
    'deleteModal.cancel': 'Anuluj',
    'deleteModal.delete': 'Usuń',

    // Toast Notifications
    'toast.refreshSuccess': 'Cena została pomyślnie zaktualizowana',
    'toast.refreshError': 'Nie udało się zaktualizować ceny',

    // Analytics View
    'analytics.title': 'Przegląd statystyczny',
    'analytics.emptyText': 'Dodaj najpierw produkty do listy śledzenia, aby zobaczyć podsumowanie statystyczne.',

    // Settings View
    'settings.title': 'Ustawienia i stan systemu',
    'settings.sqliteTitle': 'Tryb Fazy 1 — Lokalna baza danych (SQLite)',
    'settings.sqliteDesc': 'Aplikacja działa w trybie rodzimym bez zewnętrznego backendu. Wszystkie dane są przechowywane lokalnie na urządzeniu.',
    'settings.ttlTitle': 'Częstotliwość sprawdzania cen (TTL)',
    'settings.ttlDesc': 'Domyślny interwał odświeżania cen wynosi 6 godzin (z ograniczeniem minimalnego odstępu do 30 minut per produkt).',
    'settings.repoTitle': 'Abstrakcja Repozytorium (PriceRepository)',
    'settings.repoDesc': 'Zgodnie ze specyfikacją architektura, kod przygotowany jest pod bezproblemowe podłączenie zsynchronizowanego backendu Node.js + Postgres (Faza 2).',

    // Period selector
    'period.week': 'Tygodniowy',
    'period.month': 'Miesięczny',
    'period.six_months': '6 miesięcy',
    'period.year': 'Roczny',

    // Trend badges & descriptions
    'trend.Stable': 'Stabilna',
    'trend.Fluctuating': 'Ważąca się',
    'trend.Steady increase': 'Stabilny wzrost',
    'trend.Increasing (volatile)': 'Wzrost (zmienna)',
    'trend.Steady decrease': 'Stabilny spadek',
    'trend.Decreasing (volatile)': 'Spadek (zmienna)',
    'trend.Not enough data yet': 'Za mało danych',

    // Languages
    // Languages
    'lang.en': 'EN',
    'lang.pl': 'PL'
  }
};

export type TranslationKey = keyof typeof translations.en;
