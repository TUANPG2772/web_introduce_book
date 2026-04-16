(function () {
  var MARKET_HOSTS = {
    US: "www.amazon.com",
    UK: "www.amazon.co.uk",
    GB: "www.amazon.co.uk",
    DE: "www.amazon.de",
    FR: "www.amazon.fr",
    ES: "www.amazon.es",
    IT: "www.amazon.it",
    NL: "www.amazon.nl",
    PL: "www.amazon.pl",
    SE: "www.amazon.se",
    BE: "www.amazon.com.be",
    IE: "www.amazon.ie",
    JP: "www.amazon.co.jp",
    CA: "www.amazon.ca",
    AU: "www.amazon.com.au"
  };

  var LANGUAGE_FALLBACKS = {
    de: "DE",
    fr: "FR",
    es: "ES",
    it: "IT",
    nl: "NL",
    pl: "PL",
    sv: "SE",
    ja: "JP"
  };

  function normalizeMarket(region) {
    var normalized = String(region || "").trim().toUpperCase();
    if (!normalized) {
      return "US";
    }

    if (normalized === "GB") {
      return "UK";
    }

    if (MARKET_HOSTS[normalized]) {
      return normalized;
    }

    return "US";
  }

  function extractRegion(locale) {
    var value = String(locale || "");
    var parts = value.replace("_", "-").split("-");

    for (var i = parts.length - 1; i >= 0; i -= 1) {
      var token = parts[i].toUpperCase();
      if (/^[A-Z]{2}$/.test(token)) {
        return token;
      }
    }

    return "";
  }

  function detectMarket() {
    var locales = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ""];

    for (var i = 0; i < locales.length; i += 1) {
      var region = extractRegion(locales[i]);
      var market = normalizeMarket(region);
      if (market !== "US" || region === "US") {
        return market;
      }
    }

    for (var j = 0; j < locales.length; j += 1) {
      var language = String(locales[j] || "").split(/[-_]/)[0].toLowerCase();
      if (LANGUAGE_FALLBACKS[language]) {
        return LANGUAGE_FALLBACKS[language];
      }
    }

    return "US";
  }

  function localizeAmazonUrl(url, market) {
    var resolvedMarket = normalizeMarket(market);
    var targetHost = MARKET_HOSTS[resolvedMarket] || MARKET_HOSTS.US;

    try {
      var parsed = new URL(url, window.location.origin);
      parsed.protocol = "https:";
      parsed.host = targetHost;
      return parsed.toString();
    } catch (error) {
      return "https://" + targetHost;
    }
  }

  function updateAmazonLink(link) {
    var baseHref = link.getAttribute("data-amazon-base") || link.getAttribute("href") || "https://www.amazon.com";
    var market = detectMarket();
    var localizedHref = localizeAmazonUrl(baseHref, market);
    link.setAttribute("href", localizedHref);
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[data-amazon-market="auto"]');
    if (!link) {
      return;
    }

    updateAmazonLink(link);
  });

  var autoLinks = document.querySelectorAll('a[data-amazon-market="auto"]');
  autoLinks.forEach(function (link) {
    updateAmazonLink(link);
  });
})();
