const DASHBOARD = "index.html";

const form = document.getElementById("auth-form");
const message = document.getElementById("message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

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

async function submitAuth(action) {
  const creds = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
  };
  showMessage(t("wait"));
  try {
    await api(action, creds);
    try { sessionStorage.setItem("bible-opened", "1"); } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) document.querySelector(".login-card").classList.add("opening");
    setTimeout(() => location.replace(DASHBOARD), reduce ? 0 : 850); // go to the Bible dashboard
  } catch (err) {
    showMessage(err.message, true);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  submitAuth("login");
});

document.getElementById("register-btn").addEventListener("click", () => {
  if (form.reportValidity()) submitAuth("register");
});

// Already logged in? Skip straight to the dashboard.
api("me")
  .then((d) => {
    if (d.email) location.replace(DASHBOARD);
  })
  .catch((err) =>
    showMessage(
      err.message === "Failed to fetch" ? t("unreachable") : err.message,
      true
    )
  );