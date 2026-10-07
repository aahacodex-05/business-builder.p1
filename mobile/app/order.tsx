import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { formatPrice, getOrder, type Order } from "../src/api";
import { useCart } from "../src/cart";
import { Notice } from "../src/components/Notice";

/** Order confirmation, reached after checkout or from Stripe's return link. */
export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { clear } = useCart();
  const [order, setOrder] = useState<Order | null>();

  useEffect(() => {
    if (!id) {
      setOrder(null);
      return;
    }
    getOrder(id)
      .then((result) => {
        setOrder(result);
        if (result.paid) clear();
      })
      .catch(() => setOrder(null));
  }, [id, clear]);

  const done = { label: "Back to the menu", onPress: () => router.dismissTo("/") };

  if (order === undefined) return <Notice />;
  if (!order?.paid) {
    return (
      <Notice
        title="We couldn't find that order"
        message="If you were charged, show your email receipt at the counter and we'll sort it out."
        action={done}
      />
    );
  }

  return (
    <Notice
      title="Order's in!"
      message={`Thanks, ${order.name}. We're making your order now. Pick it up at ${order.location}. Total paid: ${formatPrice(order.total)}.`}
      action={done}
    />
  );
}
