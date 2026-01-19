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

// Function to update the icon based on theme
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    themeToggle.innerHTML = '';

    const icon = document.createElement('i');

    // Moon icon in light mode (switch to dark), sun icon in dark mode (switch to light)
    if (theme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }

    themeToggle.appendChild(icon);
}

// Function to toggle theme
function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlElement.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
    localStorage.setItem('theme', newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    const badgeForm = document.getElementById('badgeForm');
    if (badgeForm) {
        badgeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateBadge();
        });
    }

    const metricSelect = document.getElementById('metric');
    if (metricSelect) {
        metricSelect.addEventListener('change', function() {
            const metric = this.value;
            const colorSelect = document.getElementById('color');
            const labelInput = document.getElementById('label');

            if (labelInput && !labelInput.value) {
                labelInput.placeholder = getDefaultLabel(metric);
            }

            if (colorSelect) {
                colorSelect.value = '';
            }
        });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        updateThemeIcon(htmlElement.getAttribute('data-theme'));
    }
});