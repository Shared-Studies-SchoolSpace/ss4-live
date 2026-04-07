// F-04 SAS section displays all 5 subjects with topics and scope per subject
import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { H1, H2, Body, BodyLarge } from '../components/Typography';
import Card from '../components/Card';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const mockSubjects = [
    { title: "English Language", scope: "Comprehension, Lexis & Structure, Oral English", topics: "Consonants, Vowels, Reading Comprehension, Synonyms, Antonyms" },
    { title: "Mathematics", scope: "Algebra, Geometry, Trigonometry, Statistics", topics: "Quadratic Equations, Circle Theorem, Probability, Calculus" },
    { title: "Physics", scope: "Mechanics, Optics, Electricity, Modern Physics", topics: "Motion, Lenses, Circuits, Radioactivity" },
    { title: "Chemistry", scope: "Physical, Organic, Inorganic Chemistry", topics: "Atomic Structure, Hydrocarbons, Acids & Bases" },
    { title: "Biology", scope: "Botany, Zoology, Ecology, Genetics", topics: "Cell Structure, Human Anatomy, Ecosystems, Heredity" },
];

export default function SasPage() {
    return (
        <div className="text-[#111111]">
            <SectionWrapper variant="default">
                <div className="text-center max-w-4xl mx-auto py-12">
                    <H1>Shared Studies Assessment Series (SAS)</H1>
                    <BodyLarge className="mt-6">
                        A rigorous proprietary academic tool designed to prepare senior secondary students for their SSCE and UTME examinations.
                    </BodyLarge>
                </div>
            </SectionWrapper>
            
            <SectionWrapper variant="white">
                <div className="text-center mb-12">
                    <H2>SAS Curriculum Outline</H2>
                    <Body className="mt-4">
                        Comprehensive topics and scope for all 5 core subjects.
                    </Body>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-16">
                    {mockSubjects.map((subj, idx) => (
                        <Card key={idx} title={subj.title} icon={<MenuBookIcon />}>
                            <div className="mt-4 text-sm text-gray-700">
                                <p className="font-bold mb-1">Scope:</p>
                                <p className="mb-4">{subj.scope}</p>
                                <p className="font-bold mb-1">Key Topics:</p>
                                <p>{subj.topics}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </SectionWrapper>
        </div>
    );
}
