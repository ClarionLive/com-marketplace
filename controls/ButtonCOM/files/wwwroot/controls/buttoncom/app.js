// ButtonCOM - Styled Button Control
// JavaScript for WebView2 COM control

(function() {
    'use strict';

    // Get the button element
    const button = document.getElementById('mainButton');

    // Current configuration
    let config = {
        text: 'Click Me',
        backgroundColor: '#3498db',
        textColor: '#ffffff',
        hoverColor: '#2980b9',
        fontSize: 16,
        fontFamily: 'Segoe UI, Arial, sans-serif',
        borderRadius: 8,
        enabled: true
    };

    // Get reference to C# host object
    let hostObject = null;

    async function getHostObject() {
        if (hostObject) return hostObject;

        try {
            if (window.chrome && window.chrome.webview && window.chrome.webview.hostObjects) {
                hostObject = window.chrome.webview.hostObjects.sync.ButtonCOMHost;
            }
        } catch (e) {
            console.error('Failed to get host object:', e);
        }

        return hostObject;
    }

    // Update button appearance from config
    function updateButton(newConfig) {
        if (newConfig) {
            config = { ...config, ...newConfig };
        }

        button.textContent = config.text;
        button.style.backgroundColor = config.backgroundColor;
        button.style.color = config.textColor;
        button.style.fontSize = config.fontSize + 'px';
        button.style.fontFamily = config.fontFamily;
        button.style.borderRadius = config.borderRadius + 'px';
        button.disabled = !config.enabled;

        // Update CSS custom property for hover color
        button.style.setProperty('--hover-color', config.hoverColor);

        // Update hover styles dynamically
        updateHoverStyles();
    }

    // Create/update hover styles dynamically
    function updateHoverStyles() {
        let styleElement = document.getElementById('dynamic-hover-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-hover-styles';
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            .styled-button:hover:not(:disabled) {
                background-color: ${config.hoverColor} !important;
            }
        `;
    }

    // Event handlers
    button.addEventListener('click', async function(e) {
        if (!config.enabled) return;

        try {
            const host = await getHostObject();
            if (host) {
                host.OnButtonClick();
            }
        } catch (e) {
            // Fallback: send via postMessage
            window.chrome.webview.postMessage(JSON.stringify({ type: 'click' }));
        }
    });

    button.addEventListener('mouseenter', async function(e) {
        try {
            const host = await getHostObject();
            if (host) {
                host.OnMouseEnter();
            }
        } catch (e) {
            window.chrome.webview.postMessage(JSON.stringify({ type: 'mouseenter' }));
        }
    });

    button.addEventListener('mouseleave', async function(e) {
        try {
            const host = await getHostObject();
            if (host) {
                host.OnMouseLeave();
            }
        } catch (e) {
            window.chrome.webview.postMessage(JSON.stringify({ type: 'mouseleave' }));
        }
    });

    // Expose updateButton globally for C# to call
    window.updateButton = updateButton;

    // Notify C# that the page is ready
    document.addEventListener('DOMContentLoaded', function() {
        try {
            if (window.chrome && window.chrome.webview) {
                window.chrome.webview.postMessage(JSON.stringify({ type: 'ready' }));
            }
        } catch (e) {
            console.error('Failed to send ready message:', e);
        }
    });

    // Initialize with default styles
    updateButton(config);

})();
