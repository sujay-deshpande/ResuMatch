import { Briefcase, Heart } from "lucide-react";

const HomeHeader = () => {
  return (
    <div className="w-full py-12 md:py-20 corporate-gradient text-white relative overflow-hidden bg-pink-300">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSI0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Heart className="h-10 w-10 fill-white/50 stroke-white animate-pulse-gentle" />
            <Briefcase className="h-8 w-8 stroke-white animate-pulse-gentle" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#matcher" className="bg-white text-corporateLove-primary hover:bg-corporateLove-light px-6 py-3 rounded-lg font-semibold transition-colors">
              Try It Now
            </a>
            <a href="#how-it-works" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm">
              How It Works
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;