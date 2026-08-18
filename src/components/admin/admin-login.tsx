import { useState } from "react";
import { Coffee, Loader2 } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export function AdminLogin({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const { login } = useAdminStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username.trim(), password.trim());
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md bg-card p-8 border border-ink/10 shadow-lg text-center font-sans">
        <div className="flex justify-center mb-6 text-brass">
          <Coffee className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-display font-bold text-ink mb-2">تسجيل الدخول للإدارة</h1>
        <p className="text-ink/60 mb-8 font-medium">محمصة بن فريد</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm font-bold border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-ink">اسم المستخدم أو البريد الإلكتروني</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin أو elfareedcoffee@gmail.com"
              className="w-full border-2 border-ink/20 p-3 focus:border-brass focus:outline-none transition-colors text-ink bg-transparent"
              required
              disabled={loading}
              dir="ltr"
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-ink">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-ink/20 p-3 focus:border-brass focus:outline-none transition-colors text-ink bg-transparent"
              required
              disabled={loading}
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-cream p-3 font-bold mt-4 hover:bg-ink/90 transition-colors flex items-center justify-center disabled:opacity-70 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
