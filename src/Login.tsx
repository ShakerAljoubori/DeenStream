import React, { useState } from "react";

interface LoginProps {
  onSwitch: () => void;
  onLogin: (data: any) => void;
}

const Login = ({ onSwitch, onLogin }: LoginProps) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Save the token to LocalStorage so the user stays logged in
        localStorage.setItem("token", data.token);
        
        alert("✅ Welcome back!");
        
        // 2. Pass the user data to your parent component
        onLogin(data.user); 
      } else {
        alert(data.msg || "❌ Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("❌ Server connection error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md space-y-8 bg-[#161616] p-10 rounded-2xl border border-white/5 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-white/40">
            Enter your credentials to access your lectures
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#16C47F] focus:ring-1 focus:ring-[#16C47F] transition-all"
                placeholder="name@example.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#16C47F] focus:ring-1 focus:ring-[#16C47F] transition-all"
                placeholder="••••••••"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#16C47F] text-black font-bold py-3 rounded-xl hover:bg-[#14b374] transform active:scale-[0.98] transition-all shadow-lg shadow-[#16C47F]/20"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          Don't have an account?{" "}
          <button
            onClick={onSwitch}
            className="text-[#16C47F] hover:underline font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
