import { useNavigate } from "react-router-dom";

import SectionWrapper from "../components/SectionWrapper";
import { H1, H2, Body, BodyLarge } from "../components/Typography";
import Button from "../components/Button";
import Card from "../components/Card";
import NavBar from "../components/Navbar";

import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F6F4F0] min-h-screen text-[#111111]">
      <NavBar />

      <SectionWrapper variant="default">
        <div className="text-center max-w-4xl mx-auto py-12">
          <H1>Raising the Standard of African Secondary Education</H1>

          <BodyLarge className="mt-6">
            Shared-Studies-SchoolSpace (SS4) is an institution dedicated to academic excellence,
            providing rigorous assessment tools and prestigious awards for the brightest students.
          </BodyLarge>

          <div className="mt-10 flex justify-center items-center gap-4">
            <Button
              variant="primary"
              onClick={() => navigate("/universities")}
            >
              Browse Partner Schools
            </Button>

            <Button variant="secondary" onClick={() => navigate("/guest")}>
              View SAS Scope
            </Button>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white" className="bg-white">
        <div className="text-center mb-16 py-12">
          <H2>Our Core Pillars</H2>

          <Body className="mt-4 max-w-2xl mx-auto">
            We partner with premier schools to ensure every student is prepared for success.
          </Body>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
          <Card icon={<TravelExploreIcon />} title="The SS4 Network">
            A comprehensive directory of verified partner secondary schools across Nigeria. Ensure your institution is recognized for its academic rigor.
          </Card>

          <Card icon={<WorkspacePremiumIcon />} title="Shared Studies Assessment Series">
            A premier, proprietary academic tool covering 5 core subjects: English, Math, Physics, Chemistry, and Biology.
          </Card>

          <Card icon={<VerifiedIcon />} title="SS4 Aspirants Award">
            A prestige award celebrating the top JAMB scorer among SS4-affiliated students, featuring a cash reward and sponsor recognition.
          </Card>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="light">
        <div className="text-center max-w-4xl mx-auto py-16">
          <H2>Become an Official Sponsor</H2>

          <BodyLarge className="mt-4">
            Reach students at scale, be associated with excellence, and give back with measurable impact. Join us in shaping the next generation.
          </BodyLarge>

          <div className="mt-8">
            <Button
              variant="primary"
              onClick={() => {}}
            >
              Contact for Sponsorship
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
