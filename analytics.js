(() => {
  const measurementId = "G-KJ7HDK0P9M";
  const storageKey = "tp-analytics-consent-v1";
  const maxAge = 180 * 24 * 60 * 60 * 1000;
  const production = ["thuispizza.nl", "www.thuispizza.nl"].includes(location.hostname);
  let loaded = false;
  let choice = null;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && ["granted", "denied"].includes(saved.value) &&
        Number.isFinite(saved.time) && Date.now() - saved.time < maxAge && saved.time <= Date.now()) {
      choice = saved.value;
    }
  } catch {
    // A blocked storage API must not prevent visitors from choosing.
  }

  window[`ga-disable-${measurementId}`] = choice !== "granted";

  function startAnalytics() {
    if (loaded || !production) return;
    loaded = true;
    window[`ga-disable-${measurementId}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // Query strings and fragments can contain visitor-entered information.
      page_location: location.origin + location.pathname,
      page_referrer: cleanReferrer(),
      ...knownAiCampaign()
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }

  function knownAiCampaign() {
    // Retain only recognized AI source tokens, never arbitrary query values.
    const source = new URLSearchParams(location.search).get("utm_source");
    const allowed = ["chatgpt.com", "perplexity.ai", "copilot.microsoft.com", "claude.ai"];
    return allowed.includes(source) ? { campaign_source: source, campaign_medium: "referral" } : {};
  }

  function cleanReferrer() {
    try {
      const url = new URL(document.referrer);
      return url.origin + url.pathname;
    } catch {
      return "";
    }
  }

  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.trim().split("=")[0];
      if (name !== "_ga" && !name.startsWith("_ga_")) continue;
      for (const domain of ["", location.hostname, ".thuispizza.nl"]) {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
      }
    }
  }

  const banner = document.createElement("section");
  banner.className = "analytics-consent";
  banner.id = "analytics-consent";
  banner.setAttribute("aria-labelledby", "analytics-consent-title");
  banner.innerHTML = `
    <h2 id="analytics-consent-title">Help je de website verbeteren?</h2>
    <p>Met je toestemming gebruiken we Google Analytics om bezoeken en het gebruik van onze pagina's te meten.
    Je kunt ook zonder statistiekcookies verder. <a href="privacy.html">Meer over privacy</a></p>
    <div class="analytics-consent-actions">
      <button type="button" class="button secondary" data-consent="denied">Geen statistieken</button>
      <button type="button" class="button" data-consent="granted">Statistieken toestaan</button>
    </div>`;
  banner.hidden = choice !== null;
  document.body.append(banner);

  const settings = document.createElement("button");
  settings.type = "button";
  settings.className = "analytics-settings";
  settings.textContent = "Statistiekcookies";
  settings.setAttribute("aria-controls", "analytics-consent");
  settings.addEventListener("click", () => {
    banner.hidden = false;
    banner.querySelector("button").focus();
  });
  const footer = document.querySelector(".footer") || document.body;
  footer.append(settings);

  banner.querySelectorAll("[data-consent]").forEach((button) => {
    button.addEventListener("click", () => {
      choice = button.dataset.consent;
      try {
        localStorage.setItem(storageKey, JSON.stringify({ value: choice, time: Date.now() }));
      } catch {
        // The choice still applies to this page if persistence is unavailable.
      }
      banner.hidden = true;
      settings.focus();
      if (choice === "granted") {
        startAnalytics();
      } else {
        window[`ga-disable-${measurementId}`] = true;
        if (loaded) window.gtag("consent", "update", { analytics_storage: "denied" });
        clearAnalyticsCookies();
        // Unload the running tag after withdrawal to stop automatic events too.
        if (loaded) location.reload();
      }
    });
  });

  window.pizzaTrack = function (name, item) {
    if (choice !== "granted" || !loaded) return false;
    if (!["dough_calculation_start", "dough_calculation_complete", "merchant_click"].includes(name)) return false;
    const parameters = { page_location: location.origin + location.pathname };
    if (name === "merchant_click") {
      if (item !== "baking-steel-original") return false;
      parameters.item_id = item;
    }
    window.gtag("event", name, parameters);
    return true;
  };

  document.querySelectorAll("a[data-merchant]").forEach(link => {
    link.addEventListener("click", () => window.pizzaTrack("merchant_click", link.dataset.merchant));
  });

  if (choice === "granted") startAnalytics();
  else clearAnalyticsCookies();
})();
