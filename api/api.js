const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

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
      umami_url,
      token,
      style = 'flat',
      color = 'blue',
      label,
      logo,
      cache: cacheParam = '300'
    } = req.query;

    // Validate required parameters
    if (!website || !umami_url) {
      return res.redirect(`https://img.shields.io/badge/Error-Missing%20Parameters-red?style=${style}`);
    }

    // Create cache key
    const cacheKey = `${website}-${metric}-${umami_url}`;
    let data = cache.get(cacheKey);

    if (!data) {
      // Fetch data from Umami API
      data = await fetchUmamiData(umami_url, website, token, metric);
      
      // Cache the result
      const cacheTime = parseInt(cacheParam) || 300;
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
async function fetchUmamiData(umamiUrl, websiteId, token, metric) {
  const baseUrl = umamiUrl.replace(/\/$/, ''); // Remove trailing slash
  
  // Different endpoints for different metrics
  const endpoints = {
    views: `/api/websites/${websiteId}/stats`,
    visitors: `/api/websites/${websiteId}/stats`,
    sessions: `/api/websites/${websiteId}/stats`,
    'bounce-rate': `/api/websites/${websiteId}/stats`,
    'avg-session': `/api/websites/${websiteId}/stats`
  };

  const endpoint = endpoints[metric];
  if (!endpoint) {
    throw new Error(`Unsupported metric: ${metric}`);
  }

  // Calculate date range (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const url = `${baseUrl}${endpoint}?startAt=${startDate.getTime()}&endAt=${endDate.getTime()}`;
  
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'Umami-GitHub-Badges/1.0'
  };

  // Add authorization if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Umami API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Format metric value for display
function formatMetricValue(data, metric) {
  let value = 0;
  let formattedValue = 'N/A';

  try {
    switch (metric) {
      case 'views':
        value = data.pageviews?.value || 0;
        formattedValue = formatNumber(value);
        break;
      case 'visitors':
        value = data.uniques?.value || 0;
        formattedValue = formatNumber(value);
        break;
      case 'sessions':
        value = data.sessions?.value || 0;
        formattedValue = formatNumber(value);
        break;
      case 'bounce-rate':
        value = data.bounces?.value || 0;
        const totalViews = data.pageviews?.value || 1;
        const bounceRate = (value / totalViews) * 100;
        formattedValue = `${bounceRate.toFixed(1)}%`;
        break;
      case 'avg-session':
        const totalTime = data.totaltime?.value || 0;
        const sessions = data.sessions?.value || 1;
        value = totalTime / sessions;
        formattedValue = formatDuration(value);
        break;
      default:
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
  if (seconds >= 3600) {
    return `${(seconds / 3600).toFixed(1)}h`;
  }
  if (seconds >= 60) {
    return `${(seconds / 60).toFixed(1)}m`;
  }
  return `${seconds.toFixed(0)}s`;
}

// Get default label for metric
function getDefaultLabel(metric) {
  const labels = {
    'views': 'Views',
    'visitors': 'Visitors',
    'sessions': 'Sessions',
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
    'sessions': 'blue',
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
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Umami GitHub Badges server running on port ${port}`);
    console.log(`📊 Ready to generate badges from Umami analytics!`);
  });
}

module.exports = app;

// Export functions for testing
module.exports.fetchUmamiData = fetchUmamiData;
module.exports.formatMetricValue = formatMetricValue;
module.exports.formatNumber = formatNumber;
module.exports.formatDuration = formatDuration;
module.exports.getDefaultLabel = getDefaultLabel;
module.exports.getMetricColor = getMetricColor;
module.exports.buildShieldsUrl = buildShieldsUrl;
