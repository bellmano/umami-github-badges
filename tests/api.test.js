// Mock node-fetch before requiring api
jest.mock('node-fetch');
const fetch = require('node-fetch');

// Mock fs for Express to serve files
jest.mock('fs');

const {
  fetchUmamiData,
  formatMetricValue,
  formatNumber,
  formatDuration,
  getDefaultLabel,
  getMetricColor,
  buildShieldsUrl
} = require('../api/api');

const app = require('../api/api');

// Suppress console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('API Functions', () => {
  
  test('formatNumber handles all ranges with B, M, K suffixes', () => {
    expect(formatNumber(5000000000)).toBe('5.0B');
    expect(formatNumber(3500000)).toBe('3.5M');
    expect(formatNumber(2500)).toBe('2.5K');
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(0)).toBe('0');
  });

  test('formatDuration formats to h, m, s with thresholds', () => {
    expect(formatDuration(7200)).toBe('2.0h');
    expect(formatDuration(180)).toBe('3.0m');
    expect(formatDuration(45)).toBe('45s');
  });

  test('getDefaultLabel returns labels for all metrics', () => {
    expect(getDefaultLabel('views')).toBe('Views');
    expect(getDefaultLabel('visitors')).toBe('Visitors');
    expect(getDefaultLabel('visits')).toBe('Visits');
    expect(getDefaultLabel('bounce-rate')).toBe('Bounce Rate');
    expect(getDefaultLabel('avg-session')).toBe('Avg Session');
    expect(getDefaultLabel('unknown')).toBe('unknown');
  });

  test('getMetricColor handles custom colors, auto-select, and bounce-rate thresholds', () => {
    // Custom colors
    expect(getMetricColor('views', 'red', 100)).toBe('red');
    // Auto-select
    expect(getMetricColor('views', 'blue', 100)).toBe('brightgreen');
    expect(getMetricColor('visitors', 'blue', 100)).toBe('green');
    expect(getMetricColor('visits', 'blue', 100)).toBe('blue');
    expect(getMetricColor('avg-session', 'blue', 100)).toBe('purple');
    expect(getMetricColor('unknown-metric', 'blue', 50)).toBe('blue');
    // Bounce rate thresholds
    expect(getMetricColor('bounce-rate', 'blue', 80)).toBe('red');
    expect(getMetricColor('bounce-rate', 'blue', 50)).toBe('orange');
    expect(getMetricColor('bounce-rate', 'blue', 30)).toBe('green');
  });

  test('buildShieldsUrl builds correct URLs with and without logo', () => {
    const url1 = buildShieldsUrl({ label: 'Views', message: '1.5K', color: 'green', style: 'flat' });
    expect(url1).toContain('Views-1.5K-green');
    expect(url1).toContain('style=flat');
    expect(url1).not.toContain('logo=');

    const url2 = buildShieldsUrl({ label: 'Test Label', message: '50%', color: 'blue', style: 'flat', logo: 'github' });
    expect(url2).toContain('Test%20Label');
    expect(url2).toContain('50%25');
    expect(url2).toContain('logo=github');
  });

  test('formatMetricValue formats all metric types and handles edge cases', () => {
    // All metric types
    expect(formatMetricValue({ pageviews: 1500 }, 'views').formattedValue).toBe('1.5K');
    expect(formatMetricValue({ visitors: 2500000 }, 'visitors').formattedValue).toBe('2.5M');
    expect(formatMetricValue({ visits: 800 }, 'visits').formattedValue).toBe('800');
    expect(formatMetricValue({ bounces: 50, visits: 100 }, 'bounce-rate').formattedValue).toBe('50.0%');
    expect(formatMetricValue({ totaltime: 180000, visits: 100 }, 'avg-session').formattedValue).toBe('2s');
    expect(formatMetricValue({}, 'unknown').formattedValue).toBe('Unknown');
    
    // Missing data defaults
    expect(formatMetricValue({}, 'views').value).toBe(0);
    
    // Falsy visits values (undefined, null, false, 0, negative) - should default to 1
    expect(formatMetricValue({ bounces: 10, visits: 0 }, 'bounce-rate').formattedValue).toBe('1000.0%');
    expect(formatMetricValue({ bounces: 5 }, 'bounce-rate').formattedValue).toBe('500.0%');
    expect(formatMetricValue({ bounces: 3, visits: null }, 'bounce-rate').formattedValue).toBe('300.0%');
    expect(formatMetricValue({ bounces: 8, visits: -5 }, 'bounce-rate').formattedValue).toBe('800.0%');
    expect(formatMetricValue({ totaltime: 5000, visits: 0 }, 'avg-session').formattedValue).toBe('5s');
    expect(formatMetricValue({ totaltime: 60000 }, 'avg-session').formattedValue).toBe('1.0m');
    
    // Error handling
    expect(formatMetricValue(null, 'views').formattedValue).toBe('Error');
  });

  describe('fetchUmamiData', () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test('fetches with all date ranges and handles trailing slash', async () => {
      fetch.mockResolvedValue({ ok: true, json: async () => ({ pageviews: 100 }) });

      // Test 'all' range (year 2000)
      await fetchUmamiData('https://api.umami.is/v1', 'test', 'token', 'views', 'all');
      expect(fetch.mock.calls[0][0]).toContain('startAt=946684800000');
      
      // Test specific day range
      await fetchUmamiData('https://api.umami.is/v1/', 'test', 'token', 'views', '7d');
      expect(fetch.mock.calls[1][0]).not.toContain('946684800000');
      expect(fetch.mock.calls[1][0]).not.toContain('//websites'); // Trailing slash removed
      
      // Test default parameter (no range provided)
      await fetchUmamiData('https://api.umami.is/v1', 'test', 'token', 'views');
      expect(fetch.mock.calls[2][0]).toContain('startAt=946684800000');
    });

    test('handles errors', async () => {
      fetch.mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized', text: async () => 'Invalid' });
      await expect(fetchUmamiData('https://api.umami.is/v1', 'test', 'token', 'views', 'all'))
        .rejects.toThrow('Umami API error: 401 Unauthorized - Invalid');

      fetch.mockRejectedValue(new Error('Network failure'));
      await expect(fetchUmamiData('https://api.umami.is/v1', 'test', 'token', 'views', 'all'))
        .rejects.toThrow('Network failure');
    });
  });

  describe('Express Routes', () => {
    let mockReq, mockRes;

    beforeEach(() => {
      fetch.mockClear();
      mockReq = { params: {}, query: {} };
      mockRes = { redirect: jest.fn(), json: jest.fn(), sendFile: jest.fn() };
    });

    test('/ and /health routes work correctly', () => {
      const indexRoute = app._router.stack.find(r => r.route?.path === '/').route.stack[0].handle;
      indexRoute(mockReq, mockRes);
      expect(mockRes.sendFile).toHaveBeenCalled();

      const healthRoute = app._router.stack.find(r => r.route?.path === '/health').route.stack[0].handle;
      healthRoute(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
    });

    test('/api/:metric validates parameters and generates badges', async () => {
      const handler = app._router.stack.find(r => r.route?.path === '/api/:metric').route.stack[0].handle;
      
      // Missing website
      mockReq.params = { metric: 'views' };
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('Missing%20Website%20ID'));
      
      // Missing token
      mockRes.redirect.mockClear();
      mockReq.query = { website: 'test' };
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('Missing%20API%20Token'));
      
      // Successful badge generation
      mockRes.redirect.mockClear();
      if (app.cache) app.cache.flushAll();
      mockReq.query = { website: 'test', token: 'token123', style: 'flat', label: 'Custom' };
      fetch.mockResolvedValue({ ok: true, json: async () => ({ pageviews: 1234 }) });
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('https://img.shields.io/badge/'));
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('Custom-1.2K'));
    });

    test('/api/:metric handles caching correctly', async () => {
      const handler = app._router.stack.find(r => r.route?.path === '/api/:metric').route.stack[0].handle;
      if (app.cache) app.cache.flushAll();
      
      mockReq.params = { metric: 'visits' };
      mockReq.query = { website: 'cache-test', token: 'token-abc' };
      fetch.mockResolvedValue({ ok: true, json: async () => ({ visits: 555 }) });
      
      // First request - fetches from API
      await handler(mockReq, mockRes);
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Second request - uses cache
      fetch.mockClear();
      mockRes.redirect.mockClear();
      await handler(mockReq, mockRes);
      expect(fetch).toHaveBeenCalledTimes(0);
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('555'));
    });

    test('/api/:metric handles cache parameter variations', async () => {
      const handler = app._router.stack.find(r => r.route?.path === '/api/:metric').route.stack[0].handle;
      
      mockReq.params = { metric: 'views' };
      fetch.mockResolvedValue({ ok: true, json: async () => ({ pageviews: 100 }) });
      
      // Valid cache parameter
      mockReq.query = { website: 'test1', token: 'token1', cache: '600' };
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalled();
      
      // Invalid cache (NaN) - uses default
      mockReq.query = { website: 'test2', token: 'token2', cache: 'invalid' };
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalled();
      
      // Cache = 0 - uses default
      mockReq.query = { website: 'test3', token: 'token3', cache: '0' };
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalled();
    });

    test('/api/:metric handles errors with style fallback', async () => {
      const handler = app._router.stack.find(r => r.route?.path === '/api/:metric').route.stack[0].handle;
      
      mockReq.params = { metric: 'visitors' };
      mockReq.query = { website: 'error-test', token: 'token' };
      fetch.mockRejectedValue(new Error('Network error'));
      
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('Failed%20to%20fetch'));
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('style=flat'));
      
      // Custom style in error
      mockReq.query = { website: 'error-test2', token: 'token2', style: 'plastic' };
      fetch.mockRejectedValue(new Error('Error'));
      await handler(mockReq, mockRes);
      expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('style=plastic'));
    });
  });
});