/* ===== SITE SETTINGS: change these ===== */
const SITE = {
  email: "hello@bridgetowndigital.com",
  // Form endpoint URL (e.g. from Formspree) so requests arrive in your inbox.
  // Leave empty to fall back to opening the visitor's email app.
  formEndpoint: ""
};
/* ======================================== */

document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

document.querySelectorAll("[data-email]").forEach(a => {
  a.href = "mailto:" + SITE.email;
  a.textContent = SITE.email;
});

const form = document.getElementById("contact-form");
const status = form.querySelector(".form-status");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const data = new FormData(form);

  if (!SITE.formEndpoint) {
    const body = [...data].map(([k, v]) => `${k}: ${v}`).join("\n");
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("New project: " + data.get("service"))}&body=${encodeURIComponent(body)}`;
    return;
  }

  status.textContent = "Sending...";
  try {
    const res = await fetch(SITE.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = "Thanks! We'll be in touch within one business day.";
  } catch {
    status.textContent = `Something went wrong. Please email ${SITE.email}.`;
  }
});
