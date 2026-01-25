const { fetchUmamiData, formatMetricValue, formatNumber, formatDuration, getDefaultLabel, getMetricColor, buildShieldsUrl } = require('../api/api.js');

// Mock node-fetch
jest.mock('node-fetch', () => jest.fn());

const fetch = require('node-fetch');

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUmamiData', () => {
    it.skip('should fetch data for views metric', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ pageviews: 100 })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await fetchUmamiData('https://api.umami.is/v1', 'website123', 'token', 'views');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.umami.is/v1/websites/website123/stats'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-umami-api-key': 'token'
          })
        })
      );
      expect(result).toEqual({ pageviews: 100 });
    });

    it.skip('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Not Found')
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(fetchUmamiData('https://api.umami.is/v1', 'website123', 'token', 'views')).rejects.toThrow('Umami API error: 404 Not Found');
    });
  });

  describe('formatMetricValue', () => {
    it('should format views', () => {
      const data = { pageviews: 1500 };
      const result = formatMetricValue(data, 'views');
      expect(result).toEqual({ value: 1500, formattedValue: '1.5K' });
    });

    it('should format visitors', () => {
      const data = { visitors: 500 };
      const result = formatMetricValue(data, 'visitors');
      expect(result).toEqual({ value: 500, formattedValue: '500' });
    });

    it('should format visits', () => {
      const data = { visits: 2000 };
      const result = formatMetricValue(data, 'visits');
      expect(result).toEqual({ value: 2000, formattedValue: '2.0K' });
    });

    it('should format bounce rate', () => {
      const data = { bounces: 50, visits: 100 };
      const result = formatMetricValue(data, 'bounce-rate');
      expect(result).toEqual({ value: 50, formattedValue: '50.0%' });
    });

    it('should format average session', () => {
      const data = { totaltime: 3600000, visits: 2 }; // 3600 seconds in ms
      const result = formatMetricValue(data, 'avg-session');
      expect(result).toEqual({ value: 1800, formattedValue: '30.0m' });
    });

    it('should handle missing data', () => {
      const data = {};
      const result = formatMetricValue(data, 'views');
      expect(result).toEqual({ value: 0, formattedValue: '0' });
    });
  });

  describe('formatNumber', () => {
    it('should format large numbers', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(1500000000)).toBe('1.5B');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to human readable format', () => {
      expect(formatDuration(3661)).toBe('1.0h');
      expect(formatDuration(120)).toBe('2.0m');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(7200)).toBe('2.0h');
    });
  });

  describe('getDefaultLabel', () => {
    it('should return correct labels', () => {
      expect(getDefaultLabel('views')).toBe('Views');
      expect(getDefaultLabel('visitors')).toBe('Visitors');
      expect(getDefaultLabel('visits')).toBe('Visits');
      expect(getDefaultLabel('bounce-rate')).toBe('Bounce Rate');
      expect(getDefaultLabel('avg-session')).toBe('Avg Session');
      expect(getDefaultLabel('unknown')).toBe('unknown');
    });
  });

  describe('getMetricColor', () => {
    it('should return custom color if not blue', () => {
      expect(getMetricColor('views', 'red', 100)).toBe('red');
    });

    it('should return auto color for blue', () => {
      expect(getMetricColor('views', 'blue', 100)).toBe('brightgreen');
      expect(getMetricColor('visitors', 'blue', 100)).toBe('green');
      expect(getMetricColor('visits', 'blue', 100)).toBe('blue');
      expect(getMetricColor('bounce-rate', 'blue', 80)).toBe('red');
      expect(getMetricColor('bounce-rate', 'blue', 30)).toBe('green');
      expect(getMetricColor('avg-session', 'blue', 100)).toBe('purple');
    });
  });

  describe('buildShieldsUrl', () => {
    it('should build shields.io URL', () => {
      const result = buildShieldsUrl({
        label: 'Test',
        message: '100',
        color: 'green',
        style: 'flat',
        logo: 'github'
      });
      expect(result).toContain('https://img.shields.io/badge/Test-100-green?style=flat&logo=github');
    });

    it('should build URL without logo', () => {
      const result = buildShieldsUrl({
        label: 'Test',
        message: '100',
        color: 'green',
        style: 'flat'
      });
      expect(result).toContain('https://img.shields.io/badge/Test-100-green?style=flat');
      expect(result).not.toContain('logo=');
    });
  });
});