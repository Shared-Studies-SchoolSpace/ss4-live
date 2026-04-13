// F-05 Aspirants Award page is live and displays award details and first cycle announcement.
import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1, H2, Body, BodyLarge } from '../components/Typography';
import Button from '../components/Button';

export default function AspirantsAwardPage() {
    return (
        <div className="w-full">
            <SectionWrapper variant="white">
                <div className="text-center max-w-4xl mx-auto py-16">
                    <H1>SS4 Aspirants Award</H1>
                    <BodyLarge className="mt-6 text-brand-primary font-bold">
                        First Cycle Announcement: Applications open October 30, 2026.
                    </BodyLarge>
                    <Body className="mt-6 text-lg max-w-2xl mx-auto text-gray-600">
                        The Aspirants Award is a prestige recognition program designed to celebrate the top JAMB scorers among our verified SS4 partner schools.
                    </Body>
                </div>
            </SectionWrapper>
            <SectionWrapper variant="light">
                <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100 mb-16">
                    <H2 className="mb-6">Award Details</H2>
                    <ul className="list-disc pl-6 space-y-4 text-gray-700 text-lg">
                        <li><strong>Eligibility:</strong> Must be a registered SS3 student in an SS4 affiliated secondary school.</li>
                        <li><strong>Criterion:</strong> Highest verified score in the Joint Admissions and Matriculation Board (JAMB) UTME.</li>
                        <li><strong>Reward:</strong> A comprehensive cash prize and exclusive sponsorship recognition.</li>
                        <li><strong>Recognition:</strong> National highlight on the SS4 platform and partner sponsor networks.</li>
                    </ul>
                </div>
            </SectionWrapper>
        </div>
    );
}
