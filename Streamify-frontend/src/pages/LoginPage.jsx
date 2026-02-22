import { useState, useEffect } from "react";
import { ShipWheelIcon, Eye, EyeOff, Zap, Globe, MessageCircle, Users, Star } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import { BASE_URL } from "../lib/axios";

// Rotating quotes to keep users engaged during cold-start wait
const QUOTES = [
  { text: "Language is the road map of a culture.", author: "Rita Mae Brown" },
  { text: "One language sets you in a corridor for life. Two languages open every door.", author: "Frank Smith" },
  { text: "To have another language is to possess a second soul.", author: "Charlemagne" },
  { text: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { text: "Learning another language is like becoming another person.", author: "Haruki Murakami" },
];

const STATS = [
  { icon: Users, label: "Active Learners", value: "12K+", color: "text-primary" },
  { icon: Globe, label: "Languages", value: "50+", color: "text-secondary" },
  { icon: MessageCircle, label: "Messages Daily", value: "80K+", color: "text-accent" },
  { icon: Star, label: "Avg Rating", value: "4.9★", color: "text-warning" },
];

const FEATURES = [
  "🎙️ Voice & Video Calls",
  "🌐 50+ Languages",
  "🤝 Native Partners",
  "🎮 Fun Challenges",
  "📱 Mobile Friendly",
  "🔒 Safe & Secure",
];

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [statVisible, setStatVisible] = useState(false);
  const [serverWarm, setServerWarm] = useState(false);
  const [warmSeconds, setWarmSeconds] = useState(0);
  const [showWarmBanner, setShowWarmBanner] = useState(true);

  const { isPending, error, loginMutation } = useLogin();

  // Rotate quotes every 4 seconds
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Animate stats in after mount
  useEffect(() => {
    const t = setTimeout(() => setStatVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Server warm-up timer — free hosting cold starts can take ~30s
  useEffect(() => {
    if (!showWarmBanner) return;
    const interval = setInterval(() => {
      setWarmSeconds((s) => {
        if (s >= 30) {
          setServerWarm(true);
          clearInterval(interval);
          return 30;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showWarmBanner]);

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  const warmPercent = Math.min((warmSeconds / 30) * 100, 100);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden"
      data-theme="forest"
      style={{
        background: "radial-gradient(ellipse at 60% 50%, oklch(25% 0.08 150 / 0.6) 0%, oklch(15% 0.04 150) 100%)",
      }}
    >
      {/* Animated background orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(70% 0.2 150), transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(70% 0.2 220), transparent 70%)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 oklch(70% 0.2 150 / 0.4); }
          70% { box-shadow: 0 0 0 10px oklch(70% 0.2 150 / 0); }
          100% { box-shadow: 0 0 0 0 oklch(70% 0.2 150 / 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .quote-enter {
          animation: fadeSlideIn 0.5s ease forwards;
        }
        .stat-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .stat-card:hover {
          transform: translateY(-4px) scale(1.03);
        }
        .login-card {
          animation: fadeSlideUp 0.6s ease forwards;
          backdrop-filter: blur(20px);
        }
        .warm-progress {
          transition: width 1s linear;
        }
        .google-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px oklch(0% 0 0 / 0.3);
        }
        .google-btn { transition: all 0.2s ease; }
        .badge-float {
          animation: float 4s ease-in-out infinite;
        }
        .badge-float:nth-child(2) { animation-delay: 0.5s; }
        .badge-float:nth-child(3) { animation-delay: 1s; }
        .badge-float:nth-child(4) { animation-delay: 1.5s; }
        .badge-float:nth-child(5) { animation-delay: 2s; }
        .badge-float:nth-child(6) { animation-delay: 2.5s; }
      `}</style>

      <div className="w-full max-w-5xl mx-auto login-card">
        {/* Server warm-up banner */}
        {showWarmBanner && (
          <div
            className="mb-4 rounded-xl border px-4 py-3 flex items-center gap-3 text-sm"
            style={{
              background: serverWarm
                ? "oklch(30% 0.08 150 / 0.8)"
                : "oklch(25% 0.06 60 / 0.85)",
              borderColor: serverWarm
                ? "oklch(60% 0.2 150 / 0.5)"
                : "oklch(70% 0.2 80 / 0.4)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: serverWarm ? "oklch(70% 0.2 150)" : "oklch(75% 0.2 80)",
                animation: serverWarm ? "none" : "pulse-ring 1.5s infinite",
              }}
            />
            <div className="flex-1">
              {serverWarm ? (
                <span className="font-medium" style={{ color: "oklch(80% 0.15 150)" }}>
                  ✅ Server is ready! You can log in now.
                </span>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: "oklch(85% 0.12 80)" }}>
                      <Zap className="inline w-3.5 h-3.5 mr-1" />
                      <strong>Warming up the server</strong> (free hosting cold start)…
                    </span>
                    <span className="font-mono opacity-60" style={{ color: "oklch(85% 0.12 80)" }}>
                      {warmSeconds}s
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(20% 0.04 80)" }}>
                    <div
                      className="h-full rounded-full warm-progress"
                      style={{
                        width: `${warmPercent}%`,
                        background: "linear-gradient(90deg, oklch(70% 0.2 80), oklch(75% 0.18 100))",
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 opacity-50" style={{ color: "oklch(85% 0.12 80)" }}>
                    This only happens once. Subsequent logins are instant ⚡
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowWarmBanner(false)}
              className="opacity-40 hover:opacity-80 transition-opacity text-xs ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main card */}
        <div
          className="border border-primary/20 flex flex-col lg:flex-row w-full rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "oklch(17% 0.03 150 / 0.95)", backdropFilter: "blur(20px)" }}
        >
          {/* ─── LEFT: LOGIN FORM ─── */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-6 flex items-center gap-2">
              <div
                className="p-2 rounded-xl"
                style={{ background: "oklch(30% 0.1 150)", animation: "pulse-ring 2.5s infinite" }}
              >
                <ShipWheelIcon className="size-7 text-primary" />
              </div>
              <span
                className="text-3xl font-bold font-mono tracking-wider"
                style={{
                  background: "linear-gradient(135deg, oklch(70% 0.2 150), oklch(75% 0.18 200))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Streamify
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error mb-4 text-sm">
                <span>{error.response?.data?.message || "Login failed"}</span>
              </div>
            )}

            {/* Heading */}
            <div className="mb-5">
              <h2 className="text-2xl font-bold mb-1">Welcome Back 👋</h2>
              <p className="text-sm opacity-60">Sign in to continue your language journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  className="input input-bordered w-full focus:border-primary transition-colors"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input input-bordered w-full pr-10 focus:border-primary transition-colors"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-90 transition-opacity"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div className="text-right -mt-1">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline opacity-80">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full mt-1"
                disabled={isPending}
                style={{ animation: isPending ? "none" : undefined }}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Signing in…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>

              {/* Divider */}
              <div className="divider text-xs opacity-40 my-1">OR</div>

              {/* Google */}
              <button
                type="button"
                className="btn btn-outline w-full google-btn"
                onClick={() => (window.location.href = `${BASE_URL}/auth/google?origin=${encodeURIComponent(window.location.origin)}`)}
              >
                <img
                  src="https://img.icons8.com/color/48/000000/google-logo.png"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>
            </form>

            {/* Sign up */}
            <p className="text-sm text-center mt-5 opacity-60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium opacity-100">
                Create one free
              </Link>
            </p>
          </div>

          {/* ─── RIGHT: ENGAGEMENT PANEL ─── */}
          <div
            className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center p-8 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, oklch(22% 0.07 150), oklch(19% 0.05 200))",
              borderLeft: "1px solid oklch(70% 0.15 150 / 0.1)",
            }}
          >
            {/* Decorative ring */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
              style={{
                border: "1px solid oklch(70% 0.15 150 / 0.08)",
                boxShadow: "inset 0 0 60px oklch(70% 0.15 150 / 0.04)",
              }}
            />

            {/* Illustration */}
            <div className="relative w-52 h-52 mb-6">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full object-contain drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 0 20px oklch(70% 0.2 150 / 0.3))" }}
              />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
              {STATS.map(({ icon: Icon, label, value, color }, i) => (
                <div
                  key={label}
                  className="stat-card rounded-xl p-3 text-center"
                  style={{
                    background: "oklch(15% 0.03 150 / 0.7)",
                    border: "1px solid oklch(70% 0.15 150 / 0.1)",
                    opacity: statVisible ? 1 : 0,
                    transform: statVisible ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                  }}
                >
                  <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                  <div className={`text-lg font-bold ${color}`}>{value}</div>
                  <div className="text-xs opacity-50">{label}</div>
                </div>
              ))}
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-xs">
              {FEATURES.map((f, i) => (
                <span
                  key={f}
                  className="badge-float text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{
                    background: "oklch(25% 0.07 150 / 0.8)",
                    border: "1px solid oklch(70% 0.15 150 / 0.2)",
                    color: "oklch(80% 0.12 150)",
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Rotating quote */}
            <div
              className="w-full max-w-xs rounded-xl p-4 text-center"
              style={{
                background: "oklch(15% 0.03 150 / 0.6)",
                border: "1px solid oklch(70% 0.15 150 / 0.1)",
              }}
            >
              <div
                key={quoteIdx}
                className="quote-enter"
              >
                <p className="text-sm italic opacity-75 leading-relaxed mb-2">
                  &ldquo;{QUOTES[quoteIdx].text}&rdquo;
                </p>
                <p className="text-xs opacity-40 font-medium">— {QUOTES[quoteIdx].author}</p>
              </div>
              {/* Quote dot indicators */}
              <div className="flex justify-center gap-1 mt-3">
                {QUOTES.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setQuoteIdx(i)}
                    className="rounded-full cursor-pointer transition-all"
                    style={{
                      width: i === quoteIdx ? "16px" : "6px",
                      height: "6px",
                      background:
                        i === quoteIdx
                          ? "oklch(70% 0.2 150)"
                          : "oklch(70% 0.1 150 / 0.3)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;