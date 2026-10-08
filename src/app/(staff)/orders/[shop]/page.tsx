import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderAlerts } from "@/components/staff/OrderAlerts";
import { findLocation } from "@/data/locations";
import { formatPrice } from "@/data/menu";
import { formatTime } from "@/lib/hours";
import { todaysOrders, type Order } from "@/lib/orders";
import { canSee, webStaff } from "@/lib/staff";
import { markPickedUp, signOut } from "../actions";

export default async function ShopOrders({ params }: { params: Promise<{ shop: string }> }) {
  const location = findLocation((await params).shop);
  if (!location) notFound();

  // Employees only see their own shop; /orders sends them to it.
  const staff = await webStaff();
  if (!staff || !canSee(staff, location.id)) redirect("/orders");

  const orders = await todaysOrders(location.id);
  const waiting = orders.filter((order) => !order.pickedUp);
  const pickedUp = orders.filter((order) => order.pickedUp).reverse();

  return (
    <div className="staff__board">
      <header className="staff__head">
        <div>
          <p className="eyebrow">Mocha Express{staff.role === "employee" && ` · ${staff.name}`}</p>
          <h1>{location.name} orders</h1>
        </div>
        <div className="staff__tools">
          <OrderAlerts waitingIds={waiting.map((order) => order.id)} />
          {staff.role === "owner" && (
            <Link className="staff__link" href="/orders/owner">
              Owner page
            </Link>
          )}
          <form action={signOut}>
            <button className="staff__link">Sign out</button>
          </form>
        </div>
      </header>

      {waiting.length === 0 ? (
        <p className="staff__empty">No orders waiting. New ones show up here on their own.</p>
      ) : (
        <ul className="staff__orders">
          {waiting.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}

      {pickedUp.length > 0 && (
        <section>
          <h2>Picked up today</h2>
          <ul className="staff__orders staff__orders--done">
            {pickedUp.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <li className={`order${order.delivery ? " order--delivery" : ""}`}>
      <div className="order__head">
        <h3>{order.name}</h3>
        <span>{formatTime(order.placedAt)}</span>
      </div>
      <ul className="order__items">
        {order.items.map(({ name, quantity }) => (
          <li key={name}>
            <strong>{quantity} ×</strong> {name}
          </li>
        ))}
      </ul>
      {order.delivery && (
        <div className="order__delivery">
          <strong>Delivery</strong> to {order.delivery.address}
          {order.delivery.notes && <p>“{order.delivery.notes}”</p>}
          <p>
            {order.delivery.booked ? "Driver booked" : "Booking a driver…"}
            {order.delivery.trackingUrl && (
              <>
                {" · "}
                <a href={order.delivery.trackingUrl} target="_blank" rel="noreferrer">
                  Track
                </a>
              </>
            )}
          </p>
        </div>
      )}
      <p className="order__meta">
        {formatPrice(order.total)} paid{order.phone && <> · {order.phone}</>}
      </p>
      {!order.pickedUp && (
        <form action={markPickedUp.bind(null, order.id)}>
          <button className="btn btn--block">{order.delivery ? "Handed to driver" : "Picked up"}</button>
        </form>
      )}
    </li>
  );
}
