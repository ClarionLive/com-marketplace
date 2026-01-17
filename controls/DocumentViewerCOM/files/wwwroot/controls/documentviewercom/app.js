// DocumentViewerCOM Control JavaScript
// Rich document viewer with printing, zoom, navigation, and search capabilities

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        controlName: 'DocumentViewerCOM',
        debug: false,
        zoomStep: 10,
        minZoom: 10,
        maxZoom: 500,
        defaultZoom: 100
    };

    // State
    let state = {
        zoomLevel: 100,
        currentPage: 1,
        totalPages: 1,
        searchText: '',
        searchMatches: [],
        currentMatchIndex: -1,
        documentLoaded: false,
        originalContent: ''
    };

    // DOM Elements
    let elements = {};

    /**
     * Initialize the document viewer
     */
    function init() {
        cacheElements();
        bindEvents();
        updateUI();
        notifyCSharp('ready', {});

        if (CONFIG.debug) {
            console.log('DocumentViewerCOM initialized');
        }
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements = {
            toolbar: document.getElementById('toolbar'),
            viewerContainer: document.getElementById('viewerContainer'),
            documentContent: document.getElementById('documentContent'),
            welcomeMessage: document.getElementById('welcomeMessage'),
            statusText: document.getElementById('statusText'),
            zoomStatus: document.getElementById('zoomStatus'),

            // Page navigation
            btnFirstPage: document.getElementById('btnFirstPage'),
            btnPrevPage: document.getElementById('btnPrevPage'),
            btnNextPage: document.getElementById('btnNextPage'),
            btnLastPage: document.getElementById('btnLastPage'),
            currentPageInput: document.getElementById('currentPageInput'),
            totalPagesSpan: document.getElementById('totalPages'),

            // Zoom
            btnZoomOut: document.getElementById('btnZoomOut'),
            btnZoomIn: document.getElementById('btnZoomIn'),
            zoomSelect: document.getElementById('zoomSelect'),

            // Search
            searchInput: document.getElementById('searchInput'),
            btnFindPrev: document.getElementById('btnFindPrev'),
            btnFindNext: document.getElementById('btnFindNext'),
            btnClearSearch: document.getElementById('btnClearSearch'),
            searchResults: document.getElementById('searchResults'),

            // Print
            btnPrint: document.getElementById('btnPrint')
        };
    }

    /**
     * Bind event handlers
     */
    function bindEvents() {
        // Page navigation
        elements.btnFirstPage.addEventListener('click', firstPage);
        elements.btnPrevPage.addEventListener('click', previousPage);
        elements.btnNextPage.addEventListener('click', nextPage);
        elements.btnLastPage.addEventListener('click', lastPage);
        elements.currentPageInput.addEventListener('change', onPageInputChange);
        elements.currentPageInput.addEventListener('keypress', onPageInputKeypress);

        // Zoom
        elements.btnZoomOut.addEventListener('click', zoomOut);
        elements.btnZoomIn.addEventListener('click', zoomIn);
        elements.zoomSelect.addEventListener('change', onZoomSelectChange);

        // Search
        elements.searchInput.addEventListener('input', onSearchInput);
        elements.searchInput.addEventListener('keypress', onSearchKeypress);
        elements.btnFindPrev.addEventListener('click', findPrevious);
        elements.btnFindNext.addEventListener('click', findNext);
        elements.btnClearSearch.addEventListener('click', clearSearch);

        // Print
        elements.btnPrint.addEventListener('click', print);

        // Keyboard shortcuts
        document.addEventListener('keydown', onKeyDown);

        // Scroll for page detection
        elements.viewerContainer.addEventListener('scroll', onScroll);
    }

    /**
     * Load HTML content
     */
    function loadHtml(htmlContent) {
        try {
            state.originalContent = htmlContent;
            state.documentLoaded = true;

            // Remove welcome message and set content
            if (elements.welcomeMessage) {
                elements.welcomeMessage.style.display = 'none';
            }

            elements.documentContent.innerHTML = htmlContent;

            // Calculate pages (simple estimation based on content height)
            calculatePages();

            // Reset zoom
            setZoom(100);

            // Clear any existing search
            clearSearch();

            setStatus('Document loaded');
            notifyCSharp('documentLoaded', {});

            if (CONFIG.debug) {
                console.log('HTML content loaded');
            }
        } catch (error) {
            setStatus('Error loading document');
            notifyCSharp('error', { message: error.message });
        }
    }

    /**
     * Calculate total pages based on content
     */
    function calculatePages() {
        // Simple page calculation based on viewport height
        const contentHeight = elements.documentContent.scrollHeight;
        const viewportHeight = elements.viewerContainer.clientHeight - 40; // Subtract padding

        if (viewportHeight > 0) {
            state.totalPages = Math.max(1, Math.ceil(contentHeight / viewportHeight));
        } else {
            state.totalPages = 1;
        }

        state.currentPage = 1;
        updatePageInfo();
    }

    /**
     * Handle scroll for page detection
     */
    function onScroll() {
        if (!state.documentLoaded) return;

        const scrollTop = elements.viewerContainer.scrollTop;
        const viewportHeight = elements.viewerContainer.clientHeight - 40;

        if (viewportHeight > 0) {
            const newPage = Math.floor(scrollTop / viewportHeight) + 1;
            if (newPage !== state.currentPage && newPage >= 1 && newPage <= state.totalPages) {
                state.currentPage = newPage;
                updatePageInfo();
                notifyPageChange();
            }
        }
    }

    // ==================== Zoom Functions ====================

    function setZoom(level) {
        level = Math.max(CONFIG.minZoom, Math.min(CONFIG.maxZoom, level));
        state.zoomLevel = level;

        const scale = level / 100;
        elements.documentContent.style.transform = `scale(${scale})`;
        elements.documentContent.style.width = `${100 / scale}%`;

        updateZoomUI();
        notifyZoomChange();
    }

    function zoomIn() {
        setZoom(state.zoomLevel + CONFIG.zoomStep);
    }

    function zoomOut() {
        setZoom(state.zoomLevel - CONFIG.zoomStep);
    }

    function zoomReset() {
        setZoom(100);
    }

    function fitToWidth() {
        const containerWidth = elements.viewerContainer.clientWidth - 60; // Subtract padding
        const contentWidth = elements.documentContent.scrollWidth;

        if (contentWidth > 0) {
            const scale = (containerWidth / contentWidth) * 100;
            setZoom(Math.floor(scale));
        }
    }

    function fitToPage() {
        const containerWidth = elements.viewerContainer.clientWidth - 60;
        const containerHeight = elements.viewerContainer.clientHeight - 60;
        const contentWidth = elements.documentContent.scrollWidth;
        const contentHeight = elements.documentContent.scrollHeight;

        if (contentWidth > 0 && contentHeight > 0) {
            const scaleX = containerWidth / contentWidth;
            const scaleY = containerHeight / contentHeight;
            const scale = Math.min(scaleX, scaleY) * 100;
            setZoom(Math.floor(scale));
        }
    }

    function onZoomSelectChange() {
        const value = elements.zoomSelect.value;

        if (value === 'fitWidth') {
            fitToWidth();
        } else if (value === 'fitPage') {
            fitToPage();
        } else {
            setZoom(parseInt(value, 10));
        }
    }

    function updateZoomUI() {
        elements.zoomStatus.textContent = state.zoomLevel + '%';

        // Update select if it matches a preset
        const options = elements.zoomSelect.options;
        let found = false;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === String(state.zoomLevel)) {
                elements.zoomSelect.selectedIndex = i;
                found = true;
                break;
            }
        }

        if (!found) {
            // Reset to 100% option display but keep actual zoom
            elements.zoomSelect.value = '100';
        }
    }

    // ==================== Page Navigation Functions ====================

    function goToPage(pageNumber) {
        pageNumber = Math.max(1, Math.min(state.totalPages, pageNumber));

        if (pageNumber !== state.currentPage) {
            state.currentPage = pageNumber;

            const viewportHeight = elements.viewerContainer.clientHeight - 40;
            elements.viewerContainer.scrollTop = (pageNumber - 1) * viewportHeight;

            updatePageInfo();
            notifyPageChange();
        }
    }

    function firstPage() {
        goToPage(1);
    }

    function lastPage() {
        goToPage(state.totalPages);
    }

    function nextPage() {
        goToPage(state.currentPage + 1);
    }

    function previousPage() {
        goToPage(state.currentPage - 1);
    }

    function onPageInputChange() {
        const page = parseInt(elements.currentPageInput.value, 10);
        if (!isNaN(page)) {
            goToPage(page);
        }
    }

    function onPageInputKeypress(e) {
        if (e.key === 'Enter') {
            onPageInputChange();
        }
    }

    function updatePageInfo() {
        elements.currentPageInput.value = state.currentPage;
        elements.totalPagesSpan.textContent = state.totalPages;

        // Update button states
        elements.btnFirstPage.disabled = state.currentPage <= 1;
        elements.btnPrevPage.disabled = state.currentPage <= 1;
        elements.btnNextPage.disabled = state.currentPage >= state.totalPages;
        elements.btnLastPage.disabled = state.currentPage >= state.totalPages;
    }

    // ==================== Search Functions ====================

    function search(text) {
        if (!text || !state.documentLoaded) {
            clearSearch();
            return;
        }

        state.searchText = text;
        elements.searchInput.value = text;

        // Remove existing highlights
        removeHighlights();

        // Find and highlight matches
        highlightMatches(text);

        if (state.searchMatches.length > 0) {
            state.currentMatchIndex = 0;
            scrollToMatch(0);
            updateSearchUI();
        } else {
            state.currentMatchIndex = -1;
            updateSearchUI();
        }

        notifySearchResults();
    }

    function highlightMatches(text) {
        state.searchMatches = [];

        const walker = document.createTreeWalker(
            elements.documentContent,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.toLowerCase().includes(text.toLowerCase())) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(textNode => {
            const content = textNode.nodeValue;
            const lowerContent = content.toLowerCase();
            const lowerSearch = text.toLowerCase();

            let lastIndex = 0;
            let index;
            const fragments = [];

            while ((index = lowerContent.indexOf(lowerSearch, lastIndex)) !== -1) {
                if (index > lastIndex) {
                    fragments.push(document.createTextNode(content.substring(lastIndex, index)));
                }

                const highlight = document.createElement('span');
                highlight.className = 'search-highlight';
                highlight.textContent = content.substring(index, index + text.length);
                fragments.push(highlight);
                state.searchMatches.push(highlight);

                lastIndex = index + text.length;
            }

            if (lastIndex < content.length) {
                fragments.push(document.createTextNode(content.substring(lastIndex)));
            }

            if (fragments.length > 0) {
                const parent = textNode.parentNode;
                fragments.forEach(fragment => {
                    parent.insertBefore(fragment, textNode);
                });
                parent.removeChild(textNode);
            }
        });
    }

    function removeHighlights() {
        const highlights = elements.documentContent.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
        state.searchMatches = [];
    }

    function findNext() {
        if (state.searchMatches.length === 0) return;

        state.currentMatchIndex = (state.currentMatchIndex + 1) % state.searchMatches.length;
        scrollToMatch(state.currentMatchIndex);
        updateSearchUI();
        notifySearchResults();
    }

    function findPrevious() {
        if (state.searchMatches.length === 0) return;

        state.currentMatchIndex = (state.currentMatchIndex - 1 + state.searchMatches.length) % state.searchMatches.length;
        scrollToMatch(state.currentMatchIndex);
        updateSearchUI();
        notifySearchResults();
    }

    function scrollToMatch(index) {
        // Remove current highlight from all
        state.searchMatches.forEach(match => {
            match.classList.remove('current');
        });

        if (index >= 0 && index < state.searchMatches.length) {
            const match = state.searchMatches[index];
            match.classList.add('current');
            match.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function clearSearch() {
        state.searchText = '';
        state.currentMatchIndex = -1;
        elements.searchInput.value = '';
        removeHighlights();
        updateSearchUI();
        notifySearchResults();
    }

    function onSearchInput() {
        const text = elements.searchInput.value.trim();
        if (text.length >= 2) {
            search(text);
        } else if (text.length === 0) {
            clearSearch();
        }
    }

    function onSearchKeypress(e) {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                findPrevious();
            } else {
                findNext();
            }
        }
    }

    function updateSearchUI() {
        if (state.searchMatches.length > 0) {
            elements.searchResults.textContent = `${state.currentMatchIndex + 1} / ${state.searchMatches.length}`;
        } else if (state.searchText) {
            elements.searchResults.textContent = 'No matches';
        } else {
            elements.searchResults.textContent = '';
        }
    }

    // ==================== Print Functions ====================

    function print() {
        notifyCSharp('printStarted', {});
        window.print();
        notifyCSharp('printCompleted', { success: true });
    }

    function printPreview() {
        // WebView2 doesn't have a native print preview, use regular print
        print();
    }

    // ==================== Keyboard Shortcuts ====================

    function onKeyDown(e) {
        // Ctrl+F: Focus search
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
            elements.searchInput.select();
        }

        // Ctrl+P: Print
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            print();
        }

        // Ctrl+0: Reset zoom
        if (e.ctrlKey && e.key === '0') {
            e.preventDefault();
            zoomReset();
        }

        // Ctrl++: Zoom in
        if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            zoomIn();
        }

        // Ctrl+-: Zoom out
        if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            zoomOut();
        }

        // F3 or Enter in search: Find next
        if (e.key === 'F3') {
            e.preventDefault();
            if (e.shiftKey) {
                findPrevious();
            } else {
                findNext();
            }
        }

        // Escape: Clear search
        if (e.key === 'Escape') {
            if (state.searchText) {
                clearSearch();
            }
        }

        // Page Up/Down
        if (e.key === 'PageUp') {
            e.preventDefault();
            previousPage();
        }
        if (e.key === 'PageDown') {
            e.preventDefault();
            nextPage();
        }

        // Home/End with Ctrl
        if (e.ctrlKey && e.key === 'Home') {
            e.preventDefault();
            firstPage();
        }
        if (e.ctrlKey && e.key === 'End') {
            e.preventDefault();
            lastPage();
        }
    }

    // ==================== Notification Functions ====================

    function notifyCSharp(type, data) {
        if (typeof chrome !== 'undefined' && chrome.webview) {
            try {
                const message = JSON.stringify({ type: type, ...data });
                chrome.webview.postMessage(message);
            } catch (error) {
                if (CONFIG.debug) {
                    console.error('Error sending message to C#:', error);
                }
            }
        }
    }

    function notifyZoomChange() {
        notifyCSharp('zoomChanged', { zoomLevel: state.zoomLevel });

        // Also try host object
        if (typeof chrome !== 'undefined' && chrome.webview && chrome.webview.hostObjects) {
            try {
                chrome.webview.hostObjects.sync.DocumentViewerCOMHost.NotifyZoomChange(state.zoomLevel);
            } catch (e) {}
        }
    }

    function notifyPageChange() {
        notifyCSharp('pageChanged', {
            currentPage: state.currentPage,
            totalPages: state.totalPages
        });

        if (typeof chrome !== 'undefined' && chrome.webview && chrome.webview.hostObjects) {
            try {
                chrome.webview.hostObjects.sync.DocumentViewerCOMHost.NotifyPageChange(state.currentPage, state.totalPages);
            } catch (e) {}
        }
    }

    function notifySearchResults() {
        notifyCSharp('searchResults', {
            matchCount: state.searchMatches.length,
            currentMatch: state.currentMatchIndex + 1
        });

        if (typeof chrome !== 'undefined' && chrome.webview && chrome.webview.hostObjects) {
            try {
                chrome.webview.hostObjects.sync.DocumentViewerCOMHost.NotifySearchResults(
                    state.searchMatches.length,
                    state.currentMatchIndex + 1
                );
            } catch (e) {}
        }
    }

    // ==================== UI Updates ====================

    function updateUI() {
        updatePageInfo();
        updateZoomUI();
        updateSearchUI();
    }

    function setStatus(text) {
        elements.statusText.textContent = text;
    }

    // ==================== Public API ====================

    window.documentViewer = {
        // Content loading
        loadHtml: loadHtml,

        // Zoom
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        zoomReset: zoomReset,
        setZoom: setZoom,
        fitToWidth: fitToWidth,
        fitToPage: fitToPage,

        // Page navigation
        goToPage: goToPage,
        firstPage: firstPage,
        lastPage: lastPage,
        nextPage: nextPage,
        previousPage: previousPage,

        // Search
        search: search,
        findNext: findNext,
        findPrevious: findPrevious,
        clearSearch: clearSearch,

        // Print
        print: print,
        printPreview: printPreview,

        // State
        getState: function() {
            return { ...state };
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
