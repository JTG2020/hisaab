(function () {
  'use strict';

  var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function localDateString(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function readRoute() {
    var search = '';
    try {
      search = window.location.search || '';
    } catch (err) {
      search = '';
    }

    var params = null;
    try {
      params = new URLSearchParams(search);
    } catch (err) {
      params = null;
    }

    var todayParam = params ? params.get('today') : null;
    var today = todayParam && ISO_DATE.test(todayParam) ? todayParam : localDateString(new Date());

    var customerPhone = null;
    if (params && params.has('customer')) {
      customerPhone = (params.get('customer') || '').trim();
    }

    return { today: today, customerPhone: customerPhone };
  }

  var STATE = readRoute();

  function byId(id) {
    return document.getElementById(id);
  }

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (typeof text === 'string') {
      element.textContent = text;
    }
    return element;
  }

  function renderCustomerView(phone) {
    var main = document.querySelector('main.wrap');
    if (!main || byId('customer-view')) {
      return;
    }

    var section = makeElement('section', 'card customer-view');
    section.id = 'customer-view';
    section.setAttribute('aria-labelledby', 'cust-view-title');

    var heading = makeElement('h2', 'section-title', 'Customer');
    heading.id = 'cust-view-title';

    var name = makeElement('p', 'cust-name', 'Customer not found');
    name.id = 'cust-name';

    var phoneLine = makeElement('p', 'muted small', 'Phone: ' + phone);

    var balanceLabel = makeElement('p', 'label', 'Balance (Rs)');

    var balanceRow = makeElement('div', 'total-row');
    var balance = makeElement('div', 'total', '0');
    balance.id = 'cust-balance';
    balance.setAttribute('data-balance', '0');
    var balanceHuman = makeElement('span', 'human', 'Rs 0');
    balanceRow.appendChild(balance);
    balanceRow.appendChild(balanceHuman);

    var entriesTitle = makeElement('h3', 'sub-title', 'Entries');
    var entries = makeElement('ul', 'entries');
    entries.id = 'entries';

    var entriesEmpty = makeElement('p', 'empty', 'No entries yet.');

    var back = makeElement('a', 'btn ghost', '\u2190 All customers');
    back.href = './';

    section.appendChild(heading);
    section.appendChild(name);
    section.appendChild(phoneLine);
    section.appendChild(balanceLabel);
    section.appendChild(balanceRow);
    section.appendChild(entriesTitle);
    section.appendChild(entries);
    section.appendChild(entriesEmpty);
    section.appendChild(back);

    main.insertBefore(section, main.firstChild);
  }

  if (STATE.customerPhone !== null) {
    renderCustomerView(STATE.customerPhone);
  }

  var forms = document.querySelectorAll('form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function (event) {
      event.preventDefault();
    });
  }

  var inertButtonIds = ['add-customer', 'import-go', 'export-csv'];
  for (var j = 0; j < inertButtonIds.length; j++) {
    var button = byId(inertButtonIds[j]);
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
      });
    }
  }
})();
