import VerifiedIcon from '@mui/icons-material/Verified';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function UniversityHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
      <div className="relative shrink-0 mx-auto md:mx-0">
        <div className="bg-[#F6F4F0] rounded-xl h-24 w-24 md:h-32 md:w-32 flex items-center justify-center shadow-md border border-gray-200">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Kings_College_Lagos_Logo.png/220px-Kings_College_Lagos_Logo.png"
            alt="King's College"
            className="w-full object-contain mix-blend-multiply"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-brand-primary text-white rounded-full p-1 border-4 border-white shadow-lg">
          <VerifiedIcon sx={{ fontSize: { xs: 16, md: 20 } }}/>
        </div>
      </div>

      <div className="flex flex-col justify-center flex-1 text-center md:text-left w-full">
        <h1 className="text-[#111111] text-3xl md:text-4xl font-black mb-2 leading-tight">
          King's College
        </h1>

        <p className="text-gray-500 text-base md:text-lg mb-6 font-medium">Secondary School</p>

        <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-[#111111] justify-center md:justify-start">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-brand-primary transition-colors">
            <span className="text-brand-primary flex items-center"><LibraryBooksIcon sx={{ fontSize: 18 }}/></span>
            <span className="font-bold">5 SAS Subjects</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-brand-primary transition-colors">
            <span className="text-brand-primary flex items-center"><GroupIcon sx={{ fontSize: 18 }}/></span>
            <span className="font-bold">950 Candidates</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-brand-primary transition-colors">
            <span className="text-brand-primary flex items-center"><LocationOnIcon sx={{ fontSize: 18 }}/></span>
            <span className="font-bold">Lagos, NG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
