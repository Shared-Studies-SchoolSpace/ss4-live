import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function UniversityCard({ name, type, location, resources, logo, verified, onClicked }) {
  return (
    <div 
    className="group rounded-xl border border-[#283039] bg-[#181b21] p-5 flex flex-col hover:border-[#137fec] transition-all cursor-pointer"
    role='button'
    onClick={onClicked}>
      
      {/* Logo */}
      <div className="relative w-16 h-16 mb-4">
        <div className="bg-white w-full h-full rounded-xl flex items-center justify-center shadow border border-[#283039]">
          <img src={logo} alt={name} className="w-12 object-contain" />
        </div>

        {/* Verified Badge */}
        {verified && (
          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-4 border-[#181b21]">
            <span>
              <VerifiedIcon/>
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-white text-lg font-bold mb-1 group-hover:text-[#137fec] transition-all">
        {name}
      </h3>

      {/* Type */}
      <p className="text-[#9dabb9] text-sm mb-2 capitalize">{type}</p>

      <div className="flex flex-col gap-2 text-sm text-[#9dabb9]">
        <div className="flex items-center gap-1.5">
          <span><LocationOnIcon/></span>
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span><SchoolIcon/></span>
          <span>{resources} Courses</span>
        </div>
      </div>
    </div>
  );
}
