import { useNavigate } from "react-router-dom";
import { Hero } from "../components/Hero";
import SectionWrapper from "../components/SectionWrapper";
import { H2, Body, BodyLarge } from "../components/Typography";
import Button from "../components/Button";
import Card from "../components/Card";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import VerifiedIcon from "@mui/icons-material/Verified";
import Carousel from "../components/Carousel";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Hero />
      
      <SectionWrapper variant="white" py={5} className="bg-white">
        <div className="max-w-4xl mx-auto py-10 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-4">About SS4</p>
          <H2 className="mb-2">We Set the Standard for Education Excellence</H2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-10 overflow-hidden">
            <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase text-brand-accent whitespace-nowrap">Clear Standards</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase text-brand-primary whitespace-nowrap">Recognized Achievements</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase text-brand-accent whitespace-nowrap">Visible Progress</span>
          </div>
          <BodyLarge className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Every great sport has a governing body — one that sets the rules, raises the standard, and makes excellence visible. African secondary education has never had that. SS4 is building it.
            <br /><br />
            We do not tutor. We do not replace teachers. We create the structured environment in which academic diligence becomes visible, measurable, and worth striving for. Through our Assessment Series, our Aspirants Award, and our growing network of partner schools, we are building the most credible institution in African secondary education — from the ground up.
          </BodyLarge>
        </div>

        <div className="py-4 border-t border-gray-50 flex flex-col items-center">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-4 mt-8">What We Do</p>
          <H2 className="text-center mb-12">Three Pillars. One Mission.</H2>
          <Carousel 
            items={[
              <Card icon={<TravelExploreIcon className="text-brand-primary" />} title="The SS4 School Network">
                A curated directory of verified partner secondary schools. We document institutions that are committed to academic rigour, making their quality visible to parents, sponsors, and the wider public.
              </Card>,
              <Card icon={<WorkspacePremiumIcon className="text-brand-primary" />} title="SS4 Assessment Series (SAS)">
                Our proprietary academic assessment tool, built around core subjects. SAS defines the standard for what students must know — and challenges them to rise to it ahead of national examinations.
              </Card>,
              <Card icon={<VerifiedIcon className="text-brand-primary" />} title="The SS4 Aspirants Award">
                The highest academic honour we confer. The top JAMB scorer among SS4-affiliated students earns ceremonial recognition, a significant cash prize, and a direct connection to our sponsors.
              </Card>
            ]} 
          />
        </div>
      </SectionWrapper>

      <section className="bg-[#F6F4F0] py-5 px-4">
        <div className="container mx-auto max-w-5xl">
            <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase text-center mb-4">Latest from SS4</p>
            <H2 className="text-center mb-12">Updates from Across the Network</H2>
            <div className="grid md:grid-cols-3 gap-6">
                {[
                  { tag: 'Aspirants Award', title: 'The First Award Cycle Is Now Open', desc: 'Applications and participation for the inaugural SS4 Aspirants Award cycle are officially open. Here is everything you need to know.', date: 'Oct 24, 2026' },
                  { tag: 'Assessment Series', title: 'SAS Mathematics Scope Expanded for 2026', desc: 'The Further Mathematics syllabus has been fully integrated into the General Mathematics framework, raising the ceiling for top performers.', date: 'Oct 22, 2026' },
                  { tag: 'Sponsorship', title: 'SS4 Welcomes Its Newest Official Sponsor', desc: 'We are proud to announce a new sponsorship commitment that will directly fund this year\'s Aspirants Award prize.', date: 'Oct 18, 2026' }
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
               <Button onClick={() => navigate('/news')} variant="secondary">View All Updates</Button>
            </div>
        </div>
      </section>

      <SectionWrapper variant="light" py={0}>
        <div className="text-center max-w-4xl mx-auto py-12">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mb-4">Sponsorship</p>
          <H2>Invest in the Next Generation.</H2>
          <BodyLarge className="mt-4">
            SS4 gives sponsors something rare — direct, credible association with academic excellence at scale. Your brand reaches students, parents, and schools across Africa through a platform built on rigour and prestige. More than visibility, you gain the knowledge that your investment is shaping real academic outcomes.
          </BodyLarge>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Button variant="primary" onClick={() => navigate('/partner')}>
              Become an Official Sponsor
            </Button>
            <p className="text-sm font-bold text-gray-500">
              For partnership inquiries, reach us at <a href="mailto:partners@ssfour.org" className="text-brand-accent hover:underline">partners@ssfour.org</a>
            </p>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
