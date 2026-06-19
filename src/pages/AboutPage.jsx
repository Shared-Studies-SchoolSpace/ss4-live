// F-08 About page is live with SS4 story and vision.
import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1, H2, Body, BodyLarge } from '../components/Typography';

export default function AboutPage() {
    return (
        <div className="w-full">
            <SectionWrapper variant="default">
                <div className="text-center max-w-4xl mx-auto py-16">
                    <H1>About SS4</H1>
                    <p className="text-xs font-bold tracking-[0.2em] text-brand-accent uppercase mt-4 mb-2">A Global Village for Institutions</p>
                    <BodyLarge className="mt-6 text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        SS4 is building the infrastructure that connects schools, tertiary institutions, departments, and students into one shared space. A single environment where they compete, collaborate, discover talent, and build together. Institutions are stronger connected than they are alone. SS4 is that connection.
                    </BodyLarge>
                </div>
            </SectionWrapper>
            <SectionWrapper variant="white">
                <div className="max-w-3xl mx-auto text-gray-700 py-12 space-y-6 mb-16">
                    <H2>Our Story</H2>
                    <Body className="leading-loose">
                        For decades, Nigerian institutions have operated in isolation. A school in Akwa Ibom and a school in Ogun State may never interact. A department in UNIUYO and a department in Covenant University may never share a resource. A talented student in one institution may never be seen by a sponsor or university that would invest in them. The parts exist. The whole has been missing.
                    </Body>
                    <Body className="leading-loose font-bold text-brand-primary text-lg">
                        SS4 was founded to build that whole.
                    </Body>
                    <Body className="leading-loose">
                        We are creating what the world did for people, for academia. A global village where institutions are no longer islands. Where a student at UNIUYO plays chess against a student at UNN and builds a relationship that matters. Where schools compete on the same leaderboard and discover, through healthy competition, that they produce more together than they ever could apart. Where talent is no longer trapped inside one campus, invisible to the wider world.
                    </Body>
                    <Body className="leading-loose">
                        The SS4 Chess League (SCL) is the first engine. Chess was chosen deliberately: it is globally standardized, requires no physical infrastructure, and produces measurable performance data from every match. But chess is not the product. The network is the product. The connections between students, departments, and institutions are the product.
                    </Body>
                    <Body className="leading-loose">
                        In our first 40 days, the league grew from 60 to 140 players across multiple Nigerian states, entirely through students inviting students. No advertisements. No institutional outreach. The village is forming on its own.
                    </Body>
                    <Body className="leading-loose">
                        The Assessment Series (SAS) will be our second engine. The SS4 Language Model (SLM) will follow. Each engine serves the same mission: connecting institutions into one shared space where they build something greater than any single one of them could build alone.
                    </Body>
                    
                    <H2 className="mt-16 mb-6">Our Mission</H2>
                    <div className="space-y-6">
                        <div className="p-6 bg-[#F6F4F0] rounded-xl border border-gray-200">
                            <h4 className="font-extrabold text-brand-primary text-lg mb-1">Connect</h4>
                            <p className="text-gray-700 leading-relaxed">Linking schools, tertiary institutions, departments, and students into a single shared network. No institution operates in isolation anymore.</p>
                        </div>
                        <div className="p-6 bg-[#F6F4F0] rounded-xl border border-gray-200">
                            <h4 className="font-extrabold text-brand-primary text-lg mb-1">Compete</h4>
                            <p className="text-gray-700 leading-relaxed">Building structured, recurring competition infrastructure where institutions face each other, talent is discovered, and excellence is made visible.</p>
                        </div>
                        <div className="p-6 bg-[#F6F4F0] rounded-xl border border-gray-200">
                            <h4 className="font-extrabold text-brand-primary text-lg mb-1">Collaborate</h4>
                            <p className="text-gray-700 leading-relaxed">Creating the environment where institutions share resources, students build cross-campus relationships, and the whole becomes greater than the sum of its parts.</p>
                        </div>
                        <div className="p-6 bg-[#F6F4F0] rounded-xl border border-gray-200">
                            <h4 className="font-extrabold text-brand-primary text-lg mb-1">Celebrate</h4>
                            <p className="text-gray-700 leading-relaxed">Recognizing and rewarding the students and institutions that show up, compete, and rise. Through league rankings, institutional leaderboards, and the Aspirants Award, we make excellence impossible to ignore.</p>
                        </div>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
