(function () {
  'use strict';

  var STORAGE_KEY = 'hisaab.v1';
  var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  var MAX_PAISE = 9000000000000000;
  var MAX_RUPEES = 90000000000000;
  var WA_PREFIX = 'https://wa.me/91';
  var UPI_STORE_KEY = 'hisaab.upi.v1';
  var DEMO_UPI = 'hisaab@upi';
  var UPI_PREFIX = 'upi://pay?pa=';
  var OVERDUE_DAYS = 30;

  var I18N = {
    en: {
      brandSub: 'Shop ledger',
      language: 'Language',
      customerViewTitle: 'Customer',
      balanceLabel: 'Balance (Rs)',
      entriesTitle: 'Entries',
      noEntriesYet: 'No entries yet.',
      backAll: 'All customers',
      totalLabel: 'Total outstanding (Rs)',
      searchLabel: 'Search name or phone',
      searchEmpty: 'No customers match your search.',
      overdueTitle: 'Overdue (30+ days)',
      overdueEmpty: 'No customers overdue right now.',
      customersTitle: 'Customers',
      customersEmpty: 'No customers yet. Add one, or import a shop file.',
      addCustomerTitle: 'Add customer',
      nameLabel: 'Name',
      phoneLabel: 'Phone',
      addCustomerBtn: 'Add customer',
      entryAddTitle: 'Add entry',
      entryEditTitle: 'Edit entry',
      addEntry: 'Add entry',
      customerLabel: 'Customer',
      entryCustomerHint: 'Use Add entry on a customer row, or choose a customer here.',
      typeLabel: 'Type',
      credit: 'Credit',
      payment: 'Payment',
      amountLabel: 'Amount (Rs)',
      dateLabel: 'Date',
      noteLabel: 'Note',
      shotLabel: 'Payment screenshot',
      ocrLabel: 'Read amount from screenshot',
      save: 'Save',
      update: 'Update',
      cancel: 'Cancel',
      importTitle: 'Import shop JSON',
      pasteLabel: 'Paste shop JSON',
      importBtn: 'Import',
      exportBtn: 'Export CSV',
      shopUpiTitle: 'Shop UPI ID',
      shopUpiLabel: 'Your UPI ID (for pay links)',
      shopUpiPlaceholder: 'yourname@bank',
      upiDemoNote: 'Demo UPI ID — set your shop UPI ID',
      payUpi: 'Pay via UPI',
      edit: 'Edit',
      delete: 'Delete',
      remind: 'WhatsApp reminder',
      open: 'Open',
      selectCustomer: 'Select a customer',
      openCustomerHint: 'Open a customer from the list to see their ledger.',
      notFound: 'Customer not found',
      nothingShow: 'Nothing to show for this phone.',
      noCustomerSelected: 'No customer selected.',
      noCustomersYet: 'No customers yet',
      phonePrefix: 'Phone: '
    },
    hi: {
      brandSub: 'दुकान का खाता',
      language: 'भाषा',
      customerViewTitle: 'ग्राहक',
      balanceLabel: 'बाकी (रु.)',
      entriesTitle: 'प्रविष्टियाँ',
      noEntriesYet: 'अभी कोई प्रविष्टि नहीं।',
      backAll: 'सभी ग्राहक',
      totalLabel: 'कुल बकाया (रु.)',
      searchLabel: 'नाम या फ़ोन खोजें',
      searchEmpty: 'आपकी खोज से कोई ग्राहक नहीं मिला।',
      overdueTitle: 'बकाया — Overdue (30+ days)',
      overdueEmpty: 'अभी कोई ग्राहक बकाया नहीं है।',
      customersTitle: 'ग्राहक',
      customersEmpty: 'अभी कोई ग्राहक नहीं। एक जोड़ें या दुकान फ़ाइल आयात करें।',
      addCustomerTitle: 'ग्राहक जोड़ें',
      nameLabel: 'नाम',
      phoneLabel: 'फ़ोन',
      addCustomerBtn: 'ग्राहक जोड़ें',
      entryAddTitle: 'प्रविष्टि जोड़ें',
      entryEditTitle: 'प्रविष्टि संपादित करें',
      addEntry: 'प्रविष्टि जोड़ें',
      customerLabel: 'ग्राहक',
      entryCustomerHint: 'किसी ग्राहक पंक्ति पर प्रविष्टि जोड़ें दबाएँ, या यहाँ ग्राहक चुनें।',
      typeLabel: 'प्रकार',
      credit: 'उधार',
      payment: 'भुगतान',
      amountLabel: 'राशि (रु.)',
      dateLabel: 'तारीख़',
      noteLabel: 'टिप्पणी',
      shotLabel: 'भुगतान का स्क्रीनशॉट',
      ocrLabel: 'स्क्रीनशॉट से राशि पढ़ें',
      save: 'सहेजें',
      update: 'अपडेट करें',
      cancel: 'रद्द करें',
      importTitle: 'दुकान JSON आयात करें',
      pasteLabel: 'दुकान JSON पेस्ट करें',
      importBtn: 'आयात करें',
      exportBtn: 'CSV निर्यात करें',
      shopUpiTitle: 'दुकान UPI ID',
      shopUpiLabel: 'आपकी UPI ID (भुगतान लिंक के लिए)',
      shopUpiPlaceholder: 'yourname@bank',
      upiDemoNote: 'डेमो UPI ID — अपनी दुकान की UPI ID सेट करें',
      payUpi: 'UPI से भुगतान करें',
      edit: 'संपादित करें',
      delete: 'हटाएँ',
      remind: 'WhatsApp रिमाइंडर',
      open: 'खोलें',
      selectCustomer: 'ग्राहक चुनें',
      openCustomerHint: 'लेखा देखने के लिए सूची से ग्राहक खोलें।',
      notFound: 'ग्राहक नहीं मिला',
      nothingShow: 'इस फ़ोन के लिए कुछ नहीं है।',
      noCustomerSelected: 'कोई ग्राहक चयनित नहीं।',
      noCustomersYet: 'अभी कोई ग्राहक नहीं',
      phonePrefix: 'फ़ोन: '
    },
    te: {
      brandSub: 'దుకాణం లెడ్జర్',
      language: 'భాష',
      customerViewTitle: 'కస్టమర్',
      balanceLabel: 'బాకీ (రూ.)',
      entriesTitle: 'నమోదులు',
      noEntriesYet: 'ఇంకా నమోదులు లేవు.',
      backAll: 'అందరు కస్టమర్లు',
      totalLabel: 'మొత్తం బాకీ (రూ.)',
      searchLabel: 'పేరు లేదా ఫోన్ వెతకండి',
      searchEmpty: 'మీ వెతుకుడుకు సరిపోయే కస్టమర్‌లు లేరు.',
      overdueTitle: 'గడువు మీరినవి — Overdue (30+ days)',
      overdueEmpty: 'ప్రస్తుతం ఎవరూ గడువు మీరలేదు.',
      customersTitle: 'కస్టమర్లు',
      customersEmpty: 'ఇంకా కస్టమర్లు లేరు. ఒకరిని జోడించండి లేదా షాప్ ఫైల్ దిగుమతి చేయండి.',
      addCustomerTitle: 'కస్టమర్‌ను జోడించండి',
      nameLabel: 'పేరు',
      phoneLabel: 'ఫోన్',
      addCustomerBtn: 'కస్టమర్‌ను జోడించండి',
      entryAddTitle: 'నమోదు జోడించండి',
      entryEditTitle: 'నమోదును సవరించండి',
      addEntry: 'నమోదు జోడించండి',
      customerLabel: 'కస్టమర్',
      entryCustomerHint: 'కస్టమర్ వరుసపై నమోదు జోడించండి నొక్కండి, లేదా ఇక్కడ కస్టమర్‌ను ఎంచుకోండి.',
      typeLabel: 'రకం',
      credit: 'అప్పు',
      payment: 'చెల్లింపు',
      amountLabel: 'మొత్తం (రూ.)',
      dateLabel: 'తేదీ',
      noteLabel: 'గమనిక',
      shotLabel: 'చెల్లింపు స్క్రీన్‌షాట్',
      ocrLabel: 'స్క్రీన్‌షాట్ నుండి మొత్తం చదవండి',
      save: 'సేవ్ చేయండి',
      update: 'అప్‌డేట్ చేయండి',
      cancel: 'రద్దు చేయండి',
      importTitle: 'షాప్ JSON దిగుమతి చేయండి',
      pasteLabel: 'షాప్ JSON పేస్ట్ చేయండి',
      importBtn: 'దిగుమతి',
      exportBtn: 'CSV ఎగుమతి',
      shopUpiTitle: 'షాప్ UPI ID',
      shopUpiLabel: 'మీ UPI ID (చెల్లింపు లింక్‌ల కోసం)',
      shopUpiPlaceholder: 'yourname@bank',
      upiDemoNote: 'డెమో UPI ID — మీ షాప్ UPI ID సెట్ చేయండి',
      payUpi: 'UPI ద్వారా చెల్లించండి',
      edit: 'సవరించండి',
      delete: 'తొలగించండి',
      remind: 'WhatsApp రిమైండర్',
      open: 'తెరవండి',
      selectCustomer: 'కస్టమర్‌ను ఎంచుకోండి',
      openCustomerHint: 'లెడ్జర్ చూడటానికి జాబితా నుండి కస్టమర్‌ను తెరవండి.',
      notFound: 'కస్టమర్ కనుగొనబడలేదు',
      nothingShow: 'ఈ ఫోన్ కోసం చూపించడానికి ఏమీ లేదు.',
      noCustomerSelected: 'కస్టమర్ ఎంచుకోలేదు.',
      noCustomersYet: 'ఇంకా కస్టమర్లు లేరు',
      phonePrefix: 'ఫోన్: '
    }
  };

  var STORAGE_WARNING =
    'Could not save to browser storage. Your changes are kept in this tab only.';
  var PHOTO_WARNING =
    'The payment screenshot could not be stored; the entry was saved without the photo.';

  var SHOT_ATTEMPTS = [
    { edge: 800, quality: 0.7 },
    { edge: 800, quality: 0.6 },
    { edge: 800, quality: 0.5 },
    { edge: 800, quality: 0.4 },
    { edge: 600, quality: 0.5 },
    { edge: 400, quality: 0.5 }
  ];
  var SHOT_TARGET_CHARS = 200 * 1024;
  var SHOT_LOAD_MAX_CHARS = 1536 * 1024;
  var SHOT_TIMEOUT_MS = 8000;

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

  function t(key) {
    var table = I18N[LANG] || I18N.en;
    var value = table[key];
    if (value === undefined) {
      value = I18N.en[key];
    }
    return value === undefined ? key : value;
  }

  function applyStaticLabels() {
    var nodes = document.querySelectorAll('[data-i18n]');
    var index;
    for (index = 0; index < nodes.length; index += 1) {
      var key = nodes[index].getAttribute('data-i18n');
      if (key) {
        nodes[index].textContent = t(key);
      }
    }
    var placeholders = document.querySelectorAll('[data-i18n-ph]');
    for (index = 0; index < placeholders.length; index += 1) {
      var placeholderKey = placeholders[index].getAttribute('data-i18n-ph');
      if (placeholderKey) {
        placeholders[index].setAttribute('placeholder', t(placeholderKey));
      }
    }
  }

  function daysSinceText(days) {
    if (LANG === 'hi') {
      return 'पिछले भुगतान से ' + days + ' दिन पहले';
    }
    if (LANG === 'te') {
      return 'చివరి చెల్లింపు నుండి ' + days + ' రోజుల క్రితం';
    }
    return days + ' days since last payment';
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

  function utcDayNumber(isoDate) {
    return (
      Date.UTC(
        Number(isoDate.slice(0, 4)),
        Number(isoDate.slice(5, 7)) - 1,
        Number(isoDate.slice(8, 10))
      ) / 86400000
    );
  }

  function dayDifference(todayIso, isoDate) {
    if (!isValidCalendarDate(todayIso) || !isValidCalendarDate(isoDate)) {
      return null;
    }
    var delta = utcDayNumber(todayIso) - utcDayNumber(isoDate);
    if (delta < 0) {
      return 0;
    }
    return delta;
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

  function buildImportWarnings(stats, duplicatePhones, keptNamePhones) {
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
    var keptOnly = [];
    for (var keptIndex = 0; keptIndex < keptNamePhones.length; keptIndex += 1) {
      if (duplicatePhones.indexOf(keptNamePhones[keptIndex]) === -1) {
        keptOnly.push(keptNamePhones[keptIndex]);
      }
    }
    if (keptOnly.length === 1) {
      warnings.push(
        'Warning: duplicate phone ' +
          keptOnly[0] +
          '; the later record had no name, so the earlier name was kept.'
      );
    } else if (keptOnly.length > 1) {
      warnings.push(
        'Warning: duplicate phones ' +
          keptOnly.join(', ') +
          '; a later record had no name, so the earlier name was kept for each row.'
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
    var keptNameSeen = Object.create(null);
    var keptNamePhones = [];
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
      } else {
        var keptCustomer = customers[existingIndex];
        if (keptCustomer.name && !duplicateSeen[phone] && !keptNameSeen[phone]) {
          keptNameSeen[phone] = true;
          keptNamePhones.push(phone);
        }
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
      warnings: buildImportWarnings(stats, duplicatePhones, keptNamePhones)
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

  function readFileDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader;
      try {
        reader = new FileReader();
      } catch (error) {
        reject(error);
        return;
      }
      reader.onload = function () {
        resolve(String(reader.result || ''));
      };
      reader.onerror = function () {
        reject(reader.error || new Error('The file could not be read.'));
      };
      reader.onabort = function () {
        reject(new Error('The file read was cancelled.'));
      };
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  function loadImageFromDataUrl(dataUrl) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error('The image could not be decoded.'));
      };
      try {
        image.src = dataUrl;
      } catch (error) {
        reject(error);
      }
    });
  }

  function encodeJpeg(image, maxEdge, quality) {
    var width = image.naturalWidth || image.width;
    var height = image.naturalHeight || image.height;
    if (!width || !height) {
      throw new Error('The image has no pixels.');
    }
    var scale = Math.min(1, maxEdge / Math.max(width, height));
    var outWidth = Math.max(1, Math.round(width * scale));
    var outHeight = Math.max(1, Math.round(height * scale));
    var canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    var context = canvas.getContext ? canvas.getContext('2d') : null;
    if (!context) {
      throw new Error('Canvas is unavailable.');
    }
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, outWidth, outHeight);
    if ('imageSmoothingEnabled' in context) {
      context.imageSmoothingEnabled = true;
    }
    if ('imageSmoothingQuality' in context) {
      context.imageSmoothingQuality = 'high';
    }
    context.drawImage(image, 0, 0, outWidth, outHeight);
    return canvas.toDataURL('image/jpeg', quality);
  }

  function processShotFile(file) {
    if (!file) {
      return Promise.resolve({ error: 'none' });
    }
    if (typeof file.type === 'string' && file.type && !/^image\//i.test(file.type)) {
      return Promise.resolve({ error: 'unsupported' });
    }
    return readFileDataUrl(file)
      .then(loadImageFromDataUrl)
      .then(function (image) {
        for (var index = 0; index < SHOT_ATTEMPTS.length; index += 1) {
          var attempt = SHOT_ATTEMPTS[index];
          var candidate = '';
          try {
            candidate = encodeJpeg(image, attempt.edge, attempt.quality);
          } catch (error) {
            candidate = '';
          }
          if (
            typeof candidate === 'string' &&
            candidate.indexOf('data:image/jpeg') === 0 &&
            candidate.length <= SHOT_TARGET_CHARS
          ) {
            return { dataUrl: candidate };
          }
        }
        return { error: 'too-large' };
      })
      .catch(function () {
        return { error: 'unreadable' };
      });
  }

  function withTimeout(promise, milliseconds, fallback) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () {
        if (!settled) {
          settled = true;
          resolve(fallback);
        }
      }, milliseconds);
      promise.then(
        function (value) {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(value);
          }
        },
        function () {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(fallback);
          }
        }
      );
    });
  }

  function shotWarningFor(error) {
    if (error === 'unsupported') {
      return 'That file is not an image, so the payment was saved without a screenshot.';
    }
    if (error === 'too-large') {
      return 'The screenshot could not be stored small enough, so the payment was saved without it.';
    }
    if (error === 'timeout') {
      return 'The screenshot took too long to process, so the payment was saved without it.';
    }
    return 'The selected image could not be read, so the payment was saved without a screenshot.';
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
  var LANG = 'en';
  var shopUpi = '';
  var editingEntryId = null;
  var editingEntryPhone = null;

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

  function indexOfEntry(id) {
    if (!id) {
      return -1;
    }
    for (var index = 0; index < state.entries.length; index += 1) {
      if (state.entries[index].id === id) {
        return index;
      }
    }
    return -1;
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

  function usableShot(value) {
    return (
      typeof value === 'string' &&
      value.indexOf('data:image/') === 0 &&
      value.length <= SHOT_LOAD_MAX_CHARS
    );
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
      var loadedEntry = {
        id: id,
        phone: entryPhone,
        type: entry.type === 'payment' ? 'payment' : 'credit',
        amountPaise: amount,
        date: typeof entry.date === 'string' ? entry.date : '',
        note: typeof entry.note === 'string' ? entry.note : ''
      };
      if (entry.type === 'payment' && usableShot(entry.shot)) {
        loadedEntry.shot = entry.shot;
      }
      entries.push(loadedEntry);
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
        var stored = {
          id: entry.id,
          phone: entry.phone,
          type: entry.type,
          amountPaise: entry.amountPaise,
          date: entry.date,
          note: entry.note
        };
        if (entry.type === 'payment' && usableShot(entry.shot)) {
          stored.shot = entry.shot;
        }
        return stored;
      })
    });
  }

  function tryWriteState() {
    var payload;
    try {
      payload = serialiseState();
    } catch (error) {
      return false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  function persist() {
    if (tryWriteState()) {
      writeWarning = '';
      readWarning = '';
    } else {
      writeWarning = STORAGE_WARNING;
    }
    renderStorageMessage();
  }

  function persistEntryWithShot(entry) {
    if (tryWriteState()) {
      writeWarning = '';
      readWarning = '';
      renderStorageMessage();
      return { photoDropped: false };
    }
    var hadShot = !!(entry && entry.type === 'payment' && usableShot(entry.shot));
    if (hadShot) {
      delete entry.shot;
      if (tryWriteState()) {
        writeWarning = PHOTO_WARNING;
        readWarning = '';
        renderStorageMessage();
        return { photoDropped: true };
      }
    }
    writeWarning = hadShot ? STORAGE_WARNING + ' ' + PHOTO_WARNING : STORAGE_WARNING;
    renderStorageMessage();
    return { photoDropped: hadShot };
  }

  function loadShopUpi() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(UPI_STORE_KEY);
    } catch (error) {
      raw = null;
    }
    shopUpi = typeof raw === 'string' ? raw.trim() : '';
    var input = byId('shop-upi');
    if (input) {
      input.value = shopUpi;
    }
  }

  function saveShopUpi() {
    try {
      window.localStorage.setItem(UPI_STORE_KEY, shopUpi);
      setMessage(byId('upi-msg'), '', false);
    } catch (error) {
      setMessage(
        byId('upi-msg'),
        'Could not save the UPI ID to browser storage; it is used in this tab only.',
        false
      );
    }
  }

  function renderUpiState() {
    var note = byId('upi-demo-note');
    if (!note) {
      return;
    }
    if (shopUpi) {
      note.setAttribute('hidden', 'hidden');
    } else {
      note.removeAttribute('hidden');
    }
  }

  function buildUpiHref(customer, balance) {
    var payee = shopUpi || DEMO_UPI;
    var amount = renderMachine(balance > 0 ? balance : 0);
    return (
      UPI_PREFIX +
      payee +
      '&am=' +
      amount +
      '&cu=INR&tn=' +
      encodeURIComponent(customer.name)
    );
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
    var openLink = makeElement('a', 'btn ghost', t('open'));
    openLink.setAttribute('href', '?customer=' + customer.phone);
    openLink.setAttribute('data-open-customer', '');
    var addEntryButton = makeElement('button', 'btn ghost customer-add-entry', t('addEntry'));
    addEntryButton.setAttribute('type', 'button');
    addEntryButton.setAttribute('data-add-entry-for', customer.phone);
    var payLink = makeElement('a', 'btn ghost', t('payUpi'));
    payLink.setAttribute('href', buildUpiHref(customer, balance));
    payLink.setAttribute('data-upi-pay', '');
    var remindLink = makeElement('a', 'btn ghost', t('remind'));
    remindLink.setAttribute('data-remind', customer.phone);
    remindLink.setAttribute('href', buildReminderHref(customer, balance));
    actions.appendChild(openLink);
    actions.appendChild(addEntryButton);
    actions.appendChild(payLink);
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
      var empty = makeElement('p', 'empty', t('customersEmpty'));
      empty.id = 'customers-empty';
      container.appendChild(empty);
    } else {
      var fragment = document.createDocumentFragment();
      for (var index = 0; index < state.customers.length; index += 1) {
        fragment.appendChild(buildCustomerRow(state.customers[index], balances));
      }
      container.appendChild(fragment);
    }
    applySearchFilter();
  }

  function applySearchFilter() {
    var input = byId('search');
    var query = input ? String(input.value || '').trim().toLowerCase() : '';
    var container = byId('customers');
    if (!container) {
      return;
    }
    var rows = container.querySelectorAll('[data-customer]');
    var matched = 0;
    for (var index = 0; index < rows.length; index += 1) {
      var row = rows[index];
      var phone = String(row.getAttribute('data-customer') || '').toLowerCase();
      var nameNode = row.querySelector('.customer-name');
      var name = nameNode ? String(nameNode.textContent || '').toLowerCase() : '';
      var matches =
        query === '' || phone.indexOf(query) !== -1 || name.indexOf(query) !== -1;
      if (matches) {
        row.removeAttribute('hidden');
        matched += 1;
      } else {
        row.setAttribute('hidden', 'hidden');
      }
    }
    var emptyNode = byId('search-empty');
    if (emptyNode) {
      if (query !== '' && matched === 0) {
        emptyNode.removeAttribute('hidden');
      } else {
        emptyNode.setAttribute('hidden', 'hidden');
      }
    }
  }

  function compareEntryOrder(left, right) {
    var leftIso = isIsoShaped(left.entry.date);
    var rightIso = isIsoShaped(right.entry.date);
    if (leftIso !== rightIso) {
      return leftIso ? -1 : 1;
    }
    if (leftIso && left.entry.date !== right.entry.date) {
      return left.entry.date < right.entry.date ? 1 : -1;
    }
    return right.index - left.index;
  }

  function sortedEntriesFor(phone) {
    var list = [];
    var index;
    for (index = 0; index < state.entries.length; index += 1) {
      if (state.entries[index].phone === phone) {
        list.push({ entry: state.entries[index], index: index });
      }
    }
    list.sort(compareEntryOrder);
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
    main.appendChild(
      makeElement('span', 'entry-type', entry.type === 'payment' ? t('payment') : t('credit'))
    );
    main.appendChild(makeElement('span', 'entry-note', entry.note));

    var meta = makeElement('div', 'entry-meta');
    var amount = makeElement('span', 'entry-amount', rendered);
    amount.setAttribute('data-amount', rendered);
    meta.appendChild(amount);
    meta.appendChild(makeElement('span', 'human entry-amount-human', 'Rs ' + rendered));
    meta.appendChild(makeElement('span', 'entry-date', entry.date));

    row.appendChild(main);
    row.appendChild(meta);

    if (entry.type === 'payment' && usableShot(entry.shot)) {
      var shot = makeElement('img', 'entry-shot');
      shot.setAttribute('data-shot', '');
      shot.setAttribute('src', entry.shot);
      shot.setAttribute('alt', 'Payment screenshot');
      shot.setAttribute('loading', 'lazy');
      row.appendChild(shot);
    }

    var entryActions = makeElement('div', 'entry-actions');
    var editButton = makeElement('button', 'btn ghost entry-action', t('edit'));
    editButton.setAttribute('type', 'button');
    editButton.setAttribute('data-edit-entry', '');
    var deleteButton = makeElement('button', 'btn ghost entry-action', t('delete'));
    deleteButton.setAttribute('type', 'button');
    deleteButton.setAttribute('data-delete-entry', '');
    entryActions.appendChild(editButton);
    entryActions.appendChild(deleteButton);
    row.appendChild(entryActions);
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
    var view = byId('customer-view');
    if (view) {
      if (routePhone === null) {
        view.setAttribute('hidden', 'hidden');
      } else {
        view.removeAttribute('hidden');
      }
    }
    var customer = routePhone ? findCustomer(routePhone) : null;
    var name;
    var balance = 0;
    var entries = [];
    var emptyText = t('noEntriesYet');
    var showEmpty = true;

    if (routePhone === null) {
      name = t('selectCustomer');
      emptyText = t('noCustomerSelected');
      if (phoneNode) {
        phoneNode.textContent = t('openCustomerHint');
      }
    } else if (!customer) {
      name = t('notFound');
      emptyText = t('nothingShow');
      if (phoneNode) {
        phoneNode.textContent = t('phonePrefix') + routePhone;
      }
    } else {
      name = customer.name;
      balance = balances[customer.phone] || 0;
      entries = sortedEntriesFor(customer.phone);
      showEmpty = entries.length === 0;
      if (phoneNode) {
        phoneNode.textContent = t('phonePrefix') + customer.phone;
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
    placeholder.textContent = state.customers.length ? t('selectCustomer') : t('noCustomersYet');
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

  function latestPaymentDate(phone) {
    var best = null;
    for (var index = 0; index < state.entries.length; index += 1) {
      var entry = state.entries[index];
      if (entry.phone !== phone || entry.type !== 'payment') {
        continue;
      }
      if (!isValidCalendarDate(entry.date)) {
        continue;
      }
      if (best === null || entry.date > best) {
        best = entry.date;
      }
    }
    return best;
  }

  function compareNamesAscending(left, right) {
    var leftLower = left.toLowerCase();
    var rightLower = right.toLowerCase();
    if (leftLower < rightLower) {
      return -1;
    }
    if (leftLower > rightLower) {
      return 1;
    }
    if (left < right) {
      return -1;
    }
    if (left > right) {
      return 1;
    }
    return 0;
  }

  function renderOverdue(balances) {
    var list = byId('overdue-list');
    var empty = byId('overdue-empty');
    if (!list) {
      return;
    }
    var rows = [];
    var index;
    for (index = 0; index < state.customers.length; index += 1) {
      var customer = state.customers[index];
      var balance = balances[customer.phone] || 0;
      if (balance <= 0) {
        continue;
      }
      var lastPayment = latestPaymentDate(customer.phone);
      if (!lastPayment) {
        continue;
      }
      var days = dayDifference(STATE.today, lastPayment);
      if (days === null || days < OVERDUE_DAYS) {
        continue;
      }
      rows.push({ customer: customer, days: days });
    }
    rows.sort(function (left, right) {
      if (left.days !== right.days) {
        return right.days - left.days;
      }
      return compareNamesAscending(left.customer.name, right.customer.name);
    });

    list.textContent = '';
    if (rows.length === 0) {
      if (empty) {
        empty.removeAttribute('hidden');
      }
      return;
    }
    if (empty) {
      empty.setAttribute('hidden', 'hidden');
    }
    var fragment = document.createDocumentFragment();
    for (index = 0; index < rows.length; index += 1) {
      var overdue = rows[index];
      var row = makeElement('li', 'overdue-row');
      row.setAttribute('data-overdue', overdue.customer.phone);
      row.appendChild(makeElement('span', 'overdue-name', overdue.customer.name));
      row.appendChild(makeElement('span', 'overdue-phone', overdue.customer.phone));
      var daysNode = makeElement('span', 'overdue-days', String(overdue.days));
      daysNode.setAttribute('data-days', String(overdue.days));
      row.appendChild(daysNode);
      row.appendChild(makeElement('span', 'overdue-days-text', daysSinceText(overdue.days)));
      fragment.appendChild(row);
    }
    list.appendChild(fragment);
  }

  function csvEscape(value) {
    var text = value === null || value === undefined ? '' : String(value);
    if (/[",\r\n]/.test(text)) {
      return '"' + text.split('"').join('""') + '"';
    }
    return text;
  }

  function csvLine(fields) {
    var cells = [];
    for (var index = 0; index < fields.length; index += 1) {
      cells.push(csvEscape(fields[index]));
    }
    return cells.join(',');
  }

  function buildCustomersCsv() {
    var totals = Object.create(null);
    var index;
    for (index = 0; index < state.entries.length; index += 1) {
      var entry = state.entries[index];
      var bucket = totals[entry.phone];
      if (!bucket) {
        bucket = { credit: 0, payment: 0 };
        totals[entry.phone] = bucket;
      }
      if (entry.type === 'payment') {
        bucket.payment += entry.amountPaise;
      } else {
        bucket.credit += entry.amountPaise;
      }
    }
    var lines = ['phone,name,credit,payment,balance'];
    for (index = 0; index < state.customers.length; index += 1) {
      var customer = state.customers[index];
      var sum = totals[customer.phone] || { credit: 0, payment: 0 };
      lines.push(
        csvLine([
          customer.phone,
          customer.name,
          renderMachine(sum.credit),
          renderMachine(sum.payment),
          renderMachine(sum.credit - sum.payment)
        ])
      );
    }
    return lines.join('\r\n') + '\r\n';
  }

  function buildEntriesCsv() {
    var ordered = [];
    var index;
    for (index = 0; index < state.entries.length; index += 1) {
      ordered.push({ entry: state.entries[index], index: index });
    }
    ordered.sort(compareEntryOrder);
    var lines = ['phone,type,amount,date,note'];
    for (index = 0; index < ordered.length; index += 1) {
      var entry = ordered[index].entry;
      lines.push(
        csvLine([
          entry.phone,
          entry.type,
          renderMachine(entry.amountPaise),
          entry.date,
          entry.note
        ])
      );
    }
    return lines.join('\r\n') + '\r\n';
  }

  function downloadTextFile(filename, text) {
    var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.setAttribute('rel', 'noopener');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        /* revoking the blob URL is best effort */
      }
    }, 10000);
  }

  function handleExportCsv() {
    var message = byId('export-msg');
    downloadTextFile('customers.csv', buildCustomersCsv());
    downloadTextFile('entries.csv', buildEntriesCsv());
    setMessage(message, 'Exported customers.csv and entries.csv.', false);
  }

  function renderAll() {
    var balances = computeBalances();
    renderStorageMessage();
    renderTotal(balances);
    renderCustomers(balances);
    renderOverdue(balances);
    renderCustomerView(balances);
    renderEntryCustomerSelect();
    renderUpiState();
    updateEditModeUi();
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
    if (editingEntryId && editingEntryPhone) {
      return editingEntryPhone;
    }
    if (STATE.customerPhone !== null) {
      return findCustomer(STATE.customerPhone) ? STATE.customerPhone : null;
    }
    var select = byId('entry-customer');
    var value = select ? String(select.value || '') : '';
    return value && findCustomer(value) ? value : null;
  }

  function resetEntryFormAfterSave() {
    var amountInput = byId('entry-amount');
    if (amountInput) {
      amountInput.value = '';
    }
    var noteInput = byId('entry-note');
    if (noteInput) {
      noteInput.value = '';
    }
    var shotInput = byId('shot-input');
    if (shotInput) {
      try {
        shotInput.value = '';
      } catch (error) {
        /* clearing a file input is best effort; the node itself never moves */
      }
    }
  }

  function updateEditModeUi() {
    var saveButton = byId('entry-save');
    if (saveButton) {
      saveButton.textContent = editingEntryId ? t('update') : t('save');
    }
    var title = byId('entry-title');
    if (title) {
      title.textContent = editingEntryId ? t('entryEditTitle') : t('entryAddTitle');
    }
    var cancelButton = byId('entry-cancel');
    if (cancelButton) {
      if (editingEntryId) {
        cancelButton.removeAttribute('hidden');
      } else {
        cancelButton.setAttribute('hidden', 'hidden');
      }
    }
  }

  function endEdit(clearFields) {
    editingEntryId = null;
    editingEntryPhone = null;
    if (clearFields) {
      var amountInput = byId('entry-amount');
      if (amountInput) {
        amountInput.value = '';
      }
      var noteInput = byId('entry-note');
      if (noteInput) {
        noteInput.value = '';
      }
      var shotInput = byId('shot-input');
      if (shotInput) {
        try {
          shotInput.value = '';
        } catch (error) {
          /* clearing a file input is best effort; the node itself never moves */
        }
      }
    }
    updateEditModeUi();
    setMessage(byId('entry-msg'), '', false);
  }

  function startEntryFor(phone) {
    if (!phone || !findCustomer(phone)) {
      return;
    }
    if (editingEntryId) {
      endEdit(true);
      var resetDate = byId('entry-date');
      if (resetDate) {
        resetDate.value = STATE.today;
      }
    }
    if (STATE.customerPhone !== null && STATE.customerPhone !== phone) {
      navigate('?customer=' + encodeURIComponent(phone));
    }
    var select = byId('entry-customer');
    if (select) {
      select.value = phone;
    }
    var form = byId('entry-form');
    if (form && form.scrollIntoView) {
      try {
        form.scrollIntoView({ block: 'start' });
      } catch (error) {
        form.scrollIntoView();
      }
    }
    var amountInput = byId('entry-amount');
    if (amountInput && amountInput.focus) {
      amountInput.focus();
    }
  }

  function startEditEntry(id) {
    var index = indexOfEntry(id);
    if (index === -1) {
      return;
    }
    var entry = state.entries[index];
    editingEntryId = entry.id;
    editingEntryPhone = entry.phone;

    if (STATE.customerPhone !== null && STATE.customerPhone !== entry.phone) {
      navigate('?customer=' + encodeURIComponent(entry.phone));
    }
    var select = byId('entry-customer');
    if (select) {
      select.value = entry.phone;
    }

    var typeInput = byId('entry-type');
    if (typeInput) {
      typeInput.value = entry.type;
    }
    var amountInput = byId('entry-amount');
    if (amountInput) {
      amountInput.value = renderMachine(entry.amountPaise);
    }
    var dateInput = byId('entry-date');
    if (dateInput) {
      dateInput.value = isValidCalendarDate(entry.date) ? entry.date : '';
    }
    var noteInput = byId('entry-note');
    if (noteInput) {
      noteInput.value = entry.note || '';
    }
    var shotInput = byId('shot-input');
    if (shotInput) {
      try {
        shotInput.value = '';
      } catch (error) {
        /* clearing a file input is best effort; the node itself never moves */
      }
    }

    updateEditModeUi();
    setMessage(byId('entry-msg'), 'Editing an entry. Save to update it.', false);
    var form = byId('entry-form');
    if (form && form.scrollIntoView) {
      try {
        form.scrollIntoView({ block: 'start' });
      } catch (error) {
        form.scrollIntoView();
      }
    }
  }

  function deleteEntry(id) {
    var index = indexOfEntry(id);
    if (index === -1) {
      return;
    }
    state.entries.splice(index, 1);
    var wasEditing = editingEntryId === id;
    if (wasEditing) {
      editingEntryId = null;
      editingEntryPhone = null;
      updateEditModeUi();
      var dateInput = byId('entry-date');
      if (dateInput) {
        dateInput.value = STATE.today;
      }
    }
    persist();
    renderAll();
    setMessage(byId('entry-msg'), 'Entry deleted.', false);
  }

  function commitSavedEntry(entry, isUpdate, imageWarning) {
    var message = byId('entry-msg');
    if (!isUpdate) {
      state.entries.push(entry);
    }
    var outcome = persistEntryWithShot(entry);
    renderAll();
    resetEntryFormAfterSave();
    if (isUpdate) {
      endEdit(false);
      var dateInput = byId('entry-date');
      if (dateInput) {
        dateInput.value = STATE.today;
      }
      var typeInput = byId('entry-type');
      if (typeInput) {
        typeInput.value = 'credit';
      }
    }

    var text = isUpdate ? 'Entry updated.' : entry.type === 'payment' ? 'Payment saved.' : 'Credit saved.';
    if (imageWarning) {
      text += ' ' + imageWarning;
    }
    if (outcome.photoDropped) {
      text += ' ' + PHOTO_WARNING;
    }
    setMessage(message, text, false);
  }

  function finishSavedEntry(entry, imageWarning) {
    commitSavedEntry(entry, false, imageWarning);
  }

  function saveEntryWithoutImage(entry) {
    finishSavedEntry(entry, '');
  }

  function saveEntryWithImage(entry, file) {
    var message = byId('entry-msg');
    setMessage(message, 'Saving the payment and its screenshot\u2026', false);
    withTimeout(processShotFile(file), SHOT_TIMEOUT_MS, { error: 'timeout' }).then(
      function (result) {
        savingEntry = false;
        try {
          if (result && result.dataUrl) {
            entry.shot = result.dataUrl;
            finishSavedEntry(entry, '');
          } else {
            finishSavedEntry(entry, shotWarningFor(result ? result.error : 'unreadable'));
          }
        } catch (error) {
          setMessage(
            message,
            'Could not finish saving this entry. Please try again.',
            true
          );
        }
      },
      function () {
        savingEntry = false;
        try {
          finishSavedEntry(entry, shotWarningFor('unreadable'));
        } catch (error) {
          setMessage(
            message,
            'Could not finish saving this entry. Please try again.',
            true
          );
        }
      }
    );
  }

  var savingEntry = false;

  function handleSaveEntry(event) {
    if (event) {
      event.preventDefault();
    }
    if (savingEntry) {
      return;
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

    var shotInput = byId('shot-input');
    var file = null;
    if (type === 'payment' && shotInput && shotInput.files && shotInput.files.length) {
      file = shotInput.files[0];
    }

    var editingIndex = editingEntryId ? indexOfEntry(editingEntryId) : -1;
    if (editingIndex !== -1) {
      var existing = state.entries[editingIndex];
      existing.type = type;
      existing.amountPaise = parsed.paise;
      existing.date = date;
      existing.note = note;
      if (type !== 'payment') {
        delete existing.shot;
      }
      if (!file) {
        commitSavedEntry(existing, true, '');
        return;
      }
      savingEntry = true;
      setMessage(message, 'Saving the payment and its screenshot\u2026', false);
      withTimeout(processShotFile(file), SHOT_TIMEOUT_MS, { error: 'timeout' }).then(
        function (result) {
          savingEntry = false;
          try {
            if (result && result.dataUrl) {
              existing.shot = result.dataUrl;
              commitSavedEntry(existing, true, '');
            } else {
              commitSavedEntry(existing, true, shotWarningFor(result ? result.error : 'unreadable'));
            }
          } catch (error) {
            setMessage(message, 'Could not finish saving this entry. Please try again.', true);
          }
        },
        function () {
          savingEntry = false;
          try {
            commitSavedEntry(existing, true, shotWarningFor('unreadable'));
          } catch (error) {
            setMessage(message, 'Could not finish saving this entry. Please try again.', true);
          }
        }
      );
      return;
    }

    var entry = {
      id: newEntryId(),
      phone: phone,
      type: type,
      amountPaise: parsed.paise,
      date: date,
      note: note
    };

    if (!file) {
      saveEntryWithoutImage(entry);
      return;
    }

    savingEntry = true;
    saveEntryWithImage(entry, file);
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

    endEdit(true);
    var importedDate = byId('entry-date');
    if (importedDate) {
      importedDate.value = STATE.today;
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
    if (editingEntryId && STATE.customerPhone !== editingEntryPhone) {
      editingEntryId = null;
      editingEntryPhone = null;
    }
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

    var entryCancel = byId('entry-cancel');
    if (entryCancel) {
      entryCancel.addEventListener('click', function (event) {
        event.preventDefault();
        endEdit(true);
        var dateInput = byId('entry-date');
        if (dateInput) {
          dateInput.value = STATE.today;
        }
      });
    }

    var entriesList = byId('entries');
    if (entriesList) {
      entriesList.addEventListener('click', function (event) {
        var target = event.target;
        if (!target || !target.closest) {
          return;
        }
        var editButton = target.closest('button[data-edit-entry]');
        if (editButton) {
          event.preventDefault();
          var editRow = editButton.closest('[data-entry-id]');
          if (editRow) {
            startEditEntry(editRow.getAttribute('data-entry-id'));
          }
          return;
        }
        var deleteButton = target.closest('button[data-delete-entry]');
        if (deleteButton) {
          event.preventDefault();
          var deleteRow = deleteButton.closest('[data-entry-id]');
          if (deleteRow) {
            deleteEntry(deleteRow.getAttribute('data-entry-id'));
          }
        }
      });
    }

    var searchInput = byId('search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        applySearchFilter();
      });
    }

    var exportButton = byId('export-csv');
    if (exportButton) {
      exportButton.addEventListener('click', function (event) {
        event.preventDefault();
        handleExportCsv();
      });
    }

    var shopUpiInput = byId('shop-upi');
    if (shopUpiInput) {
      shopUpiInput.addEventListener('input', function () {
        shopUpi = String(shopUpiInput.value || '').trim();
        saveShopUpi();
        renderAll();
      });
    }

    var langSwitch = byId('lang-switch');
    if (langSwitch) {
      langSwitch.addEventListener('change', function () {
        var value = String(langSwitch.value || 'en');
        LANG = value === 'hi' || value === 'te' ? value : 'en';
        applyStaticLabels();
        renderAll();
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
        if (!event.target || !event.target.closest) {
          return;
        }
        var addEntryButton = event.target.closest('button[data-add-entry-for]');
        if (addEntryButton) {
          event.preventDefault();
          startEntryFor(addEntryButton.getAttribute('data-add-entry-for'));
          return;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        var link = event.target.closest('a[data-open-customer]');
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
      if (editingEntryId && STATE.customerPhone !== editingEntryPhone) {
        editingEntryId = null;
        editingEntryPhone = null;
      }
      renderAll();
    });
  }

  function boot() {
    LANG = 'en';
    var langSwitch = byId('lang-switch');
    if (langSwitch) {
      langSwitch.value = 'en';
    }
    loadState();
    loadShopUpi();
    ensureEntryCustomers();
    var dateInput = byId('entry-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = STATE.today;
    }
    applyStaticLabels();
    renderAll();
    wireEvents();
  }

  boot();
})();
