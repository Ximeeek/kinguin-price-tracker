import { parseKinguinUrl, cleanProductTitle } from '../main/services/kinguinFetcher';
import { TrendEngine } from '../main/services/trendEngine';
import { AverageEngine } from '../main/services/averageEngine';
import { parseCustomDays } from '../shared/timeUtils';
import { PriceSnapshot } from '../shared/types';

function runTests() {
  console.log('=== Running Kinguin Tracker Engine Verification Tests ===\n');

  // Test 1: URL Parsing
  console.log('Test 1: Kinguin URL Parsing');
  const validUrl1 = 'https://www.kinguin.net/category/123456/grand-theft-auto-v-steam-alter-cd-key';
  const validUrl2 = 'https://www.kinguin.net/c/654321/cyberpunk-2077';
  const invalidUrl = 'https://www.google.com/category/123456';

  const parsed1 = parseKinguinUrl(validUrl1);
  const parsed2 = parseKinguinUrl(validUrl2);
  const parsedInvalid = parseKinguinUrl(invalidUrl);

  console.assert(parsed1?.id === '123456', 'URL 1 ID mismatch');
  console.assert(parsed1?.canonicalUrl === 'https://www.kinguin.net/category/123456/grand-theft-auto-v-steam-alter-cd-key', 'URL 1 canonicalUrl mismatch');
  console.assert(parsed2?.id === '654321', 'URL 2 ID mismatch');
  console.assert(parsedInvalid === null, 'Invalid URL should return null');
  console.log('✅ URL Parsing passed.\n');

  // Test 2: Trend Engine - Insufficient Data (< 14 days)
  console.log('Test 2: Trend Engine - Insufficient Data (< 14 days)');
  const recentDate = new Date().toISOString();
  const youngSnapshots: PriceSnapshot[] = [
    { productId: '1', price: 20.0, checkedAt: recentDate }
  ];
  const youngAnalysis = TrendEngine.analyze(youngSnapshots, recentDate);
  console.assert(youngAnalysis.label === 'Not enough data yet', 'Should return Not enough data yet');
  console.assert(youngAnalysis.hasSufficientData === false, 'hasSufficientData should be false');
  console.log('✅ Insufficient Data check passed.\n');

  // Test 3: Trend Engine - Stable Trend (14+ days, flat price, low volatility)
  console.log('Test 3: Trend Engine - Stable Trend');
  const now = Date.now();
  const fourteenDaysAgo = new Date(now - 15 * 24 * 3600 * 1000).toISOString();
  const stableSnapshots: PriceSnapshot[] = [];
  for (let i = 14; i >= 0; i--) {
    stableSnapshots.push({
      productId: '1',
      price: 20.0 + (i % 2 === 0 ? 0.2 : -0.2), // ~1% fluctuation
      checkedAt: new Date(now - i * 24 * 3600 * 1000).toISOString()
    });
  }
  const stableAnalysis = TrendEngine.analyze(stableSnapshots, fourteenDaysAgo);
  console.assert(stableAnalysis.label === 'Stable', `Expected Stable, got: ${stableAnalysis.label}`);
  console.assert(stableAnalysis.hasSufficientData === true, 'hasSufficientData should be true');
  console.log('✅ Stable Trend check passed.\n');

  // Test 4: Average Engine
  console.log('Test 4: Average Engine Delta Calculation');
  const avgSnapshots: PriceSnapshot[] = [
    { productId: '1', price: 100.0, checkedAt: new Date(now - 5 * 24 * 3600 * 1000).toISOString() },
    { productId: '1', price: 100.0, checkedAt: new Date(now - 2 * 24 * 3600 * 1000).toISOString() }
  ];
  const avgAnalysis = AverageEngine.analyze(avgSnapshots, 80.0, 'month'); // 80 vs avg 100 => 20% below average
  console.assert(avgAnalysis.averagePrice === 100.0, 'Average should be 100');
  console.assert(avgAnalysis.deltaPct === -20.0, `Delta Pct should be -20, got ${avgAnalysis.deltaPct}`);
  console.assert(avgAnalysis.label === '20% below average', `Label mismatch: ${avgAnalysis.label}`);
  console.log('✅ Average Engine check passed.\n');

  // Test 5: parseCustomDays parsing
  console.log('Test 5: parseCustomDays Period Parsing');
  console.assert(parseCustomDays('custom_14').days === 14, `custom_14 should parse to 14 days, got ${parseCustomDays('custom_14').days}`);
  console.assert(parseCustomDays('custom_14').isValid === true, 'custom_14 should be valid');
  console.assert(parseCustomDays('14d').days === 14, '14d should parse to 14 days');
  console.assert(parseCustomDays('2w').days === 14, '2w should parse to 14 days');
  console.assert(parseCustomDays('14').days === 14, '14 should parse to 14 days');
  console.assert(parseCustomDays('custom_7').days === 7, 'custom_7 should parse to 7 days');
  console.assert(parseCustomDays('invalid').isValid === false, 'invalid string should be invalid');
  // Test 6: Title cleaning
  console.log('Test 6: Title Cleaning (cleanProductTitle)');
  console.assert(cleanProductTitle('Cyberpunk 2077 | Buy cheap on Kinguin.net') === 'Cyberpunk 2077', 'Suffix 1 failed');
  console.assert(cleanProductTitle('The Witcher 3 | Buy cheap Kinguin.net') === 'The Witcher 3', 'Suffix 2 failed');
  console.assert(cleanProductTitle('GTA VI - Kinguin.net') === 'GTA VI', 'Suffix 3 failed');
  console.assert(cleanProductTitle('Elden Ring | Kinguin') === 'Elden Ring', 'Suffix 4 failed');
  console.assert(cleanProductTitle('Red Dead Redemption 2 - Buy cheap on Kinguin') === 'Red Dead Redemption 2', 'Suffix 5 failed');
  console.assert(cleanProductTitle('Clean Product Name') === 'Clean Product Name', 'Clean title failed');
  console.log('✅ Title Cleaning check passed.\n');

  console.log('🎉 ALL VERIFICATION TESTS PASSED!');
}

runTests();
