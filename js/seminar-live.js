/**
 * Load upcoming seminars live from the series in seminars.txt.
 * English source text only — the page translates when the UI language is Chinese.
 */
(function (root) {
  "use strict";

  var GCAL_KEY = "AIzaSyDnWE6xGE0GPXVjY2HMNFUlSkBNeKzBtIo";
  var ECON_PAGE = "https://economics.ucsd.edu/events/seminars/index.html";
  var TZ = "America/Los_Angeles";

  var MONTHS = {
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
    april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
    august: 8, aug: 8, september: 9, sept: 9, sep: 9, october: 10, oct: 10,
    november: 11, nov: 11, december: 12, dec: 12
  };

  var CALENDARS = [
    { id: "ucsd.edu_3jp20qac5od4flv9vombmg2r6s@group.calendar.google.com", series: "Workshop in Labor & Public Economics", field: "Labor & public economics", group: "economics", url: ECON_PAGE },
    { id: "ucsd.edu_kclsu81519jjlpd5lgljhea5fk@group.calendar.google.com", series: "Workshop in Econometrics", field: "Econometrics", group: "economics", url: ECON_PAGE },
    { id: "ucsd.edu_oofbkirne67ufj66bbq8hoc31s@group.calendar.google.com", series: "Workshop on Development Economics", field: "Development economics", group: "economics", url: ECON_PAGE },
    { id: "ucsd.edu_fd2u4po5smtmchjet5atr1mln4@group.calendar.google.com", series: "Workshop in Macroeconomics", field: "Macroeconomics", group: "economics", url: ECON_PAGE },
    { id: "ucsd.edu_4pkudmo014ibi88efnest0j894@group.calendar.google.com", series: "Workshop in Theoretical, Behavioral, and Experimental Economics", field: "Theory, behavioral, and experimental economics", group: "economics", url: ECON_PAGE },
    { id: "c_6jv8jlbhek9bbfusgvsjofvvjg@group.calendar.google.com", series: "Global Economy Workshop", field: "Global economy", group: "economics", url: "https://ccd.ucsd.edu/events/global-economy-workshop.html" },
    { id: "c_7vt9igltp8aun39m343ts4fepk@group.calendar.google.com", series: "Workshop in Environmental and Resource Economics", field: "Environmental and resource economics", group: "economics", url: ECON_PAGE },
    { id: "ucsd.edu_k4cp214mehvdidrn229m9kkr7k@group.calendar.google.com", series: "Economics faculty seminars", field: "Economics", group: "economics", url: ECON_PAGE, optional: true }
  ];

  var PAGES = [
    { id: "gsipe", url: "https://gsipe-workshop.github.io/schedule/", parse: parseGsipe },
    { id: "cprp", url: "https://chinesepoliticsresearchinprogress.com/schedule/", parse: parseCprp },
    { id: "pgpelg", url: "https://ccd.ucsd.edu/events/pelg/pelg-speaker-series.html", parse: parsePgpelg },
    { id: "roundtable", url: "https://economics.ucsd.edu/events/economics-roundtable/index.html", parse: parseRoundtable },
    { id: "junior-io", url: "https://io-workshop.github.io/schedule/", parse: parseJuniorIo, optional: true }
  ];

  var DIRECTORY = [
    { id: "china-center", group: "other", name: "21st Century China Center", detail: "Public talks at GPS. Listed here when the center has not posted a current lineup.", url: "https://china.ucsd.edu/events/index.html" },
    { id: "epg", group: "other", name: "Environmental Politics and Governance", detail: "Virtual workshop. Listed here when a current public schedule is not posted.", url: "https://epgnetwork.org/virtual-epg/" },
    { id: "junior-io", group: "other", name: "Junior IO Scholars Workshop", detail: "Virtual workshop on international organizations. Listed here when the speaker lineup is not posted.", url: "https://io-workshop.github.io/" },
    { id: "polisci-programs", group: "political-science", name: "Political Science speaker programs", detail: "Department workshops besides PGPELG. Listed here when dated pages do not show a current lineup.", url: "https://polisci.ucsd.edu/people/faculty/research-and-speaker-programs/index.html" }
  ];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function ymd(year, month, day) {
    return year + "-" + pad(month) + "-" + pad(day);
  }

  function monthNum(name) {
    if (!name) return 0;
    return MONTHS[String(name).toLowerCase().replace(/\./g, "")] || 0;
  }

  function windowRange() {
    var now = new Date();
    var past = new Date(now.getTime() - 45 * 86400000);
    var future = new Date(now.getTime() + 150 * 86400000);
    return { min: past, max: future };
  }

  function inWindow(iso, range) {
    return iso >= toIsoDate(range.min) && iso <= toIsoDate(range.max);
  }

  function toIsoDate(date) {
    return date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
  }

  function slug(text) {
    return String(text || "talk")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "talk";
  }

  function person(name, affiliation, url) {
    return {
      name: String(name || "").replace(/\s+/g, " ").trim(),
      affiliation: affiliation ? String(affiliation).replace(/\s+/g, " ").trim() : "",
      url: url || "",
      note: ""
    };
  }

  function eventRecord(opts) {
    var talks = opts.presentations || [];
    var announced = talks.some(function (t) { return !!(t.topic && String(t.topic).trim()); });
    return {
      id: opts.id,
      date: opts.date,
      start: opts.start,
      end: opts.end,
      durationMin: opts.durationMin,
      group: opts.group,
      format: opts.format || "in-person",
      series: opts.series,
      field: opts.field,
      venue: opts.venue || "",
      place: opts.place || "",
      topicStatus: announced ? "announced" : "unannounced",
      note: opts.note || "",
      presentations: talks,
      links: opts.links || []
    };
  }

  function decodeEntities(text) {
    return String(text || "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&ldquo;|&rdquo;/g, "\"")
      .replace(/&lsquo;|&rsquo;/g, "'")
      .replace(/&mdash;|&ndash;/g, "-")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  function toPlain(raw) {
    var text = String(raw || "");
    if (/<\/?[a-z][\s\S]*>/i.test(text)) {
      text = text
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|h[1-6]|tr|li|blockquote|table)>/gi, "\n")
        .replace(/<a [^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2 <$1>")
        .replace(/<[^>]+>/g, " ");
    }
    return decodeEntities(text)
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function fetchPage(url) {
    return fetch(url, { mode: "cors" })
      .then(function (res) {
        if (!res.ok) throw new Error("direct");
        return res.text();
      })
      .catch(function () {
        return fetch("https://r.jina.ai/" + url, { mode: "cors" }).then(function (res) {
          if (!res.ok) throw new Error("proxy");
          return res.text();
        });
      })
      .then(toPlain);
  }

  function fetchCalendar(cal, range) {
    var params =
      "key=" + encodeURIComponent(GCAL_KEY) +
      "&timeMin=" + encodeURIComponent(range.min.toISOString()) +
      "&timeMax=" + encodeURIComponent(range.max.toISOString()) +
      "&singleEvents=true&orderBy=startTime&maxResults=80";
    var url = "https://www.googleapis.com/calendar/v3/calendars/" +
      encodeURIComponent(cal.id) + "/events?" + params;
    return fetch(url, { mode: "cors" }).then(function (res) {
      if (!res.ok) throw new Error("calendar " + res.status);
      return res.json();
    }).then(function (data) {
      var items = data.items || [];
      var events = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var startIso = item.start && item.start.dateTime;
        var endIso = item.end && item.end.dateTime;
        if (!startIso || !endIso) continue;
        var summary = String(item.summary || "").trim();
        if (!summary) continue;
        if (/no seminar|cancelled|canceled|holiday/i.test(summary)) continue;
        var rest = summary;
        var dash = summary.indexOf(" - ");
        if (dash !== -1) rest = summary.slice(dash + 3).trim();
        var names = rest.split(/\s*,\s*/).map(function (bit) {
          return bit.replace(/\s+/g, " ").trim();
        }).filter(Boolean);
        if (!names.length) names = [rest || summary];
        var loc = String(item.location || "").trim() || "Malk Hall 520/530";
        var virtual = /zoom|virtual/i.test(loc);
        var start = startIso.slice(11, 16);
        var end = endIso.slice(11, 16);
        var mins = Math.max(15, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60000));
        events.push(eventRecord({
          id: cal.id.split("@")[0].slice(-12) + "-" + startIso.slice(0, 10),
          date: startIso.slice(0, 10),
          start: start,
          end: end,
          durationMin: mins,
          group: cal.group,
          format: virtual ? "virtual" : "in-person",
          series: cal.series,
          field: cal.field,
          venue: loc,
          place: virtual ? "Virtual" : "UC San Diego, La Jolla",
          note: "Paper title is not on the department calendar yet.",
          presentations: [{
            topic: "",
            session: "",
            abstract: "",
            speakers: names.map(function (name) { return person(name, "", ""); }),
            discussants: []
          }],
          links: [{ label: "Series calendar", url: cal.url }]
        }));
      }
      return { id: cal.id, series: cal.series, optional: !!cal.optional, events: events };
    });
  }

  function yearFromText(text, fallback) {
    var fall = text.match(/Fall\s+(20\d{2})/i);
    if (fall) return Number(fall[1]);
    var spring = text.match(/Spring\s+(20\d{2})/i);
    if (spring) return Number(spring[1]);
    var any = text.slice(0, 2000).match(/20\d{2}/);
    return any ? Number(any[0]) : fallback;
  }

  function parseGsipe(text, range) {
    var year = yearFromText(text, range.max.getUTCFullYear());
    var parts = text.split(/\n###\s+/);
    var byDate = {};
    for (var i = 1; i < parts.length; i++) {
      var block = parts[i];
      var head = block.match(/^([A-Za-z]+)\s+(\d{1,2})/);
      if (!head) continue;
      var month = monthNum(head[1]);
      var day = Number(head[2]);
      if (!month || !day) continue;
      var date = ymd(year, month, day);
      if (!inWindow(date, range)) continue;
      var sessionMatch = block.match(/\*(Practice Job Talk|Standard Presentation|Early Ideas)[^*]*\*/i);
      var session = sessionMatch ? sessionMatch[1] : "";
      var talks = [];
      var titleRe = /####\s*[“"']([^”"']+)[”"']|“([^”]+)”|"([^"]{12,})"/g;
      var titles = [];
      var tm;
      while ((tm = titleRe.exec(block))) titles.push(tm[1] || tm[2] || tm[3]);
      if (!titles.length) continue;
      var nameRe = /\*\*([^*]+)\*\*\s*\n\s*[*_]([^*_]+)[*_]/g;
      var people = [];
      var nm;
      while ((nm = nameRe.exec(block))) {
        var label = nm[1].replace(/\s+/g, " ").trim();
        if (/^discussant/i.test(label)) continue;
        people.push({ name: label, affiliation: nm[2].replace(/\s+/g, " ").trim() });
      }
      var discRe = /\*\*Discussant:\*\*\s*([^\n]+)/gi;
      var discs = [];
      var dm;
      while ((dm = discRe.exec(block))) discs.push(dm[1].replace(/\s+/g, " ").trim());
      for (var t = 0; t < titles.length; t++) {
        var who = people[t] || people[0] || { name: "", affiliation: "" };
        var discName = discs[t] || "";
        talks.push({
          topic: titles[t].trim(),
          session: session,
          abstract: "",
          speakers: who.name ? [person(who.name, who.affiliation, "")] : [],
          discussants: discName ? [person(discName, "", "")] : []
        });
      }
      if (!talks.length) continue;
      if (!byDate[date]) byDate[date] = [];
      for (var k = 0; k < talks.length; k++) byDate[date].push(talks[k]);
    }
    var events = [];
    Object.keys(byDate).forEach(function (date) {
      events.push(eventRecord({
        id: "gsipe-" + date,
        date: date,
        start: "09:00",
        end: "10:00",
        durationMin: 60,
        group: "political-science",
        format: "virtual",
        series: "GSIPE Workshop",
        field: "International political economy",
        venue: "Zoom",
        place: "Virtual · 12:00–1:00 p.m. Eastern",
        note: "The Zoom link is sent on the GSIPE mailing list.",
        presentations: byDate[date],
        links: [
          { label: "Schedule", url: "https://gsipe-workshop.github.io/schedule/" },
          { label: "Papers", url: "https://gsipe-workshop.github.io/paper/" }
        ]
      }));
    });
    return events;
  }

  function parseCprp(text, range) {
    var chunks = text.split(/\n\s*[-*]{3,}\s*\n/);
    var events = [];
    for (var i = 0; i < chunks.length; i++) {
      var block = chunks[i];
      var dm = block.match(/([A-Za-z]+)\s+(\d{1,2})\s*\([^)]+\),\s*(20\d{2})/);
      if (!dm) continue;
      var month = monthNum(dm[1]);
      var day = Number(dm[2]);
      var year = Number(dm[3]);
      if (!month) continue;
      var date = ymd(year, month, day);
      if (!inWindow(date, range)) continue;
      var titleM = block.match(/[“"]([^”"]{8,})[”"]/);
      var topic = titleM ? titleM[1].trim() : "";
      var speakerM = block.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*\(([^)]+)\)/) ||
        block.match(/\n([A-Z][^\n(]{2,60})\s*\(([^)]+)\)/);
      var name = "";
      var aff = "";
      var url = "";
      if (speakerM) {
        name = (speakerM[1] || "").trim();
        if (speakerM[3]) {
          url = speakerM[2];
          aff = speakerM[3].trim();
        } else if (speakerM[2] && /^https?:/.test(speakerM[2])) {
          url = speakerM[2];
        } else {
          aff = (speakerM[2] || "").trim();
        }
      }
      var absM = block.match(/Abstract[:\s]+([\s\S]+?)(?:\nDiscussants?:|$)/i);
      var abstract = absM ? absM[1].replace(/\s+\n/g, "\n").trim() : "";
      var discs = [];
      var discBlock = block.match(/Discussants?[:\s]+([\s\S]+)$/i);
      if (discBlock) {
        var dpart = discBlock[1];
        var dre = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*\(([^)]+)\)/g;
        var hit;
        while ((hit = dre.exec(dpart))) {
          discs.push(person(hit[1], hit[3], hit[2]));
        }
        if (!discs.length) {
          dpart.split(/\band\b|,/).forEach(function (bit) {
            var clean = bit.replace(/Discussants?/i, "").replace(/https?:\/\/\S+/g, "").trim();
            if (clean.length > 2 && clean.length < 80) discs.push(person(clean, "", ""));
          });
        }
      }
      events.push(eventRecord({
        id: "cprp-" + date,
        date: date,
        start: "11:30",
        end: "12:30",
        durationMin: 60,
        group: "political-science",
        format: "virtual",
        series: "Chinese Politics Research in Progress",
        field: "Chinese politics",
        venue: "Zoom",
        place: "Virtual · 11:30 a.m.–12:30 p.m. Pacific",
        presentations: [{
          topic: topic,
          session: "",
          abstract: abstract,
          speakers: name ? [person(name, aff, url)] : [],
          discussants: discs
        }],
        links: [{ label: "Schedule and Zoom", url: "https://chinesepoliticsresearchinprogress.com/schedule/" }]
      }));
    }
    return events;
  }

  function parsePgpelg(text, range) {
    var year = yearFromText(text, 2026);
    var cut = text.split(/Past Events/i)[0];
    var events = [];
    var rowRe = /\|\s*([A-Za-z]{3,9}\.?)\s+(\d{1,2}),\s*(20\d{2})\s*\|\s*([^|]+)\|\s*([^|]+)\|/g;
    var row;
    while ((row = rowRe.exec(cut))) {
      var month = monthNum(row[1]);
      if (!month) continue;
      var date = ymd(Number(row[3]), month, Number(row[2]));
      if (!inWindow(date, range)) continue;
      var speakerCell = row[4].replace(/\s+/g, " ").trim();
      var affCell = row[5].replace(/\s+/g, " ").trim();
      var speakers = [];
      if (/Ph\.?D\.? Student/i.test(speakerCell)) {
        var names = speakerCell.replace(/^.*?:\s*/, "").split(/\s*,\s*|\s+and\s+/);
        var affMap = {};
        affCell.split(/\s*;\s*/).forEach(function (part) {
          var bits = part.split(":");
          if (bits.length >= 2) {
            var aff = bits.slice(1).join(":").trim();
            bits[0].split(/\s+and\s+/).forEach(function (nm) {
              affMap[nm.trim()] = aff;
            });
          }
        });
        names.forEach(function (nm) {
          nm = nm.trim();
          if (nm) speakers.push(person(nm, affMap[nm] || "", ""));
        });
      } else {
        speakers.push(person(speakerCell, affCell, ""));
      }
      events.push(eventRecord({
        id: "pgpelg-" + date,
        date: date,
        start: "12:30",
        end: "13:45",
        durationMin: 75,
        group: "political-science",
        format: "in-person",
        series: "Peter Gourevitch Political Economy Lunch Group",
        field: "Political economy",
        venue: "GPS Dean's Conference Room",
        place: "UC San Diego, La Jolla",
        presentations: [{ topic: "", session: "", abstract: "", speakers: speakers, discussants: [] }],
        links: [{ label: "Series page", url: "https://ccd.ucsd.edu/events/pelg/pelg-speaker-series.html" }]
      }));
    }
    return events;
  }

  function parseRoundtable(text, range) {
    var events = [];
    var seen = {};
    var re = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})/g;
    var hit;
    while ((hit = re.exec(text))) {
      var date = ymd(Number(hit[3]), monthNum(hit[1]), Number(hit[2]));
      if (seen[date] || !inWindow(date, range)) continue;
      seen[date] = true;
      var slice = text.slice(hit.index, hit.index + 900);
      var timeM = slice.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*([ap]\.?m\.?)/i);
      var start = "16:00";
      var end = "17:00";
      if (timeM) {
        start = to24(timeM[1], timeM[3]);
        end = to24(timeM[2], timeM[3]);
      }
      var locM = slice.match(/Location:\s*([^\n]+)/i);
      var venue = locM ? locM[1].replace(/\s+/g, " ").trim() : "UC San Diego campus";
      var nameM = slice.match(/##\s+([A-Z][^\n]{3,60})/);
      var roleM = slice.match(/##\s+((?:Vice|Professor|Chair)[^\n]+)/);
      var titleM = slice.match(/##\s+([A-Z][^#\n]{12,120})/);
      var speaker = nameM ? nameM[1].trim() : "";
      var topic = "";
      if (titleM && titleM[1] && titleM[1] !== speaker && !/Vice Chair|Professor/i.test(titleM[1])) {
        topic = titleM[1].trim();
      }
      var aff = roleM ? roleM[1].trim() : "";
      var regM = slice.match(/https:\/\/cvent\.me\/\S+/);
      var links = [{ label: "Roundtable page", url: "https://economics.ucsd.edu/events/economics-roundtable/index.html" }];
      if (regM) links.push({ label: "Register", url: regM[0].replace(/[).,]+$/, "") });
      events.push(eventRecord({
        id: "roundtable-" + date,
        date: date,
        start: start,
        end: end,
        durationMin: 60,
        group: "economics",
        format: "hybrid",
        series: "UC San Diego Economics Roundtable",
        field: "Economics roundtable",
        venue: venue,
        place: "UC San Diego",
        presentations: [{
          topic: topic,
          session: "",
          abstract: "",
          speakers: speaker ? [person(speaker, aff, "")] : [],
          discussants: []
        }],
        links: links
      }));
    }
    return events;
  }

  function to24(hhmm, ampm) {
    var bits = hhmm.split(":");
    var h = parseInt(bits[0], 10);
    var m = bits[1] || "00";
    var pm = /p/i.test(ampm);
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
    return pad(h) + ":" + m;
  }

  function parseJuniorIo(text, range) {
    var events = [];
    var year = yearFromText(text, range.max.getUTCFullYear());
    var re = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:,\s*(20\d{2}))?/g;
    var hit;
    var seen = {};
    while ((hit = re.exec(text))) {
      var y = hit[3] ? Number(hit[3]) : year;
      var date = ymd(y, monthNum(hit[1]), Number(hit[2]));
      if (seen[date] || !inWindow(date, range)) continue;
      seen[date] = true;
      var slice = text.slice(hit.index, hit.index + 500);
      var titleM = slice.match(/[“"]([^”"]{8,})[”"]/);
      var nameM = slice.match(/\*\*([^*]{3,60})\*\*/);
      events.push(eventRecord({
        id: "junior-io-" + date,
        date: date,
        start: "08:00",
        end: "09:00",
        durationMin: 60,
        group: "other",
        format: "virtual",
        series: "Junior IO Scholars Workshop",
        field: "International organizations",
        venue: "Zoom",
        place: "Virtual",
        presentations: [{
          topic: titleM ? titleM[1] : "",
          session: "",
          abstract: "",
          speakers: nameM ? [person(nameM[1], "", "")] : [],
          discussants: []
        }],
        links: [{ label: "Series page", url: "https://io-workshop.github.io/" }]
      }));
    }
    return events;
  }

  function load() {
    var range = windowRange();
    var errors = [];
    var calJobs = CALENDARS.map(function (cal) {
      return fetchCalendar(cal, range).catch(function () {
        if (!cal.optional) errors.push(cal.series);
        return { id: cal.id, series: cal.series, optional: !!cal.optional, events: [], failed: true };
      });
    });
    var pageJobs = PAGES.map(function (src) {
      return fetchPage(src.url).then(function (text) {
        return { id: src.id, events: src.parse(text, range) || [], failed: false };
      }).catch(function () {
        if (!src.optional) errors.push(src.id);
        return { id: src.id, events: [], failed: true };
      });
    });
    return Promise.all([Promise.all(calJobs), Promise.all(pageJobs)]).then(function (pack) {
      var events = [];
      var facultyCount = 0;
      var juniorCount = 0;
      pack[0].forEach(function (res) {
        events = events.concat(res.events);
        if (res.series === "Economics faculty seminars") facultyCount = res.events.length;
      });
      pack[1].forEach(function (res) {
        events = events.concat(res.events);
        if (res.id === "junior-io") juniorCount = res.events.length;
      });
      var seen = {};
      var uniq = [];
      events.forEach(function (ev) {
        var key = ev.series + "|" + ev.date + "|" + ev.start + "|" + ((ev.presentations[0] && ev.presentations[0].speakers[0] && ev.presentations[0].speakers[0].name) || "");
        if (seen[key]) return;
        seen[key] = true;
        uniq.push(ev);
      });
      uniq.sort(function (a, b) {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
      });
      var directory = DIRECTORY.filter(function (item) {
        if (item.id === "junior-io") return juniorCount === 0;
        return true;
      });
      if (facultyCount === 0) {
        directory.push({
          id: "econ-faculty",
          group: "economics",
          name: "Economics faculty seminars",
          detail: "The department faculty-seminar calendar has no dated talks in the current window.",
          url: ECON_PAGE
        });
      }
      return {
        timezone: TZ,
        fetchedAt: new Date().toISOString(),
        errors: errors,
        events: uniq,
        directory: directory
      };
    });
  }

  root.SeminarLive = { load: load };
})(window);
