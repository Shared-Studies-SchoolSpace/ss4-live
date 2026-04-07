import { useNavigate } from "react-router-dom";
import { Hero } from "../components/Hero";
import SectionWrapper from "../components/SectionWrapper";
import { H2, Body, BodyLarge } from "../components/Typography";
import Button from "../components/Button";
import Card from "../components/Card";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Hero />
      
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

      <section className="bg-[#F6F4F0] py-20 px-4">
        <div className="container mx-auto max-w-5xl">
            <H2 className="text-center mb-12">Latest Updates</H2>
            <div className="grid md:grid-cols-3 gap-6">
                {[
                  { tag: 'Aspirants Award', title: 'Q1 Award Cycle Opens', desc: 'The first cycle of the Aspirants Award is now open for participants.', date: 'Oct 24, 2026' },
                  { tag: 'SAS Updates', title: 'New Math Curriculum', desc: 'The SAS syllabus for Further Math has been fully merged into General Math.', date: 'Oct 22, 2026' },
                  { tag: 'Sponsorship', title: 'Welcome to our newest sponsor', desc: 'We are thrilled to welcome our new sponsors to the SS4 platform.', date: 'Oct 18, 2026' }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
                        <div className="mb-2"><span className="text-[10px] font-bold bg-[#26844D] text-white px-3 py-1 rounded-full uppercase tracking-wider">{item.tag}</span></div>
                        <h3 className="text-lg font-bold mt-4 text-[#111111]">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-2 mb-6">{item.desc}</p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400">{item.date}</p>
                            <a href="/news" className="text-sm font-bold text-[#E8640A] hover:underline">Read more</a>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-12">
               <Button onClick={() => navigate('/news')} variant="secondary">View All News</Button>
            </div>
        </div>
      </section>

      <SectionWrapper variant="light">
        <div className="text-center max-w-4xl mx-auto py-16">
          <H2>Become an Official Sponsor</H2>
          <BodyLarge className="mt-4">
            Reach students at scale, be associated with excellence, and give back with measurable impact. Join us in shaping the next generation.
          </BodyLarge>
          <div className="mt-8">
            <Button variant="primary" onClick={() => navigate('/partner')}>
              Contact for Sponsorship
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
