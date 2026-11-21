// F-06 Updates/news feed displays cards with headline, tag, date, and excerpt.
import React, { useState } from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1 } from '../components/Typography';
import NewsCard from '../components/NewsCard';
import { FeedContainer } from '../components/feed';

const mockNews = [
    { 
        tag: 'Varsity Matchday 2', 
        title: "SCL Varsity Games Matchday 2: League Match 2 Tonight on Lichess", 
        desc: "The opening fixtures are complete. Next up: League Match 2 on Fri 20 Nov from 8:00–9:00 PM (WAT) in 3+0 Blitz across 15 Nigerian university squads.", 
        date: 'Nov 20, 2026',
        image: '/varsity-nov-2026-poster.png',
        colSpan: 'md:col-span-2 lg:col-span-2',
        isHero: true
    },
    { 
        tag: 'Varsity Season 2', 
        title: "SS4 Chess League Varsity Tournament Nov. '26 (Season 2) Underway on Lichess", 
        desc: 'Featuring the best chess players from top Universities in Nigeria. 15 institutions compete in 5-player teams from 18th–30th November 2026 across 4 League Match Days in 3+0 Blitz, with the top 8 qualifying for the Quarter-Finals.', 
        date: 'Nov 18, 2026',
        image: '/varsity-nov-2026-poster.png',
        colSpan: 'md:col-span-1 lg:col-span-1',
        isHero: false
    },
    { 
        tag: 'theBOARDGAMES', 
        title: 'SS4 Chess League theBOARDGAMES: October 2026 Championship Underway on Lichess', 
        desc: 'Featuring the best chess players from top universities in Nigeria. Battles run 9th–31st October 2026 across 3+0, 5+0, and 10+0 time controls. The Board Remembers.', 
        date: 'Oct 9, 2026',
        image: '/october-tournament-poster.png',
        colSpan: 'md:col-span-1 lg:col-span-1',
        isHero: false
    },
    { 
        tag: 'Varsity Tournament', 
        title: 'Official 11-Team Squad Lineups Released', 
        desc: '11 top Nigerian universities locked in their 5-player rosters for the SS4 Chess League Varsity Tournament.', 
        date: 'Sep 16, 2026',
        image: '/varsity-lineups-poster.jpg',
        colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
        tag: 'August Champion', 
        title: 'Anuchi Emmanuel Crowned August Champion', 
        desc: 'Covenant University’s Anuchi Emmanuel conquers a 56-player field and 115 matches to claim the August 2026 SS4 Chess League crown.', 
        date: 'Sep 4, 2026',
        image: '/august-tournament-champion.png',
        colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
        tag: 'August Semifinals', 
        title: 'Final Four Clash Over 64 Squares', 
        desc: 'Semifinals showdown featuring FUTIA, UNILORIN, Bells Tech, and Covenant University. Verified university showdowns on Lichess.', 
        date: 'Sep 3, 2026',
        colSpan: 'md:col-span-1 lg:col-span-1'
    },
    { 
        tag: 'August Quarterfinals', 
        title: 'Elite 8 Contenders Battle', 
        desc: 'Quarterfinal fixtures across 8 top Nigerian university contenders. Pure university chess excellence.', 
        date: 'Sep 2, 2026',
        colSpan: 'md:col-span-1 lg:col-span-1'
    }
];

export default function NewsPage() {
    const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'grid'

    return (
        <div className="w-full">
            <SectionWrapper variant="default">
                <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <H1 className="mb-4">Updates & News</H1>
                        <p className="text-sm text-gray-600 font-medium">
                            Live competitive dispatches, video duel recaps, tournament registrations, and institutional announcements from the SS4 platform.
                        </p>

                        {/* View Switcher Tabs */}
                        <div className="mt-6 inline-flex items-center bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm gap-1.5">
                            <button
                                onClick={() => setViewMode('feed')}
                                className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                                    viewMode === 'feed'
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                Interactive Feed
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                                    viewMode === 'grid'
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Editorial Grid
                            </button>
                        </div>
                    </div>
                    
                    {/* View 1: Extracted SAS Feed Components */}
                    {viewMode === 'feed' && (
                        <div className="w-full">
                            <FeedContainer 
                                title="Live SS4 & SAS Community Stream" 
                                subtitle="Real-time duel highlights, tournament broadcasts, photo galleries, and platform releases"
                                showComposer={true}
                            />
                        </div>
                    )}

                    {/* View 2: Classic Grid Layout */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 max-w-6xl mx-auto pt-4">
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
                    )}
                </div>
            </SectionWrapper>
        </div>
    );
}
