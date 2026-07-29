import React from "react";

export const CartPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-2">Shopping Cart Page</h1>
      <p className="text-slate-400">Manage items in cart, modify quantities, and check estimated totals.</p>
    </div>
  );
};

export default CartPage;
