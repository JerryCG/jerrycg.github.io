/**
 * Seminar tracker. Reads data/seminars.json and renders both languages.
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

  var DATA = null;
  var group = "all";
  var query = "";

  var MONTHS = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  };
  var DOW = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  };

  function langCode() {
    var lang = window.SiteI18n ? SiteI18n.resolve() : "en";
    return lang === "zh-CN" ? "zh" : "en";
  }

  function tr(key) {
    return window.SiteI18n ? SiteI18n.t(key) : key;
  }

  function pick(obj) {
    if (!obj) return "";
    var code = langCode();
    return obj[code] || obj.en || obj.zh || "";
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

  function personHtml(person) {
    var name = esc(person.name || "");
    var inner = person.url
      ? '<a href="' + esc(person.url) + '" target="_blank" rel="noopener noreferrer">' + name + "</a>"
      : name;
    var aff = person.affiliation ? " · " + esc(person.affiliation) : "";
    var note = pick(person.note);
    var noteHtml = note ? ' <span class="seminar-person-note">' + esc(note) + "</span>" : "";
    return "<span class=\"seminar-person\">" + inner + aff + noteHtml + "</span>";
  }

  function peopleLine(label, people) {
    if (!people || !people.length) return "";
    var bits = [];
    for (var i = 0; i < people.length; i++) bits.push(personHtml(people[i]));
    return '<p class="seminar-people"><span class="seminar-role">' + esc(label) + "</span> " + bits.join("; ") + "</p>";
  }

  function both(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return (obj.en || "") + " " + (obj.zh || "");
  }

  function haystack(ev) {
    var bits = [both(ev.series), both(ev.field), both(ev.venue), both(ev.place), both(ev.note)];
    var talks = ev.presentations || [];
    for (var i = 0; i < talks.length; i++) {
      var talk = talks[i];
      bits.push(both(talk.topic), both(talk.session), both(talk.abstract));
      var groups = [talk.speakers || [], talk.discussants || []];
      for (var g = 0; g < groups.length; g++) {
        for (var p = 0; p < groups[g].length; p++) {
          bits.push(groups[g][p].name, groups[g][p].affiliation, both(groups[g][p].note));
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
    if (announced && talks[0] && pick(talks[0].topic)) title = pick(talks[0].topic);
    else if (talks[0] && talks[0].speakers && talks[0].speakers.length) {
      var names = [];
      for (var n = 0; n < talks[0].speakers.length; n++) names.push(talks[0].speakers[n].name);
      title = names.join(", ");
    }

    var blocks = "";
    for (var i = 0; i < talks.length; i++) {
      var talk = talks[i];
      var topic = pick(talk.topic);
      var session = pick(talk.session);
      var showTopic = announced && topic && (talks.length > 1 || title !== topic);
      blocks += '<div class="seminar-talk">';
      if (session) blocks += '<p class="seminar-session">' + esc(session) + "</p>";
      if (showTopic) blocks += '<p class="seminar-topic">' + esc(topic) + "</p>";
      if (!announced && i === 0) {
        blocks += '<p class="seminar-topic seminar-topic-missing">' + esc(tr("seminars.topicMissing")) + "</p>";
      }
      blocks += peopleLine(tr("seminars.speaker"), talk.speakers);
      blocks += peopleLine(tr("seminars.discussant"), talk.discussants);
      if (pick(talk.abstract)) {
        var absId = "abs-" + ev.id + "-" + i;
        blocks += '<div class="paper-links"><button type="button" class="abstract-toggle" aria-expanded="false" aria-controls="' + absId + '">'
          + '<span>' + esc(tr("seminars.abstract")) + '</span>'
          + '<span class="abstract-toggle-icon" aria-hidden="true">▸</span></button></div>'
          + '<div class="abstract-panel" id="' + absId + '" aria-hidden="true"><div class="abstract-panel-inner">'
          + '<p class="abstract-body">' + esc(pick(talk.abstract)) + "</p></div></div>";
      }
      blocks += "</div>";
    }

    var links = ev.links || [];
    var linkHtml = "";
    for (var l = 0; l < links.length; l++) {
      if (!links[l].url) continue;
      linkHtml += '<a class="text-link" href="' + esc(links[l].url) + '" target="_blank" rel="noopener noreferrer"><span>'
        + esc(pick(links[l])) + '</span><span aria-hidden="true">→</span></a>';
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
      + '<div class="seminar-kicker"><span class="data-badge">' + esc(pick(ev.field)) + "</span>"
      + '<span class="seminar-series">' + esc(pick(ev.series)) + "</span></div>"
      + '<h3 class="seminar-title">' + esc(title) + "</h3>"
      + blocks
      + '<dl class="seminar-meta">'
      + "<div><dt>" + esc(tr("seminars.time")) + "</dt><dd>" + esc(formatRange(ev)) + " · " + esc(tr("seminars.pt")) + "</dd></div>"
      + "<div><dt>" + esc(tr("seminars.duration")) + "</dt><dd>" + esc(tr("seminars.minutes").replace("{n}", String(ev.durationMin))) + "</dd></div>"
      + "<div><dt>" + esc(tr("seminars.venue")) + "</dt><dd>" + esc(pick(ev.venue)) + "</dd></div>"
      + "<div><dt>" + esc(tr("seminars.place")) + "</dt><dd>" + esc(pick(ev.place)) + " · " + esc(tr("seminars.format." + (ev.format || "in-person"))) + "</dd></div>"
      + "</dl>"
      + (pick(ev.note) ? '<p class="seminar-note">' + esc(pick(ev.note)) + "</p>" : "")
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
      if (query && (both(items[i].name) + " " + both(items[i].detail)).toLowerCase().indexOf(query) === -1) continue;
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
        + (item.url ? '<a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">' + esc(pick(item.name)) + "</a>" : esc(pick(item.name)))
        + '</p></div><p class="data-card-desc">' + esc(pick(item.detail)) + "</p></article>";
    }
    dirEl.innerHTML = html;
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
  }

  function byWhen(a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
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
        if (talks[t].topic && talks[t].topic.en) topics.push(talks[t].topic.en);
      }
      var summary = (names[0] || pick(ev.series)) + " — " + (ev.series.en || "");
      var description = [
        ev.field && ev.field.en,
        topics.join("; ") || "Paper title not yet posted",
        ev.start + "-" + ev.end + " Pacific",
        (ev.durationMin || "") + " min",
        (ev.venue && ev.venue.en) || "",
        (ev.place && ev.place.en) || "",
        (ev.note && ev.note.en) || ""
      ].filter(Boolean).join("\n");
      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + ev.id + "@jerrycg.github.io");
      lines.push("DTSTAMP:" + stamp);
      lines.push("DTSTART;TZID=America/Los_Angeles:" + stamp);
      lines.push("DTEND;TZID=America/Los_Angeles:" + end);
      lines.push("SUMMARY:" + icsEscape(summary));
      lines.push("LOCATION:" + icsEscape(pick(ev.venue) + ", " + pick(ev.place)));
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
  document.addEventListener("site:lang", render);

  fetch("data/seminars.json")
    .then(function (res) {
      if (!res.ok) throw new Error("load");
      return res.json();
    })
    .then(function (data) {
      DATA = data;
      render();
    })
    .catch(function () {
      listEl.innerHTML = '<p class="seminars-note">' + esc(tr("seminars.error")) + "</p>";
    });
})();
