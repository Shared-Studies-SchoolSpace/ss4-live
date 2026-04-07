// F-06 Updates/news feed displays cards with headline, tag, date, and excerpt.
import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1, H2, Body } from '../components/Typography';

const mockNews = [
    { tag: 'Aspirants Award', title: 'Q1 Award Cycle Opens', desc: 'The first cycle of the Aspirants Award is now open for participants. Ensure your school registers candidates before the deadline.', date: 'Oct 24, 2026' },
    { tag: 'SAS Updates', title: 'New Math Curriculum Integration', desc: 'The SAS syllabus for Further Math has been fully merged into General Math based on the new WAEC curriculum standards.', date: 'Oct 22, 2026' },
    { tag: 'Sponsorship', title: 'Welcome to our newest sponsor', desc: 'We are thrilled to welcome our new sponsors to the SS4 platform. Their contribution will expand our reach to 50 more schools.', date: 'Oct 18, 2026' },
    { tag: 'Partner Schools', title: 'Loyola Jesuit College Joins SS4', desc: 'Loyola Jesuit College is our latest partner school, granting its students full access to the SAS mock series.', date: 'Oct 10, 2026' },
];

export default function NewsPage() {
    return (
        <div className="text-[#111111]">
            <SectionWrapper variant="default">
                <div className="max-w-5xl mx-auto py-12">
                    <H1 className="text-center mb-12">Updates & News</H1>
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
                        {mockNews.map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
                                <div className="mb-4">
                                    <span className="text-[10px] font-bold bg-[#E8640A] text-white px-3 py-1 rounded-full uppercase tracking-wider">{item.tag}</span>
                                </div>
                                <H2 className="text-xl font-bold mt-2 text-[#111111]">{item.title}</H2>
                                <Body className="text-sm text-gray-600 mt-3 mb-8">{item.desc}</Body>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                    <p className="text-sm font-bold text-gray-400">{item.date}</p>
                                    <a href="#" className="text-sm font-bold text-[#26844D] hover:underline">Read full story &rarr;</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
