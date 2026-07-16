// F-06 Updates/news feed displays cards with headline, tag, date, and excerpt.
import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1 } from '../components/Typography';
import NewsCard from '../components/NewsCard';

const mockNews = [
    { 
        tag: 'June Tournament Ahead', 
        title: 'Preparations Underway', 
        desc: 'The June tournament runs in the last seven days of the month. League matches continue every two days. Students are preparing. Institutions are watching. Registration remains open.', 
        date: 'Jun 16, 2026',
        image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=1200',
        colSpan: 'md:col-span-2 lg:col-span-2',
        isHero: true
    },
    { 
        tag: 'League Growth', 
        title: '140 Players and Counting', 
        desc: 'The SS4 Chess League has grown from 60 to 140 players in less than 40 days, 100% through peer referral across Nigerian states. Institutions are connecting.', 
        date: 'Jun 14, 2026',
        gradient: 'blue',
        colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
        tag: 'Retention', 
        title: 'Inter-Tournament League Active', 
        desc: 'Over 30 matches played by more than 30 players in the weeks between tournaments. The calendar is working. The habit is forming.', 
        date: 'Jun 10, 2026',
        image: 'https://images.unsplash.com/photo-1586165368502-1badb97a64e1?auto=format&fit=crop&q=80&w=800',
        colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
        tag: 'Sponsorship', 
        title: 'Partner with the Next Generation', 
        desc: 'SS4 offers sponsors direct visibility into an active, connected community of Nigerian students and institutions competing on a known monthly calendar.', 
        date: 'Jun 5, 2026',
        gradient: 'orange',
        colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
        tag: 'May Tournament Concludes', 
        title: 'First Tournament Cycle Complete', 
        desc: 'The inaugural SS4 Chess League tournament wrapped successfully. Winners recorded. Rankings live. The leaderboard is no longer empty.', 
        date: 'Jun 2, 2026',
        image: 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=800',
        colSpan: 'md:col-span-1 lg:col-span-1'
    }
];

export default function NewsPage() {
    return (
        <div className="w-full">
            <SectionWrapper variant="default">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
                    <H1 className="text-center mb-12">Updates & News</H1>
                    
                    {/* Grid Layout mimicking newsfeed.webp */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
                        {mockNews.map((item, i) => (
                            <NewsCard 
                                key={i}
                                tag={item.tag}
                                title={item.title}
                                desc={item.desc}
                                date={item.date}
                                image={item.image}
                                gradient={item.gradient}
                                colSpan={item.colSpan}
                                isHero={item.isHero}
                            />
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
