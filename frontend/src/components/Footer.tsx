import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-200 text-sm">B&J Mushroom Products</p>
          <p className="text-slate-500 mt-0.5">Fresh & Processed Gourmet Mushrooms • Quality Stock & Cultivation Supplies</p>
        </div>
        <div className="text-center sm:text-right text-slate-500">
          <p>&copy; {new Date().getFullYear()} B&J Mushroom Products. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
