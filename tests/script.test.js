// Mock DOM elements
document.body.innerHTML = `
  <form id="badgeForm">
    <input id="umamiUrl" value="https://umami.example.com" />
    <input id="websiteId" value="website123" />
    <select id="metric"><option value="views">Views</option></select>
    <input id="token" value="token" />
    <select id="style"><option value="flat">Flat</option></select>
    <input id="color" value="blue" />
    <input id="label" value="Test Label" />
    <img id="badgePreview" />
    <input id="directUrl" />
    <textarea id="markdownCode"></textarea>
    <textarea id="htmlCode"></textarea>
    <div id="resultSection" class="hidden"></div>
  </form>
  <button id="theme-toggle"></button>
`;

// Mock window.location
delete window.location;
window.location = { origin: 'http://localhost:3000' };

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock alert
global.alert = jest.fn();

// Load the script after DOM setup
require('../src/script.js');

describe('Script Functions', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getDefaultLabel', () => {
    it.skip('should return correct default labels', () => {
      expect(global.getDefaultLabel('views')).toBe('Views');
      expect(global.getDefaultLabel('visitors')).toBe('Visitors');
      expect(global.getDefaultLabel('unknown')).toBe('unknown');
    });
  });

  describe('generateBadge', () => {
    it.skip('should generate badge URL and update DOM', () => {
      // Call generateBadge
      global.generateBadge();

      expect(document.getElementById('badgePreview').src).toContain('http://localhost:3000/api/views');
      expect(document.getElementById('directUrl').value).toContain('http://localhost:3000/api/views');
      expect(document.getElementById('markdownCode').value).toContain('![Test Label]');
      expect(document.getElementById('htmlCode').value).toContain('<img src="');
      expect(document.getElementById('resultSection').classList.contains('hidden')).toBe(false);
    });

    it.skip('should alert if required fields are missing', () => {
      document.getElementById('umamiUrl').value = '';
      global.generateBadge();

      expect(global.alert).toHaveBeenCalledWith('Please fill in the required fields: (Umami URL and Website ID)');
    });
  });

  describe('copyToClipboard', () => {
    it.skip('should copy text to clipboard', () => {
      document.getElementById('directUrl').value = 'test url';
      const selectSpy = jest.spyOn(document.getElementById('directUrl'), 'select');
      const setSelectionRangeSpy = jest.spyOn(document.getElementById('directUrl'), 'setSelectionRange');
      const execCommandSpy = jest.spyOn(document, 'execCommand');

      global.copyToClipboard('directUrl');

      expect(selectSpy).toHaveBeenCalled();
      expect(setSelectionRangeSpy).toHaveBeenCalledWith(0, 99999);
      expect(execCommandSpy).toHaveBeenCalledWith('copy');
    });
  });

  describe('Theme Toggle', () => {
    it.skip('should toggle theme', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      global.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      global.toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});