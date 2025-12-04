import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionWrapper from "../components/SectionWrapper";
import { H1, H2, Body, BodyLarge } from "../components/Typography";
import Button from "../components/Button";
import Card from "../components/Card";
import NavBar from "../components/Navbar";

import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import SignupChoiceModal from "../components/SignupChoiceModal";
import StudentSignupModal from "../components/StudentSignupModal";

export default function LandingPage() {
  const navigate = useNavigate();

  const [openSignupChoice, setOpenSignupChoice] = useState(false);
  const [openStudentSignup, setOpenStudentSignup] = useState(false);

  function handleGuest() {
    setOpenSignupChoice(false);
    navigate("/home");
  }

  function handleStudent() {
    setOpenSignupChoice(false);
    setOpenStudentSignup(true);
  }

  return (
    <>
      <NavBar />

      {openSignupChoice && (
        <SignupChoiceModal
          onGuest={handleGuest}
          onStudent={handleStudent}
          onClose={() => setOpenSignupChoice(false)}
        />
      )}

      {openStudentSignup && (
        <StudentSignupModal
          onClose={() => setOpenStudentSignup(false)}
        />
      )}

      <SectionWrapper variant="default">
        <div className="text-center max-w-4xl mx-auto">
          <H1>Upload, Share, and Monetize Your University Resources</H1>

          <BodyLarge className="mt-6">
            SS4 is the social-learning marketplace for students and graduates
            to share and monetize notes, study guides, and more.
          </BodyLarge>

          <div className="mt-10 flex justify-center items-center gap-4">
            <Button
              variant="primary"
              onClick={() => setOpenSignupChoice(true)}
            >
              Get Started for Free
            </Button>

            <Button variant="secondary">
              Explore Resources
            </Button>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white">
        <div className="text-center mb-16">
          <H2>Everything You Need to Succeed</H2>

          <Body className="mt-4 max-w-2xl mx-auto">
            Discover a new way to learn and earn with our powerful platform
            features.
          </Body>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card icon={<CloudUploadIcon />} title="Resource Sharing & Monetization">
            Easily upload your study materials and set your own prices. Turn
            your hard work into a rewarding side income.
          </Card>

          <Card icon={<TravelExploreIcon />} title="Structured Content Discovery">
            Find exactly what you need by filtering by university, course,
            or topic. Connect with peers and discover trending content.
          </Card>

          <Card icon={<WorkspacePremiumIcon />} title="Flexible Subscription Models">
            Start with the Freemium plan or upgrade to Premium for unlimited
            access and exclusive features.
          </Card>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="text-center max-w-4xl mx-auto">
          <H2>Join Thousands of Students Today</H2>

          <BodyLarge className="mt-4">
            Sign up now to start exploring, sharing, and monetizing your
            educational resources.
          </BodyLarge>

          <div className="mt-8">
            <Button
              variant="primary"
              onClick={() => setOpenSignupChoice(true)}
            >
              Create Your Free Account
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
