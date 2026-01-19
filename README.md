# :rocket: Umami GitHub Badges

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=coverage&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=security_rating&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=sqale_rating&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=reliability_rating&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=bugs&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=vulnerabilities&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=code_smells&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)

Generate beautiful, dynamic GitHub badges for your Umami website analytics! Show off your website traffic, page views, and visitor stats directly in your README files.

## :sparkles: Features

- :bar_chart: **Real-time analytics badges** from your Umami dashboard
- :art: **Multiple badge styles** and colors (powered by shields.io)
- :zap: **Fast, cached responses** for better performance
- :lock: **Secure API key handling**
- :globe_with_meridians: **Easy integration** with any GitHub repository
- :iphone: **Responsive web interface** for badge generation
- :dart: **Support for multiple metrics** (views, visitors, sessions, etc.)

## :rocket: Quick Start

### 1. Find Your Umami Details

You'll need:
- Your Umami website URL (e.g., `https://analytics.yoursite.com`)
- Your website ID from Umami (found in Settings → Websites)
- An API token (optional, only if your Umami instance requires it)

### 2. Generate Your Badge

**Option A: Use the Web Interface**

Visit: **[umami-github-badges.vercel.app](https://umami-github-badges.vercel.app/)**

**Option B: Create URL Manually**
```
https://umami-github-badges.vercel.app/api/{metric}?website={WEBSITE_ID}&umami_url={UMAMI_URL}
```

### 3. Add to Your README

```markdown
![Website Analytics](https://umami-github-badges.vercel.app/api/views?website=your-website-id&umami_url=https://analytics.yoursite.com)
```

## :bar_chart: Available Metrics

| Metric | Description | Example |
|--------|-------------|---------|
| `views` | Total page views | ![Views](https://img.shields.io/badge/Views-12.5K-brightgreen?style=flat-square) |
| `visitors` | Unique visitors | ![Visitors](https://img.shields.io/badge/Visitors-3.2K-green?style=flat-square) |
| `sessions` | Total sessions | ![Sessions](https://img.shields.io/badge/Sessions-8.9K-blue?style=flat-square) |
| `bounce-rate` | Bounce rate percentage | ![Bounce Rate](https://img.shields.io/badge/Bounce%20Rate-45.2%25-orange?style=flat-square) |
| `avg-session` | Average session duration | ![Avg Session](https://img.shields.io/badge/Avg%20Session-2.5m-purple?style=flat-square) |

## :art: Customization Options

| Parameter | Description | Values |
|-----------|-------------|--------|
| `style` | Badge style | `flat`, `flat-square`, `for-the-badge`, `plastic`, `social` |
| `color` | Badge color | `brightgreen`, `green`, `blue`, `red`, `orange`, `yellow`, `purple`, or hex codes |
| `label` | Custom label text | Any text (URL encoded) |
| `logo` | Logo from Simple Icons | `analytics`, `umami`, `github`, etc. |
| `cache` | Cache duration in seconds | Default: `300` (5 minutes) |

## :book: Examples

### Basic Usage
```markdown
![Views](https://umami-github-badges.vercel.app/api/views?website=abc123&umami_url=https://analytics.example.com)
```

### Custom Styling
```markdown
![Visitors](https://umami-github-badges.vercel.app/api/visitors?website=abc123&umami_url=https://analytics.example.com&style=for-the-badge&color=brightgreen&label=Unique%20Visitors)
```

### Multiple Badges in a Row
```markdown
![Views](https://umami-github-badges.vercel.app/api/views?website=abc123&umami_url=https://analytics.example.com&style=flat-square)
![Visitors](https://umami-github-badges.vercel.app/api/visitors?website=abc123&umami_url=https://analytics.example.com&style=flat-square)
![Sessions](https://umami-github-badges.vercel.app/api/sessions?website=abc123&umami_url=https://analytics.example.com&style=flat-square)
```

### With Custom Colors and Logos
```markdown
![Analytics](https://umami-github-badges.vercel.app/api/views?website=abc123&umami_url=https://analytics.example.com&style=for-the-badge&color=ff6b6b&logo=analytics&label=Total%20Views)
```

## :test_tube: Running Tests

To run the tests and view coverage:

1. Install the required dev dependency:
	```powershell
	npm install
	```
2. Run the test coverage script:
	```powershell
	npm run test:coverage
	```

This will execute the tests and generate a coverage report.

## :handshake: Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## :mega: Issues or Suggestions
Any issues or suggestions, please [create an issue on Github](https://github.com/bellmano/umami-github-badges/issues).

## :coffee: Buy me a coffee
Donations are welcome to appreciate my work to keep this website alive, but isn't required at all.

<!-- PayPal icon/button is used from this GitHub repo: https://github.com/andreostrovsky/donate-with-paypal -->
<a href="https://www.paypal.me/bellmano1"><img src="img/paypal.svg" height="50"></a>