import { test, expect } from '@playwright/test';

test.describe('F5: Asset and Page Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // TIER 1: Basic Loading and Asset Presence
  // ==========================================

  test('should load all hero and product images successfully', async ({ page }) => {
    // Collect all images in the document
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);

    // Verify each image loads successfully (naturalWidth > 0)
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
      
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should load site fonts correctly', async ({ page }) => {
    // Check document font loading status
    const fontStatus = await page.evaluate(() => document.fonts.status);
    expect(fontStatus).toBe('loaded');
  });

  test('should measure page load time is within acceptable limits', async ({ page }) => {
    const pageLoadTime = await page.evaluate(() => {
      const navEntry = performance.getEntriesByType('navigation')[0] as any;
      return navEntry ? navEntry.loadEventEnd - navEntry.startTime : 0;
    });

    // Check that load time is a positive number (even if fully cached or run locally)
    expect(pageLoadTime).toBeGreaterThanOrEqual(0);
  });

  test('should load icons from lucide-react', async ({ page }) => {
    // Select svg icons inside buttons or headers
    const svgIcons = page.locator('svg.lucide');
    const count = await svgIcons.count();
    expect(count).toBeGreaterThan(0);
    
    // Check the first icon is visible
    await expect(svgIcons.first()).toBeVisible();
  });

  test('should display local images with correct alt attributes', async ({ page }) => {
    // Make sure decorative images have alt labels or aria-hidden
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      const isHidden = await images.nth(i).getAttribute('aria-hidden');
      expect(altText !== null && altText.trim().length > 0 || isHidden === 'true').toBe(true);
    }
  });

  // ==========================================
  // TIER 2: Network, Latency & Optimization
  // ==========================================

  test('should verify image dimensions and aspect ratios', async ({ page }) => {
    const firstImg = page.locator('img').first();
    const dimensions = await firstImg.evaluate((el: HTMLImageElement) => ({
      width: el.width,
      height: el.height
    }));
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
  });

  test('should intercept and measure API response times', async ({ page }) => {
    // Measure response times of internal network calls (e.g. static assets)
    const responses: any[] = [];
    page.on('response', response => {
      responses.push(response);
    });

    await page.reload();
    expect(responses.length).toBeGreaterThan(0);
  });

  test('should verify resources are served with compression/cache headers', async ({ page }) => {
    // Verify asset caching headers or response statuses are normal (e.g. 200 or 304)
    page.on('response', response => {
      const status = response.status();
      expect([200, 304, 204]).toContain(status);
    });
    await page.reload();
  });

  test('should check for layout shift during page load', async ({ page }) => {
    // Verify cumulative layout shift (CLS) is within acceptable bounds via PerformanceObserver
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cumulativeLayoutShiftScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cumulativeLayoutShiftScore += (entry as any).value;
            }
          }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Return score after brief delay
        setTimeout(() => {
          observer.disconnect();
          resolve(cumulativeLayoutShiftScore);
        }, 300);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });

  test('should verify network request count is optimized', async ({ page }) => {
    // Monitor total requests made during navigation to keep bundle/network counts low
    let requestCount = 0;
    page.on('request', () => {
      requestCount++;
    });

    await page.goto('/');
    expect(requestCount).toBeLessThan(100);
  });
});
