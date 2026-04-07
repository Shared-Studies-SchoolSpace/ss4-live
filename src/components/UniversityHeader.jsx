import VerifiedIcon from '@mui/icons-material/Verified';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function UniversityHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
      <div className="relative shrink-0">
        <div className="bg-[#F6F4F0] rounded-xl h-24 w-24 md:h-32 md:w-32 flex items-center justify-center shadow-md border border-gray-200">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Kings_College_Lagos_Logo.png/220px-Kings_College_Lagos_Logo.png"
            alt="King's College"
            className="w-full object-contain mix-blend-multiply"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-brand-primary text-white rounded-full p-1 border-4 border-white">
          <VerifiedIcon fontSize="small"/>
        </div>
      </div>

      <div className="flex flex-col justify-center flex-1">
        <h1 className="text-[#111111] text-4xl font-bold mb-2">
          King's College
        </h1>

        <p className="text-gray-500 text-lg mb-4">Secondary School</p>

        <div className="flex flex-wrap gap-4 text-sm text-[#111111]">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span className="text-brand-primary"><LibraryBooksIcon fontSize="small"/></span>
            <span className="font-medium">5 SAS Subjects</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span className="text-brand-primary"><GroupIcon fontSize="small"/></span>
            <span className="font-medium">950 Candidates</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span className="text-brand-primary"><LocationOnIcon fontSize="small"/></span>
            <span className="font-medium">Lagos, NG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
