// SignupFlowController.jsx
import { useState } from "react";
import SignupChoiceModal from "./SignupChoiceModal";
import StudentSignupModal from "./StudentSignupModal";

export default function SignupFlowController() {
  const [stage, setStage] = useState(null); 
  // null = no modal, "choice" = first modal, "student" = second modal

  return (
    <>
      <button onClick={() => setStage("choice")}>Signup</button>

      {stage === "choice" && (
        <SignupChoiceModal
          onClose={() => setStage(null)}
          onGuest={() => {
            setStage(null);
            // redirect to home
          }}
          onStudent={() => setStage("student")}
        />
      )}

      {stage === "student" && (
        <StudentSignupModal
          onClose={() => setStage(null)}
        />
      )}
    </>
  );
}
