import React from "react";

export const LoginPage: React.FC = () => {
  return (
    <div className="p-8 max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Login Page</h1>
      <p className="text-sm text-slate-400">User authentication entry point for customer and admin sign in.</p>
    </div>
  );
};

export default LoginPage;
