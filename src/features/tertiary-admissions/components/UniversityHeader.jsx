import VerifiedIcon from '@mui/icons-material/Verified';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function UniversityHeader({ school, registeredCount }) {
  const name = school?.name || "King's College";
  const type = school?.type || "Secondary School";
  const location = school ? `${school.location}, ${school.state}` : "Lagos, NG";
  const verified = school !== undefined ? school.verified : true;

  // Let's generate a stable pseudo-random student count if not present
  const getStudentsCount = () => {
    if (school?.studentsCount) return school.studentsCount;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const count = (Math.abs(hash) % 400) + 400; // between 400 and 800
    return `${count} Students`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
      <div className="relative shrink-0 mx-auto md:mx-0">
        <div className="bg-[#F6F4F0] rounded-xl h-24 w-24 md:h-32 md:w-32 flex items-center justify-center shadow-md border border-gray-200 overflow-hidden p-2">
          {!school ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Kings_College_Lagos_Logo.png/220px-Kings_College_Lagos_Logo.png"
              alt="King's College"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          ) : (
            <span className="text-3xl text-brand-primary font-black tracking-wide">
              {name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}
            </span>
          )}
        </div>
        {verified && (
          <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-brand-primary text-white rounded-full p-1 border-4 border-white shadow-lg">
            <VerifiedIcon sx={{ fontSize: { xs: 16, md: 20 } }}/>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center flex-1 text-center md:text-left w-full">
        <h1 className="text-[#111111] text-3xl md:text-4xl font-black mb-2 leading-tight">
          {name}
        </h1>

        <p className="text-gray-500 text-base md:text-lg mb-6 font-medium capitalize">{type}</p>

        <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-[#111111] justify-center md:justify-start">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-brand-primary transition-colors">
            <span className="text-brand-primary flex items-center"><GroupIcon sx={{ fontSize: 18 }}/></span>
            <span className="font-bold">{getStudentsCount()}</span>
          </div>
          {registeredCount !== undefined && (
            <div className="flex items-center gap-1.5 bg-brand-primary/5 px-3 py-1.5 rounded-full border border-brand-primary/20 shadow-sm hover:border-brand-primary transition-colors">
              <span className="text-brand-primary font-bold">♟</span>
              <span className="font-black text-brand-primary">{registeredCount} SCL Players</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-brand-primary transition-colors">
            <span className="text-brand-primary flex items-center"><LocationOnIcon sx={{ fontSize: 18 }}/></span>
            <span className="font-bold">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

