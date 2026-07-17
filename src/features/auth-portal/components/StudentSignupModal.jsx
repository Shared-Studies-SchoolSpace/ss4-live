import { useState, useEffect } from "react";
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useAuth } from '../hooks/useAuth';
import { fetchChessComStats, fetchLichessStats, fetchCompletePlayerData } from '../../chess-league/utils/chessService';
import { toast } from "react-toastify";

export default function StudentSignupModal({ onClose, onAuthSuccess, initialIsLogin = false }) {
  const { signUp, signIn } = useAuth();

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [progressWidth, setProgressWidth] = useState('0%');

  useEffect(() => {
    if (signupSuccess) {
      const timer = setTimeout(() => setProgressWidth('100%'), 50);
      return () => clearTimeout(timer);
    }
  }, [signupSuccess]);

  // Verification states: 'idle' | 'verifying' | 'valid' | 'invalid'
  const [chessStatus, setChessStatus] = useState('idle');
  const [lichessStatus, setLichessStatus] = useState('idle');

  // Stored ratings from verification lookup
  const [verifiedChessRating, setVerifiedChessRating] = useState(0);
  const [verifiedLichessRating, setVerifiedLichessRating] = useState(0);

  // Stored avatars from verification lookup
  const [chessAvatar, setChessAvatar] = useState(null);
  const [lichessAvatar, setLichessAvatar] = useState(null);

  const verifyChessUsername = async (username) => {
    const trimmed = username?.trim();
    if (!trimmed) {
      setChessStatus('idle');
      setVerifiedChessRating(0);
      setChessAvatar(null);
      setErrors(prev => ({ ...prev, chess_username: "" }));
      return;
    }
    setChessStatus('verifying');
    try {
      const data = await fetchCompletePlayerData(trimmed, 'chess.com');
      if (data.error || !data.rating) {
        setErrors(prev => ({ ...prev, chess_username: "Chess.com username not found" }));
        setChessStatus('invalid');
        setVerifiedChessRating(0);
        setChessAvatar(null);
      } else {
        setErrors(prev => ({ ...prev, chess_username: "" }));
        setChessStatus('valid');
        setVerifiedChessRating(data.rating);
        setChessAvatar(data.avatar);
      }
    } catch (err) {
      setChessStatus('invalid');
      setVerifiedChessRating(0);
      setChessAvatar(null);
    }
  };

  const verifyLichessUsername = async (username) => {
    const trimmed = username?.trim();
    if (!trimmed) {
      setLichessStatus('idle');
      setVerifiedLichessRating(0);
      setLichessAvatar(null);
      setErrors(prev => ({ ...prev, lichess_username: "" }));
      return;
    }
    setLichessStatus('verifying');
    try {
      const data = await fetchCompletePlayerData(trimmed, 'lichess');
      if (data.error || !data.rating) {
        setErrors(prev => ({ ...prev, lichess_username: "Lichess username not found" }));
        setLichessStatus('invalid');
        setVerifiedLichessRating(0);
        setLichessAvatar(null);
      } else {
        setErrors(prev => ({ ...prev, lichess_username: "" }));
        setLichessStatus('valid');
        setVerifiedLichessRating(data.rating);
        setLichessAvatar(data.avatar);
      }
    } catch (err) {
      setLichessStatus('invalid');
      setVerifiedLichessRating(0);
      setLichessAvatar(null);
    }
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    university: "",
    faculty: "",
    department: "",
    level: "",
    chess_username: "",
    lichess_username: ""
  });

  const [errors, setErrors] = useState({});

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  }

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";

    if (!isLogin) {
      if (!form.name) newErrors.name = "Full name is required";
      if (form.password !== form.confirm) {
        newErrors.confirm = "Passwords do not match";
      }
      if (form.password && form.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (!form.chess_username && !form.lichess_username) {
        newErrors.chess_username = "At least one Chess.com or Lichess username is required";
        newErrors.lichess_username = "At least one Chess.com or Lichess username is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    setLoading(true);

    // Store the remember-me flag BEFORE sign-in so the storage proxy reads it correctly
    localStorage.setItem('ss4_remember_me', rememberMe ? 'true' : 'false');

    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      setLoading(false);
      if (error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.success("Welcome back!");
        // Fire post-login callback if provided, otherwise just close
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess();
        } else {
          onClose();
        }
      }
    } else {
      const needsChessVerify = form.chess_username && chessStatus !== 'valid';
      const needsLichessVerify = form.lichess_username && lichessStatus !== 'valid';

      if (needsChessVerify || needsLichessVerify) {
        setLoading(true);
        toast.info("Verifying chess usernames and fetching ratings...");
        
        let hasError = false;

        if (needsChessVerify) {
          const data = await fetchCompletePlayerData(form.chess_username, 'chess.com');
          if (data.error || !data.rating) {
            setErrors(prev => ({ ...prev, chess_username: "Chess.com username not found" }));
            setChessStatus('invalid');
            setVerifiedChessRating(0);
            setChessAvatar(null);
            hasError = true;
          } else {
            setErrors(prev => ({ ...prev, chess_username: "" }));
            setChessStatus('valid');
            setVerifiedChessRating(data.rating);
            setChessAvatar(data.avatar);
          }
        }

        if (needsLichessVerify) {
          const data = await fetchCompletePlayerData(form.lichess_username, 'lichess');
          if (data.error || !data.rating) {
            setErrors(prev => ({ ...prev, lichess_username: "Lichess username not found" }));
            setLichessStatus('invalid');
            setVerifiedLichessRating(0);
            setLichessAvatar(null);
            hasError = true;
          } else {
            setErrors(prev => ({ ...prev, lichess_username: "" }));
            setLichessStatus('valid');
            setVerifiedLichessRating(data.rating);
            setLichessAvatar(data.avatar);
          }
        }

        setLoading(false);
        if (hasError) {
          toast.error("Please enter a valid username for your chess account(s).");
        } else {
          toast.success("Accounts verified successfully! Click Create Account to finalize.");
        }
        return;
      }

      setLoading(true);
      const profileData = {
        name: form.name,
        university: form.university,
        faculty: form.faculty,
        department: form.department,
        level: form.level,
        chess_username: form.chess_username,
        lichess_username: form.lichess_username,
        chess_rating: verifiedChessRating,
        lichess_rating: verifiedLichessRating
      };

      const { error } = await signUp(form.email, form.password, profileData);
      setLoading(false);

      if (error) {
        toast.error(`Signup failed: ${error.message}`);
      } else {
        setSignupSuccess(true);
        setTimeout(() => {
          if (typeof onAuthSuccess === 'function') {
            onAuthSuccess();
          } else {
            onClose();
          }
        }, 2200);
      }
    }
  };

  if (signupSuccess) {
    return (
      <div className="fixed inset-0 bg-[#111111]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary to-brand-accent"></div>
          
          {/* Animated Success Checkmark Ring */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-50 border border-emerald-100 animate-ping opacity-75 duration-1000"></div>
            {/* Inner stable circle */}
            <div className="relative w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in duration-300">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black font-space text-brand-text-dark leading-tight animate-in slide-in-from-bottom-2 duration-300">
            Welcome to the League!
          </h2>
          <p className="text-sm font-semibold text-gray-500 mt-2.5 max-w-xs mx-auto animate-in slide-in-from-bottom-3 duration-400">
            Account created successfully. Initializing your SCL chess stats and pairings...
          </p>

          {/* Animating Progress Bar */}
          <div className="mt-8 max-w-xs mx-auto">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary rounded-full"
                style={{ 
                  width: progressWidth,
                  transition: 'width 2100ms cubic-bezier(0.1, 0.8, 0.25, 1)' 
                }}
              ></div>
            </div>
            <span className="text-[10px] font-black text-gray-350 uppercase tracking-widest block mt-3">
              Redirecting to dashboard
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#111111]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 relative my-8 animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-text-dark w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <img src="/ss4_logo.jpg" alt="SS4 Logo" className="h-10 mx-auto mb-3" />
          <h2 className="text-2xl font-black font-space text-brand-text-dark leading-tight">
            {isLogin ? "Welcome Back" : "Student Registration"}
          </h2>
          <p className="text-xs font-semibold text-gray-400 mt-1.5">
            {isLogin ? "Log in to access pairings and chat" : "Join the SS4 Chess League & Tournaments"}
          </p>
        </div>

        {/* Segmented Mode Selector */}
        <div className="flex bg-gray-100/70 border border-gray-200/60 rounded-2xl p-1 mb-6 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrors({});
              setShowPassword(false);
              setShowConfirm(false);
            }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none ${
              isLogin
                ? "bg-white text-brand-primary shadow-sm"
                : "text-gray-400 hover:text-gray-600 bg-transparent"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrors({});
              setShowPassword(false);
              setShowConfirm(false);
            }}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none ${
              !isLogin
                ? "bg-white text-brand-primary shadow-sm"
                : "text-gray-400 hover:text-gray-600 bg-transparent"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">

          {!isLogin && (
            <>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <Input
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
                {errors.name && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.name}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <Input
              type="email"
              placeholder="e.g. john@university.edu"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {errors.email && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center cursor-pointer select-none bg-transparent border-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                <div className="relative flex items-center">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center cursor-pointer select-none bg-transparent border-none"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.confirm && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.confirm}</p>}
              </div>
            )}
          </div>

          {!isLogin && (
            <>
              <div className="border-t border-gray-100 pt-4 mt-2">
                <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest mb-3">Academic Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">University</label>
                    <Input
                      placeholder="e.g. University of Uyo"
                      value={form.university}
                      onChange={(e) => update("university", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Faculty</label>
                    <Input
                      placeholder="e.g. Engineering"
                      value={form.faculty}
                      onChange={(e) => update("faculty", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Department</label>
                    <Input
                      placeholder="e.g. Computer Science"
                      value={form.department}
                      onChange={(e) => update("department", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Level</label>
                    <select
                      value={form.level}
                      onChange={(e) => update("level", e.target.value)}
                      className="w-full bg-white border border-[#E8640A] rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8640A]/40"
                    >
                      <option value="">Select Level</option>
                      {[100, 200, 300, 400, 500].map(l => (
                        <option key={l} value={`${l}`}>{l} Level</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <h3 className="text-xs font-black text-brand-accent uppercase tracking-widest mb-1">Chess Credentials</h3>
                <p className="text-[10px] text-gray-400 mb-3 font-semibold">Enter your username on at least one platform to sync your ratings.</p>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Chess.com Username</label>
                    <div className="relative flex items-center">
                      <Input
                        placeholder="e.g. GrandmasterX"
                        value={form.chess_username}
                        onChange={(e) => {
                          update("chess_username", e.target.value);
                          setChessStatus('idle');
                        }}
                        onBlur={(e) => verifyChessUsername(e.target.value)}
                        className="pr-20"
                      />
                      {chessStatus === 'verifying' && (
                        <span className="absolute right-3 flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary"></span>
                      )}
                      {chessStatus === 'valid' && (
                        <span className="absolute right-3 text-xs font-bold text-emerald-650 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                          {chessAvatar && (
                            <img src={chessAvatar} alt="Chess Avatar" className="w-4 h-4 rounded-full object-cover mr-0.5 border border-emerald-200" />
                          )}
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          {verifiedChessRating}
                        </span>
                      )}
                      {chessStatus === 'invalid' && (
                        <span className="absolute right-3 text-xs font-bold text-brand-accent flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </span>
                      )}
                    </div>
                    {errors.chess_username && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.chess_username}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lichess Username</label>
                    <div className="relative flex items-center">
                      <Input
                        placeholder="e.g. LichessPro"
                        value={form.lichess_username}
                        onChange={(e) => {
                          update("lichess_username", e.target.value);
                          setLichessStatus('idle');
                        }}
                        onBlur={(e) => verifyLichessUsername(e.target.value)}
                        className="pr-20"
                      />
                      {lichessStatus === 'verifying' && (
                        <span className="absolute right-3 flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary"></span>
                      )}
                      {lichessStatus === 'valid' && (
                        <span className="absolute right-3 text-xs font-bold text-emerald-650 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                          {lichessAvatar && (
                            <img src={lichessAvatar} alt="Lichess Avatar" className="w-4 h-4 rounded-full object-cover mr-0.5 border border-emerald-200" />
                          )}
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          {verifiedLichessRating}
                        </span>
                      )}
                      {lichessStatus === 'invalid' && (
                        <span className="absolute right-3 text-xs font-bold text-brand-accent flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </span>
                      )}
                    </div>
                    {errors.lichess_username && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.lichess_username}</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Remember Me */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-primary accent-brand-primary cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-xs font-semibold text-gray-500 cursor-pointer select-none">
              Remember me on this device
            </label>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                isLogin ? "Sign In" : (
                  ((form.chess_username && chessStatus !== 'valid') ||
                   (form.lichess_username && lichessStatus !== 'valid'))
                    ? "Verify and Create" 
                    : "Create Account"
                )
              )}
            </Button>
          </div>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-brand-primary font-bold hover:underline ml-1 cursor-pointer focus:outline-none"
            >
              {isLogin ? "Register here" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
