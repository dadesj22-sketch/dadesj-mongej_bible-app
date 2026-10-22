// Interface languages. To fix or add a word, just edit the text below.
const STRINGS = {
  en: {
    title: "Bible Reader",
    openPrompt: "Type a reference on the left page to begin reading.",
    noText: "The Waray-Waray Bible text has not been added to the database yet.",
    warayLink: "Read the Waray-Waray Bible online ↗",
    contactHelp: "Need help logging in or creating an account? Please contact the developer:",
    book: "Book",
    chapter: "Chapter",
    version: "Bible version",
    language: "Language",
    searchLabel: "Verse or chapter",
    read: "Read",
    votd: "Verse of the day",
    loading: "Loading…",
    bookmark: "Bookmark",
    removeBookmark: "Remove bookmark",
    prev: "Previous chapter",
    next: "Next chapter",
    copy: "Copy text",
    bookmarks: "Bookmarks",
    noBookmarks: "No bookmarks yet. Open a passage and choose Bookmark.",
    remove: "Remove",
    logout: "Log out",
    notFound: "Passage not found. Check the reference and try again.",
    loadFail: "Could not load the passage. Check your connection.",
    copied: "Copied to clipboard.",
    copyFail: "Copy is not available in this browser.",
    votdFail: "Could not load a verse right now.",
    serverError: "Server error. Is Apache running in XAMPP?",
    unreachable: "Cannot reach the server. Is Apache running in XAMPP?",
    hintOther: "For this version, type the book name in its own language.",
    loginSubtitle: "Log in to open your dashboard",
    email: "Email address",
    password: "Password (8+ characters)",
    login: "Log in",
    createAccount: "Create account",
    wait: "Please wait…",
  },

  tl: {
    title: "Mambabasa ng Biblia",
    openPrompt: "Mag-type ng reperensya sa kaliwang pahina para magsimulang magbasa.",
    noText: "Hindi pa naidaragdag sa database ang teksto ng Biblia sa Waray-Waray.",
    warayLink: "Basahin ang Biblia sa Waray-Waray online ↗",
    contactHelp: "Kailangan ng tulong sa pag-log in o paggawa ng account? Makipag-ugnayan sa developer:",
    book: "Aklat",
    chapter: "Kabanata",
    version: "Bersyon ng Biblia",
    language: "Wika",
    searchLabel: "Talata o kabanata",
    read: "Basahin",
    votd: "Talata ng Araw",
    loading: "Naglo-load…",
    bookmark: "I-bookmark",
    removeBookmark: "Alisin ang bookmark",
    prev: "Naunang kabanata",
    next: "Susunod na kabanata",
    copy: "Kopyahin ang teksto",
    bookmarks: "Mga Bookmark",
    noBookmarks: "Wala pang bookmark. Magbukas ng talata at piliin ang I-bookmark.",
    remove: "Alisin",
    logout: "Mag-log out",
    notFound: "Hindi nahanap ang talata. Suriin ang reperensya at subukan muli.",
    loadFail: "Hindi ma-load ang talata. Tingnan ang iyong koneksyon.",
    copied: "Nakopya na.",
    copyFail: "Hindi available ang pagkopya sa browser na ito.",
    votdFail: "Hindi makapag-load ng talata ngayon.",
    serverError: "Error sa server. Tumatakbo ba ang Apache sa XAMPP?",
    unreachable: "Hindi maabot ang server. Tumatakbo ba ang Apache sa XAMPP?",
    hintOther: "Para sa bersyong ito, isulat ang pangalan ng aklat sa sarili nitong wika.",
    loginSubtitle: "Mag-log in para buksan ang iyong dashboard",
    email: "Email address",
    password: "Password (8+ karakter)",
    login: "Mag-log in",
    createAccount: "Gumawa ng account",
    wait: "Sandali lang…",
  },

  // Best-effort Waray-Waray: please have a native speaker check these.
  war: {
    title: "Mamabasa han Biblia",
    openPrompt: "Isulat an reperensya ha wala nga pahina basi makapagtikang pagbasa.",
    noText: "Waray pa nadugang ha database an teksto han Biblia ha Waray-Waray.",
    warayLink: "Basaha an Biblia ha Waray-Waray online ↗",
    contactHelp: "Kinahanglan hin bulig ha pag-log in o paghimo hin account? Kontaka an developer:",
    book: "Libro",
    chapter: "Kapitulo",
    version: "Bersyon han Biblia",
    language: "Yinaknan",
    searchLabel: "Bersikulo o kapitulo",
    read: "Basaha",
    votd: "Bersikulo han Adlaw",
    loading: "Naglo-load…",
    bookmark: "I-bookmark",
    removeBookmark: "Kuhaa an bookmark",
    prev: "Nauna nga kapitulo",
    next: "Sunod nga kapitulo",
    copy: "Kopyaha an teksto",
    bookmarks: "Mga Bookmark",
    noBookmarks: "Waray pa bookmark. Buksi an usa nga bersikulo ngan pilia an I-bookmark.",
    remove: "Kuhaa",
    logout: "Mag-log out",
    notFound: "Diri nakit-an an bersikulo. Usisaa an reperensya ngan subuki liwat.",
    loadFail: "Diri ma-load an bersikulo. Usisaa an imo koneksyon.",
    copied: "Nakopya na.",
    copyFail: "Diri magamit an pagkopya hini nga browser.",
    votdFail: "Diri makapag-load hin bersikulo yana.",
    serverError: "Sayop han server. Nagdadagan ba an Apache ha XAMPP?",
    unreachable: "Diri maabot an server. Nagdadagan ba an Apache ha XAMPP?",
    hintOther: "Para hini nga bersyon, isulat an ngaran han libro ha iya kalugaringon nga yinaknan.",
    loginSubtitle: "Mag-log in basi mabuksan an imo dashboard",
    email: "Email address",
    password: "Password (8+ nga karakter)",
    login: "Mag-log in",
    createAccount: "Maghimo hin account",
    wait: "Maghulat anay…",
  },
};

const HTML_LANG = { en: "en", tl: "fil", war: "war" };
let lang = "en";
try {
  const saved = localStorage.getItem("bible-lang");
  if (STRINGS[saved]) lang = saved;
} catch {}

function t(key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}

function applyI18n() {
  document.documentElement.lang = HTML_LANG[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
}

function setLang(code) {
  if (!STRINGS[code]) return;
  lang = code;
  try {
    localStorage.setItem("bible-lang", code);
  } catch {}
  applyI18n();
  document.dispatchEvent(new Event("langchange"));
}

const langSelect = document.getElementById("lang");
if (langSelect) {
  langSelect.value = lang;
  langSelect.addEventListener("change", () => setLang(langSelect.value));
}
applyI18n();