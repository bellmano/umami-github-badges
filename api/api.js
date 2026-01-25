const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Hardcoded Umami Cloud API URL
const UMAMI_URL = 'https://api.umami.is/v1';

// Cache for 5 minutes by default
const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());
app.use(express.static('.'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Main badge endpoint
app.get('/api/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const {
      website,
      token,
      style = 'for-the-badge',
      color = 'blue',
      label,
      logo,
      range = 'all',
      cache: cacheParam = '300'
    } = req.query;

    // Validate required parameters
    if (!website) {
      return res.redirect(`https://img.shields.io/badge/Error-Missing%20Website%20ID-red?style=${style}`);
    }

    if (!token) {
      return res.redirect(`https://img.shields.io/badge/Error-Missing%20API%20Token-red?style=${style}`);
    }

    // Create cache key
    const cacheKey = `${website}-${metric}-${range}-${token.substring(0, 8)}`;
    let data = cache.get(cacheKey);

    if (!data) {
      // Fetch data from Umami API
      data = await fetchUmamiData(UMAMI_URL, website, token, metric, range);
      
      // Cache the result
      let cacheTime = 300;
      const parsedCache = parseInt(cacheParam);
      if (parsedCache && parsedCache > 0) {
        cacheTime = parsedCache;
      }
      cache.set(cacheKey, data, cacheTime);
    }

    // Format for shields.io
    const { value, formattedValue } = formatMetricValue(data, metric);
    const badgeLabel = label || getDefaultLabel(metric);
    const badgeColor = getMetricColor(metric, color, value);

    // Build shields.io URL
    const shieldsUrl = buildShieldsUrl({
      label: badgeLabel,
      message: formattedValue,
      color: badgeColor,
      style,
      logo
    });

    // Redirect to shields.io
    res.redirect(shieldsUrl);

  } catch (error) {
    console.error('Error generating badge:', error);
    res.redirect(`https://img.shields.io/badge/Error-Failed%20to%20fetch-red?style=${req.query.style || 'flat'}`);
  }
});

// Fetch data from Umami API
async function fetchUmamiData(umamiUrl, websiteId, token, metric, range = 'all') {
  const baseUrl = umamiUrl.replace(/\/$/, ''); // Remove trailing slash
  
  // Calculate date range based on range parameter
  const endDate = new Date().getTime();
  let startTime;
  
  if (range === 'all') {
    // All-time: Use a date far in the past (e.g., year 2000)
    startTime = new Date('2000-01-01').getTime();
  } else {
    const startDate = new Date();
    const days = parseInt(range.replace('d', ''));
    startDate.setDate(startDate.getDate() - days);
    startTime = startDate.getTime();
  }

  // Build the stats URL (baseUrl already contains /v1)
  const url = `${baseUrl}/websites/${websiteId}/stats?startAt=${startTime}&endAt=${endDate}`;
  
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'Umami-GitHub-Badges/1.0',
    'x-umami-api-key': token  // Umami uses x-umami-api-key header for API key authentication
  };

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Umami API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Format metric value for display
function formatMetricValue(data, metric) {
  let value = 0;
  let formattedValue = 'N/A';

  try {
    /* istanbul ignore next */
    const metrics = {
      'views': () => {
        value = data.pageviews || 0;
        formattedValue = formatNumber(value);
      },
      'visitors': () => {
        value = data.visitors || 0;
        formattedValue = formatNumber(value);
      },
      'visits': () => {
        value = data.visits || 0;
        formattedValue = formatNumber(value);
      },
      'bounce-rate': () => {
        value = data.bounces || 0;
        const totalVisits = (data.visits && data.visits > 0) ? data.visits : 1;
        const bounceRate = (value / totalVisits) * 100;
        formattedValue = `${bounceRate.toFixed(1)}%`;
      },
      'avg-session': () => {
        // Umami returns totaltime in seconds (total across all visits)
        const totalTime = data.totaltime || 0;
        const visits = (data.visits && data.visits > 0) ? data.visits : 1;
        value = totalTime / visits;
        formattedValue = formatDuration(value);
      }
    };

    if (metrics[metric]) {
      metrics[metric]();
    } else {
      formattedValue = 'Unknown';
    }
  } catch (error) {
    console.error('Error formatting metric:', error);
    formattedValue = 'Error';
  }

  return { value, formattedValue };
}

// Format large numbers with K, M, B suffixes
function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format duration in seconds to human readable format
function formatDuration(seconds) {
  const totalSeconds = Math.floor(seconds);
  
  if (totalSeconds === 0) {
    return '0s';
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// Get default label for metric
function getDefaultLabel(metric) {
  const labels = {
    'views': 'Views',
    'visitors': 'Visitors',
    'visits': 'Visits',
    'bounce-rate': 'Bounce Rate',
    'avg-session': 'Avg Session'
  };
  return labels[metric] || metric;
}

// Get appropriate color for metric
function getMetricColor(metric, defaultColor, value) {
  // Use custom color if provided
  if (defaultColor !== 'blue') {
    return defaultColor;
  }

  // Auto-select colors based on metric type
  const colorMap = {
    'views': 'brightgreen',
    'visitors': 'green',
    'visits': 'blue',
    'bounce-rate': value > 70 ? 'red' : value > 40 ? 'orange' : 'green',
    'avg-session': 'purple'
  };

  return colorMap[metric] || defaultColor;
}

// Build shields.io URL
function buildShieldsUrl({ label, message, color, style, logo }) {
  const params = new URLSearchParams();
  params.append('style', style);
  
  if (logo) {
    params.append('logo', logo);
  }

  const encodedLabel = encodeURIComponent(label);
  const encodedMessage = encodeURIComponent(message);
  const encodedColor = encodeURIComponent(color);

  return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${encodedColor}?${params.toString()}`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Umami GitHub Badges server running at http://localhost:${port}`);
  });
}

module.exports = app;

// Export cache for testing
module.exports.cache = cache;

// Export functions for testing
module.exports.fetchUmamiData = fetchUmamiData;
module.exports.formatMetricValue = formatMetricValue;
module.exports.formatNumber = formatNumber;
module.exports.formatDuration = formatDuration;
module.exports.getDefaultLabel = getDefaultLabel;
module.exports.getMetricColor = getMetricColor;
module.exports.buildShieldsUrl = buildShieldsUrl;
