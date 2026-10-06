import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderAlerts } from "@/components/staff/OrderAlerts";
import { SignIn } from "@/components/staff/SignIn";
import { findLocation } from "@/data/locations";
import { formatPrice } from "@/data/menu";
import { formatTime } from "@/lib/hours";
import { todaysOrders, type Order } from "@/lib/orders";
import { isStaff } from "@/lib/staff";
import { markPickedUp } from "../actions";

export default async function ShopOrders({ params }: { params: Promise<{ shop: string }> }) {
  const location = findLocation((await params).shop);
  if (!location) notFound();
  if (!(await isStaff())) return <SignIn />;

  const orders = await todaysOrders(location.id);
  const waiting = orders.filter((order) => !order.pickedUp);
  const pickedUp = orders.filter((order) => order.pickedUp).reverse();

  return (
    <div className="staff__board">
      <header className="staff__head">
        <div>
          <p className="eyebrow">Mocha Express</p>
          <h1>{location.name} orders</h1>
        </div>
        <OrderAlerts waitingIds={waiting.map((order) => order.id)} />
        <Link className="staff__link" href="/orders">
          Switch shop
        </Link>
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
    <li className="order">
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
      <p className="order__meta">
        {formatPrice(order.total)} paid{order.phone && <> · {order.phone}</>}
      </p>
      {!order.pickedUp && (
        <form action={markPickedUp.bind(null, order.paymentIntentId)}>
          <button className="btn btn--block">Picked up</button>
        </form>
      )}
    </li>
  );
}
