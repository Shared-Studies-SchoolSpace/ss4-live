import React from 'react';
import { WhyIcon1, WhyIcon2, WhyIcon3 } from './icons';

const DiscoveryItem = ({ Icon, title, description }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="mb-8 p-6 bg-brand-bg-cream rounded-full transition-transform group-hover:scale-110">
      <Icon />
    </div>
    <h3 className="text-sm font-bold tracking-widest text-brand-primary-green mb-4 uppercase">
      {title}
    </h3>
    <p className="text-gray-700 font-medium leading-relaxed max-w-[280px]">
      {description}
    </p>
  </div>
);

export const DiscoveryGrid = () => {
  return (
    <section className="bg-white py-32 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-24">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-primary-green uppercase mb-4">
            Find Your Niche
          </p>
          <h2 className="text-4xl lg:text-5xl font-black text-brand-dark-green mb-8">
            Your search is unique.<br />Just like you.
          </h2>
          <div className="w-32 h-1.5 bg-brand-primary-green mx-auto mb-8 rounded-full" />
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-600 leading-relaxed font-medium">
            We give you all of the data, reviews, and insights in one place to make your search as easy as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          <DiscoveryItem 
            Icon={WhyIcon1}
            title="NO HEAVY LIFTING"
            description="We analyze the data so you don't have to."
          />
          <DiscoveryItem 
            Icon={WhyIcon2}
            title="THE GOOD, THE BAD, & THE HONEST"
            description="Our user reviews let you hear directly from families and students to give you an honest and holistic view."
          />
          <DiscoveryItem 
            Icon={WhyIcon3}
            title="LIKE A GLOVE"
            description="We personalize your search based on what's most important to you."
          />
        </div>
      </div>
    </section>
  );
};
