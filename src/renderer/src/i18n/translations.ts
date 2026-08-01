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
    'productList.noSearchResults': 'No matching products found.',
    'productList.neverChecked': 'Never checked',
    'productList.refreshTooltip': 'Refresh price',
    'productList.deleteTooltip': 'Delete tracking',
    'productList.setDefaultTooltip': 'Set as default product',
    'productList.unsetDefaultTooltip': 'Remove default product',
    'productList.isDefaultBadge': 'Default',
    'productList.clearDefaultBtn': 'Remove from default',
    'productList.lastCheckedTooltip': 'Last price update timestamp',
    'productList.idTooltip': 'Kinguin product ID',
    'heroPlaceholder.title': 'No default game selected',
    'heroPlaceholder.subtitle': 'Set your most tracked game as default to view its live statistics and price chart here automatically upon launch.',
    'deleteModal.deleteConfirm': 'Are you sure you want to delete "{title}"?',

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
    'toast.refreshAllSuccess': 'All product prices updated successfully',
    'toast.refreshSomeFailed': 'Failed to refresh some products ({count})',
    'toast.autoPasted': 'Automatically pasted Kinguin link from clipboard',

    // Indicator Tooltips
    'indicator.noChange': 'Price unchanged since last check',
    'indicator.increased': 'Price increased by {amount} since last check',
    'indicator.decreased': 'Price dropped by {amount} since last check',

    // Analytics View
    'analytics.title': 'Statistical Overview',
    'analytics.emptyText': 'Add products to your tracking list first to see statistical summaries.',

    // Settings View
    'settings.title': 'App Preferences & Customization',
    'settings.searchModeTitle': 'Search Bar Scroll Behavior',
    'settings.searchModeDesc': 'Configure how the sticky search bar behaves when scrolling down the page.',
    'settings.searchModeTranslucent': 'Semi-transparent (Default)',
    'settings.searchModeHidden': 'Completely hidden (Visible on hover & focus)',
    'settings.languageTitle': 'Interface Language',
    'settings.languageDesc': 'Select your preferred display language for the user interface.',
    'settings.currencyTitle': 'Display Currency',
    'settings.currencyDesc': 'Set your primary display currency for product prices and exchange rate calculations.',
    'settings.defaultProductTitle': 'Pinned Default Game',
    'settings.defaultProductDesc': 'Manage or remove the featured default game pinned to your top dashboard.',
    'settings.clearDefaultBtn': 'Unpin Default Game',
    'settings.noDefaultSet': 'No game currently pinned as default.',
    'settings.autoPasteTitle': 'Auto-Paste Clipboard Links',
    'settings.autoPasteDesc': 'Automatically paste Kinguin product URLs from clipboard when focusing the app window.',
    'settings.autoPasteEnabled': 'Enabled (Default)',
    'settings.autoPasteDisabled': 'Disabled',

    // Info Modal
    'infoModal.button': 'I',
    'infoModal.title': 'Technical Architecture & System Specs',
    'infoModal.subtitle': 'Deep dive technical breakdown for users and developers.',
    'infoModal.tabStack': 'Tech Stack',
    'infoModal.tabDatabase': 'Storage Engine',
    'infoModal.tabScraper': 'Scraper Pipeline',
    'infoModal.tabAlgorithm': 'Algorithms',
    'infoModal.tabSecurity': 'Security & IPC',

    // Period selector
    'period.week': 'Weekly',
    'period.month': 'Monthly',
    'period.six_months': '6 Months',
    'period.year': 'Yearly',
    'period.all': 'All-Time',
    'period.disabledTooltip': 'Insufficient tracking history for this range',

    // Trend badges & descriptions
    'trend.Stable': 'Stable',
    'trend.Fluctuating': 'Fluctuating',
    'trend.Steady increase': 'Steady increase',
    'trend.Increasing (volatile)': 'Increasing (volatile)',
    'trend.Steady decrease': 'Steady decrease',
    'trend.Decreasing (volatile)': 'Decreasing (volatile)',
    'trend.Not enough data yet': 'Not enough data yet',

    // High-visibility Trend Headers
    'trendHeader.decreasing': 'Downward Trend — Great Time to Buy!',
    'trendHeader.increasing': 'Upward Trend — Price is Rising',
    'trendHeader.stable': 'Stable Trend — Consistent Pricing',
    'trendHeader.fluctuating': 'Volatile Trend — High Fluctuations',
    'trendHeader.insufficient': 'Insufficient Data for Trend Analysis',

    // Price Prediction Engine
    'prediction.toggleBtn': 'Price Forecast',
    'prediction.title': 'Predictive Price Model',
    'prediction.subtitle': 'Dampened mean-reverting regression model with MSRP ceiling constraints.',
    'prediction.2w': '2 Weeks',
    'prediction.1m': '1 Month',
    'prediction.6m': '6 Months',
    'prediction.1y': '1 Year',
    'prediction.projectedPrice': 'Projected Price',
    'prediction.expectedChange': 'Expected Change',
    'prediction.corridor': 'Projected Range Corridor',
    'prediction.confidence': 'Model Confidence',
    'prediction.confidenceHigh': 'High',
    'prediction.confidenceMed': 'Moderate',
    'prediction.confidenceLow': 'Preliminary',
    'prediction.disclaimer': 'Statistical forecast based on historical price dynamics. Real prices may vary due to publisher seasonal sales and promotions.',

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
    'productList.noSearchResults': 'Brak produktów spełniających kryteria wyszukiwania.',
    'productList.neverChecked': 'Nie sprawdzano',
    'productList.refreshTooltip': 'Odśwież cenę',
    'productList.deleteTooltip': 'Usuń śledzenie',
    'productList.setDefaultTooltip': 'Ustaw jako domyślny produkt',
    'productList.unsetDefaultTooltip': 'Usuń z domyślnych',
    'productList.isDefaultBadge': 'Domyślny',
    'productList.clearDefaultBtn': 'Usuń z domyślnych',
    'productList.lastCheckedTooltip': 'Data i godzina ostatniego odświeżenia ceny',
    'productList.idTooltip': 'Identyfikator produktu w Kinguin',
    'heroPlaceholder.title': 'Brak ustawionej domyślnej gry',
    'heroPlaceholder.subtitle': 'Ustaw na domyślny najbardziej chętną grę do trackowania z listy poniżej (klikając ikonę gwiazdki), aby jej statystyki i wykres cenowy wyświetlały się tutaj automatycznie po uruchomieniu.',
    'deleteModal.deleteConfirm': 'Czy na pewno chcesz usunąć "{title}"?',

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
    'toast.refreshAllSuccess': 'Wszystkie ceny zostały pomyślnie zaktualizowane',
    'toast.refreshSomeFailed': 'Nie udało się odświeżyć niektórych produktów ({count})',
    'toast.autoPasted': 'Automatycznie wklejono link ze schowka',

    // Indicator Tooltips
    'indicator.noChange': 'Cena bez zmian od ostatniego sprawdzenia',
    'indicator.increased': 'Cena wzrosła o {amount} od ostatniego odświeżenia',
    'indicator.decreased': 'Cena spadła o {amount} od ostatniego odświeżenia',

    // Analytics View
    'analytics.title': 'Przegląd statystyczny',
    'analytics.emptyText': 'Dodaj najpierw produkty do listy śledzenia, aby zobaczyć podsumowanie statystyczne.',

    // Settings View
    'settings.title': 'Ustawienia i Personalizacja',
    'settings.searchModeTitle': 'Zachowanie paska wyszukiwania przy skrolowaniu',
    'settings.searchModeDesc': 'Wybierz zachowanie przyklejonego paska wyszukiwania podczas przewijania strony w dół.',
    'settings.searchModeTranslucent': 'Półprzezroczysty (Domyślny)',
    'settings.searchModeHidden': 'Całkowicie ukryty (Widoczny po najechaniu i przy pisaniu)',
    'settings.languageTitle': 'Język interfejsu',
    'settings.languageDesc': 'Wybierz preferowany język wyświetlania całej aplikacji.',
    'settings.currencyTitle': 'Główna waluta wyświetlania',
    'settings.currencyDesc': 'Ustaw domyślną walutę przeliczania cen oraz format kwot na wykresach.',
    'settings.defaultProductTitle': 'Wyróżniony domyślny produkt',
    'settings.defaultProductDesc': 'Zarządzaj lub usuń przypięty domyślny produkt z górnej karty pulpitu.',
    'settings.clearDefaultBtn': 'Odepnij domyślny produkt',
    'settings.noDefaultSet': 'Brak obecnie przypiętego domyślnego produktu.',
    'settings.autoPasteTitle': 'Automatyczne Wklejanie ze Schowka',
    'settings.autoPasteDesc': 'Automatycznie wklejaj linki do produktów Kinguin ze schowka po przejściu do okna aplikacji.',
    'settings.autoPasteEnabled': 'Włączone (Domyślne)',
    'settings.autoPasteDisabled': 'Wyłączone',

    // Info Modal
    'infoModal.button': 'I',
    'infoModal.title': 'Specyfikacja Techniczna i Architektura',
    'infoModal.subtitle': 'Kompletny i dokładny opis działania aplikacji dla użytkowników i deweloperów.',
    'infoModal.tabStack': 'Stos Technologiczny',
    'infoModal.tabDatabase': 'Baza Danych',
    'infoModal.tabScraper': 'Parser Cen',
    'infoModal.tabAlgorithm': 'Algorytmy Predykcji',
    'infoModal.tabSecurity': 'Bezpieczeństwo IPC',

    // Period selector
    'period.week': 'Tygodniowy',
    'period.month': 'Miesięczny',
    'period.six_months': '6 miesięcy',
    'period.year': 'Roczny',
    'period.all': 'Od początku',
    'period.disabledTooltip': 'Za krótki okres śledzenia dla tego zakresu',

    // Trend badges & descriptions
    'trend.Stable': 'Stabilna',
    'trend.Fluctuating': 'Ważąca się',
    'trend.Steady increase': 'Stabilny wzrost',
    'trend.Increasing (volatile)': 'Wzrost (zmienna)',
    'trend.Steady decrease': 'Stabilny spadek',
    'trend.Decreasing (volatile)': 'Spadek (zmienna)',
    'trend.Not enough data yet': 'Za mało danych',

    // High-visibility Trend Headers
    'trendHeader.decreasing': 'Trend Spadkowy — Korzystny moment na zakup!',
    'trendHeader.increasing': 'Trend Wzrostowy — Cena idzie w górę',
    'trendHeader.stable': 'Trend Stabilny — Stały poziom cenowy',
    'trendHeader.fluctuating': 'Volatile Trend — Duże wahania cen',
    'trendHeader.insufficient': 'Za mało danych do wyznaczenia trendu',

    // Price Prediction Engine
    'prediction.toggleBtn': 'Prognoza cenowa',
    'prediction.title': 'Model Predykcji Ceny',
    'prediction.subtitle': 'Model regresji z wygładzaniem tłumionym, uwzględniający powrót do średniej rynkowej i limit cenowy MSRP.',
    'prediction.2w': '2 Tygodnie',
    'prediction.1m': '1 Miesiąc',
    'prediction.6m': '6 Miesięcy',
    'prediction.1y': '1 Rok',
    'prediction.projectedPrice': 'Prognozowana cena',
    'prediction.expectedChange': 'Oczekiwana zmiana',
    'prediction.corridor': 'Przewidywany przedział (Korytarz)',
    'prediction.confidence': 'Pewność modelu',
    'prediction.confidenceHigh': 'Wysoka',
    'prediction.confidenceMed': 'Umiarkowana',
    'prediction.confidenceLow': 'Wstępna',
    'prediction.disclaimer': 'Estymacja matematyczna na podstawie dotychczasowej dynamiki i dryfu cenowego. Rzeczywista cena może ulec zmianie podczas sezonowych promocji.',

    // Languages
    'lang.en': 'EN',
    'lang.pl': 'PL'
  }
};

export type TranslationKey = keyof typeof translations.en;
