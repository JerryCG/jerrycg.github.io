/**
 * Offline i18n for jerrycg.github.io
 * No external APIs — works in mainland China (no Google Translate dependency).
 */
(function () {
  "use strict";

  var LANG_KEY = "lang";
  var DEFAULT_LANG = "en";
  var SUPPORTED = ["en", "zh-CN"];

  var STRINGS = {
    en: {
      "meta.title": "Guo (Jerry) Cheng",
      "meta.description":
        "Guo (Jerry) Cheng — Incoming PhD in Political Science at UC San Diego. Interdisciplinary research in policy-driven economics and political science.",
      "skip": "Skip to content",
      "brand.home": "Guo (Jerry) Cheng — home",
      "brand.name": "Guo Cheng",
      "hero.name": "Guo (Jerry) Cheng",
      "footer.name": "Guo (Jerry) Cheng",
      "nav.about": "About",
      "nav.research": "Research",
      "nav.cv": "CV",
      "nav.primary": "Primary",
      "lang.label": "Language",
      "lang.en": "English",
      "lang.zh": "简体中文",
      "theme.toggle": "Toggle light / dark theme",
      "hero.role": "Incoming PhD in Polisci @UCSD",
      "hero.lede":
        "An explorer in interdisciplinary research of policy-driven economics and political science.",
      "hero.cv": "Download CV",
      "hero.research": "View research",
      "social.profiles": "Profiles and contact",
      "social.email": "Email",
      "social.scholar": "Scholar",
      "social.orcid": "ORCID",
      "social.linkedin": "LinkedIn",
      "social.github": "GitHub",
      "photo.alt": "Fatty Fries, a British Shorthair cat, resting on a bed",
      "photo.name": "Fatty Fries",
      "photo.note": "British Shorthair · site co-director",
      "about.title": "About",
      "about.p1":
        "I am an incoming PhD student in Political Science at UC San Diego. My main research interests are broad in international topics — including international relations, organizations and institutions, trade, and political economy — and my work is policy-oriented.",
      "about.p2":
        "I approach these questions with interdisciplinary tools from political science and economics, aiming for research that is theoretically grounded and useful for understanding real-world policy.",
      "about.p3":
        'Beyond research, I love furry animals — especially British and American Shorthairs and red pandas. I love music; here is a collection of what I enjoy: <a href="https://jerrycg.github.io/music-player/" target="_blank" rel="noopener noreferrer">果子狸のMusic Player</a>. My favorite singers are Celine Dion, Jessie J, and Sohyang — they are my beacons. I also love watching sports, and here is my visualization project <a href="https://tennis-vis.onrender.com/" target="_blank" rel="noopener noreferrer">TennisVis</a> to honor the GOAT, Novak Djokovic.',
      "edu.title": "Education",
      "edu.ucsd.school": "UC San Diego",
      "edu.ucsd.years": "Incoming",
      "edu.ucsd.degree": "PhD, Political Science",
      "edu.uchicago.school": "University of Chicago",
      "edu.uchicago.degree": "MA, Computational Social Science (Economics)",
      "edu.cityu.school": "City University of Hong Kong",
      "edu.cityu.degree": "BBA, Finance · Minors in CS & Mathematics",
      "research.label": "Research",
      "research.title": "Selected work",
      "research.publication": "Publication",
      "research.working": "Working papers",
      "research.wip": "Work in progress",
      "research.thesis": "Thesis",
      "paper.fatf.title":
        "On the Performance-based Legitimacy of Financial Action Task Force: A Quantitative Exploration",
      "paper.fatf.meta": "with Bo Wen · Regulation & Governance (2025), online first",
      "paper.fatf.note":
        "Note: In the published text, the terms “mediation/mediate” should be read as “moderation/moderate” to denote the correct statistical concept.",
      "paper.fatf.abstract":
        "How legitimate is Financial Action Task Force (FATF)? We address this question with cross-country evidence spanning performance-wise aspects—standards, evaluation, strategy. FATF’s legitimacy needs strengthening. Standards-wise, compliance to FATF’s Recommendations generally contributes to both FATF’s and external effectiveness proxies, yet the latter has much weaker evidence. Granularly, FATF’s Recommendations pose challenges for good-faith developing states, since capacity constraints hinder compliance and effectiveness conversion. Evaluation-wise, the effectiveness appraisal may be biased due to heavy reliance on compliance ratings, evidenced by weak correlations with external corruption control and financial transparency indicators. Strategy-wise, though enhanced follow-up boosts persistent compliance, the dominantly punitive strategy system is detrimental to good-faith yet low-capacity states. Theoretically, we build an extended framework on Mitchell’s theory by deepening the analysis of effectiveness and justifying its applicability to non-binding institutions. We also enrich the dialogue on the legitimacy of international organizations by presenting a quantitative, objective approach using official data.",
      "paper.ngm.title":
        "Neoclassical Growth Revisited: Why Are Policy Functions Myopic in Closed-Form?",
      "paper.ngm.meta": "with Sergio Salas",
      "paper.ngm.abstract":
        "In learning macroeconomic dynamics, it is common to start with a version of the Neoclassical Growth Model (NGM) that admits closed-form solutions. This involves analyzing a special case with: i) log utility, ii) a Cobb–Douglas production function, and iii) full depreciation. While the existence of a closed-form solution under these assumptions has long been established, the implications for households and the role of their forward-looking behavior in deriving the results are seldom explained. This is particularly relevant in connection to the “news” literature, because unlike in a purely Markovian recursive structure, news about future changes in the economic environment—e.g., changes in productivity—generally produce current effects. However, under the special case of the NGM that admits closed-form solutions, news about future changes has no current effects. To understand why this result holds, we present the market approach to solving the problem, where it is revealed exactly what economic forces underlie the fact that agents do not react to news about future changes in wages and interest rates.",
      "paper.wip.title":
        "A Structural Model of Institutional Competition and Academic Mobility: Evidence from Elite Economics",
      "paper.thesis.title":
        "Fertility Outcomes and Preferences in China: A Two-way Causal Analysis",
      "paper.thesis.meta": "Master’s thesis · supervised by Christina Brown",
      "paper.thesis.abstract":
        "This study explores the bidirectional causality between fertility preferences and outcomes in China, using the latest two waves of the Chinese General Social Survey (CGSS 2018 and 2021). The findings highlight significant implications for two contrasting phenomena observed in the data: 1) A progressive shift from son preference to daughter preference overall across cohorts; 2) A persistent gender discrepancy between fertility outcomes and preferences — actual fertility outcomes are more skewed towards boys than ideal fertility preferences suggest. The shift towards the daughter preference can be attributed to the “girl-updating” mechanism: having girls on average reduces the gender gap in preferences by approximately 0.5 children, while the effects of having boys are less consistent. On the other hand, the gender discrepancy between fertility outcomes and preferences can be explained by two behavioral patterns: 18% of the discrepancy comes from people with a son preference taking more aggressive measures to ensure male offspring, whereas 82% is attributed to the “implicit son preference” among people with a balance preference, who opt for a boy when limited to only one child. Moreover, a dynamic Difference-in-Differences study suggests that during the early stage of birth control policies, urban residents with a balance preference suffer from increasingly stricter constraints of having only one child than their rural counterparts, exacerbating the skewed sex ratio.",
      "link.abstract": "Abstract",
      "link.pdf": "Download PDF",
      "link.slides": "Slides",
      "link.data": "Data (FATF 4th-round ratings, as of Jul 2025)",
      "link.doi": "Publisher (DOI)",
      "link.draft": "Draft PDF",
      "link.thesis": "Thesis record",
      "cv.label": "Curriculum Vitae",
      "cv.title": "Full CV",
      "cv.date": "As of July 2026",
      "cv.download": "Download PDF",
      "footer.email": "Email",
      "footer.main": "main",
      "footer.copy": "© {year} Guo (Jerry) Cheng"
    },
    "zh-CN": {
      "meta.title": "程果（杰瑞）",
      "meta.description":
        "程果（杰瑞）— 加州大学圣地亚哥分校政治科学博士（即将入学）。关注政策导向的经济学与政治科学交叉研究。",
      "skip": "跳到正文",
      "brand.home": "程果 — 首页",
      "brand.name": "程果",
      "hero.name": "程果（杰瑞）",
      "footer.name": "程果（杰瑞）",
      "nav.about": "关于",
      "nav.research": "研究",
      "nav.cv": "简历",
      "nav.primary": "主导航",
      "lang.label": "语言",
      "lang.en": "English",
      "lang.zh": "简体中文",
      "theme.toggle": "切换浅色 / 深色主题",
      "hero.role": "加州大学圣地亚哥分校 · 政治科学博士（即将入学）",
      "hero.lede": "探索政策导向的经济学与政治科学交叉研究。",
      "hero.cv": "查看简历",
      "hero.research": "查看研究",
      "social.profiles": "个人主页与联系方式",
      "social.email": "邮箱",
      "social.scholar": "学术主页",
      "social.orcid": "ORCID",
      "social.linkedin": "领英",
      "social.github": "GitHub",
      "photo.alt": "肥薯，一只躺在床上的英国短毛猫",
      "photo.name": "肥薯",
      "photo.note": "英短 · 本站联合站长",
      "about.title": "关于",
      "about.p1":
        "我是加州大学圣地亚哥分校政治科学博士（即将入学）。主要研究兴趣广泛涉及国际议题——包括国际关系、国际组织与制度、贸易以及政治经济学——并以政策导向的研究为取向。",
      "about.p2":
        "我结合政治科学与经济学的跨学科方法研究这些问题，致力于产出具有理论根基、并有助于理解现实政策的研究。",
      "about.p3":
        '研究之外，我喜欢毛茸茸的小动物——尤其是英短、美短和小熊猫。我热爱音乐；这里是我喜欢的作品合集：<a href="https://jerrycg.github.io/music-player/" target="_blank" rel="noopener noreferrer">果子狸のMusic Player</a>。我最喜欢的歌手是席琳·迪翁（Celine Dion）、结石姐（Jessie J）和少香（Sohyang）——她们是我的灯塔。我也热爱体育，这里是我的可视化项目 <a href="https://tennis-vis.onrender.com/" target="_blank" rel="noopener noreferrer">TennisVis</a>，致敬 GOAT 诺瓦克·德约科维奇。',
      "edu.title": "教育经历",
      "edu.ucsd.school": "加州大学圣地亚哥分校",
      "edu.ucsd.years": "即将入学",
      "edu.ucsd.degree": "政治科学博士",
      "edu.uchicago.school": "芝加哥大学",
      "edu.uchicago.degree": "计算社会科学硕士（经济学方向）",
      "edu.cityu.school": "香港城市大学",
      "edu.cityu.degree": "金融学工商管理学士 · 辅修计算机科学与数学",
      "research.label": "研究",
      "research.title": "精选成果",
      "research.publication": "已发表",
      "research.working": "工作论文",
      "research.wip": "进行中",
      "research.thesis": "学位论文",
      "paper.fatf.title":
        "论金融行动特别工作组（FATF）基于绩效的合法性：一项定量探索",
      "paper.fatf.meta": "与温博合作 · 《规制与治理》(Regulation & Governance)（2025），网络优先出版",
      "paper.fatf.note":
        "说明：正式发表文本中的 “mediation/mediate” 应理解为 “moderation/moderate”，以对应正确的统计概念（调节而非中介）。",
      "paper.fatf.abstract":
        "金融行动特别工作组（FATF）的合法性如何？我们以跨国证据，从标准、评估与策略等绩效维度回应这一问题。FATF 的合法性仍有待加强。在标准层面，对 FATF 建议的合规总体有助于 FATF 自身与外部有效性代理指标，但后者的证据明显更弱。细分来看，FATF 建议对善意发展中国家构成挑战，因为能力约束阻碍了合规及其向有效性的转化。在评估层面，有效性评价可能因过度依赖合规评级而存在偏误，这与外部腐败控制与金融透明度指标的弱相关相一致。在策略层面，尽管强化后续跟进有助于持续合规，但以惩罚为主导的策略体系对善意却能力不足的国家不利。理论上，我们在 Mitchell 理论基础上扩展分析框架，深化有效性分析，并论证其适用于非约束性制度。我们也通过基于官方数据的定量、客观方法，丰富关于国际组织合法性的讨论。",
      "paper.ngm.title": "再论新古典增长：为何闭式解中的政策函数是“短视”的？",
      "paper.ngm.meta": "与 Sergio Salas 合作",
      "paper.ngm.abstract":
        "在学习宏观动态时，人们常从可得到闭式解的新古典增长模型（NGM）特例入手，通常包括：i) 对数效用，ii) 柯布—道格拉斯生产函数，iii) 完全折旧。尽管在这些假设下闭式解的存在早已确立，其对家庭行为的含义、以及前瞻性行为在推导中的作用却很少被解释清楚。这一点与“消息”（news）文献尤为相关：与纯马尔可夫递归结构不同，关于未来经济环境变化（例如生产率变化）的消息通常会产生当期效应。然而，在上述可闭式求解的 NGM 特例中，关于未来变化的消息却没有当期效应。为理解这一结果，我们给出市场法求解路径，从而精确揭示：为何行为人不会对工资与利率未来变化的消息作出反应。",
      "paper.wip.title":
        "制度竞争与学术流动的结构模型：来自顶尖经济学的证据",
      "paper.thesis.title": "中国生育偏好与生育结果的双向因果分析",
      "paper.thesis.meta": "硕士学位论文 · 导师 Christina Brown",
      "paper.thesis.abstract":
        "本研究利用中国综合社会调查（CGSS 2018 与 2021）最新两期数据，探讨中国生育偏好与生育结果之间的双向因果关系。研究发现对数据中两个对照鲜明的现象具有重要含义：1）跨队列总体呈现由男孩偏好向女孩偏好的渐进转变；2）生育结果与理想偏好之间持续存在性别落差——实际生育结果比理想偏好更偏向男孩。向女孩偏好的转变可用“女孩更新”机制解释：平均而言，生育女孩会将偏好中的性别差距缩小约 0.5 个孩子，而生育男孩的影响则不那么一致。另一方面，结果与偏好的性别落差可由两类行为模式解释：约 18% 来自具有男孩偏好者采取更积极手段以确保男性子嗣；约 82% 归因于平衡偏好者中的“隐性男孩偏好”——在只能生育一个孩子时更倾向选择男孩。此外，动态双重差分分析表明，在计划生育早期阶段，城市中持平衡偏好的居民比农村居民面临更严格的“一孩”约束，从而加剧了性别比失衡。",
      "link.abstract": "摘要",
      "link.pdf": "下载 PDF",
      "link.slides": "幻灯片",
      "link.data": "数据（FATF 第四轮评分，截至 2025 年 7 月）",
      "link.doi": "出版社页面（DOI）",
      "link.draft": "论文草稿 PDF",
      "link.thesis": "论文存档",
      "cv.label": "个人简历",
      "cv.title": "完整简历",
      "cv.date": "截至 2026 年 7 月",
      "cv.download": "下载 PDF",
      "footer.email": "邮箱",
      "footer.main": "主要",
      "footer.copy": "© {year} 程果（杰瑞）"
    }
  };

  function getStoredLang() {
    try {
      var v = localStorage.getItem(LANG_KEY);
      return SUPPORTED.indexOf(v) !== -1 ? v : null;
    } catch (e) {
      return null;
    }
  }

  function resolveLang() {
    return getStoredLang() || DEFAULT_LANG;
  }

  function t(lang, key) {
    var pack = STRINGS[lang] || STRINGS[DEFAULT_LANG];
    if (pack[key] != null) return pack[key];
    if (STRINGS[DEFAULT_LANG][key] != null) return STRINGS[DEFAULT_LANG][key];
    return key;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var root = document.documentElement;
    root.setAttribute("lang", lang === "zh-CN" ? "zh-CN" : "en");
    root.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var value = t(lang, key);
      if (key === "footer.copy") {
        var yearEl = document.getElementById("year");
        var year = yearEl ? yearEl.textContent : String(new Date().getFullYear());
        value = value.replace("{year}", year);
      }
      el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(lang, key);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      el.setAttribute("aria-label", t(lang, key));
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (!key) return;
      el.setAttribute("title", t(lang, key));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (!key) return;
      el.setAttribute("alt", t(lang, key));
    });

    var titleEl = document.querySelector("title");
    if (titleEl) titleEl.textContent = t(lang, "meta.title");
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t(lang, "meta.description"));
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", t(lang, "meta.description"));
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", t(lang, "meta.title"));

    document.querySelectorAll(".lang-option").forEach(function (btn) {
      var code = btn.getAttribute("data-lang");
      btn.setAttribute("aria-selected", code === lang ? "true" : "false");
      btn.classList.toggle("is-active", code === lang);
    });

    var current = document.getElementById("lang-current");
    if (current) {
      current.textContent = lang === "zh-CN" ? "中文" : "EN";
    }

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }

  function initLangSwitch() {
    var switcher = document.getElementById("lang-switch");
    var btn = document.getElementById("lang-toggle");
    var menu = document.getElementById("lang-menu");
    if (!switcher || !btn || !menu) return;

    function closeMenu() {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      switcher.classList.remove("is-open");
    }

    function openMenu() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      switcher.classList.add("is-open");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    menu.querySelectorAll(".lang-option").forEach(function (option) {
      option.addEventListener("click", function () {
        var code = option.getAttribute("data-lang");
        applyLang(code);
        closeMenu();
      });
    });

    document.addEventListener("click", function (e) {
      if (!switcher.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  // Boot: year first so footer copy can use it
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  applyLang(resolveLang());
  initLangSwitch();

  window.SiteI18n = {
    apply: applyLang,
    resolve: resolveLang,
    t: function (key) {
      return t(resolveLang(), key);
    }
  };
})();
