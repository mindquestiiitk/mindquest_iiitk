"use client"
// import { poiretOne } from '@/fonts';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import React from 'react';

import hero_avatar from '@/assets/hero_avatar.png';

const DynamicImage = dynamic(() => import('next/image'), { ssr: false });

const images = [
    { 
        src: hero_avatar,
        alt: 'Chaster IT Solutions'
    },
    { 
        src: hero_avatar,
        alt: 'Chaster IT Solutions'
    },
    { 
        src: hero_avatar,
        alt: 'Chaster IT Solutions'
    },
    { 
        src: hero_avatar,
        alt: 'Chaster IT Solutions'
    },
    

]

interface LogoTickerProps {
    id?: string;
}

const LogoTicker: React.FC<LogoTickerProps> = ({id}) => {
  return (
    <div id={id} className='bg-black text-white py-[72px] sm:py-24'>
        <div className="contaier">
            <h2 className='text-3xl font-bold text-center text-white/70' >Trusted by the world&#39;s most innovative teams</h2>
            <div 
                className="flex overflow-hidden mt-9 before:content-[''] after:content-[''] before:absolute after:absolute before:h-full after:h-full before:w-5 sm:before:w-10 after:w-5 sm:after:w-10 relative after:right-0 before:left-0 before:top-0 after:top-0 before:z-10 after:z-10 before:bg-[linear-gradient(to_right,#000,rgb(0,0,0,0))] after:bg-[linear-gradient(to_left,#000,rgb(0,0,0,0))] "
            >
                {/* Infinite scroll */}
                <motion.div className='flex flex-none items-center gap-16 pr-16'
                    transition={{ 
                        duration: 10, 
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    initial={{ translateX: 0 }}
                    animate={{ translateX: '-50%' }}
                >
                    {images.map(({src, alt}, index) => (
                        <DynamicImage priority key={index} src={src} alt={alt} className={`w-auto h-20 flex-none filter grayscale hover:grayscale-0 hover:brightness-100 transition ${(alt === "Zendesk")? 'brightmess-150' : 'brightness-50'}`} />
                    ))}
                    {images.map(({src, alt}, index) => (
                        <DynamicImage priority key={index} src={src} alt={alt} className={`w-auto h-20 flex-none filter grayscale hover:grayscale-0 hover:brightness-100 transition ${(alt === "Zendesk")? 'brightmess-150' : 'brightness-50'}`} />
                    ))}
                </motion.div>
            </div>
        </div>
    </div>
  )
}

export default LogoTicker