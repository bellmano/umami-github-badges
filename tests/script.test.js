// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock globalThis.location.origin
Object.defineProperty(globalThis, 'location', {
  value: { origin: 'http://localhost:3000' },
  writable: true
});

// Load the script
require('../src/script.js');

describe('Badge Generator', () => {
  let container, localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    global.alert = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
    navigator.clipboard.writeText.mockClear();

    // Create DOM
    container = document.createElement('div');
    container.innerHTML = `
      <form id="badgeForm">
        <input type="text" id="websiteId" value="" />
        <input type="text" id="token" value="" />
        <select id="metric">
          <option value="views">Views</option>
          <option value="visitors">Visitors</option>
          <option value="visits">Visits</option>
          <option value="bounce-rate">Bounce Rate</option>
          <option value="avg-session">Avg Session</option>
        </select>
        <select id="style"><option value="">Auto</option><option value="for-the-badge">For the Badge</option></select>
        <select id="color"><option value="">Auto</option><option value="green">Green</option></select>
        <input type="text" id="label" value="" />
        <select id="range"><option value="">All</option><option value="30d">30d</option></select>
      </form>
      <div id="resultSection" class="hidden">
        <img id="badgePreview" src="" />
        <input type="text" id="directUrl" value="" />
        <button><i class="fas fa-copy"></i></button>
        <input type="text" id="markdownCode" value="" />
        <button><i class="fas fa-copy"></i></button>
        <input type="text" id="htmlCode" value="" />
      </div>
      <button id="theme-toggle"></button>
      <div class="tooltip-trigger" data-tooltip="test1"></div>
      <div class="tooltip-popup active" id="tooltip-test1">
        <button class="tooltip-close">X</button>
      </div>
      <div class="tooltip-trigger" data-tooltip="test2"></div>
      <div class="tooltip-popup" id="tooltip-test2">
        <button class="tooltip-close">X</button>
      </div>
    `;
    document.body.appendChild(container);
    
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test('validates required fields and generates badge with all parameter combinations', () => {
    const form = document.getElementById('badgeForm');
    
    // Test validation - missing websiteId
    form.dispatchEvent(new Event('submit'));
    expect(global.alert).toHaveBeenCalledWith('Please fill in the required fields: (Website ID and API Key)');
    
    // Test validation - missing token
    global.alert.mockClear();
    document.getElementById('websiteId').value = 'test-id';
    form.dispatchEvent(new Event('submit'));
    expect(global.alert).toHaveBeenCalledWith('Please fill in the required fields: (Website ID and API Key)');
    
    // Test minimal badge (no optional params - range, style, color, label empty)
    document.getElementById('token').value = 'test-token';
    document.getElementById('metric').value = 'views';
    form.dispatchEvent(new Event('submit'));
    
    let url = document.getElementById('directUrl').value;
    expect(url).toContain('/api/views');
    expect(url).toContain('website=test-id');
    expect(url).toContain('token=test-token');
    expect(url).not.toContain('range=');
    expect(url).not.toContain('style=');
    expect(url).not.toContain('color=');
    expect(url).not.toContain('label=');
    
    // Test with all params
    document.getElementById('style').value = 'for-the-badge';
    document.getElementById('color').value = 'green';
    document.getElementById('label').value = 'Custom';
    document.getElementById('range').value = '30d';
    form.dispatchEvent(new Event('submit'));
    
    url = document.getElementById('directUrl').value;
    expect(url).toContain('style=for-the-badge');
    expect(url).toContain('color=green');
    expect(url).toContain('label=Custom');
    expect(url).toContain('range=30d');
    
    // Test result display
    expect(document.getElementById('resultSection').classList.contains('hidden')).toBe(false);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(document.getElementById('badgePreview').src).toContain('/api/views');
    expect(document.getElementById('markdownCode').value).toContain('![Custom]');
    expect(document.getElementById('htmlCode').value).toContain('<img src=');
  });

  test('uses default labels for all metrics and handles unknown metrics', () => {
    const form = document.getElementById('badgeForm');
    document.getElementById('websiteId').value = 'test-id';
    document.getElementById('token').value = 'test-token';
    
    // Test all metric default labels
    const metrics = [
      { value: 'views', label: 'Views' },
      { value: 'visitors', label: 'Visitors' },
      { value: 'visits', label: 'Visits' },
      { value: 'bounce-rate', label: 'Bounce Rate' },
      { value: 'avg-session', label: 'Avg Session' }
    ];
    
    metrics.forEach(({ value, label }) => {
      document.getElementById('metric').value = value;
      form.dispatchEvent(new Event('submit'));
      expect(document.getElementById('markdownCode').value).toContain(`![${label}]`);
      expect(document.getElementById('htmlCode').value).toContain(`alt="${label}"`);
    });
    
    // Test getDefaultLabel directly for unknown metric (returns the metric itself)
    expect(globalThis.getDefaultLabel('unknown-metric')).toBe('unknown-metric');
  });

  test('copies to clipboard with visual feedback and handles errors', async () => {
    // Setup: generate a badge first
    document.getElementById('websiteId').value = 'test-id';
    document.getElementById('token').value = 'test-token';
    document.getElementById('badgeForm').dispatchEvent(new Event('submit'));
    
    const directUrl = document.getElementById('directUrl');
    const button = directUrl.nextElementSibling;
    const originalIcon = button.innerHTML;
    
    jest.useFakeTimers();
    
    // Call the actual copyToClipboard function
    globalThis.copyToClipboard('directUrl');
    
    await Promise.resolve();
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(directUrl.value);
    expect(button.innerHTML).toContain('fa-check');
    
    jest.advanceTimersByTime(1000);
    expect(button.innerHTML).toBe(originalIcon);
    
    jest.useRealTimers();
    
    // Test error handling
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Copy failed'));
    
    globalThis.copyToClipboard('directUrl');
    
    await Promise.resolve();
    await Promise.resolve();
    
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test('toggles theme between light and dark with icon updates', () => {
    const toggle = document.getElementById('theme-toggle');
    document.documentElement.dataset.theme = 'light';
    
    // Trigger DOMContentLoaded to set initial icon
    document.body.removeChild(container);
    container = document.createElement('div');
    container.innerHTML = '<button id="theme-toggle"></button>';
    document.body.appendChild(container);
    document.documentElement.dataset.theme = 'light';
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const toggleBtn = document.getElementById('theme-toggle');
    expect(toggleBtn.querySelector('i').className).toContain('fa-moon');
    
    // Test toggle to dark
    toggleBtn.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(toggleBtn.querySelector('i').className).toContain('fa-sun');
    
    // Test toggle back to light
    toggleBtn.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(toggleBtn.querySelector('i').className).toContain('fa-moon');
  });

  test('loads saved theme on init and handles missing theme and missing element', () => {
    // Test with saved theme
    document.body.removeChild(container);
    localStorageMock.getItem.mockReturnValue('dark');
    
    container = document.createElement('div');
    container.innerHTML = '<button id="theme-toggle"></button>';
    document.body.appendChild(container);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.getElementById('theme-toggle').querySelector('i').className).toContain('fa-sun');
    
    // Test with no saved theme (uses current theme)
    document.body.removeChild(container);
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.dataset.theme = 'light';
    
    container = document.createElement('div');
    container.innerHTML = '<button id="theme-toggle"></button>';
    document.body.appendChild(container);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    expect(document.getElementById('theme-toggle').querySelector('i')).toBeTruthy();
    
    // Test updateThemeIcon when theme-toggle doesn't exist (returns early)
    document.body.removeChild(container);
    container = document.createElement('div');
    container.innerHTML = '<div></div>'; // No theme-toggle
    document.body.appendChild(container);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    // Should not throw error
  });

  test('updates placeholder and resets color on metric change with all conditions', () => {
    const metricSelect = document.getElementById('metric');
    const labelInput = document.getElementById('label');
    const colorSelect = document.getElementById('color');
    
    // Test placeholder update when label is empty
    labelInput.value = '';
    colorSelect.value = 'green';
    metricSelect.value = 'visitors';
    metricSelect.dispatchEvent(new Event('change'));
    
    expect(labelInput.placeholder).toBe('Visitors');
    expect(colorSelect.value).toBe('');
    
    // Test doesn't update placeholder if label has value
    labelInput.value = 'My Label';
    colorSelect.value = 'green';
    metricSelect.value = 'bounce-rate';
    metricSelect.dispatchEvent(new Event('change'));
    expect(labelInput.placeholder).toBe('Visitors'); // Shouldn't change
    expect(colorSelect.value).toBe(''); // But still resets color
  });

  test('handles all tooltip interactions and edge cases', () => {
    const trigger1 = container.querySelector('[data-tooltip="test1"]');
    const trigger2 = container.querySelector('[data-tooltip="test2"]');
    const tooltip1 = document.getElementById('tooltip-test1');
    const tooltip2 = document.getElementById('tooltip-test2');
    const closeButton1 = tooltip1.querySelector('.tooltip-close');
    const closeButton2 = tooltip2.querySelector('.tooltip-close');
    
    // Test clicking trigger closes other tooltips
    expect(tooltip1.classList.contains('active')).toBe(true);
    trigger2.click();
    expect(tooltip1.classList.contains('active')).toBe(false);
    expect(tooltip2.classList.contains('active')).toBe(true);
    
    // Test toggling same trigger (close and open)
    trigger2.click();
    expect(tooltip2.classList.contains('active')).toBe(false);
    trigger2.click();
    expect(tooltip2.classList.contains('active')).toBe(true);
    
    // Test close button
    closeButton2.click();
    expect(tooltip2.classList.contains('active')).toBe(false);
    
    // Test clicking inside tooltip popup doesn't close it
    trigger1.click();
    expect(tooltip1.classList.contains('active')).toBe(true);
    tooltip1.click();
    expect(tooltip1.classList.contains('active')).toBe(true);
    
    // Test clicking close button inside tooltip
    closeButton1.click();
    expect(tooltip1.classList.contains('active')).toBe(false);
    
    // Test clicking outside closes all tooltips
    trigger1.click();
    trigger2.click();
    expect(tooltip2.classList.contains('active')).toBe(true);
    document.body.click();
    expect(tooltip1.classList.contains('active')).toBe(false);
    expect(tooltip2.classList.contains('active')).toBe(false);
  });

  test('handles DOMContentLoaded when elements do not exist', () => {
    // Remove container and create one without form or metric select
    document.body.removeChild(container);
    container = document.createElement('div');
    container.innerHTML = '<div></div>'; // No form, metric, or theme-toggle
    document.body.appendChild(container);
    
    // Should not throw errors
    expect(() => {
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }).not.toThrow();
  });

  test('covers edge cases: labelInput with value and colorSelect without labelInput', () => {
    // Test metric change when labelInput already has a value (line 116 branch)
    document.body.removeChild(container);
    container = document.createElement('div');
    container.innerHTML = `
      <select id="metric">
        <option value="views">Views</option>
        <option value="visitors">Visitors</option>
      </select>
      <input type="text" id="label" value="Pre-filled" />
      <select id="color"><option value="">Auto</option><option value="green">Green</option></select>
    `;
    document.body.appendChild(container);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const metricSelect = document.getElementById('metric');
    const labelInput = document.getElementById('label');
    const colorSelect = document.getElementById('color');
    
    // labelInput has value, so placeholder should not be updated (covers line 116)
    expect(labelInput.value).toBe('Pre-filled');
    colorSelect.value = 'green';
    metricSelect.value = 'visitors';
    metricSelect.dispatchEvent(new Event('change'));
    
    // Placeholder should not have been set because labelInput.value exists
    expect(labelInput.placeholder).toBe('');
    expect(colorSelect.value).toBe(''); // But color still resets
    
    // Test when colorSelect doesn't exist
    document.body.removeChild(container);
    container = document.createElement('div');
    container.innerHTML = `
      <select id="metric">
        <option value="views">Views</option>
      </select>
      <input type="text" id="label" value="" />
    `;
    document.body.appendChild(container);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const metricSelect2 = document.getElementById('metric');
    metricSelect2.dispatchEvent(new Event('change'));
    // Should not throw error even though colorSelect doesn't exist
  });
});