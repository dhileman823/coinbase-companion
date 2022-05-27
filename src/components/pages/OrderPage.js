import { useEffect, useState } from "react";
import TransactionHistory from "./subcomponents/TransactionHistory";

function OrderPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const orderList = [
      {
        id: 1,
        amount: 30,
        asset: "BTC-USD",
        created: new Date().toDateString(),
        type: "order",
      },
      {
        id: 2,
        amount: 30,
        asset: "ETH-USD",
        created: new Date().toDateString(),
        type: "order",
      },
    ];
    setOrders(orderList);
  }, []);

  return (
    <div className="page">
      Transaction History
      <TransactionHistory orders={orders} />
    </div>
  );
}

export default OrderPage;
