import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import { motion as Motion } from 'framer-motion';

export default function UniversityCard({ name, type, location, resources, logo, verified, bio, address, image, onClicked }) {
  // Generate consistent pseudo-random gradients based on the school name
  const getRandomGradients = () => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const pos1 = (hash % 100 + 100) % 100;
    const pos2 = ((hash >> 8) % 100 + 100) % 100;
    const size1 = ((hash >> 16) % 50 + 40);
    const size2 = ((hash >> 24) % 50 + 40);
    
    return {
      backgroundImage: `
        radial-gradient(circle at ${pos1}% ${pos2}%, rgba(239, 68, 68, 0.4), transparent ${size1}%),
        radial-gradient(circle at ${100 - pos2}% ${100 - pos1}%, rgba(59, 130, 246, 0.4), transparent ${size2}%)
      `
    };
  };

  return (
    <Motion.div
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="group rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col hover:border-brand-primary transition-all cursor-pointer shadow-sm"
      role='button'
      onClick={onClicked}
    >
      {/* School Image / Thumbnail */}
      <div className="relative h-48 md:h-40 overflow-hidden bg-gray-200">
        <img
          src="/tester.webp"
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale will-change-transform"
        />
        {/* Blended Gradients Overlay */}
        <div 
          className="absolute inset-0 mix-blend-overlay opacity-80"
          style={getRandomGradients()}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-white/20 flex items-center justify-center">
            <SchoolIcon className="text-brand-primary" sx={{ fontSize: 28 }} />
          </div>
          {verified && (            <div className="bg-brand-primary rounded-full p-1 text-white shadow-lg border-2 border-white">
              <VerifiedIcon sx={{ fontSize: 14 }} />
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Name and Type */}
        <div className="mb-4">
          <h3 className="text-[#111111] text-lg font-bold group-hover:text-brand-primary transition-all line-clamp-2">
            {name}
          </h3>
          <p className="text-brand-primary text-[10px] font-black uppercase tracking-widest mt-1">{type}</p>
        </div>

        {/* Bio Snippet */}
        <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed italic">
          "{bio || "A leading institution committed to academic excellence and student development."}"
        </p>

        {/* Details */}
        <div className="mt-auto space-y-3">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <LocationOnIcon sx={{ fontSize: 16 }} className="text-brand-accent mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">{location}</span>
              <span className="opacity-80 mt-0.5">{address || "Principal's Office, Main Campus"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-brand-primary/5 transition-colors">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">View Profile</span>
        <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all">
          <InfoIcon sx={{ fontSize: 14 }} />
        </div>
      </div>
    </Motion.div>
  );
}
