
"use client";

import { useEffect, useState } from "react";
import { Upload, Heart, Briefcase, ArrowRight, Linkedin, Github, Code, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import HomeHeader from "@/components/HomeHeader"
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
}


type ResumeData = {
  file: File | null;
  links: {
    linkedin: string;
    github: string;
    leetcode: string;
  };
};

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function Home() {
  const [resumes, setResumes] = useState<{
    person1: ResumeData;
    person2: ResumeData;
  }>({
    person1: { file: null, links: { linkedin: "", github: "", leetcode: "" } },
    person2: { file: null, links: { linkedin: "", github: "", leetcode: "" } },
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    matchScore: number;
    referralScore: number;
    loveCompatibility: string;
    professionalSynergy: string;
    recommendation: string;
    competativeAnalysis:string;
  } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    window.addEventListener("error", (e) => {
      if (e.message.includes("ChunkLoadError")) {
        window.location.reload();
      }
    });
  }, []);
  useEffect(()=>{
    console.info("Disclaimer: This result is not an official assessment. The score is not guaranteed and is for entertainment and educational purposes only. No legal or career decisions should be made based on this analysis.");

  },[])

  const readPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ");
    }
    return text;
  };
  const readLeetcode = async (username: string) => {
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}`, {
      cache: "no-store",
    });
    
    const data = await response.json();
    return data;
  };
  const readDOCX = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const analyzeResumes = async () => {
    if (!resumes.person1.file || !resumes.person2.file) {
      toast({
        title: "Missing Resumes",
        description: "Please upload both resumes to find the perfect match!",
        variant: "destructive",
      });
      return;
    }

    if (resumes.person1.links.leetcode || resumes.person2.links.leetcode) {
      const extractUsername = (input: string) => {
        if (!input) return null;
        try {
          const url = new URL(input);
          const parts = url.pathname.split('/');
          return parts.filter(Boolean).pop();
        } catch (e) {
          return input.trim();
        }
      };
  
      const username1 = extractUsername(resumes.person1.links.leetcode);
      const username2 = extractUsername(resumes.person2.links.leetcode);
      try{
        if (username1) {
          const data1 = await readLeetcode(username1);
          resumes.person1.links.leetcode = data1;
        }
        
        if (username2) {
          const data2 = await readLeetcode(username2);
          resumes.person2.links.leetcode = data2;
        }
      }catch(error){
        
      }
    }
    
    setLoading(true);
    try {
      const [text1, text2] = await Promise.all([
        resumes.person1.file?.type === "application/pdf"
          ? readPDF(resumes.person1.file)
          : readDOCX(resumes.person1.file),
        resumes.person2.file?.type === "application/pdf"
          ? readPDF(resumes.person2.file)
          : readDOCX(resumes.person2.file),
      ]);

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Act as a Corporate Love Guru analyzing two professionals' compatibility. Consider their resumes and social links and generate the answer in the form of conversation with the person1 that is person who ask about him/her about the partner:

      Person 1 means the person who is checking:
      ${text1.substring(0, 10000)}... [truncated]
      LinkedIn: ${resumes.person1.links.linkedin || "Not provided"}
      GitHub: ${resumes.person1.links.github || "Not provided"}
      LeetCode: ${resumes.person1.links.leetcode || "Not provided"}

      Person 2 is crush or partner:
      ${text2.substring(0, 10000)}... [truncated]
      LinkedIn: ${resumes.person2.links.linkedin || "Not provided"}
      GitHub: ${resumes.person2.links.github || "Not provided"}
      LeetCode: ${resumes.person2.links.leetcode || "Not provided"}

      Generate JSON response with:
      - "matchScore": 0-100% romantic compatibility based on career alignment and interests
      - "referralScore": 0-100% likelihood of professional referrals
      - "loveCompatibility": 2 sentence playful analysis with corporate jargon and emojis
      - "professionalSynergy": 2 sentence collaboration potential analysis
      - "recommendation": Fun 1-sentence recommendation with emojis
      - "CompatativeAnalysis":Fun using the links/information for the leetcode and other provided

      Format: {
        "matchScore": number,
        "referralScore": number,
        "loveCompatibility": string,
        "professionalSynergy": string,
        "competativeAnalysis":string,
        "recommendation": string
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      const parsedResult = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      setResult({
        matchScore: parsedResult.matchScore,
        referralScore: parsedResult.referralScore,
        loveCompatibility: parsedResult.loveCompatibility,
        professionalSynergy: parsedResult.professionalSynergy,
        competativeAnalysis:parsedResult.competativeAnalysis,
        recommendation: parsedResult.recommendation,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze resumes. Please try again!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (
    person: "person1" | "person2",
    type: keyof ResumeData["links"],
    value: string
  ) => {
    setResumes(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        links: {
          ...prev[person].links,
          [type]: value,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
      <motion.header
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="text-center mb-16 relative overflow-visible"
>

  <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg transition-all duration-300 hover:scale-105">
    ResuMatch
  </h1>

  <motion.div 
    className="inline-block bg-pink-100 rounded-full px-6 py-2 mb-4 shadow-lg"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <p className="text-xl md:text-2xl font-medium text-rose-600 italic">
      Kundali mile na mile, resume toh zaroor milega! 
      <span className="ml-2 animate-pulse">💘</span>
    </p>
  </motion.div>

  <motion.p 
    className="text-lg md:text-xl text-rose-500 mt-6 flex items-center justify-center gap-2"
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <span className="text-2xl">✨</span>
    Discover your pyaar-worthy professional partner
    <span className="text-2xl">✨</span>
  </motion.p>
</motion.header>


        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {(["person1", "person2"] as const).map((person, index) => (
            <motion.div
              key={person}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <MotionCard
                whileHover={{ y: -5 }}
                className="p-8 bg-white/90 backdrop-blur-lg dark:bg-gray-800/90 border-0 shadow-xl rounded-3xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      index === 0 
                        ? "bg-pink-100/50 dark:bg-pink-900/20" 
                        : "bg-blue-100/50 dark:bg-blue-900/20"
                    )}>
                      {index === 0 ? (
                        <Heart className="text-pink-600 h-8 w-8" />
                      ) : (
                        <Briefcase className="text-blue-600 h-8 w-8" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold">{index==0?"You":"Your Love One"}</h2>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }}>
  <div className="space-y-2">
    <Label className="text-base">Resume Upload</Label>
    <div className="relative group">
      <Input
        type="file"
        accept=".pdf,.doc,.docx"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setResumes(prev => ({
              ...prev,
              [person]: { 
                ...prev[person],
                file: e.target.files![0],
              },
            }));
          }
        }}
      />
      
      <div className="h-16 border-2 border-dashed border-gray-300 rounded-xl transition-colors group-hover:border-pink-300 dark:group-hover:border-blue-300 flex items-center justify-center gap-2 text-muted-foreground">
        {/* {!resume ? {<Upload className="h-5 w-5" />
        <span>Drag & drop or browse</span>}: {{resume.name}}} */}
        { !resumes[person].file ? (
          <>
            <Upload className="h-5 w-5" />
            <span>Drag & drop or browse</span>
          </>
        ) : (
          <span>{resumes[person]?.file?.name}</span>
        )}
      </div>
    </div>
  </div>
</motion.div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-base">
                        <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                        LinkedIn
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        className="h-12 rounded-xl"
                        value={resumes[person].links.linkedin}
                        onChange={(e) => handleLinkChange(person, "linkedin", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-base">
                        <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                        GitHub
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://github.com/username"
                        className="h-12 rounded-xl"
                        value={resumes[person].links.github}
                        onChange={(e) => handleLinkChange(person, "github", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-base">
                        <Code className="h-5 w-5 text-orange-600" />
                        LeetCode
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://leetcode.com/username"
                        className="h-12 rounded-xl"
                        value={resumes[person].links.leetcode}
                        onChange={(e) => handleLinkChange(person, "leetcode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </MotionCard>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MotionButton
            onClick={analyzeResumes}
            disabled={loading}
            size="lg"
            className="rounded-full px-12 py-7 text-lg bg-gradient-to-r from-pink-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="h-5 w-5 border-2 border-white/50 rounded-full border-t-transparent"
                />
                Analyzing Synergy...
              </div>
            ) : (
              <>
                Spark Connection 
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </MotionButton>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="mt-16"
            >
              <MotionCard
                className="p-10 bg-white/90 backdrop-blur-lg dark:bg-gray-800/90 border-0 shadow-2xl rounded-3xl"
                whileHover={{ scale: 1.005 }}
              >
                <div className="space-y-10">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                      Match Results
                    </h2>
                    <p className="text-muted-foreground mt-2">Power couple potential unlocked</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-block bg-pink-100/50 dark:bg-pink-900/20 p-4 rounded-2xl">
                          <Heart className="h-12 w-12 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-semibold mt-4">Romantic Chemistry</h3>
                        <div className="mt-4">
                          <Progress 
                            value={result.matchScore} 
                            className="h-3 bg-gray-100 dark:bg-gray-700"
                            // indicatorClassName="bg-pink-600"
                          />
                          <div className="mt-4 text-4xl font-bold text-pink-600">
                            {result.matchScore}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-block bg-blue-100/50 dark:bg-blue-900/20 p-4 rounded-2xl">
                          <Briefcase className="h-12 w-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mt-4">Professional Synergy</h3>
                        <div className="mt-4">
                          <Progress 
                            value={result.referralScore} 
                            className="h-3 bg-gray-100 dark:bg-gray-700"
                            // indicatorClassName="bg-blue-600"
                          />
                          <div className="mt-4 text-4xl font-bold text-blue-600">
                            {result.referralScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <motion.div 
                      className="bg-blue-50/50 dark:bg-blue-900/20 p-6 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        Compatibility Insights
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {result.loveCompatibility}
                      </p>
                    </motion.div>

                    <motion.div 
                      className="bg-pink-50/50 dark:bg-pink-900/20 p-6 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                        <Briefcase className="h-5 w-5 text-pink-600" />
                        Collaboration Potential
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {result.professionalSynergy}
                      </p>
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-r from-pink-600 to-blue-600 p-6 rounded-xl text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                        <ArrowRight className="h-5 w-5" />
                        Expert Recommendation
                      </h3>
                      <p className="leading-relaxed">{result.recommendation}</p>
                    </motion.div>
                  </div>
                </div>
              </MotionCard>
            </motion.div>
          )}
          <p className="sr-only">
  Disclaimer: This result is not an official assessment. The score is not guaranteed and is for entertainment and educational purposes only. No legal or career decisions should be made based on this analysis.
</p>

        </AnimatePresence>
      </div>
    </div>
  );
}