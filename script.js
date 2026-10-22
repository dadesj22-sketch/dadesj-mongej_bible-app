const API = "https://bible-api.com";

const els = {
  translation: document.getElementById("translation"),
  form: document.getElementById("search-form"),
  ref: document.getElementById("ref"),
  votdText: document.getElementById("votd-text"),
  votdRef: document.getElementById("votd-ref"),
  reader: document.getElementById("reader"),
  title: document.getElementById("reader-title"),
  verses: document.getElementById("verses"),
  message: document.getElementById("message"),
  bookmarkBtn: document.getElementById("bookmark-btn"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  copy: document.getElementById("copy"),
  list: document.getElementById("bookmark-list"),
  empty: document.getElementById("bookmark-empty"),
};

const leaf = document.getElementById("leaf");
const openPrompt = document.getElementById("open-prompt");
const pickerForm = document.getElementById("picker-form");
const bookSelect = document.getElementById("book-select");
const chapterInput = document.getElementById("chapter-input");

/* ---------- Tagalog Bible (Ang Dating Biblia 1905, public domain) via getBible ---------- */
const GETBIBLE_API = "https://api.getbible.net/v2";
const GETBIBLE = new Set(["tagalog", "waray"]); // versions that are not on bible-api.com
const DB_VERSIONS = new Set(["waray"]); // versions stored in your own MySQL database

// [English name, Tagalog name]; the position in the list + 1 is the book number
const BOOKS = [
  ["Genesis", "Genesis"], ["Exodus", "Exodo"], ["Leviticus", "Levitico"], ["Numbers", "Mga Bilang"],
  ["Deuteronomy", "Deuteronomio"], ["Joshua", "Josue"], ["Judges", "Mga Hukom"], ["Ruth", "Ruth"],
  ["1 Samuel", "1 Samuel"], ["2 Samuel", "2 Samuel"], ["1 Kings", "1 Mga Hari"], ["2 Kings", "2 Mga Hari"],
  ["1 Chronicles", "1 Mga Cronica"], ["2 Chronicles", "2 Mga Cronica"], ["Ezra", "Ezra"], ["Nehemiah", "Nehemias"],
  ["Esther", "Esther"], ["Job", "Job"], ["Psalms", "Mga Awit"], ["Proverbs", "Mga Kawikaan"],
  ["Ecclesiastes", "Eclesiastes"], ["Song of Solomon", "Awit ng mga Awit"], ["Isaiah", "Isaias"], ["Jeremiah", "Jeremias"],
  ["Lamentations", "Mga Panaghoy"], ["Ezekiel", "Ezekiel"], ["Daniel", "Daniel"], ["Hosea", "Oseas"],
  ["Joel", "Joel"], ["Amos", "Amos"], ["Obadiah", "Abdias"], ["Jonah", "Jonas"],
  ["Micah", "Mikas"], ["Nahum", "Nahum"], ["Habakkuk", "Habacuc"], ["Zephaniah", "Zefanias"],
  ["Haggai", "Hagai"], ["Zechariah", "Zacarias"], ["Malachi", "Malakias"], ["Matthew", "Mateo"],
  ["Mark", "Marcos"], ["Luke", "Lucas"], ["John", "Juan"], ["Acts", "Mga Gawa"],
  ["Romans", "Mga Taga-Roma"], ["1 Corinthians", "1 Mga Taga-Corinto"], ["2 Corinthians", "2 Mga Taga-Corinto"], ["Galatians", "Mga Taga-Galacia"],
  ["Ephesians", "Mga Taga-Efeso"], ["Philippians", "Mga Taga-Filipos"], ["Colossians", "Mga Taga-Colosas"], ["1 Thessalonians", "1 Mga Taga-Tesalonica"],
  ["2 Thessalonians", "2 Mga Taga-Tesalonica"], ["1 Timothy", "1 Timoteo"], ["2 Timothy", "2 Timoteo"], ["Titus", "Tito"],
  ["Philemon", "Filemon"], ["Hebrews", "Mga Hebreo"], ["James", "Santiago"], ["1 Peter", "1 Pedro"],
  ["2 Peter", "2 Pedro"], ["1 John", "1 Juan"], ["2 John", "2 Juan"], ["3 John", "3 Juan"],
  ["Jude", "Judas"], ["Revelation", "Apocalipsis"],
];

// ===== Waray-Waray book names: EDIT HERE =====
// Write one line per book as  number: "Name",  (1 = Genesis ... 43 = John ... 66 = Revelation).
// Any book you leave out shows its English name. Example:
//   43: "Juan",
const WARAY_NAMES = {
  // 1: "Genesis",
  // 43: "Juan",
};
// ===============================================

const DAILY = ["John 3:16", "Psalm 23:1", "Romans 8:28", "Philippians 4:13", "Proverbs 3:5", "Isaiah 41:10",
  "Jeremiah 29:11", "Matthew 11:28", "Joshua 1:9", "Psalm 46:1", "1 Corinthians 13:4", "Hebrews 11:1"];

function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "").replace(/^([123])\s*(?=[a-z])/, "$1 ").replace(/\s+/g, " ").trim();
}

// Finds a book number from an English or Tagalog name ("John", "Juan", "Mga Awit", "Awit"...)
function findBook(input) {
  const q = norm(input);
  if (!q) return null;
  const names = BOOKS.map(([en, tl], i) => [norm(en), norm(tl), WARAY_NAMES[i + 1] ? norm(WARAY_NAMES[i + 1]) : ""]);
  const tests = [(n) => n === q, (n) => n === "mga " + q, (n) => n.startsWith(q), (n) => n.endsWith(q)];
  for (let k = 0; k < tests.length; k++) {
    const hits = names.map((p, i) => (p.some(tests[k]) ? i + 1 : 0)).filter(Boolean);
    if (hits.length === 1 || (hits.length > 1 && k === 0)) return hits[0];
  }
  return null;
}

async function fetchGetBible(reference) {
  const m = reference.trim().match(/^(.+?)\s+(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/);
  const nr = m && findBook(m[1]);
  if (!nr) throw new Error(t("notFound"));
  const chapter = Number(m[2]);
  const version = els.translation.value;
  let raw;
  if (DB_VERSIONS.has(version)) {
    raw = (await api(`chapter&translation=${version}&book=${nr}&chapter=${chapter}`)).verses;
    if (!raw.length) throw new Error(t("noText"));
  } else {
    const res = await fetch(`${GETBIBLE_API}/${version}/${nr}/${chapter}.json`);
    if (!res.ok) throw new Error(t("notFound"));
    const data = await res.json();
    raw = Array.isArray(data.verses) ? data.verses : Object.values(data.verses || {});
  }
  const name = version === "waray" ? WARAY_NAMES[nr] || BOOKS[nr - 1][0] : BOOKS[nr - 1][1];
  let verses = raw.map((v) => ({ book_name: name, book_nr: nr, chapter, verse: v.verse, text: String(v.text || "") }));
  const from = m[3] ? Number(m[3]) : 0;
  const to = m[4] ? Number(m[4]) : from;
  if (from) verses = verses.filter((v) => v.verse >= from && v.verse <= to);
  if (!verses.length) throw new Error(t("notFound"));

  const range = from ? `:${from}${to > from ? "-" + to : ""}` : "";
  return {
    reference: `${name} ${chapter}${range}`,
    en_reference: `${BOOKS[nr - 1][0]} ${chapter}${range}`,
    translation_id: els.translation.value,
    verses,
  };
}

let current = null; // { reference, verses, translation_id }

/* ---------- server (PHP + MySQL via XAMPP) ---------- */
let user = null;
let bookmarks = [];

async function api(action, body) {
  const res = await fetch(`api.php?action=${action}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || t("serverError"));
  return data;
}

/* ---------- helpers ---------- */
function showMessage(text, isError = false) {
  els.message.textContent = text;
  els.message.classList.toggle("error", isError);
}

async function fetchPassage(reference) {
  if (GETBIBLE.has(els.translation.value)) return fetchGetBible(reference);
  const url = `${API}/${encodeURIComponent(reference)}?translation=${els.translation.value}&single_chapter_book_matching=indifferent`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(t("notFound"));
  return res.json();
}

/* ---------- reader ---------- */
async function openPassage(reference, dir) {
  if (dir) startTurn(dir);
  showMessage(t("loading"));
  try {
    const data = await fetchPassage(reference);
    current = data;
    renderPassage(data);
    showMessage("");
  } catch (err) {
    showMessage(err.message === "Failed to fetch" ? t("loadFail") : err.message, true);
  }
}

function renderPassage(data) {
  els.reader.hidden = false;
  openPrompt.hidden = true;
  els.title.textContent = `${data.reference} (${data.translation_id.toUpperCase()})`;
  els.verses.textContent = "";

  data.verses.forEach((v) => {
    const p = document.createElement("p");
    const num = document.createElement("span");
    num.className = "vnum";
    num.textContent = v.verse;
    p.append(num, v.text.trim());
    els.verses.appendChild(p);
  });

  const first = data.verses[0];
  els.prev.disabled = first.chapter <= 1;
  updateBookmarkButton();
  if (window.matchMedia("(max-width: 800px)").matches) els.reader.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Turn the page: a copy of the old page swings away to reveal the new one
function startTurn(dir) {
  if (els.reader.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const copy = els.reader.cloneNode(true);
  copy.removeAttribute("id");
  copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  leaf.replaceChildren(copy);
  leaf.className = "leaf";
  void leaf.offsetWidth; // restart the animation
  leaf.className = `leaf turn-${dir}`;
  leaf.addEventListener(
    "animationend",
    () => {
      leaf.className = "leaf";
      leaf.replaceChildren();
    },
    { once: true }
  );
}

function chapterRef(offset) {
  const v = current.verses[0];
  return `${v.book_name} ${v.chapter + offset}`;
}

els.prev.addEventListener("click", () => openPassage(chapterRef(-1), "prev"));
els.next.addEventListener("click", () => openPassage(chapterRef(1), "next"));

els.copy.addEventListener("click", async () => {
  const text = `${current.reference}\n` + current.verses.map((v) => `${v.verse} ${v.text.trim()}`).join("\n");
  try {
    await navigator.clipboard.writeText(text);
    showMessage(t("copied"));
  } catch {
    showMessage(t("copyFail"), true);
  }
});

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  openPassage(els.ref.value.trim());
});

// Reload the open passage when the version changes
els.translation.addEventListener("change", () => {
  if (current) openPassage(current.en_reference || current.reference);
  loadVerseOfTheDay();
});

/* ---------- verse of the day ---------- */
async function loadVerseOfTheDay() {
  try {
    if (GETBIBLE.has(els.translation.value)) {
      const day = Math.floor(Date.now() / 86400000);
      const data = await fetchGetBible(DAILY[day % DAILY.length]);
      els.votdText.textContent = data.verses[0].text.trim();
      els.votdRef.textContent = data.reference;
      return;
    }
    const res = await fetch(`${API}/data/${els.translation.value}/random`);
    if (!res.ok) throw new Error();
    const { random_verse: v } = await res.json();
    els.votdText.textContent = v.text.trim();
    els.votdRef.textContent = `${v.book} ${v.chapter}:${v.verse}`;
  } catch {
    els.votdText.textContent = t("votdFail");
    els.votdRef.textContent = "";
  }
}

/* ---------- bookmarks ---------- */
function isSaved() {
  return !!current && bookmarks.some(
    (b) => b.reference === current.reference && b.translation === current.translation_id
  );
}

function updateBookmarkButton() {
  els.bookmarkBtn.hidden = !user;
  els.bookmarkBtn.textContent = isSaved() ? t("removeBookmark") : t("bookmark");
}

els.bookmarkBtn.addEventListener("click", async () => {
  const body = { reference: current.reference, translation: current.translation_id };
  try {
    const data = await api(isSaved() ? "bookmark_remove" : "bookmark_add", body);
    bookmarks = data.bookmarks;
    updateBookmarkButton();
    renderBookmarks();
  } catch (err) {
    showMessage(err.message, true);
  }
});

function renderBookmarks() {
  els.list.textContent = "";
  els.empty.textContent = t("noBookmarks");
  els.empty.hidden = user && bookmarks.length > 0;

  bookmarks.forEach((b) => {
    const li = document.createElement("li");

    const open = document.createElement("button");
    open.className = "open";
    open.textContent = `${b.reference} (${b.translation.toUpperCase()})`;
    open.addEventListener("click", () => {
      els.translation.value = b.translation;
      openPassage(b.reference);
    });

    const remove = document.createElement("button");
    remove.className = "ghost remove";
    remove.textContent = t("remove");
    remove.addEventListener("click", async () => {
      try {
        bookmarks = (await api("bookmark_remove", b)).bookmarks;
        renderBookmarks();
        updateBookmarkButton();
      } catch (err) {
        showMessage(err.message, true);
      }
    });

    li.append(open, remove);
    els.list.appendChild(li);
  });
}

/* ---------- session (redirects to login.html if not logged in) ---------- */
const userName = document.getElementById("user-name");

document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await api("logout", {});
  } finally {
    location.replace("login.html");
  }
});

async function refreshSession() {
  const email = (await api("me")).email;
  if (!email) {
    location.replace("login.html");
    return;
  }
  user = email;
  userName.textContent = email;
  bookmarks = (await api("bookmarks")).bookmarks;
  document.body.classList.remove("checking");
  renderBookmarks();
  updateBookmarkButton();
}

/* ---------- start ---------- */
try {
  // the cover opens once per visit (the login page is already the cover)
  if (sessionStorage.getItem("bible-opened")) document.body.classList.add("no-cover");
  else sessionStorage.setItem("bible-opened", "1");
} catch {}
els.votdText.textContent = t("loading");
loadVerseOfTheDay();
refreshSession().catch((err) => {
  document.body.classList.remove("checking");
  showMessage(
    err.message === "Failed to fetch" ? t("unreachable") : err.message,
    true
  );
});

/* ---------- Bible versions & interface language ---------- */
const PLACEHOLDERS = {
  tagalog: "Juan 3:16 o Mga Awit 23",
  waray: "Juan 3:16",
  almeida: "João 3:16",
  clementine: "Joannes 3:16",
  rccv: "Ioan 3:16",
  bkr: "Jan 3:16",
  cuv: "約翰福音 3:16",
};
const ENGLISH_VERSIONS = new Set(["web", "webbe", "kjv", "asv", "bbe", "darby", "dra", "ylt", "oeb-us", "oeb-cw"]);
const versionHint = document.getElementById("version-hint");

function updateVersionUI() {
  const v = els.translation.value;
  els.ref.placeholder = PLACEHOLDERS[v] || "John 3:16 or Psalm 23";
  versionHint.textContent = t("hintOther");
  const simple = ENGLISH_VERSIONS.has(v) || GETBIBLE.has(v);
  versionHint.hidden = simple;
  pickerForm.hidden = !simple;
}

els.translation.addEventListener("change", updateVersionUI);
document.addEventListener("langchange", () => {
  updateVersionUI();
  fillBooks();
  updateBookmarkButton();
  renderBookmarks();
});
updateVersionUI();

/* ---------- book & chapter picker ---------- */
function fillBooks() {
  const keep = bookSelect.value;
  bookSelect.replaceChildren();
  BOOKS.forEach(([en, tl], i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = lang === "en" ? en : lang === "war" ? WARAY_NAMES[i + 1] || tl : tl;
    bookSelect.appendChild(opt);
  });
  if (keep) bookSelect.value = keep;
}

pickerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nr = Number(bookSelect.value);
  const chapter = Math.max(1, Number(chapterInput.value) || 1);
  openPassage(`${BOOKS[nr - 1][0]} ${chapter}`);
});

fillBooks();