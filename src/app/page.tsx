import { Menu } from "@/components/Menu";
import { OpenStatus } from "@/components/OpenStatus";
import { Landscape, TreeLine } from "@/components/Scenery";
import { Space } from "@/components/Space";
import { LOCATIONS } from "@/data/locations";
import { HOURS_LABELS } from "@/lib/hours";

export default function Home() {
  return (
    <main>
      <section className="hero drizzle">
        <div className="container hero__inner">
          <div>
            <p className="eyebrow">Greater Portland, Oregon</p>
            <h1>
              Come for the mocha. <span className="accent">Stay for the couch.</span>
            </h1>
            <p className="lead">
              Rain or shine (mostly rain), we pour handcrafted espresso and mochas at three spots around
              Portland. Grab one to go, or settle in and stay a while.
            </p>
            <div className="hero__actions">
              <a className="btn" href="#menu">
                Order ahead
              </a>
              <a className="btn btn--ghost" href="#space">
                See the space
              </a>
            </div>
          </div>
          <div className="hero__sun" aria-hidden="true">
            <img src="/logo.png" alt="" width={300} height={300} />
          </div>
        </div>
        <Landscape className="hero__landscape" />
      </section>

      <Space />

      <section id="menu" className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">The menu</p>
            <h2>Order ahead, then grab a seat.</h2>
          </div>
          <Menu />
        </div>
      </section>

      <TreeLine className="treeline" />
      <section id="locations" className="section locations-band">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">Find your spot</p>
            <h2>Three Portland-area shops</h2>
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
        </div>
      </section>
    </main>
  );
}
