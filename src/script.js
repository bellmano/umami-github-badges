function generateBadge() {
    const websiteId = document.getElementById('websiteId').value;
    const metric = document.getElementById('metric').value;
    const token = document.getElementById('token').value;
    const style = document.getElementById('style').value;
    const color = document.getElementById('color').value;
    const label = document.getElementById('label').value;
    const range = document.getElementById('range').value;

    if (!websiteId || !token) {
        alert('Please fill in the required fields: (Website ID and API Key)');
        return;
    }

    // Build the badge URL
    const params = new URLSearchParams();
    params.append('website', websiteId);
    params.append('token', token);
    if (range) params.append('range', range);
    if (style) params.append('style', style);
    if (color) params.append('color', color);
    if (label) params.append('label', label);

    const badgeUrl = `${globalThis.location.origin}/api/${metric}?${params.toString()}`;
    
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
        'visits': 'Visits',
        'bounce-rate': 'Bounce Rate',
        'avg-session': 'Avg Session'
    };
    return labels[metric] || metric;
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.value;
    
    // Use modern Clipboard API
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const button = element.nextElementSibling;
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check text-green-500"></i>';
        setTimeout(() => {
            button.innerHTML = originalIcon;
        }, 1000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
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
    const currentTheme = htmlElement.dataset.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlElement.dataset.theme = newTheme;
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
        htmlElement.dataset.theme = savedTheme;
        updateThemeIcon(savedTheme);
    } else {
        updateThemeIcon(htmlElement.dataset.theme);
    }

    // Tooltip functionality
    const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tooltipId = 'tooltip-' + this.dataset.tooltip;
            const tooltip = document.getElementById(tooltipId);
            
            // Close all other tooltips
            document.querySelectorAll('.tooltip-popup.active').forEach(t => {
                if (t.id !== tooltipId) {
                    t.classList.remove('active');
                }
            });
            
            // Toggle this tooltip
            tooltip.classList.toggle('active');
        });
    });

    // Close tooltips when clicking close button
    document.querySelectorAll('.tooltip-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.closest('.tooltip-popup').classList.remove('active');
        });
    });

    // Close tooltips when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.tooltip-trigger') && !e.target.closest('.tooltip-popup')) {
            document.querySelectorAll('.tooltip-popup.active').forEach(tooltip => {
                tooltip.classList.remove('active');
            });
        }
    });
});

// Export functions for testing (globalThis is always available in modern environments)
globalThis.copyToClipboard = copyToClipboard;
globalThis.generateBadge = generateBadge;
globalThis.getDefaultLabel = getDefaultLabel;