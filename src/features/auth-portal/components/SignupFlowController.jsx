// SignupFlowController.jsx
import { useState } from "react";
import SignupChoiceModal from './SignupChoiceModal';
import StudentSignupModal from './StudentSignupModal';

export default function SignupFlowController({ onAuthSuccess, initialStage = null }) {
  const [stage, setStage] = useState(initialStage); 
  // null = no modal, "choice" = pre-flow modal, "student" = student signup, "general" = general signup, "login" = sign in

  return (
    <>
      {stage === "choice" && (
        <SignupChoiceModal
          onClose={() => setStage(null)}
          onStudent={() => setStage("student")}
          onGeneral={() => setStage("general")}
          onSignIn={() => setStage("login")}
        />
      )}

      {(stage === "student" || stage === "general" || stage === "login") && (
        <StudentSignupModal
          onClose={() => setStage(null)}
          onAuthSuccess={onAuthSuccess}
          initialIsLogin={stage === "login"}
          initialFlowType={stage === "general" ? "general" : "student"}
          onBackToChoice={() => setStage("choice")}
        />
      )}
    </>
  );
}
