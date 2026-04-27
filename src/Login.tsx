import React, { useState } from "react";

interface LoginProps {
  onSwitch: () => void;
  onLogin: (data: any) => void;
}

const Login = ({ onSwitch, onLogin }: LoginProps) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setSuccess(`Welcome back, ${data.user.name}!`);
        setTimeout(() => onLogin(data.user), 2000);
      } else {
        setError(data.msg || "Login failed. Please try again.");
      }
    } catch {
      setError("Could not connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md bg-[#161616] p-10 rounded-2xl border border-white/5 shadow-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-white/40">Enter your credentials to access your lectures</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
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
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(null); }}
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
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(null); }}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="shrink-0">✕</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#16C47F]/10 border border-[#16C47F]/20 text-[#16C47F] text-sm">
              <span className="shrink-0">✓</span>
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#16C47F] text-black font-bold py-3 rounded-xl hover:bg-[#14b374] active:scale-[0.98] transition-all shadow-lg shadow-[#16C47F]/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          Don't have an account?{" "}
          <button onClick={onSwitch} className="text-[#16C47F] hover:underline font-medium">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
