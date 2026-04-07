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
        <div className="max-w-4xl mx-auto py-20 text-center">
          <H2>What is SS4?</H2>
          <BodyLarge className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            SS4 is an African institution for secondary education excellence. We are to education what UEFA is to football — the structured environment where quality is assessed, recognized, and rewarded. We don't just tutor; we set the standard against which all academic diligence is measured.
          </BodyLarge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-16 border-t border-gray-50">
          <Card icon={<TravelExploreIcon className="text-brand-primary" />} title="The SS4 Network">
            Africa's directory of verified partner secondary schools. We document institutions committed to the highest academic rigour, making excellence visible to parents and sponsors.
          </Card>

          <Card icon={<WorkspacePremiumIcon className="text-brand-primary" />} title="Assessment Series (SAS)">
            Our serious, proprietary academic tool defining the standard for five core subjects. SAS is built to challenge and sharpen students ahead of national examinations.
          </Card>

          <Card icon={<VerifiedIcon className="text-brand-primary" />} title="Aspirants Award">
            The ultimate prestige for African students. We celebrate the top JAMB scorers from our partner schools with ceremonial recognition and significant cash rewards.
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
                        <div className="mb-2"><span className="text-[10px] font-bold bg-brand-primary text-white px-3 py-1 rounded-full uppercase tracking-wider">{item.tag}</span></div>
                        <h3 className="text-lg font-bold mt-4 text-[#111111]">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-2 mb-6">{item.desc}</p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400">{item.date}</p>
                             <a href="/news" className="text-sm font-bold text-brand-accent hover:underline">Read more</a>
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
