(function () {
  'use strict';

  var STORAGE_KEY = 'hisaab.v1';
  var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  var MAX_PAISE = 9000000000000000;
  var MAX_RUPEES = 90000000000000;
  var WA_PREFIX = 'https://wa.me/91';

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function localDateString(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

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

  function normalizeName(value) {
    var text = value === null || value === undefined ? '' : String(value);
    try {
      text = text.normalize('NFC');
    } catch (error) {
      text = String(value === null || value === undefined ? '' : value);
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  function normalizePhoneDigits(value) {
    var text = value === null || value === undefined ? '' : String(value);
    text = text.replace(/[\s-]+/g, '');
    return /^\d{10}$/.test(text) ? text : null;
  }

  function normalizeRoutePhone(value) {
    var raw = value === null || value === undefined ? '' : String(value).trim();
    if (!raw) {
      return null;
    }
    var digits = raw.replace(/[^0-9]/g, '');
    if (digits.length === 12 && digits.slice(0, 2) === '91') {
      digits = digits.slice(2);
    }
    return digits || raw;
  }

  function isIsoShaped(value) {
    return typeof value === 'string' && ISO_DATE.test(value);
  }

  function isValidCalendarDate(value) {
    if (!isIsoShaped(value)) {
      return false;
    }
    var year = Number(value.slice(0, 4));
    var month = Number(value.slice(5, 7));
    var day = Number(value.slice(8, 10));
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    var probe = new Date(Date.UTC(year, month - 1, day));
    return (
      probe.getUTCFullYear() === year &&
      probe.getUTCMonth() === month - 1 &&
      probe.getUTCDate() === day
    );
  }

  function parseAmount(raw) {
    if (raw === null || raw === undefined) {
      return null;
    }
    var text = String(raw);
    text = text.replace(/\u20B9/g, '');
    text = text.replace(/rs/gi, '');
    text = text.replace(/inr/gi, '');
    text = text.replace(/[\s\u00A0]+/g, '');
    text = text.split(',').join('');
    if (text.charAt(0) === '+') {
      text = text.slice(1);
    }
    if (!/^-?[0-9]+(\.[0-9]+)?$/.test(text)) {
      return null;
    }
    if (text.charAt(0) === '-') {
      text = text.slice(1);
    }
    var dot = text.indexOf('.');
    var integerPart = dot === -1 ? text : text.slice(0, dot);
    var fractionPart = dot === -1 ? '' : text.slice(dot + 1);
    integerPart = integerPart.replace(/^0+(?=\d)/, '');

    var clamped = false;
    var rupees = 0;
    if (integerPart.length > 14) {
      clamped = true;
    } else {
      rupees = Number(integerPart);
      if (rupees > MAX_RUPEES) {
        clamped = true;
      }
    }

    var paise = 0;
    if (fractionPart.length === 1) {
      paise = Number(fractionPart) * 10;
    } else if (fractionPart.length >= 2) {
      paise = Number(fractionPart.slice(0, 2));
    }

    var rounded = false;
    if (fractionPart.length > 2 && fractionPart.charAt(2) >= '5') {
      paise += 1;
      rounded = true;
    }

    var total;
    if (clamped) {
      total = MAX_PAISE;
    } else {
      total = rupees * 100 + paise;
      if (total > MAX_PAISE) {
        total = MAX_PAISE;
        clamped = true;
      }
    }

    if (rounded) {
      console.warn('Hisaab: amount rounded to the nearest paise');
    }
    if (clamped) {
      console.warn('Hisaab: amount clamped to the supported maximum');
    }
    return { paise: total, rounded: rounded, clamped: clamped };
  }

  function normalizeImportPhone(value) {
    var text = value === null || value === undefined ? '' : String(value).trim();
    if (text.charAt(0) === '+') {
      text = text.slice(1);
    }
    var digits = text.replace(/[^0-9]/g, '');
    if (digits.length === 12 && digits.slice(0, 2) === '91') {
      digits = digits.slice(2);
    }
    return digits;
  }

  function importDisplayName(value) {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return '';
    }
    return normalizeName(value);
  }

  function importCountText(count, one, many) {
    return count + ' ' + (count === 1 ? one : many);
  }

  function mapImportType(raw, stats) {
    var text = raw === null || raw === undefined ? '' : String(raw).trim().toLowerCase();
    if (!text) {
      stats.missingTypes += 1;
      return 'credit';
    }
    if (
      text.indexOf('credit') === 0 ||
      text.indexOf('debit') === 0 ||
      text === 'gave' ||
      text === 'udhaar'
    ) {
      return 'credit';
    }
    if (text.indexOf('payment') === 0 || text.indexOf('paid') === 0 || text === 'received') {
      return 'payment';
    }
    stats.unknownTypes += 1;
    return 'credit';
  }

  function importAmount(raw, stats) {
    var parsed = parseAmount(raw);
    if (!parsed) {
      stats.invalidAmounts += 1;
      return 0;
    }
    if (parsed.rounded) {
      stats.roundedAmounts += 1;
    }
    if (parsed.clamped) {
      stats.clampedAmounts += 1;
    }
    return parsed.paise;
  }

  function importDateValue(raw, stats) {
    if (raw === null || raw === undefined) {
      return STATE.today;
    }
    var text = String(raw);
    var trimmed = text.trim();
    if (!trimmed) {
      return STATE.today;
    }
    if (isIsoShaped(trimmed)) {
      return trimmed;
    }
    stats.invalidDates += 1;
    return text;
  }

  function importNoteValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return '';
    }
    var text = String(value);
    return text.trim() === '' ? '' : text;
  }

  function buildImportWarnings(stats, duplicatePhones) {
    var warnings = [];
    if (stats.missingCustomers) {
      warnings.push(
        'Warning: the customers list was missing or not a list, so no customers were imported.'
      );
    }
    if (stats.missingEntries) {
      warnings.push(
        'Warning: the entries list was missing or not a list, so no entries were imported.'
      );
    }
    if (stats.invalidCustomers) {
      warnings.push(
        'Warning: ' +
          importCountText(stats.invalidCustomers, 'customer record was', 'customer records were') +
          ' skipped because no usable phone could be read.'
      );
    }
    if (duplicatePhones.length === 1) {
      warnings.push(
        'Warning: duplicate phone ' + duplicatePhones[0] + '; kept the last name for that row.'
      );
    } else if (duplicatePhones.length > 1) {
      warnings.push(
        'Warning: duplicate phones ' + duplicatePhones.join(', ') + '; kept the last name for each row.'
      );
    }
    if (stats.skippedEntries) {
      warnings.push(
        'Warning: ' +
          importCountText(stats.skippedEntries, 'entry was', 'entries were') +
          ' skipped because no usable phone could be read.'
      );
    }
    if (stats.missingTypes) {
      warnings.push(
        'Warning: ' +
          importCountText(stats.missingTypes, 'entry had', 'entries had') +
          ' a missing or empty type; each was treated as credit.'
      );
    }
    if (stats.unknownTypes) {
      warnings.push(
        'Warning: ' +
          importCountText(stats.unknownTypes, 'entry had', 'entries had') +
          ' an unknown type; each was treated as credit.'
      );
    }
    if (stats.invalidAmounts) {
      warnings.push(
        'Warning: ' +
          importCountText(stats.invalidAmounts, 'entry had', 'entries had') +
          ' a missing or unreadable amount; each was imported as 0.'
      );
    }
    if (stats.roundedAmounts) {
      warnings.push(
        'Warning: ' +
          importCountText(stats.roundedAmounts, 'amount was', 'amounts were') +
          ' rounded to the nearest paise.'
      );
    }
    if (stats.clampedAmounts) {
      warnings.push(
        'Warning: ' +
          importCountText(stats.clampedAmounts, 'amount was', 'amounts were') +
          ' clamped to the supported maximum.'
      );
    }
    if (stats.invalidDates) {
      console.warn('Hisaab: import kept ' + stats.invalidDates + ' date(s) that were not YYYY-MM-DD');
      warnings.push(
        'Warning: ' +
          importCountText(stats.invalidDates, 'date was', 'dates were') +
          ' not in YYYY-MM-DD format; kept as text and sorted after ISO dates.'
      );
    }
    return warnings;
  }

  function buildImportState(root) {
    var stats = {
      missingCustomers: false,
      missingEntries: false,
      invalidCustomers: 0,
      skippedEntries: 0,
      missingTypes: 0,
      unknownTypes: 0,
      invalidAmounts: 0,
      roundedAmounts: 0,
      clampedAmounts: 0,
      invalidDates: 0
    };
    var customers = [];
    var entries = [];
    var phoneIndex = Object.create(null);
    var duplicateSeen = Object.create(null);
    var duplicatePhones = [];
    var shop = typeof root.shop === 'string' ? root.shop : '';

    var sourceCustomers = root.customers;
    if (!Array.isArray(sourceCustomers)) {
      stats.missingCustomers = true;
      sourceCustomers = [];
    }
    var index;
    for (index = 0; index < sourceCustomers.length; index += 1) {
      var customerRecord = sourceCustomers[index];
      if (!customerRecord || typeof customerRecord !== 'object' || Array.isArray(customerRecord)) {
        stats.invalidCustomers += 1;
        continue;
      }
      var phone = normalizeImportPhone(customerRecord.phone);
      if (!phone) {
        stats.invalidCustomers += 1;
        continue;
      }
      var name = importDisplayName(customerRecord.name);
      var existingIndex = phoneIndex[phone];
      if (existingIndex === undefined) {
        phoneIndex[phone] = customers.length;
        customers.push({ name: name, phone: phone });
      } else if (name) {
        var existing = customers[existingIndex];
        if (existing.name && existing.name.toLowerCase() !== name.toLowerCase()) {
          if (!duplicateSeen[phone]) {
            duplicateSeen[phone] = true;
            duplicatePhones.push(phone);
          }
        }
        existing.name = name;
      }
    }

    var sourceEntries = root.entries;
    if (!Array.isArray(sourceEntries)) {
      stats.missingEntries = true;
      sourceEntries = [];
    }
    var idPrefix = 'e' + Date.now().toString(36);
    for (index = 0; index < sourceEntries.length; index += 1) {
      var entryRecord = sourceEntries[index];
      if (!entryRecord || typeof entryRecord !== 'object' || Array.isArray(entryRecord)) {
        stats.skippedEntries += 1;
        continue;
      }
      var entryPhone = normalizeImportPhone(entryRecord.phone);
      if (!entryPhone) {
        stats.skippedEntries += 1;
        continue;
      }
      if (phoneIndex[entryPhone] === undefined) {
        phoneIndex[entryPhone] = customers.length;
        customers.push({ name: 'Customer ' + entryPhone, phone: entryPhone });
      }
      entries.push({
        id: idPrefix + '-' + index,
        phone: entryPhone,
        type: mapImportType(entryRecord.type, stats),
        amountPaise: importAmount(entryRecord.amount, stats),
        date: importDateValue(entryRecord.date, stats),
        note: importNoteValue(entryRecord.note)
      });
    }

    return {
      state: { shop: shop, customers: customers, entries: entries },
      warnings: buildImportWarnings(stats, duplicatePhones)
    };
  }

  function splitPaise(paise) {
    var value = Math.trunc(Number(paise));
    if (!isFinite(value)) {
      value = 0;
    }
    var negative = value < 0;
    var digits = String(Math.abs(value));
    var rupees;
    var remainder;
    if (digits.length <= 2) {
      rupees = '0';
      remainder = ('0' + digits).slice(-2);
    } else {
      rupees = digits.slice(0, digits.length - 2);
      remainder = digits.slice(-2);
    }
    rupees = rupees.replace(/^0+(?=\d)/, '');
    return { negative: negative, rupees: rupees, paise: remainder };
  }

  function renderMachine(paise) {
    var parts = splitPaise(paise);
    var text = parts.rupees;
    if (parts.paise !== '00') {
      text += '.' + parts.paise;
    }
    return (parts.negative ? '-' : '') + text;
  }

  function groupDigits(digits) {
    var out = '';
    var count = 0;
    for (var index = digits.length - 1; index >= 0; index -= 1) {
      out = digits.charAt(index) + out;
      count += 1;
      if (count % 3 === 0 && index > 0) {
        out = ',' + out;
      }
    }
    return out;
  }

  function humanMoney(paise) {
    var parts = splitPaise(paise);
    var text = groupDigits(parts.rupees);
    if (parts.paise !== '00') {
      text += '.' + parts.paise;
    }
    return (parts.negative ? 'Advance Rs ' : 'Rs ') + text;
  }

  function readRoute() {
    var search = '';
    try {
      search = window.location.search || '';
    } catch (error) {
      search = '';
    }
    var params = null;
    try {
      params = new URLSearchParams(search);
    } catch (error) {
      params = null;
    }
    var todayParam = params ? params.get('today') : null;
    var today = isValidCalendarDate(todayParam) ? todayParam : localDateString(new Date());
    var customerPhone = null;
    if (params && params.has('customer')) {
      customerPhone = normalizeRoutePhone(params.get('customer'));
    }
    return { today: today, customerPhone: customerPhone };
  }

  var STATE = readRoute();
  var state = { shop: '', customers: [], entries: [] };
  var readWarning = '';
  var writeWarning = '';

  function findCustomer(phone) {
    if (!phone) {
      return null;
    }
    for (var index = 0; index < state.customers.length; index += 1) {
      if (state.customers[index].phone === phone) {
        return state.customers[index];
      }
    }
    return null;
  }

  function hasEntryId(id) {
    for (var index = 0; index < state.entries.length; index += 1) {
      if (state.entries[index].id === id) {
        return true;
      }
    }
    return false;
  }

  function newEntryId() {
    var base = 'e' + Date.now().toString(36);
    var id = base;
    var suffix = 0;
    while (hasEntryId(id)) {
      suffix += 1;
      id = base + '-' + suffix;
    }
    return id;
  }

  function storedPhone(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).replace(/[^0-9]/g, '');
  }

  function coerceLoadedState(parsed) {
    var customers = [];
    var entries = [];
    var seen = Object.create(null);
    var usedIds = Object.create(null);
    var index;

    for (index = 0; index < parsed.customers.length; index += 1) {
      var customer = parsed.customers[index];
      if (!customer || typeof customer !== 'object') {
        continue;
      }
      var phone = storedPhone(customer.phone);
      if (!phone || seen[phone]) {
        continue;
      }
      seen[phone] = true;
      customers.push({ name: normalizeName(customer.name), phone: phone });
    }

    for (index = 0; index < parsed.entries.length; index += 1) {
      var entry = parsed.entries[index];
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      var entryPhone = storedPhone(entry.phone);
      if (!entryPhone) {
        continue;
      }
      if (!seen[entryPhone]) {
        seen[entryPhone] = true;
        customers.push({ name: 'Customer ' + entryPhone, phone: entryPhone });
      }
      var amount = Math.abs(Math.trunc(Number(entry.amountPaise)));
      if (!isFinite(amount) || isNaN(amount)) {
        amount = 0;
      }
      if (amount > MAX_PAISE) {
        amount = MAX_PAISE;
      }
      var id = typeof entry.id === 'string' ? entry.id : '';
      if (!id || usedIds[id]) {
        id = 'e' + Date.now().toString(36) + '-' + index;
        while (usedIds[id]) {
          id += 'x';
        }
      }
      usedIds[id] = true;
      entries.push({
        id: id,
        phone: entryPhone,
        type: entry.type === 'payment' ? 'payment' : 'credit',
        amountPaise: amount,
        date: typeof entry.date === 'string' ? entry.date : '',
        note: typeof entry.note === 'string' ? entry.note : ''
      });
    }
    return { customers: customers, entries: entries };
  }

  function loadState() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      readWarning = 'Browser storage is unavailable. Your changes are kept in this tab only.';
      return;
    }
    if (raw === null || raw === undefined || raw === '') {
      return;
    }
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      readWarning = 'Saved data could not be read. Starting with an empty shop.';
      return;
    }
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed) ||
      !Array.isArray(parsed.customers) ||
      !Array.isArray(parsed.entries)
    ) {
      readWarning = 'Saved data had an unexpected format. Starting with an empty shop.';
      return;
    }
    var loaded = coerceLoadedState(parsed);
    state.shop = typeof parsed.shop === 'string' ? parsed.shop : '';
    state.customers = loaded.customers;
    state.entries = loaded.entries;
  }

  function serialiseState() {
    return JSON.stringify({
      shop: typeof state.shop === 'string' ? state.shop : '',
      customers: state.customers.map(function (customer) {
        return { name: customer.name, phone: customer.phone };
      }),
      entries: state.entries.map(function (entry) {
        return {
          id: entry.id,
          phone: entry.phone,
          type: entry.type,
          amountPaise: entry.amountPaise,
          date: entry.date,
          note: entry.note
        };
      })
    });
  }

  function persist() {
    var payload;
    try {
      payload = serialiseState();
    } catch (error) {
      payload = null;
    }
    if (payload === null) {
      writeWarning = 'Could not save to browser storage. Your changes are kept in this tab only.';
      renderStorageMessage();
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, payload);
      writeWarning = '';
      readWarning = '';
    } catch (error) {
      writeWarning = 'Could not save to browser storage. Your changes are kept in this tab only.';
    }
    renderStorageMessage();
  }

  function ensureEntryCustomers() {
    for (var index = 0; index < state.entries.length; index += 1) {
      var phone = state.entries[index].phone;
      if (!findCustomer(phone)) {
        state.customers.push({ name: 'Customer ' + phone, phone: phone });
      }
    }
  }

  function computeBalances() {
    var balances = Object.create(null);
    var index;
    for (index = 0; index < state.customers.length; index += 1) {
      balances[state.customers[index].phone] = 0;
    }
    for (index = 0; index < state.entries.length; index += 1) {
      var entry = state.entries[index];
      var current = balances[entry.phone];
      if (current === undefined) {
        current = 0;
      }
      balances[entry.phone] =
        entry.type === 'payment' ? current - entry.amountPaise : current + entry.amountPaise;
    }
    return balances;
  }

  function computeTotal(balances) {
    var total = 0;
    for (var index = 0; index < state.customers.length; index += 1) {
      total += balances[state.customers[index].phone] || 0;
    }
    return total;
  }

  function renderStorageMessage() {
    var message = byId('storage-msg');
    if (!message) {
      return;
    }
    var text = writeWarning || readWarning || '';
    message.textContent = text;
    message.className = text ? 'msg msg-warn' : 'msg';
  }

  function renderTotal(balances) {
    var total = computeTotal(balances);
    var machine = renderMachine(total);
    var node = byId('total-outstanding');
    if (node) {
      node.textContent = machine;
      node.setAttribute('data-value', machine);
    }
    var human = byId('total-human');
    if (human) {
      human.textContent = humanMoney(total);
    }
  }

  function buildReminderHref(customer, balance) {
    var message = 'Namaste ' + customer.name + ', your balance is Rs ' + renderMachine(balance) + '.';
    return WA_PREFIX + customer.phone + '?text=' + encodeURIComponent(message);
  }

  function buildCustomerRow(customer, balances) {
    var balance = balances[customer.phone] || 0;
    var rendered = renderMachine(balance);

    var row = makeElement('div', 'customer-row');
    row.setAttribute('data-customer', customer.phone);

    var identity = makeElement('div', 'customer-id');
    identity.appendChild(makeElement('span', 'customer-name', customer.name));
    identity.appendChild(makeElement('span', 'customer-phone', customer.phone));

    var money = makeElement('div', 'customer-money');
    var balanceNode = makeElement('span', 'customer-balance', rendered);
    balanceNode.setAttribute('data-balance', rendered);
    money.appendChild(balanceNode);
    money.appendChild(makeElement('span', 'human balance-human', humanMoney(balance)));

    var actions = makeElement('div', 'customer-actions');
    var openLink = makeElement('a', 'btn ghost', 'Open');
    openLink.setAttribute('href', '?customer=' + customer.phone);
    openLink.setAttribute('data-open-customer', '');
    var remindLink = makeElement('a', 'btn ghost', 'WhatsApp reminder');
    remindLink.setAttribute('data-remind', customer.phone);
    remindLink.setAttribute('href', buildReminderHref(customer, balance));
    actions.appendChild(openLink);
    actions.appendChild(remindLink);

    row.appendChild(identity);
    row.appendChild(money);
    row.appendChild(actions);
    return row;
  }

  function renderCustomers(balances) {
    var container = byId('customers');
    if (!container) {
      return;
    }
    container.textContent = '';
    if (state.customers.length === 0) {
      var empty = makeElement('p', 'empty', 'No customers yet. Add one, or import a shop file.');
      empty.id = 'customers-empty';
      container.appendChild(empty);
      return;
    }
    var fragment = document.createDocumentFragment();
    for (var index = 0; index < state.customers.length; index += 1) {
      fragment.appendChild(buildCustomerRow(state.customers[index], balances));
    }
    container.appendChild(fragment);
  }

  function sortedEntriesFor(phone) {
    var list = [];
    var index;
    for (index = 0; index < state.entries.length; index += 1) {
      if (state.entries[index].phone === phone) {
        list.push({ entry: state.entries[index], index: index });
      }
    }
    list.sort(function (left, right) {
      var leftIso = isIsoShaped(left.entry.date);
      var rightIso = isIsoShaped(right.entry.date);
      if (leftIso !== rightIso) {
        return leftIso ? -1 : 1;
      }
      if (leftIso && left.entry.date !== right.entry.date) {
        return left.entry.date < right.entry.date ? 1 : -1;
      }
      return right.index - left.index;
    });
    return list.map(function (item) {
      return item.entry;
    });
  }

  function buildEntryRow(entry) {
    var rendered = renderMachine(entry.amountPaise);

    var row = makeElement('li', 'entry');
    row.setAttribute('data-entry-id', entry.id);
    row.setAttribute('data-type', entry.type);
    row.setAttribute('data-date', entry.date);

    var main = makeElement('div', 'entry-main');
    main.appendChild(makeElement('span', 'entry-type', entry.type === 'payment' ? 'Payment' : 'Credit'));
    main.appendChild(makeElement('span', 'entry-note', entry.note));

    var meta = makeElement('div', 'entry-meta');
    var amount = makeElement('span', 'entry-amount', rendered);
    amount.setAttribute('data-amount', rendered);
    meta.appendChild(amount);
    meta.appendChild(makeElement('span', 'human entry-amount-human', 'Rs ' + rendered));
    meta.appendChild(makeElement('span', 'entry-date', entry.date));

    row.appendChild(main);
    row.appendChild(meta);
    return row;
  }

  function renderCustomerView(balances) {
    var nameNode = byId('cust-name');
    var phoneNode = byId('cust-phone');
    var balanceNode = byId('cust-balance');
    var balanceHuman = byId('cust-balance-human');
    var list = byId('entries');
    var emptyNode = byId('entries-empty');

    var routePhone = STATE.customerPhone;
    var customer = routePhone ? findCustomer(routePhone) : null;
    var name;
    var balance = 0;
    var entries = [];
    var emptyText = 'No entries yet.';
    var showEmpty = true;

    if (routePhone === null) {
      name = 'Select a customer';
      emptyText = 'No customer selected.';
      if (phoneNode) {
        phoneNode.textContent = 'Open a customer from the list to see their ledger.';
      }
    } else if (!customer) {
      name = 'Customer not found';
      emptyText = 'Nothing to show for this phone.';
      if (phoneNode) {
        phoneNode.textContent = 'Phone: ' + routePhone;
      }
    } else {
      name = customer.name;
      balance = balances[customer.phone] || 0;
      entries = sortedEntriesFor(customer.phone);
      showEmpty = entries.length === 0;
      if (phoneNode) {
        phoneNode.textContent = 'Phone: ' + customer.phone;
      }
    }

    if (nameNode) {
      nameNode.textContent = name;
    }

    var rendered = renderMachine(balance);
    if (balanceNode) {
      balanceNode.textContent = rendered;
      balanceNode.setAttribute('data-balance', rendered);
    }
    if (balanceHuman) {
      balanceHuman.textContent = humanMoney(balance);
    }

    if (list) {
      list.textContent = '';
      var fragment = document.createDocumentFragment();
      for (var index = 0; index < entries.length; index += 1) {
        fragment.appendChild(buildEntryRow(entries[index]));
      }
      list.appendChild(fragment);
    }

    if (emptyNode) {
      emptyNode.textContent = emptyText;
      if (showEmpty) {
        emptyNode.removeAttribute('hidden');
      } else {
        emptyNode.setAttribute('hidden', 'hidden');
      }
    }
  }

  function renderEntryCustomerSelect() {
    var select = byId('entry-customer');
    if (!select) {
      return;
    }
    var previous = select.value;
    var desired;
    if (STATE.customerPhone !== null) {
      desired = findCustomer(STATE.customerPhone) ? STATE.customerPhone : '';
    } else {
      desired = previous;
    }

    select.textContent = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = state.customers.length ? 'Select a customer' : 'No customers yet';
    select.appendChild(placeholder);

    for (var index = 0; index < state.customers.length; index += 1) {
      var customer = state.customers[index];
      var option = document.createElement('option');
      option.value = customer.phone;
      option.textContent = customer.name + ' \u2014 ' + customer.phone;
      select.appendChild(option);
    }

    if (desired && findCustomer(desired)) {
      select.value = desired;
    } else {
      select.value = '';
    }
  }

  function renderAll() {
    var balances = computeBalances();
    renderStorageMessage();
    renderTotal(balances);
    renderCustomers(balances);
    renderCustomerView(balances);
    renderEntryCustomerSelect();
  }

  function setMessage(element, text, isError) {
    if (!element) {
      return;
    }
    element.textContent = text || '';
    if (isError) {
      element.classList.add('msg-error');
    } else {
      element.classList.remove('msg-error');
    }
  }

  function handleAddCustomer() {
    var nameInput = byId('new-name');
    var phoneInput = byId('new-phone');
    var message = byId('new-customer-msg');
    var name = normalizeName(nameInput ? nameInput.value : '');
    var phone = normalizePhoneDigits(phoneInput ? phoneInput.value : '');

    if (!name) {
      setMessage(message, 'Enter a customer name.', true);
      return;
    }
    if (!phone) {
      setMessage(message, 'Enter a phone number with exactly 10 digits.', true);
      return;
    }
    if (findCustomer(phone)) {
      setMessage(message, 'A customer with this phone already exists.', true);
      return;
    }

    state.customers.push({ name: name, phone: phone });
    persist();
    renderAll();
    if (nameInput) {
      nameInput.value = '';
    }
    if (phoneInput) {
      phoneInput.value = '';
    }
    setMessage(message, 'Customer added.', false);
  }

  function selectedEntryPhone() {
    if (STATE.customerPhone !== null) {
      return findCustomer(STATE.customerPhone) ? STATE.customerPhone : null;
    }
    var select = byId('entry-customer');
    var value = select ? String(select.value || '') : '';
    return value && findCustomer(value) ? value : null;
  }

  function handleSaveEntry(event) {
    if (event) {
      event.preventDefault();
    }
    var message = byId('entry-msg');
    var phone = selectedEntryPhone();
    if (!phone) {
      setMessage(message, 'Choose a customer before saving an entry.', true);
      return;
    }

    var typeInput = byId('entry-type');
    var type = typeInput ? typeInput.value : '';
    if (type !== 'credit' && type !== 'payment') {
      setMessage(message, 'Choose credit or payment.', true);
      return;
    }

    var amountInput = byId('entry-amount');
    var parsed = parseAmount(amountInput ? amountInput.value : '');
    if (!parsed || parsed.paise === 0) {
      setMessage(message, 'Enter an amount greater than zero.', true);
      return;
    }

    var dateInput = byId('entry-date');
    var date = dateInput && dateInput.value ? dateInput.value : STATE.today;
    var noteInput = byId('entry-note');
    var note = noteInput ? String(noteInput.value || '') : '';

    state.entries.push({
      id: newEntryId(),
      phone: phone,
      type: type,
      amountPaise: parsed.paise,
      date: date,
      note: note
    });
    persist();
    renderAll();

    if (amountInput) {
      amountInput.value = '';
    }
    if (noteInput) {
      noteInput.value = '';
    }
    setMessage(message, type === 'payment' ? 'Payment saved.' : 'Credit saved.', false);
  }

  function handleImport() {
    var box = document.querySelector('#import-box');
    var message = byId('import-msg');
    var rawText = box ? String(box.value || '') : '';
    var parsedRoot;

    try {
      parsedRoot = JSON.parse(rawText);
    } catch (error) {
      setMessage(
        message,
        'Could not import: the pasted text is not valid JSON. The previous shop is unchanged.',
        true
      );
      return;
    }

    if (!parsedRoot || typeof parsedRoot !== 'object' || Array.isArray(parsedRoot)) {
      setMessage(
        message,
        'Could not import: the JSON must be an object with shop, customers and entries. The previous shop is unchanged.',
        true
      );
      return;
    }

    var built;
    try {
      built = buildImportState(parsedRoot);
    } catch (error) {
      setMessage(
        message,
        'Could not import: the shop data could not be read. The previous shop is unchanged.',
        true
      );
      return;
    }

    var previous = state;
    state = built.state;
    try {
      persist();
      renderAll();
    } catch (error) {
      state = previous;
      try {
        persist();
      } catch (ignoredPersist) {
        /* storage already reported by persist */
      }
      try {
        renderAll();
      } catch (ignoredRender) {
        /* the previous render stays on screen */
      }
      setMessage(
        message,
        'Could not import: the shop could not be displayed. The previous shop is unchanged.',
        true
      );
      return;
    }

    var balances = computeBalances();
    var total = computeTotal(balances);
    var count = state.customers.length;
    var success = 'Imported';
    if (state.shop) {
      success += ' "' + state.shop + '"';
    }
    success +=
      ': ' +
      importCountText(count, 'customer', 'customers') +
      ', total ' +
      renderMachine(total) +
      '.';
    if (built.warnings.length) {
      success += ' ' + built.warnings.join(' ');
    }
    setMessage(message, success, false);
  }

  function navigate(url) {
    if (!url) {
      return;
    }
    try {
      window.history.pushState({}, '', url);
    } catch (error) {
      window.location.assign(url);
      return;
    }
    STATE = readRoute();
    renderAll();
    var view = byId('customer-view');
    if (view && view.scrollIntoView) {
      try {
        view.scrollIntoView({ block: 'start' });
      } catch (error) {
        view.scrollIntoView();
      }
    }
  }

  function wireEvents() {
    var forms = document.querySelectorAll('form');
    for (var index = 0; index < forms.length; index += 1) {
      forms[index].addEventListener('submit', function (event) {
        event.preventDefault();
      });
    }

    var addButton = byId('add-customer');
    if (addButton) {
      addButton.addEventListener('click', function (event) {
        event.preventDefault();
        handleAddCustomer();
      });
    }

    var newCustomerForm = byId('new-customer');
    if (newCustomerForm) {
      newCustomerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        handleAddCustomer();
      });
    }

    var entryForm = byId('entry-form');
    if (entryForm) {
      entryForm.addEventListener('submit', function (event) {
        handleSaveEntry(event);
      });
    }

    var entryCustomer = byId('entry-customer');
    if (entryCustomer) {
      entryCustomer.addEventListener('change', function () {
        if (STATE.customerPhone === null) {
          return;
        }
        var value = entryCustomer.value;
        if (value && findCustomer(value)) {
          navigate('?customer=' + encodeURIComponent(value));
        }
      });
    }

    var importButton = byId('import-go');
    if (importButton) {
      importButton.addEventListener('click', function (event) {
        event.preventDefault();
        handleImport();
      });
    }

    var customersContainer = byId('customers');
    if (customersContainer) {
      customersContainer.addEventListener('click', function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        var link = event.target && event.target.closest ? event.target.closest('a[data-open-customer]') : null;
        if (!link) {
          return;
        }
        event.preventDefault();
        navigate(link.getAttribute('href'));
      });
    }

    var backLink = byId('back-to-list');
    if (backLink) {
      backLink.addEventListener('click', function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        navigate(backLink.getAttribute('href'));
      });
    }

    window.addEventListener('popstate', function () {
      STATE = readRoute();
      renderAll();
    });
  }

  function boot() {
    loadState();
    ensureEntryCustomers();
    var dateInput = byId('entry-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = STATE.today;
    }
    renderAll();
    wireEvents();
  }

  boot();
})();
