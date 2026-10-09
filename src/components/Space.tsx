import { CozyCorner } from "./CozyCorner";
import { Icon, type IconName } from "./Icon";

const AMENITIES: { icon: IconName; title: string; text: string }[] = [
  { icon: "armchair", title: "Big armchairs", text: "Basically a couch for one. Sink in with a mocha or a book." },
  { icon: "laptop", title: "Comfortable work tables", text: "Room for the laptop, the notebook and the second coffee." },
  // TODO: confirm the shops offer free Wi-Fi.
  { icon: "wifi", title: "Free Wi-Fi", text: "Hop on and get some work done." },
  { icon: "bag", title: "Order ahead", text: "Your drink can be ready when you walk in." },
];

export function Space() {
  return (
    <section id="space" className="section space">
      <div className="container space__grid">
        <div>
          <p className="eyebrow">The space</p>
          <h2>Stay a while.</h2>
          <p className="lead">
            Sink into an oversized armchair with a mocha, or claim a comfortable table and get some work
            done. Rainy Portland afternoons were made for this.
          </p>
          <ul className="amenities">
            {AMENITIES.map(({ icon, title, text }) => (
              <li key={title} className="amenity">
                <Icon name={icon} />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <CozyCorner />
      </div>
    </section>
  );
}
