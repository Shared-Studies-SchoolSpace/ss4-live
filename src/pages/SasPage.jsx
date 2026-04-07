import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1, H2, Body, BodyLarge } from '../components/Typography';

const mockSubjects = [
    { title: "English Language", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800", scope: "Comprehension, Lexis & Structure, Oral English", topics: "Consonants, Vowels, Reading Comprehension, Synonyms, Antonyms", isAvailable: false },
    { title: "Mathematics", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800", scope: "Algebra, Geometry, Trigonometry, Statistics", topics: "Quadratic Equations, Circle Theorem, Probability, Calculus", isAvailable: false },
    { title: "Physics", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800", scope: "Mechanics, Optics, Electricity, Modern Physics", topics: "Motion, Lenses, Circuits, Radioactivity", isAvailable: true },
    { title: "Chemistry", image: "https://images.unsplash.com/photo-1603126859591-10c034a7427b?auto=format&fit=crop&q=80&w=800", scope: "Physical, Organic, Inorganic Chemistry", topics: "Atomic Structure, Hydrocarbons, Acids & Bases", isAvailable: false },
    { title: "Biology", image: "https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?auto=format&fit=crop&q=80&w=800", scope: "Botany, Zoology, Ecology, Genetics", topics: "Cell Structure, Human Anatomy, Ecosystems, Heredity", isAvailable: false },
];

export default function SasPage() {
    return (
        <div className="w-full">
            <SectionWrapper variant="default">
                <div className="text-center max-w-4xl mx-auto py-12">
                    <H1>Shared Studies Assessment Series (SAS)</H1>
                    <BodyLarge className="mt-6 text-gray-700">
                        A rigorous proprietary academic tool designed to prepare senior secondary students for their SSCE and UTME examinations.
                    </BodyLarge>
                </div>
            </SectionWrapper>
            
            <SectionWrapper variant="white">
                <div className="text-center mb-16">
                    <H2>SAS Curriculum Outline</H2>
                    <Body className="mt-4">
                        Comprehensive topics and scope for all 5 core subjects.
                    </Body>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 pb-16">
                    {mockSubjects.map((subj, idx) => (
                        <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative group">
                            <div className="relative h-56 overflow-hidden">
                                <img src={subj.image} alt={subj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                <div className="absolute bottom-6 left-6">
                                    <h3 className="text-2xl font-black tracking-tight text-white">{subj.title}</h3>
                                </div>
                                {!subj.isAvailable && (
                                    <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        Coming Soon
                                    </div>
                                )}
                                {subj.isAvailable && (
                                    <div className="absolute top-4 right-4 bg-[#26844D] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                        Available Now
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="mb-5">
                                    <span className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-1">Scope</span>
                                    <p className="text-sm font-semibold text-[#111111]">{subj.scope}</p>
                                </div>
                                <div className="flex-grow">
                                    <span className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-1">Key Topics</span>
                                    <p className="text-sm text-gray-600 line-clamp-3">{subj.topics}</p>
                                </div>
                                {subj.isAvailable ? (
                                    <button className="mt-8 w-full bg-[#004529] text-white font-bold py-3.5 rounded-xl hover:bg-[#26844D] hover:shadow-md transition-all">
                                        Download Module
                                    </button>
                                ) : (
                                    <button disabled className="mt-8 w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
                                        Module Locked
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionWrapper>
        </div>
    );
}
