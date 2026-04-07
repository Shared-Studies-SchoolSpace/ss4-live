import React, { useState, useEffect } from 'react';

const stories = [
  {
    name: "ABBY D.",
    text: "During my secondary school search, I was having a difficult time narrowing down what I wanted in a school, so I used Shared Studies to help. I especially liked looking at the rankings for different aspects of the school experience, like the campus, academics, and much more!",
    image: "/home/abby-1.webp",
    color: "bg-red-400"
  },
  {
    name: "DAYNA M.",
    text: "I am so grateful for Shared Studies and their resources. Schooling children at home has truly had its challenges. But having resources has made it so much easier. Finding the right programs for my little ones has been invaluable.",
    image: "/home/dayna-1.webp",
    color: "bg-blue-400"
  },
  {
    name: "CLAY N.",
    text: "When I was preparing for JAMB, I had no idea what I was looking for. Shared Studies helped me explore different schools and see breakdowns on many aspects of their programs! Thanks to Shared Studies, I found a school that was a perfect fit!",
    image: "/home/clay-1.webp",
    color: "bg-yellow-400"
  }
];

export const NicheStories = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % stories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white py-24 px-4 overflow-hidden">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Text Content */}
        <div className="w-full lg:w-5/12 space-y-8">
          <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            Real SS4 Stories
          </p>
          <h2 className="text-4xl font-black text-brand-dark-green leading-tight">
            Shared Studies has helped millions of students and families find their fit.
          </h2>
          
          <div className="relative min-h-[160px]">
            {stories.map((story, i) => (
              <div 
                key={story.name}
                className={`absolute inset-0 transition-all duration-700 ${i === current ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}
              >
                <p className="text-xl lg:text-2xl text-brand-primary-green font-medium italic leading-relaxed mb-6">
                  "{story.text}"
                </p>
                <p className="text-sm font-black text-brand-dark-green tracking-widest">— {story.name}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6">
            {stories.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-brand-dark-green w-8' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="w-full lg:w-7/12 relative">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
            {stories.map((story, i) => (
             <React.Fragment key={story.name}>
                <img 
                  src={story.image} 
                  alt={story.name}
                  className={`w-full aspect-[4/3] object-cover absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className={`absolute inset-0 ${story.color} opacity-20 mix-blend-multiply transition-opacity duration-1000 ${i === current ? 'opacity-20' : 'opacity-0'}`} />
             </React.Fragment>
            ))}
            <div className="relative w-full aspect-[4/3]" /> {/* Spacer */}
          </div>
        </div>
      </div>
    </section>
  );
};
