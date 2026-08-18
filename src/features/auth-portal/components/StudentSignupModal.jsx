import { useState, useEffect } from "react";
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useAuth } from '../hooks/useAuth';
import { fetchCompletePlayerData } from '../../chess-league/utils/chessService';
import { validateLoginForm, validateSignupForm, validatePasswordResetForm } from '../utils/authValidation';
import { toast } from "react-toastify";

export default function StudentSignupModal({ 
  onClose, 
  onAuthSuccess, 
  initialIsLogin = false 
}) {
  const { signUp, signIn, sendPasswordReset } = useAuth();

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [progressWidth, setProgressWidth] = useState('0%');

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const resetErrors = validatePasswordResetForm(form.email);
    if (Object.keys(resetErrors).length > 0) {
      setErrors(resetErrors);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await sendPasswordReset(form.email);
      if (error) throw error;
      setResetEmailSent(true);
      toast.success("Reset link sent!");
    } catch (err) {
      toast.error(`Error sending reset link: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

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
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
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
    const newErrors = isLogin
      ? validateLoginForm(form)
      : validateSignupForm(form);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);

    if (isLogin) {
      localStorage.setItem('ss4_remember_me', rememberMe ? 'true' : 'false');
      const { error } = await signIn(form.email, form.password);
      setSubmitting(false);
      if (error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.success("Welcome back!");
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess();
        } else {
          onClose();
        }
      }
    } else {
      let currentChessRating = verifiedChessRating;
      let currentLichessRating = verifiedLichessRating;
      const needsChessVerify = form.chess_username?.trim() && chessStatus !== 'valid';
      const needsLichessVerify = form.lichess_username?.trim() && lichessStatus !== 'valid';

      if (needsChessVerify || needsLichessVerify) {
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
            currentChessRating = data.rating;
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
            currentLichessRating = data.rating;
            setVerifiedLichessRating(data.rating);
            setLichessAvatar(data.avatar);
          }
        }

        if (hasError) {
          setSubmitting(false);
          toast.error("Please enter a valid username for your chess account(s).");
          return;
        }
      }

      // Concatenate First Name and Last Name into full name for database storage
      const fullName = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();

      const profileData = {
        name: fullName,
        phone: form.phone.trim(),
        university: form.university.trim(),
        faculty: form.faculty.trim(),
        department: form.department.trim(),
        level: form.level || '',
        chess_username: form.chess_username?.trim() || '',
        lichess_username: form.lichess_username?.trim() || '',
        chess_rating: currentChessRating,
        lichess_rating: currentLichessRating
      };

      localStorage.setItem('ss4_remember_me', rememberMe ? 'true' : 'false');
      const { error } = await signUp(form.email, form.password, profileData);
      setSubmitting(false);

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
      <div className="fixed inset-0 bg-[#111111]/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary to-brand-accent"></div>
          
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-50 border border-emerald-100 animate-ping opacity-75 duration-1000"></div>
            <div className="relative w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in duration-300">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-[22px] font-black font-space text-brand-text-dark leading-tight animate-in slide-in-from-bottom-2 duration-300">
            Welcome to the League!
          </h2>
          <p className="text-[11px] font-semibold text-gray-500 mt-2.5 max-w-xs mx-auto animate-in slide-in-from-bottom-3 duration-400">
            Account created successfully. Initializing your profile and ratings...
          </p>

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
            <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block mt-3">
              Redirecting to dashboard
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#111111]/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-6 overflow-y-auto">
      {/* 2-Field Row Enforced Geometry & 8% Reduced Font Hierarchy */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-[500px] shadow-2xl border border-gray-100 relative my-auto animate-in fade-in zoom-in-95 duration-200 transition-all">

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-brand-text-dark w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-5">
          <img src="/ss4_logo.jpg" alt="SS4 Logo" className="h-9 mx-auto mb-2.5" />
          <h2 className="text-[22px] font-black font-space text-brand-text-dark leading-tight">
            {isForgotPassword 
              ? "Reset Password" 
              : (isLogin ? "Welcome Back" : "Create Account")}
          </h2>
          <p className="text-[11px] font-semibold text-gray-400 mt-1 max-w-xs mx-auto">
            {isForgotPassword 
              ? "We'll send a password recovery link to your email" 
              : (isLogin ? "Log in to access pairings and chat" : "Join the SS4 Chess League & Tournaments")}
          </p>
        </div>

        {/* Segmented Mode Selector */}
        {!isForgotPassword && (
          <div className="flex bg-gray-100/70 border border-gray-200/60 rounded-2xl p-1 mb-5 max-w-[240px] mx-auto">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
                setShowPassword(false);
                setShowConfirm(false);
              }}
              className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none ${
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
              className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none ${
                !isLogin
                  ? "bg-white text-brand-primary shadow-sm"
                  : "text-gray-400 hover:text-gray-600 bg-transparent"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
            {resetEmailSent ? (
              <div className="text-center py-5 space-y-2.5">
                <span className="text-3xl block mb-1.5">✉️</span>
                <h3 className="text-[11px] font-black text-brand-text-dark uppercase tracking-wider">Reset Link Sent</h3>
                <p className="text-[11px] font-semibold text-gray-500 max-w-xs mx-auto leading-relaxed">
                  We've sent a password reset link to <strong className="text-brand-primary font-bold">{form.email}</strong>. Please check your inbox.
                </p>
                <div className="pt-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                    className="w-full py-2.5 text-[11px] font-bold rounded-full cursor-pointer"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="e.g. john@university.edu"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="text-[13px] py-2 px-3"
                  />
                  {errors.email && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.email}</p>}
                </div>
                
                <div className="pt-1.5">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </div>

                <div className="text-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrors({});
                    }}
                    className="text-brand-primary text-[11px] font-bold hover:underline cursor-pointer bg-transparent border-none focus:outline-none"
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in duration-150">

            {!isLogin ? (
              <>
                {/* Row 1: First Name & Last Name (2 Fields Per Row) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">First Name</label>
                    <Input
                      placeholder="e.g. John"
                      value={form.first_name}
                      onChange={(e) => update("first_name", e.target.value)}
                      className="text-[13px] py-2 px-3"
                    />
                    {errors.first_name && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Name</label>
                    <Input
                      placeholder="e.g. Doe"
                      value={form.last_name}
                      onChange={(e) => update("last_name", e.target.value)}
                      className="text-[13px] py-2 px-3"
                    />
                    {errors.last_name && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.last_name}</p>}
                  </div>
                </div>

                {/* Row 2: Email Address & Phone Number (2 Fields Per Row) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="e.g. john@uni.edu"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="text-[13px] py-2 px-3"
                    />
                    {errors.email && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone / WhatsApp</label>
                    <Input
                      placeholder="e.g. +2348000000000"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="text-[13px] py-2 px-3"
                    />
                    {errors.phone && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.phone}</p>}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                <Input
                  type="email"
                  placeholder="e.g. john@university.edu"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="text-[13px] py-2 px-3"
                />
                {errors.email && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.email}</p>}
              </div>
            )}

            {/* Row 3: Password & Confirm Password (2 Fields Per Row) */}
            <div className={`${isLogin ? 'block' : 'grid grid-cols-2 gap-3'}`}>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrors({});
                      }}
                      className="text-brand-primary text-[9px] font-bold hover:underline cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="pr-9 text-[13px] py-2 px-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center cursor-pointer select-none bg-transparent border-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirm}
                      onChange={(e) => update("confirm", e.target.value)}
                      className="pr-9 text-[13px] py-2 px-3"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center cursor-pointer select-none bg-transparent border-none"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirm ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.confirm && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.confirm}</p>}
                </div>
              )}
            </div>

          {!isLogin && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-widest mb-2.5">
                Academic Details
              </h3>
              <div className="space-y-3">
                {/* Row 4: University / School & Faculty (2 Fields Per Row) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      University / School
                    </label>
                    <Input
                      placeholder="e.g. Uniuyo"
                      value={form.university}
                      onChange={(e) => update("university", e.target.value)}
                      className="text-[13px] py-2 px-3"
                    />
                    {errors.university && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.university}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Faculty
                    </label>
                    <Input
                      placeholder="e.g. Science"
                      value={form.faculty}
                      onChange={(e) => update("faculty", e.target.value)}
                      className="text-[13px] py-2 px-3"
                    />
                    {errors.faculty && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.faculty}</p>}
                  </div>
                </div>

                {/* Row 5: Department & Academic Level (2 Fields Per Row) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Department
                    </label>
                    <Input
                      placeholder="e.g. Computer Sci"
                      value={form.department}
                      onChange={(e) => update("department", e.target.value)}
                      className="text-[13px] py-2 px-3"
                    />
                    {errors.department && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.department}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Academic Level <span className="text-[9px] font-normal lowercase text-gray-400">(opt)</span>
                    </label>
                    <select
                      value={form.level}
                      onChange={(e) => update("level", e.target.value)}
                      className="w-full bg-white border border-[#E8640A] rounded-xl px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8640A]/40"
                    >
                      <option value="">Select Level</option>
                      {[100, 200, 300, 400, 500].map(l => (
                        <option key={l} value={`${l}`}>{l} Level</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <h3 className="text-[11px] font-black text-brand-accent uppercase tracking-widest mb-0.5">Chess Credentials</h3>
              <p className="text-[9px] text-gray-400 mb-2.5 font-semibold">At least one username is required; both recommended.</p>

                {/* Row 6: Chess.com Username & Lichess Username (2 Fields Per Row) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chess.com Username</label>
                    <div className="relative flex items-center">
                      <Input
                        placeholder="e.g. GrandmasterX"
                        value={form.chess_username}
                        onChange={(e) => {
                          update("chess_username", e.target.value);
                          setChessStatus('idle');
                        }}
                        onBlur={(e) => verifyChessUsername(e.target.value)}
                        className="pr-16 text-[13px] py-2 px-3"
                      />
                      {chessStatus === 'verifying' && (
                        <span className="absolute right-2.5 flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary"></span>
                      )}
                      {chessStatus === 'valid' && (
                        <span className="absolute right-2 text-[10px] font-bold text-emerald-650 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          {chessAvatar && (
                            <img src={chessAvatar} alt="Chess Avatar" className="w-3.5 h-3.5 rounded-full object-cover mr-0.5 border border-emerald-200" />
                          )}
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          {verifiedChessRating}
                        </span>
                      )}
                      {chessStatus === 'invalid' && (
                        <span className="absolute right-2 text-[10px] font-bold text-brand-accent flex items-center gap-0.5 bg-red-50 px-1.5 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </span>
                      )}
                    </div>
                    {errors.chess_username && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.chess_username}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lichess Username</label>
                    <div className="relative flex items-center">
                      <Input
                        placeholder="e.g. LichessPro"
                        value={form.lichess_username}
                        onChange={(e) => {
                          update("lichess_username", e.target.value);
                          setLichessStatus('idle');
                        }}
                        onBlur={(e) => verifyLichessUsername(e.target.value)}
                        className="pr-16 text-[13px] py-2 px-3"
                      />
                      {lichessStatus === 'verifying' && (
                        <span className="absolute right-2.5 flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-primary"></span>
                      )}
                      {lichessStatus === 'valid' && (
                        <span className="absolute right-2 text-[10px] font-bold text-emerald-650 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          {lichessAvatar && (
                            <img src={lichessAvatar} alt="Lichess Avatar" className="w-3.5 h-3.5 rounded-full object-cover mr-0.5 border border-emerald-200" />
                          )}
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          {verifiedLichessRating}
                        </span>
                      )}
                      {lichessStatus === 'invalid' && (
                        <span className="absolute right-2 text-[10px] font-bold text-brand-accent flex items-center gap-0.5 bg-red-50 px-1.5 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </span>
                      )}
                    </div>
                    {errors.lichess_username && <p className="text-[9px] font-bold text-brand-accent mt-0.5">{errors.lichess_username}</p>}
                  </div>
                </div>
              </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-brand-primary accent-brand-primary cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-[11px] font-semibold text-gray-500 cursor-pointer select-none">
              Remember me on this device
            </label>
          </div>

          <div className="pt-1.5">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
        )}

        {!isForgotPassword && (
          <div className="text-center mt-5 pt-3 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500">
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
        )}
      </div>
    </div>
  );
}
