# :ramen: Umami GitHub Badges

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=coverage&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=security_rating&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=sqale_rating&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=reliability_rating&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=bugs&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=vulnerabilities&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=bellmano_umami-github-badges&metric=code_smells&token=6e9bb50bb14b2d851f65c161bef4a5e41dc5050c)](https://sonarcloud.io/summary/overall?id=bellmano_umami-github-badges)

Generate beautiful, dynamic GitHub badges for your Umami website analytics! Show off your website traffic, page views, and visitor stats directly in your README files.

## :rocket: Quick Start

### 1. Get Your Website ID and API Key

You'll need:
- Your Website ID (found in your website settings)
- An API key (Account Settings → API keys)

**Note:** This service is designed for **Umami Cloud** (https://cloud.umami.is) which uses the API endpoint `https://api.umami.is/v1`. If you're self-hosting Umami, you'll need to modify the code to point to your instance.

### 2. Generate Your Badge

**Option A: Use the Web Interface**

Visit: **[umami-github-badges.vercel.app](https://umami-github-badges.vercel.app/)**

**Option B: Create URL Manually**
```
https://umami-github-badges.vercel.app/api/{metric}?website={WEBSITE_ID}&token={API_TOKEN}&range=all&style=for-the-badge
```

### 3. Add to Your README

```markdown
![Website Analytics](https://umami-github-badges.vercel.app/api/views?website=your-website-id&token=your-api-token&range=all&style=for-the-badge)
```

## :bar_chart: Available Metrics

| Metric | Description | Example |
|--------|-------------|---------|
| `views` | Total page views | ![Views](https://img.shields.io/badge/Views-12.5K-brightgreen?style=for-the-badge) |
| `visitors` | Unique visitors | ![Visitors](https://img.shields.io/badge/Visitors-3.2K-green?style=for-the-badge) |
| `visits` | Total visits | ![Visits](https://img.shields.io/badge/Visits-8.9K-blue?style=for-the-badge) |
| `bounce-rate` | Bounce rate percentage | ![Bounce Rate](https://img.shields.io/badge/Bounce%20Rate-45.2%25-orange?style=for-the-badge) |
| `avg-session` | Average session duration | ![Avg Session](https://img.shields.io/badge/Avg%20Session-2.5m-purple?style=for-the-badge) |

## :art: Customization Options

| Parameter | Description | Values |
|-----------|-------------|--------|
| `range` | Time range for stats | `7d`, `30d`, `90d`, `all` (default: `all`) |
| `style` | Badge style | `flat`, `flat-square`, `for-the-badge`, `plastic`, `social` |
| `color` | Badge color | `brightgreen`, `green`, `blue`, `red`, `orange`, `yellow`, `purple`, or hex codes |
| `label` | Custom label text | Any text (URL encoded) |

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
Donations are welcome to appreciate my work and to keep this project alive, but isn't required at all.

<a href="https://ko-fi.com/bellmano"><img src="img/bellmano-kofi.jpg" width="50%"></a>
