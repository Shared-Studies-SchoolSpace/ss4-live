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
            <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase text-brand-accent whitespace-nowrap">One Space</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase text-brand-primary whitespace-nowrap">Many Institutions</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="text-xs md:text-sm font-black tracking-[0.3em] uppercase text-brand-accent whitespace-nowrap">Stronger Together</span>
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
              <Card icon={<TravelExploreIcon className="text-brand-primary" />} title="Shared Study School Space (SS4)">
                <span className="block font-bold text-brand-accent mb-2">One Space. Many Institutions. Stronger Together.</span>
                This is the Shared Study School Space. A single, connected environment where institutions stop operating alone and start building as one. The SS4 Chess League is the first engine powering that connection. More engines will follow. The village comes first.
              </Card>,
              <Card icon={<WorkspacePremiumIcon className="text-brand-primary" />} title="The SS4 Chess League (SCL)">
                <span className="block font-bold text-brand-accent mb-2">The first engine inside the SS4 network.</span>
                A structured, recurring competition system where students across Nigerian institutions compete in ranked divisions, monthly tournaments, and continuous league matches every two days. Student performance profiles accumulate across seasons. Institutional rankings make schools visible to the world. Live now with players spanning multiple states. Growing entirely through students inviting students, school linking to school.
              </Card>,
              <Card icon={<VerifiedIcon className="text-brand-primary" />} title="Assessment Series (SAS)">
                A self-assessment tool built to help students identify and close knowledge gaps ahead of national examinations. SAS serves the SS4 community directly, offering structured academic preparation alongside structured competition.
              </Card>
            ]} 
          />
        </div>
      </SectionWrapper>

      <section className="bg-[#F6F4F0] py-5 px-4">
        <div className="container mx-auto max-w-5xl">
            <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase text-center mb-4">Latest from SS4</p>
            <H2 className="text-center mb-12">Updates from Across the Network</H2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { tag: 'June Tournament Ahead', title: 'Preparations Underway', desc: 'The June tournament runs in the last seven days of the month. League matches continue every two days. Students are preparing. Institutions are watching. Registration remains open.', date: 'Jun 16, 2026' },
                  { tag: 'League Growth', title: '140 Players and Counting', desc: 'The SS4 Chess League has grown from 60 to 140 players in less than 40 days, 100% through peer referral across multiple Nigerian states. Institutions are connecting through their students.', date: 'Jun 14, 2026' },
                  { tag: 'Retention', title: 'Inter-Tournament League Active', desc: 'Over 30 matches played by more than 30 players in the weeks between tournaments. The calendar is working. The habit is forming.', date: 'Jun 10, 2026' },
                  { tag: 'Sponsorship', title: 'Partner with the Next Generation', desc: 'SS4 offers sponsors direct visibility into an active, connected community of Nigerian students and institutions competing on a known monthly calendar.', date: 'Jun 5, 2026' },
                  { tag: 'May Tournament Concludes', title: 'First Tournament Cycle Complete', desc: 'The inaugural SS4 Chess League tournament wrapped successfully. Winners recorded. Rankings live. The leaderboard is no longer empty.', date: 'Jun 2, 2026' }
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
          <H2>Become an Official Sponsor</H2>
          <BodyLarge className="mt-4">
            Reach students and institutions inside a connected network. Be associated with performance, collaboration, and the infrastructure that is turning academia into a global village.
          </BodyLarge>
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-brand-accent/20 transition-all cursor-pointer" onClick={() => window.location.href='mailto:ss4.mail.org@gmail.com'}>
                Contact for Sponsorship
              </button>
            </div>
            <p className="text-gray-500 text-xs text-center mt-6">
              For partnership inquiries, reach us at <a href="mailto:ss4.mail.org@gmail.com" className="text-brand-accent hover:underline">ss4.mail.org@gmail.com</a>
            </p>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
