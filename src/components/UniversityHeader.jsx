import VerifiedIcon from '@mui/icons-material/Verified';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function UniversityHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
      <div className="relative shrink-0">
        <div className="bg-white rounded-xl h-24 w-24 md:h-32 md:w-32 flex items-center justify-center shadow-lg border border-[#283039]">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg"
            alt="MIT"
            className="w-full object-contain"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-4 border-[#111418]">
          <span><VerifiedIcon/></span>
        </div>
      </div>

      <div className="flex flex-col justify-center flex-1">
        <h1 className="text-white text-4xl font-bold mb-2">
          Massachusetts Institute of Technology
        </h1>

        <p className="text-[#9dabb9] text-lg mb-4">University</p>

        <div className="flex flex-wrap gap-4 text-sm text-[#9dabb9]">
          <div className="flex items-center gap-1.5 bg-[#181b21] px-3 py-1.5 rounded-full border border-[#283039]">
            <span><LibraryBooksIcon/></span>
            <span>1,204 Resources</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#181b21] px-3 py-1.5 rounded-full border border-[#283039]">
            <span><GroupIcon/></span>
            <span>3.5k Students</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#181b21] px-3 py-1.5 rounded-full border border-[#283039]">
            <span><LocationOnIcon/></span>
            <span>Cambridge, MA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
