/* ===== SITE SETTINGS: change these ===== */
const SITE = {
  email: "andrew@thebusinessbuilder.tech",
  // Business phone, e.g. "(503) 555-0123". Phone links stay hidden until this is set.
  phone: "(503) 200-9202",
  // Form endpoint URL (e.g. from Formspree) so assessment requests arrive in your inbox.
  // Leave empty to fall back to opening the visitor's email app.
  formEndpoint: "",
  // Client reviews shown on the home page. The section stays hidden until at least one is added.
  // e.g. {quote: "They got us on Google Maps in a week.", name: "Maria G.", business: "Bright Clean, Portland"}
  testimonials: []
};
/* ======================================== */

document.querySelectorAll("[data-yr]").forEach(el => el.textContent = new Date().getFullYear());

document.querySelectorAll("[data-email]").forEach(a => {
  a.href = "mailto:" + SITE.email;
  if (!a.children.length) a.textContent = SITE.email;
});

if (SITE.phone) document.querySelectorAll("[data-phone]").forEach(el => {
  const a = el.matches("a") ? el : el.querySelector("a");
  a.href = "tel:" + SITE.phone.replace(/[^\d+]/g, "");
  a.querySelector("[data-phone-num]")?.replaceChildren(SITE.phone);
  el.hidden = false;
});

const reviews = document.getElementById("reviews");
if (reviews && SITE.testimonials.length) {
  const list = reviews.querySelector(".quotes");
  SITE.testimonials.forEach(t => {
    const fig = document.createElement("figure");
    fig.className = "quote";
    const q = document.createElement("blockquote");
    q.textContent = `“${t.quote}”`;
    const cap = document.createElement("figcaption");
    cap.innerHTML = "<b></b><span></span>";
    cap.querySelector("b").textContent = t.name;
    cap.querySelector("span").textContent = t.business || "";
    fig.append(q, cap);
    list.appendChild(fig);
  });
  reviews.hidden = false;
}
