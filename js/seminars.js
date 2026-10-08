/**
 * Seminar tracker. Loads talks live and translates content when the UI is Chinese.
 */
(function () {
  "use strict";

  var listEl = document.getElementById("seminar-list");
  if (!listEl) return;

  var pastEl = document.getElementById("seminar-past-list");
  var pastWrap = document.getElementById("seminar-past");
  var dirEl = document.getElementById("seminar-directory-list");
  var dirWrap = document.getElementById("seminar-directory");
  var countEl = document.getElementById("seminar-count");
  var searchEl = document.getElementById("seminar-search");
  var icsBtn = document.getElementById("seminar-ics");
  var statusEl = document.getElementById("seminar-status");

  var DATA = null;
  var group = "all";
  var query = "";
  var zhCache = {};
  var translating = false;
  var ZH_KEY = "seminar-zh-cache-v1";

  var MONTHS = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  };
  var DOW = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  };
  var SKIP_TX = {
    TBD: 1, Zoom: 1, "N/A": 1, "UC San Diego": 1, UCSD: 1
  };

  try {
    zhCache = JSON.parse(localStorage.getItem(ZH_KEY) || "{}");
  } catch (e) {
    zhCache = {};
  }

  function langCode() {
    var lang = window.SiteI18n ? SiteI18n.resolve() : "en";
    return lang === "zh-CN" ? "zh" : "en";
  }

  function tr(key) {
    return window.SiteI18n ? SiteI18n.t(key) : key;
  }

  function plain(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.en || value.zh || value.label || "";
  }

  function tx(value) {
    var text = plain(value);
    if (!text) return "";
    if (langCode() !== "zh") return text;
    return zhCache[text] || text;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function todayPT() {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function parseDate(iso) {
    var parts = iso.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
  }

  function ymd(date) {
    var m = String(date.getMonth() + 1);
    var d = String(date.getDate());
    if (m.length < 2) m = "0" + m;
    if (d.length < 2) d = "0" + d;
    return date.getFullYear() + "-" + m + "-" + d;
  }

  function mondayOf(iso) {
    var date = parseDate(iso);
    var day = date.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return ymd(date);
  }

  function formatClock(hhmm) {
    var bits = hhmm.split(":");
    var h = parseInt(bits[0], 10);
    var m = bits[1];
    if (langCode() === "zh") return hhmm;
    var suffix = h >= 12 ? "p.m." : "a.m.";
    var h12 = h % 12 || 12;
    return h12 + ":" + m + " " + suffix;
  }

  function formatRange(ev) {
    return formatClock(ev.start) + "–" + formatClock(ev.end);
  }

  function formatLong(iso) {
    var date = parseDate(iso);
    if (langCode() === "zh") {
      return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日";
    }
    return MONTHS.en[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  }

  function personHtml(who) {
    var name = esc(who.name || "");
    var inner = who.url
      ? '<a href="' + esc(who.url) + '" target="_blank" rel="noopener noreferrer">' + name + "</a>"
      : name;
    var aff = who.affiliation ? " · " + esc(tx(who.affiliation)) : "";
    var note = tx(who.note);
    var noteHtml = note ? ' <span class="seminar-person-note">' + esc(note) + "</span>" : "";
    return "<span class=\"seminar-person\">" + inner + aff + noteHtml + "</span>";
  }

  function peopleLine(label, people) {
    if (!people || !people.length) return "";
    var bits = [];
    for (var i = 0; i < people.length; i++) bits.push(personHtml(people[i]));
    return '<p class="seminar-people"><span class="seminar-role">' + esc(label) + "</span> " + bits.join("; ") + "</p>";
  }

  function haystack(ev) {
    var bits = [plain(ev.series), tx(ev.series), plain(ev.field), tx(ev.field), plain(ev.venue), plain(ev.place), plain(ev.note), tx(ev.note)];
    var talks = ev.presentations || [];
    for (var i = 0; i < talks.length; i++) {
      var talk = talks[i];
      bits.push(plain(talk.topic), tx(talk.topic), plain(talk.session), plain(talk.abstract), tx(talk.abstract));
      var groups = [talk.speakers || [], talk.discussants || []];
      for (var g = 0; g < groups.length; g++) {
        for (var p = 0; p < groups[g].length; p++) {
          bits.push(groups[g][p].name, groups[g][p].affiliation, tx(groups[g][p].affiliation));
        }
      }
    }
    return bits.join(" ").toLowerCase();
  }

  function matches(ev) {
    if (group !== "all" && ev.group !== group) return false;
    if (!query) return true;
    return haystack(ev).indexOf(query) !== -1;
  }

  function cardHtml(ev, today) {
    var date = parseDate(ev.date);
    var code = langCode();
    var talks = ev.presentations || [];
    var announced = ev.topicStatus === "announced";
    var title = "";
    if (announced && talks[0] && plain(talks[0].topic)) title = tx(talks[0].topic);
    else if (talks[0] && talks[0].speakers && talks[0].speakers.length) {
      var names = [];
      for (var n = 0; n < talks[0].speakers.length; n++) names.push(talks[0].speakers[n].name);
      title = names.join(", ");
    }

    var blocks = "";
    for (var i = 0; i < talks.length; i++) {
      var talk = talks[i];
      var topic = tx(talk.topic);
      var session = tx(talk.session);
      var showTopic = announced && topic && (talks.length > 1 || title !== topic);
      blocks += '<div class="seminar-talk">';
      if (session) blocks += '<p class="seminar-session">' + esc(session) + "</p>";
      if (showTopic) blocks += '<p class="seminar-topic">' + esc(topic) + "</p>";
      if (!announced && i === 0) {
        blocks += '<p class="seminar-topic seminar-topic-missing">' + esc(tr("seminars.topicMissing")) + "</p>";
      }
      blocks += peopleLine(tr("seminars.speaker"), talk.speakers);
      blocks += peopleLine(tr("seminars.discussant"), talk.discussants);
      if (plain(talk.abstract)) {
        var absId = "abs-" + ev.id + "-" + i;
        blocks += '<div class="paper-links"><button type="button" class="abstract-toggle" aria-expanded="false" aria-controls="' + absId + '">'
          + "<span>" + esc(tr("seminars.abstract")) + "</span>"
          + '<span class="abstract-toggle-icon" aria-hidden="true">▸</span></button></div>'
          + '<div class="abstract-panel" id="' + absId + '" aria-hidden="true"><div class="abstract-panel-inner">'
          + '<p class="abstract-body">' + esc(tx(talk.abstract)) + "</p></div></div>";
      }
      blocks += "</div>";
    }

    var links = ev.links || [];
    var linkHtml = "";
    for (var l = 0; l < links.length; l++) {
      if (!links[l].url) continue;
      linkHtml += '<a class="text-link" href="' + esc(links[l].url) + '" target="_blank" rel="noopener noreferrer"><span>'
        + esc(tx(links[l].label || links[l])) + '</span><span aria-hidden="true">→</span></a>';
    }

    var todayMark = ev.date === today
      ? '<span class="seminar-today">' + esc(tr("seminars.today")) + "</span>"
      : "";

    return '<article class="seminar-card">'
      + '<div class="seminar-when">'
      + '<span class="seminar-dow">' + esc(DOW[code][date.getDay()]) + "</span>"
      + '<span class="seminar-daynum">' + date.getDate() + "</span>"
      + '<span class="seminar-mon">' + esc(code === "zh" ? MONTHS.zh[date.getMonth()] : MONTHS.en[date.getMonth()].slice(0, 3)) + "</span>"
      + todayMark
      + "</div>"
      + '<div class="seminar-body">'
      + '<div class="seminar-kicker"><span class="data-badge">' + esc(tx(ev.field)) + "</span>"
      + '<span class="seminar-series">' + esc(tx(ev.series)) + "</span></div>"
      + '<h3 class="seminar-title">' + esc(title) + "</h3>"
      + blocks
      + '<dl class="seminar-meta">'
      + "<div><dt>" + esc(tr("seminars.time")) + "</dt><dd>" + esc(formatRange(ev)) + " · " + esc(tr("seminars.pt")) + "</dd></div>"
      + "<div><dt>" + esc(tr("seminars.duration")) + "</dt><dd>" + esc(tr("seminars.minutes").replace("{n}", String(ev.durationMin))) + "</dd></div>"
      + "<div><dt>" + esc(tr("seminars.venue")) + "</dt><dd>" + esc(tx(ev.venue)) + "</dd></div>"
      + "<div><dt>" + esc(tr("seminars.place")) + "</dt><dd>" + esc(tx(ev.place)) + " · " + esc(tr("seminars.format." + (ev.format || "in-person"))) + "</dd></div>"
      + "</dl>"
      + (plain(ev.note) ? '<p class="seminar-note">' + esc(tx(ev.note)) + "</p>" : "")
      + (linkHtml ? '<div class="paper-links">' + linkHtml + "</div>" : "")
      + "</div></article>";
  }

  function groupByWeek(events) {
    var weeks = [];
    var index = {};
    for (var i = 0; i < events.length; i++) {
      var key = mondayOf(events[i].date);
      if (!index[key]) {
        index[key] = [];
        weeks.push({ key: key, events: index[key] });
      }
      index[key].push(events[i]);
    }
    return weeks;
  }

  function listHtml(events, today) {
    if (!events.length) return '<p class="seminars-note">' + esc(tr("seminars.empty")) + "</p>";
    var weeks = groupByWeek(events);
    var html = "";
    for (var i = 0; i < weeks.length; i++) {
      html += '<h2 class="seminar-week">' + esc(tr("seminars.week").replace("{date}", formatLong(weeks[i].key))) + "</h2>";
      for (var j = 0; j < weeks[i].events.length; j++) html += cardHtml(weeks[i].events[j], today);
    }
    return html;
  }

  function bindDrawers(scope) {
    var buttons = scope.querySelectorAll(".abstract-toggle");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var open = this.getAttribute("aria-expanded") === "true";
        var next = !open;
        var panel = document.getElementById(this.getAttribute("aria-controls"));
        this.setAttribute("aria-expanded", next ? "true" : "false");
        if (!panel) return;
        panel.classList.toggle("is-open", next);
        panel.setAttribute("aria-hidden", next ? "false" : "true");
      });
    }
  }

  function renderDirectory(items) {
    if (!dirEl || !dirWrap) return;
    var shown = [];
    for (var i = 0; i < items.length; i++) {
      if (group !== "all" && items[i].group !== group) continue;
      var blob = (plain(items[i].name) + " " + tx(items[i].name) + " " + plain(items[i].detail) + " " + tx(items[i].detail)).toLowerCase();
      if (query && blob.indexOf(query) === -1) continue;
      shown.push(items[i]);
    }
    if (!shown.length) {
      dirWrap.hidden = true;
      dirEl.innerHTML = "";
      return;
    }
    dirWrap.hidden = false;
    var html = "";
    for (var j = 0; j < shown.length; j++) {
      var item = shown[j];
      html += '<article class="data-card"><div class="data-card-top"><p class="data-card-title">'
        + (item.url ? '<a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">' + esc(tx(item.name)) + "</a>" : esc(tx(item.name)))
        + '</p></div><p class="data-card-desc">' + esc(tx(item.detail)) + "</p></article>";
    }
    dirEl.innerHTML = html;
  }

  function setStatus() {
    if (!statusEl || !DATA) return;
    var stamp = "";
    try {
      stamp = new Intl.DateTimeFormat(langCode() === "zh" ? "zh-CN" : "en", {
        timeZone: "America/Los_Angeles",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(DATA.fetchedAt || Date.now()));
    } catch (e) {
      stamp = DATA.fetchedAt || "";
    }
    var line = tr("seminars.updated").replace("{time}", stamp);
    if (DATA.errors && DATA.errors.length) line += " " + tr("seminars.partial");
    if (translating) line += " " + tr("seminars.translating");
    statusEl.textContent = line;
  }

  function render() {
    if (!DATA) return;
    if (searchEl) {
      searchEl.placeholder = tr("seminars.search");
      searchEl.setAttribute("aria-label", tr("seminars.search"));
    }
    var today = todayPT();
    var upcoming = [];
    var past = [];
    var events = DATA.events || [];
    for (var i = 0; i < events.length; i++) {
      if (!matches(events[i])) continue;
      if (events[i].date < today) past.push(events[i]);
      else upcoming.push(events[i]);
    }
    upcoming.sort(byWhen);
    past.sort(byWhen);
    listEl.innerHTML = listHtml(upcoming, today);
    bindDrawers(listEl);
    if (countEl) countEl.textContent = tr("seminars.count").replace("{n}", String(upcoming.length));
    if (pastWrap && pastEl) {
      pastWrap.hidden = past.length === 0;
      pastEl.innerHTML = past.length ? listHtml(past, today) : "";
      bindDrawers(pastEl);
    }
    renderDirectory(DATA.directory || []);
    setStatus();
  }

  function byWhen(a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
  }

  function shouldTranslate(text) {
    if (!text) return false;
    if (SKIP_TX[text]) return false;
    if (text.length < 4) return false;
    if (/^https?:/i.test(text)) return false;
    if (/[\u3400-\u9fff]/.test(text)) return false;
    if (!/[A-Za-z]/.test(text)) return false;
    return true;
  }

  function collectStrings() {
    var bag = {};
    function add(value) {
      var text = plain(value);
      if (shouldTranslate(text)) bag[text] = true;
    }
    var events = (DATA && DATA.events) || [];
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      add(ev.series); add(ev.field); add(ev.venue); add(ev.place); add(ev.note);
      var links = ev.links || [];
      for (var l = 0; l < links.length; l++) add(links[l].label);
      var talks = ev.presentations || [];
      for (var t = 0; t < talks.length; t++) {
        add(talks[t].topic); add(talks[t].session); add(talks[t].abstract);
        var people = (talks[t].speakers || []).concat(talks[t].discussants || []);
        for (var p = 0; p < people.length; p++) {
          add(people[p].affiliation);
          add(people[p].note);
        }
      }
    }
    var dir = (DATA && DATA.directory) || [];
    for (var d = 0; d < dir.length; d++) {
      add(dir[d].name);
      add(dir[d].detail);
    }
    return Object.keys(bag);
  }

  function translateOne(text) {
    var chunks = [];
    if (text.length <= 1600) chunks = [text];
    else {
      var rest = text;
      while (rest.length) {
        if (rest.length <= 1600) {
          chunks.push(rest);
          break;
        }
        var cut = rest.lastIndexOf(". ", 1500);
        if (cut < 400) cut = 1500;
        else cut += 1;
        chunks.push(rest.slice(0, cut));
        rest = rest.slice(cut).trim();
      }
    }
    var jobs = chunks.map(function (chunk) {
      var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=" + encodeURIComponent(chunk);
      return fetch(url, { mode: "cors" }).then(function (res) {
        if (!res.ok) throw new Error("tx");
        return res.json();
      }).then(function (data) {
        return (data[0] || []).map(function (row) { return row[0]; }).join("");
      });
    });
    return Promise.all(jobs).then(function (parts) { return parts.join(""); });
  }

  function fillTranslations() {
    if (!DATA || langCode() !== "zh" || translating) return;
    var need = collectStrings().filter(function (s) { return !zhCache[s]; });
    if (!need.length) return;
    translating = true;
    setStatus();
    var i = 0;
    var running = 0;
    var limit = 4;
    var changed = false;

    function pump() {
      if (i >= need.length && running === 0) {
        translating = false;
        if (changed) {
          try { localStorage.setItem(ZH_KEY, JSON.stringify(zhCache)); } catch (e) { /* ignore */ }
          render();
        } else {
          setStatus();
        }
        return;
      }
      while (running < limit && i < need.length) {
        (function (text) {
          running += 1;
          translateOne(text).then(function (zh) {
            if (zh && zh !== text) {
              zhCache[text] = zh;
              changed = true;
            }
          }).catch(function () { /* keep English */ }).then(function () {
            running -= 1;
            pump();
          });
        })(need[i++]);
      }
    }
    pump();
  }

  function icsEscape(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function downloadIcs() {
    if (!DATA) return;
    var today = todayPT();
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//jerrycg.github.io//seminars//EN",
      "CALSCALE:GREGORIAN",
      "X-WR-CALNAME:Guo Cheng seminars",
      "BEGIN:VTIMEZONE",
      "TZID:America/Los_Angeles",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:-0800",
      "TZOFFSETTO:-0700",
      "TZNAME:PDT",
      "DTSTART:19700308T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
      "END:DAYLIGHT",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:-0700",
      "TZOFFSETTO:-0800",
      "TZNAME:PST",
      "DTSTART:19701101T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
      "END:STANDARD",
      "END:VTIMEZONE"
    ];
    var events = DATA.events || [];
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if (ev.date < today) continue;
      var stamp = ev.date.replace(/-/g, "") + "T" + ev.start.replace(":", "") + "00";
      var end = ev.date.replace(/-/g, "") + "T" + ev.end.replace(":", "") + "00";
      var talks = ev.presentations || [];
      var names = [];
      var topics = [];
      for (var t = 0; t < talks.length; t++) {
        var speakers = talks[t].speakers || [];
        for (var s = 0; s < speakers.length; s++) names.push(speakers[s].name);
        if (plain(talks[t].topic)) topics.push(plain(talks[t].topic));
      }
      var summary = (names[0] || plain(ev.series)) + " — " + plain(ev.series);
      var description = [
        plain(ev.field),
        topics.join("; ") || "Paper title not yet posted",
        ev.start + "-" + ev.end + " Pacific",
        (ev.durationMin || "") + " min",
        plain(ev.venue),
        plain(ev.place),
        plain(ev.note)
      ].filter(Boolean).join("\n");
      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + ev.id + "@jerrycg.github.io");
      lines.push("DTSTAMP:" + stamp);
      lines.push("DTSTART;TZID=America/Los_Angeles:" + stamp);
      lines.push("DTEND;TZID=America/Los_Angeles:" + end);
      lines.push("SUMMARY:" + icsEscape(summary));
      lines.push("LOCATION:" + icsEscape(plain(ev.venue) + ", " + plain(ev.place)));
      lines.push("DESCRIPTION:" + icsEscape(description));
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-P1D");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:" + icsEscape(summary));
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "seminars.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  document.querySelectorAll(".seminar-filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      group = btn.getAttribute("data-group") || "all";
      document.querySelectorAll(".seminar-filter").forEach(function (other) {
        var on = other === btn;
        other.classList.toggle("is-active", on);
        other.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
    });
  });

  if (searchEl) {
    searchEl.addEventListener("input", function () {
      query = searchEl.value.trim().toLowerCase();
      render();
    });
  }
  if (icsBtn) icsBtn.addEventListener("click", downloadIcs);
  document.addEventListener("site:lang", function () {
    render();
    fillTranslations();
  });

  function boot() {
    if (!window.SeminarLive) {
      listEl.innerHTML = '<p class="seminars-note">' + esc(tr("seminars.error")) + "</p>";
      return;
    }
    window.SeminarLive.load().then(function (data) {
      DATA = data;
      render();
      fillTranslations();
    }).catch(function () {
      listEl.innerHTML = '<p class="seminars-note">' + esc(tr("seminars.error")) + "</p>";
    });
  }

  boot();
})();
