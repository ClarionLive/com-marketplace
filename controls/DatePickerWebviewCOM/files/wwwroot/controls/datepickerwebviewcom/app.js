(function () {
    'use strict';

    var selectedDate = new Date();
    var viewMonth = selectedDate.getMonth();
    var viewYear = selectedDate.getFullYear();

    var MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Parse MM/DD/YYYY string to Date
    function parseDate(str) {
        if (!str) return null;
        var parts = str.split('/');
        if (parts.length !== 3) return null;
        var m = parseInt(parts[0], 10);
        var d = parseInt(parts[1], 10);
        var y = parseInt(parts[2], 10);
        if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
        var date = new Date(y, m - 1, d);
        if (date.getMonth() !== m - 1) return null;
        return date;
    }

    // Format Date to MM/DD/YYYY
    function formatDate(date) {
        var mm = String(date.getMonth() + 1).padStart(2, '0');
        var dd = String(date.getDate()).padStart(2, '0');
        return mm + '/' + dd + '/' + date.getFullYear();
    }

    // Same calendar day?
    function sameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    // Populate month dropdown
    function buildMonthSelect() {
        var sel = document.getElementById('monthSelect');
        sel.innerHTML = '';
        for (var i = 0; i < 12; i++) {
            var opt = document.createElement('option');
            opt.value = i;
            opt.textContent = MONTHS[i];
            sel.appendChild(opt);
        }
    }

    // Populate year dropdown (20 years back, 20 years forward)
    function buildYearSelect() {
        var sel = document.getElementById('yearSelect');
        sel.innerHTML = '';
        var current = new Date().getFullYear();
        var minYear = current - 20;
        var maxYear = current + 20;
        for (var y = minYear; y <= maxYear; y++) {
            var opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            sel.appendChild(opt);
        }
    }

    function render() {
        // Update dropdowns to match view
        document.getElementById('monthSelect').value = viewMonth;
        document.getElementById('yearSelect').value = viewYear;

        var grid = document.getElementById('daysGrid');
        grid.innerHTML = '';

        var firstDow = new Date(viewYear, viewMonth, 1).getDay();
        var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        var daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
        var today = new Date();

        // Previous month filler days
        for (var p = firstDow - 1; p >= 0; p--) {
            var prevDay = daysInPrev - p;
            var el = document.createElement('div');
            el.className = 'day other-month';
            el.textContent = prevDay;
            grid.appendChild(el);
        }

        // Current month days
        for (var i = 1; i <= daysInMonth; i++) {
            var dayEl = document.createElement('div');
            dayEl.className = 'day';
            dayEl.textContent = i;

            var thisDate = new Date(viewYear, viewMonth, i);

            if (sameDay(thisDate, today)) {
                dayEl.classList.add('today');
            }

            if (sameDay(thisDate, selectedDate)) {
                dayEl.classList.add('selected');
            }

            (function (dayNum) {
                dayEl.addEventListener('click', function () {
                    selectedDate = new Date(viewYear, viewMonth, dayNum);
                    render();
                });
            })(i);

            grid.appendChild(dayEl);
        }

        // Next month filler days - always fill to 42 cells (6 rows)
        var totalCells = grid.children.length;
        var remaining = 42 - totalCells;
        for (var n = 1; n <= remaining; n++) {
            var nextEl = document.createElement('div');
            nextEl.className = 'day other-month';
            nextEl.textContent = n;
            grid.appendChild(nextEl);
        }
    }

    function selectAndNavigate(date) {
        selectedDate = date;
        viewMonth = date.getMonth();
        viewYear = date.getFullYear();
        render();
    }

    function submitSelection() {
        window.chrome.webview.postMessage(JSON.stringify({
            type: 'select',
            date: formatDate(selectedDate)
        }));
    }

    function cancelSelection() {
        window.chrome.webview.postMessage(JSON.stringify({
            type: 'cancel'
        }));
    }

    function bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', function () {
            viewMonth--;
            if (viewMonth < 0) { viewMonth = 11; viewYear--; }
            render();
        });

        document.getElementById('nextMonth').addEventListener('click', function () {
            viewMonth++;
            if (viewMonth > 11) { viewMonth = 0; viewYear++; }
            render();
        });

        // Month/year dropdown changes
        document.getElementById('monthSelect').addEventListener('change', function () {
            viewMonth = parseInt(this.value, 10);
            render();
        });

        document.getElementById('yearSelect').addEventListener('change', function () {
            viewYear = parseInt(this.value, 10);
            render();
        });

        document.getElementById('btnToday').addEventListener('click', function () {
            selectAndNavigate(new Date());
        });

        document.getElementById('btnWeek').addEventListener('click', function () {
            var d = new Date(selectedDate.getTime());
            d.setDate(d.getDate() + 7);
            selectAndNavigate(d);
        });

        document.getElementById('btnMonth').addEventListener('click', function () {
            var d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate());
            if (d.getMonth() > selectedDate.getMonth() + 1 ||
                (selectedDate.getMonth() === 11 && d.getMonth() > 0 && d.getFullYear() > selectedDate.getFullYear() + 1)) {
                d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 2, 0);
            }
            selectAndNavigate(d);
        });

        document.getElementById('btnYear').addEventListener('click', function () {
            var d = new Date(selectedDate.getFullYear() + 1, selectedDate.getMonth(), selectedDate.getDate());
            if (d.getMonth() !== selectedDate.getMonth()) {
                d = new Date(selectedDate.getFullYear() + 1, selectedDate.getMonth() + 1, 0);
            }
            selectAndNavigate(d);
        });

        document.getElementById('btnSelect').addEventListener('click', submitSelection);
        document.getElementById('btnCancel').addEventListener('click', cancelSelection);

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            // Don't intercept keys when a select dropdown is focused
            if (document.activeElement && document.activeElement.tagName === 'SELECT') return;

            var handled = true;
            switch (e.key) {
                case 'ArrowLeft':
                    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1);
                    break;
                case 'ArrowRight':
                    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
                    break;
                case 'ArrowUp':
                    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7);
                    break;
                case 'ArrowDown':
                    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7);
                    break;
                case 'Enter':
                    submitSelection();
                    return;
                case 'Escape':
                    cancelSelection();
                    return;
                default:
                    handled = false;
            }
            if (handled) {
                e.preventDefault();
                viewMonth = selectedDate.getMonth();
                viewYear = selectedDate.getFullYear();
                render();
            }
        });

        // Listen for Enter key confirmation from C#
        window.chrome.webview.addEventListener('message', function (e) {
            try {
                var msg = JSON.parse(e.data);
                if (msg.type === 'confirm') {
                    submitSelection();
                }
            } catch (ex) { }
        });
    }

    // Called by C# after navigation completes
    window.initCalendar = function (initialDateStr) {
        var parsed = parseDate(initialDateStr);
        if (parsed) {
            selectedDate = parsed;
        } else {
            selectedDate = new Date();
        }
        viewMonth = selectedDate.getMonth();
        viewYear = selectedDate.getFullYear();
        render();
    };

    // Build dropdowns, bind events, initial render
    buildMonthSelect();
    buildYearSelect();
    bindEvents();
    render();
})();
