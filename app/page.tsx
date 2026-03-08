"use client";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import FooterGrad from "../components/footergrad";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Components
import Pointstable from "../components/pointstable";
import TeamsCarousel from "@/components/teams";
import LatestNews from "@/components/latestnews";
import PartnersSponsors from "@/components/partners";
import Socials from "@/components/socials";
import ScheduleCard from "@/components/ScheduleCard";
import MobileSvg from "@/components/MobileSvg";
import DelhiExcellence from "@/components/DelhiExcellence";
import Philosophy from "@/components/Philosophy";
import LeagueInfoSection from "@/components/Leagueinfo";

// --- CONFIGURATION FOR STATIC BANNERS ---
// You can easily change images and text here
const STATIC_SLIDES = [
  // {
  //   id: "static-5",
  //   desktopImg: "/assets/banner/4.png",
  //   mobileImg: "/assets/banner/mobile5.png",
  //   position: "center",
  // },
  
  {
    id: "static-2",
    desktopImg: "/assets/banner/2.png",
    mobileImg: "/assets/banner/mobile2.png",
    position: "bottom",
   
  },
  {
    id: "static-3",
    desktopImg: "/assets/banner/3.png",
    mobileImg: "/assets/banner/mobile3.png",
    position: "bottom",
    
  },
  {
    id: "static-4",
    desktopImg: "/assets/banner/5.png",
    mobileImg: "/assets/banner/mobile4.png",
    position: "bottom",
    
  },
  {
    id: "static-1",
    desktopImg: "/assets/banner/1.png",
    mobileImg: "/assets/banner/mobile1.png",
    position: "center", // Options: 'center' | 'bottom'
    
  },
  
];
export default function Home() {
  const [current, setCurrent] = useState(0);
  const [backendBanners, setBackendBanners] = useState<any[]>([]);

  // Merge Static + Backend Slides
  const allSlides = [
    ...STATIC_SLIDES,
    ...backendBanners.map((b) => ({
      id: b._id || `backend-${Math.random()}`,
      desktopImg: b.laptopSrc,
      mobileImg: b.mobileSrc,
      position: "bottom", // Default position for backend banners
      content: b.title ? (
        <h2 className="text-white font-norch text-3xl md:text-5xl lg:text-7xl xl:text-8xl leading-tight text-center drop-shadow-2xl">
          {b.title}
        </h2>
      ) : null,
    })),
  ];

  const totalSlides = allSlides.length;

  // Auto-scroll effect
  useEffect(() => {
    if (totalSlides === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Fetch Banners from Backend (unchanged logic)
  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => {
        if (data?.banners && Array.isArray(data.banners) && data.banners.length > 0) {
          setBackendBanners(data.banners);
        }
      })
      .catch((err) => console.error("Failed to fetch banners", err));
  }, []);

  return (
    <main className="min-h-screen font-sans bg-gray-50">
      <Navbar />

      <section className="relative w-full overflow-hidden h-[300px] md:h-[650px] lg:h-[80vh] xl:h-[85vh]">

        {allSlides.map((slide, index) => {
          const isActive = current === index;

          // Logic to position text (Center vs Bottom)
          const textContainerClass = slide.position === 'center'
            ? 'justify-center items-center pb-0'
            : 'justify-end items-center pb-20 md:pb-24 lg:pb-32';

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              
              {/* Desktop Image (Hidden on Mobile) */}
              <div className="hidden md:block absolute inset-0 w-full h-full">
                <Image
                  src={slide.desktopImg}
                  alt="Desktop Banner"
                  fill
                  priority={index === 0}
                  className="object-cover object-top"
                  quality={95}
                  sizes="100vw"
                />
              </div>

              {/* Mobile Image (Hidden on Desktop) */}
              <div className="block md:hidden absolute inset-0 w-full h-full">
                <Image
                  src={slide.mobileImg}
                  alt="Mobile Banner"
                  fill
                  priority={index === 0}
                  className="object-cover object-bottom"
                  quality={95}
                  sizes="100vw"
                />
              </div>

              <div className="absolute inset-0 " />

            </div>
          );
        })}

        {/* --- FIXED OVERLAYS --- */}
        {/* Social Icons (Clickable) */}
        <div className="absolute top-0 right-0 z-30 h-full flex items-center pointer-events-none">
          <div className="pointer-events-auto">
            <Socials />
          </div>
        </div>

        {/* Mobile SVG (Bottom decoration) */}
        <div className="absolute bottom-0 w-full z-20 pointer-events-none">
          <MobileSvg />
        </div>

      </section>
      <LeagueInfoSection/>
<Philosophy/>
<FooterGrad variant="cropped" height={20} />
      <DelhiExcellence />
      {/* PAGE CONTENT */}
      <div className="w-full bg-gray-50 pt-20">
        <div className="w-full h-12 md:h-24 bg-gray-50" />
        <ScheduleCard />
      </div>

      <Pointstable />
      <FooterGrad />
      <TeamsCarousel />
      <LatestNews />

      <PartnersSponsors />
      <FooterGrad />
      <Footer />
    </main>
  );
}