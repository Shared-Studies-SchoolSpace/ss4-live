// F-08 About page is live with SS4 story and vision.
import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1, H2, Body, BodyLarge } from '../components/Typography';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen text-[#111111]">
            <SectionWrapper variant="light" className="bg-[#F6F4F0]">
                <div className="text-center max-w-4xl mx-auto py-16">
                    <H1>Our Vision for African Education</H1>
                    <BodyLarge className="mt-6 text-gray-600">
                        At Shared-Studies-SchoolSpace (SS4), we believe in bridging the gap between talent and opportunity.
                    </BodyLarge>
                </div>
            </SectionWrapper>
            <SectionWrapper variant="white">
                <div className="max-w-3xl mx-auto text-gray-700 py-12 space-y-6 mb-16">
                    <H2>Our Story</H2>
                    <Body className="leading-loose">
                        SS4 was founded with a singular mission: to provide rigorous academic infrastructure to secondary schools in Nigeria and across Africa. Recognizing the disparities in educational resources, we built a unified mock assessment tier—the SAS—that levels the playing field for all partner schools.
                    </Body>
                    <Body className="leading-loose">
                        We understand that the transition from secondary school to tertiary education is incredibly competitive. Standardized tests like JAMB and WAEC determine the futures of millions of students annually. Through the SS4 network, we aim to ensure that students are not just tested, but adequately sharpened and rewarded.
                    </Body>
                    
                    <H2 className="mt-12 mb-4">Our Mission</H2>
                    <ul className="list-disc pl-6 space-y-4 text-lg">
                        <li><strong>Standardization:</strong> Delivering a universally trusted benchmark through the Shared Studies Assessment Series (SAS).</li>
                        <li><strong>Recognition:</strong> Rewarding true academic grit and excellence via the Aspirants Award.</li>
                        <li><strong>Partnership:</strong> Connecting the brightest students with impactful sponsors and tertiary institutions.</li>
                    </ul>
                </div>
            </SectionWrapper>
        </div>
    );
}
