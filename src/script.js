document.getElementById('badgeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generateBadge();
});

function generateBadge() {
    const umamiUrl = document.getElementById('umamiUrl').value;
    const websiteId = document.getElementById('websiteId').value;
    const metric = document.getElementById('metric').value;
    const token = document.getElementById('token').value;
    const style = document.getElementById('style').value;
    const color = document.getElementById('color').value;
    const label = document.getElementById('label').value;

    if (!umamiUrl || !websiteId) {
        alert('Please fill in the required fields (Umami URL and Website ID)');
        return;
    }

    // Build the badge URL
    const params = new URLSearchParams();
    params.append('website', websiteId);
    params.append('umami_url', umamiUrl);
    if (token) params.append('token', token);
    if (style) params.append('style', style);
    if (color) params.append('color', color);
    if (label) params.append('label', label);

    const badgeUrl = `${window.location.origin}/api/${metric}?${params.toString()}`;
    
    // Update preview and code
    document.getElementById('badgePreview').src = badgeUrl;
    document.getElementById('directUrl').value = badgeUrl;
    document.getElementById('markdownCode').value = `![${label || getDefaultLabel(metric)}](${badgeUrl})`;
    document.getElementById('htmlCode').value = `<img src="${badgeUrl}" alt="${label || getDefaultLabel(metric)}">`;
    
    // Show result section
    document.getElementById('resultSection').classList.remove('hidden');
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

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

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    element.setSelectionRange(0, 99999);
    document.execCommand('copy');
    
    // Show feedback
    const button = element.nextElementSibling;
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check text-green-500"></i>';
    setTimeout(() => {
        button.innerHTML = originalIcon;
    }, 1000);
}

// Update metric-based auto-suggestions
document.getElementById('metric').addEventListener('change', function() {
    const metric = this.value;
    const colorSelect = document.getElementById('color');
    const labelInput = document.getElementById('label');
    
    // Auto-suggest labels
    if (!labelInput.value) {
        labelInput.placeholder = getDefaultLabel(metric);
    }
    
    // Reset color to auto when metric changes
    colorSelect.value = '';
});

// Theme switching functionality
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Function to update the icon based on theme
function updateThemeIcon(theme) {
    // Clear the button content
    themeToggle.innerHTML = '';
    
    // Create the appropriate icon
    const icon = document.createElement('i');
    
    // Use moon icon for light mode (to switch to dark) and sun icon for dark mode (to switch to light)
    if (theme === 'light') {
        icon.className = 'fas fa-moon'; // Moon icon for switching to dark mode
    } else {
        icon.className = 'fas fa-sun';  // Sun icon for switching to light mode
    }
    
    // Add the icon to the button
    themeToggle.appendChild(icon);
}

// Function to toggle theme
function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update the theme
    htmlElement.setAttribute('data-theme', newTheme);
    
    // Update the icon
    updateThemeIcon(newTheme);
    
    // Store the theme preference in localStorage
    localStorage.setItem('theme', newTheme);
}

// Add event listener to the theme toggle button
themeToggle.addEventListener('click', toggleTheme);

// Check for saved theme preference or use default
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
} else {
    // Set initial icon based on the default theme in HTML
    const initialTheme = htmlElement.getAttribute('data-theme');
    updateThemeIcon(initialTheme);
}