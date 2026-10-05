import { Menu } from "@/components/Menu";
import { OpenStatus } from "@/components/OpenStatus";
import { LOCATIONS } from "@/data/locations";
import { HOURS_LABELS } from "@/lib/hours";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Portland's favorite coffee stop</p>
          <h1>
            Good coffee,
            <br />
            served <span className="accent">express</span>.
          </h1>
          <p className="lead">
            Handcrafted espresso, signature mochas and fresh bites, made fast and made right at three
            spots around the greater Portland area.
          </p>
          <div className="hero__actions">
            <a className="btn" href="#menu">
              Order for Pickup
            </a>
            <a className="btn btn--ghost" href="#locations">
              Find a Location
            </a>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="steam">
            <span />
            <span />
            <span />
          </div>
          <img src="/logo.png" alt="" width={320} height={320} />
        </div>
      </section>

      <section id="menu" className="section">
        <div className="section__head">
          <p className="eyebrow">Order ahead</p>
          <h2>The menu</h2>
        </div>
        <Menu />
      </section>

      <section id="locations" className="section section--dark">
        <div className="section__head">
          <p className="eyebrow">Come say hi</p>
          <h2>Three locations, one great cup</h2>
        </div>
        <div className="locations">
          {LOCATIONS.map((location) => (
            <article key={location.id} className="location">
              <h3>{location.name}</h3>
              <address>
                {location.street}
                <br />
                {location.city}
              </address>
              <a href={location.mapUrl} className="link" target="_blank" rel="noopener">
                Get directions →
              </a>
            </article>
          ))}
        </div>
        <div className="hours">
          <h3>Hours</h3>
          <dl>
            {HOURS_LABELS.map(({ days, time }) => (
              <div key={days}>
                <dt>{days}</dt>
                <dd>{time}</dd>
              </div>
            ))}
          </dl>
          <OpenStatus />
        </div>
      </section>

      <section id="about" className="section about">
        <p className="eyebrow">Our story</p>
        <h2>Coffee with a smile, on the go</h2>
        {/* TODO: replace with the shop's real story. */}
        <p>
          Mocha Express started with a simple idea: great coffee shouldn't slow you down. Today our
          three Portland-area shops serve neighbors their morning rituals, afternoon pick-me-ups and
          everything in between.
        </p>
      </section>
    </main>
  );
}
