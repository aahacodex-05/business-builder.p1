const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll("[data-panel]");

tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.toggle("is-active", t === tab);
      t.setAttribute("aria-selected", t === tab);
    });
    panels.forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
  })
);

// Hours in shop-local time: [open, close] in 24h, indexed Sun..Sat.
const HOURS = [[8, 19], [6, 19], [6, 19], [6, 19], [6, 19], [6, 19], [8, 19]];

function updateStatus() {
  const el = document.querySelector("[data-status]");
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const [open, close] = HOURS[now.getDay()];
  const hour = now.getHours() + now.getMinutes() / 60;
  const isOpen = hour >= open && hour < close;
  el.textContent = isOpen ? "Open now" : "Closed now";
  el.className = `status ${isOpen ? "is-open" : "is-closed"}`;
}

updateStatus();
document.querySelector("[data-year]").textContent = new Date().getFullYear();
