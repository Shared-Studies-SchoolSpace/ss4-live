import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { useAuth } from "../hooks/useAuth";
import { fetchChessComStats, fetchLichessStats } from "../utils/chessService";
import { toast } from "react-toastify";

export default function StudentSignupModal({ onClose }) {
  const { signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
    if (!validate()) return;
    setLoading(false);

    if (isLogin) {
      setLoading(true);
      const { error } = await signIn(form.email, form.password);
      setLoading(false);
      if (error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.success("Successfully logged in!");
        onClose();
      }
    } else {
      setLoading(true);
      toast.info("Verifying chess usernames and fetching ratings...", { autoClose: 2000 });
      
      let chessRating = 0;
      let lichessRating = 0;

      // Poll Chess.com
      if (form.chess_username) {
        const stats = await fetchChessComStats(form.chess_username);
        if (stats.error) {
          toast.warning(`Chess.com username warning: ${stats.error}. Standard rating assigned.`);
        }
        chessRating = stats.rating || 1200;
      }

      // Poll Lichess
      if (form.lichess_username) {
        const stats = await fetchLichessStats(form.lichess_username);
        if (stats.error) {
          toast.warning(`Lichess username warning: ${stats.error}. Standard rating assigned.`);
        }
        lichessRating = stats.rating || 1500;
      }

      const profileData = {
        name: form.name,
        university: form.university,
        faculty: form.faculty,
        department: form.department,
        level: form.level,
        chess_username: form.chess_username,
        lichess_username: form.lichess_username,
        chess_rating: chessRating,
        lichess_rating: lichessRating
      };

      const { error } = await signUp(form.email, form.password, profileData);
      setLoading(false);

      if (error) {
        toast.error(`Signup failed: ${error.message}`);
      } else {
        toast.success("Account created successfully!");
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#111111]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-text-dark text-2xl font-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
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
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              {errors.password && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.password}</p>}
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                />
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
                    <Input
                      placeholder="e.g. 400 Level"
                      value={form.level}
                      onChange={(e) => update("level", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <h3 className="text-xs font-black text-brand-accent uppercase tracking-widest mb-1">Chess Credentials</h3>
                <p className="text-[10px] text-gray-400 mb-3 font-semibold">Enter your username on at least one platform to sync your ratings.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Chess.com Username</label>
                    <Input
                      placeholder="e.g. GrandmasterX"
                      value={form.chess_username}
                      onChange={(e) => update("chess_username", e.target.value)}
                    />
                    {errors.chess_username && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.chess_username}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Lichess Username</label>
                    <Input
                      placeholder="e.g. LichessPro"
                      value={form.lichess_username}
                      onChange={(e) => update("lichess_username", e.target.value)}
                    />
                    {errors.lichess_username && <p className="text-[10px] font-bold text-brand-accent mt-1">{errors.lichess_username}</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-accent transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                isLogin ? "Sign In" : "Register Account"
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
