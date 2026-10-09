import Link from "next/link";
import { MenuCard } from "@/components/MenuCard";
import { OpenStatus } from "@/components/OpenStatus";
import { OrderHere } from "@/components/OrderHere";
import { Landscape, TreeLine } from "@/components/Scenery";
import { Space } from "@/components/Space";
import { LOCATIONS, directionsUrl, phoneUrl } from "@/data/locations";
import { POPULAR } from "@/data/menu";
import { hoursLabels } from "@/lib/hours";

export default function Home() {
  return (
    <main>
      <section className="hero drizzle">
        <div className="container hero__inner">
          <div>
            <p className="eyebrow">Greater Portland, Oregon</p>
            <h1>
              Come for the mocha. <span className="accent">Stay for the armchair.</span>
            </h1>
            <p className="lead">
              Rain or shine (mostly rain), we pour handcrafted espresso and mochas at three spots around
              Portland. Grab one to go, or settle in and stay a while.
            </p>
            <div className="hero__actions">
              <Link className="btn" href="/menu">
                Order ahead
              </Link>
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
          <ul className="menu menu--featured">
            {POPULAR.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </ul>
          <div className="section__foot">
            <Link className="btn" href="/menu">
              See the full menu
            </Link>
          </div>
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
                <p className="location__services">{location.services.join(" · ")}</p>
                <address>
                  {location.street}
                  <br />
                  {location.city}, OR {location.zip}
                  <br />
                  <a href={phoneUrl(location)}>{location.phone}</a>
                </address>
                <dl className="location__hours">
                  {hoursLabels(location.hours).map(({ days, time }) => (
                    <div key={days}>
                      <dt>{days}</dt>
                      <dd>{time}</dd>
                    </div>
                  ))}
                </dl>
                <OpenStatus hours={location.hours} />
                <div className="location__actions">
                  <OrderHere locationId={location.id} />
                  <a href={directionsUrl(location)} className="link" target="_blank" rel="noopener">
                    Get directions →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
