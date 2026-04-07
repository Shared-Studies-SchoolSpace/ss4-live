import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function UniversityCard({ name, type, location, resources, logo, verified, onClicked }) {
  return (
    <div 
    className="group rounded-xl border border-gray-200 bg-white p-5 flex flex-col hover:border-brand-primary hover:shadow-md transition-all cursor-pointer"
    role='button'
    onClick={onClicked}>
      
      {/* Logo */}
      <div className="relative w-16 h-16 mb-4">
        <div className="bg-[#F6F4F0] w-full h-full rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
          <img src={logo} alt={name} className="w-12 object-contain mix-blend-multiply" />
        </div>

        {/* Verified Badge */}
        {verified && (
          <div className="absolute -bottom-2 -right-2 bg-brand-primary rounded-full p-1 border-4 border-white text-white">
            <VerifiedIcon fontSize="small"/>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-[#111111] text-lg font-bold mb-1 group-hover:text-brand-primary transition-all">
        {name}
      </h3>

      {/* Type */}
      <p className="text-gray-500 text-sm mb-2 capitalize">{type}</p>

      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400"><LocationOnIcon fontSize="small" /></span>
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400"><SchoolIcon fontSize="small" /></span>
          <span>{resources} SAS Subjects</span>
        </div>
      </div>
    </div>
  );
}
