// F-06 Updates/news feed displays cards with headline, tag, date, and excerpt.
import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1, H2, Body } from '../components/Typography';

const mockNews = [
    { tag: 'June Tournament Ahead', title: 'Preparations Underway', desc: 'The June tournament runs in the last seven days of the month. League matches continue every two days. Students are preparing. Institutions are watching. Registration remains open.', date: 'Jun 16, 2026' },
    { tag: 'League Growth', title: '140 Players and Counting', desc: 'The SS4 Chess League has grown from 60 to 140 players in less than 40 days, 100% through peer referral across multiple Nigerian states. Institutions are connecting through their students.', date: 'Jun 14, 2026' },
    { tag: 'Retention', title: 'Inter-Tournament League Active', desc: 'Over 30 matches played by more than 30 players in the weeks between tournaments. The calendar is working. The habit is forming.', date: 'Jun 10, 2026' },
    { tag: 'Sponsorship', title: 'Partner with the Next Generation', desc: 'SS4 offers sponsors direct visibility into an active, connected community of Nigerian students and institutions competing on a known monthly calendar.', date: 'Jun 5, 2026' },
    { tag: 'May Tournament Concludes', title: 'First Tournament Cycle Complete', desc: 'The inaugural SS4 Chess League tournament wrapped successfully. Winners recorded. Rankings live. The leaderboard is no longer empty.', date: 'Jun 2, 2026' }
];

export default function NewsPage() {
    return (
        <div className="w-full">
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
                                    <a href="#" className="text-sm font-bold text-brand-primary hover:underline">Read full story &rarr;</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
