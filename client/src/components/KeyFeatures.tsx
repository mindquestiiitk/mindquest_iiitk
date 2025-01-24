import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const VerticalWaveScroll = ({ children }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
    const [maxScroll, setMaxScroll] = useState(0);
    const [isStuck, setIsStuck] = useState(true); // Initially, side content is stuck
    const pathRef = useRef(null);
    const contentRef = useRef(null);
    const circleRef = useRef(null);

    // Wave parameters
    const height = 1000; // Total height of the path
    const width = 60;    // Maximum deviation from center
    const points = 200;  // Number of points to generate the path

    useEffect(() => {
        const calculateMaxScroll = () => {
            console.log("function called", window.innerHeight);
            setMaxScroll(window.innerHeight);
        };
        calculateMaxScroll();

        window.addEventListener('resize', calculateMaxScroll);
        return () => window.removeEventListener('resize', calculateMaxScroll);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const position = window.scrollY;
            const rect = contentRef.current.getBoundingClientRect();
            if (rect && rect.top <= maxScroll) {
                setScrollPosition(maxScroll - rect.top);
            } else {
            console.log("did not update", rect.top, maxScroll);
                setScrollPosition(0);
            }
            if (position < rect.top) return;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [maxScroll]);

    useEffect(() => {
        if (maxScroll === 0) return;
        const progress = Math.min(scrollPosition / maxScroll, 1);
        console.log(scrollPosition, maxScroll);
        const y = progress * height;

        let x = 0;
        const waves = [
            { freq: 0.015, amp: 1.0 },
            { freq: 0.03, amp: 0.3 },
        ];

        waves.forEach((wave) => {
            x += Math.sin(y * wave.freq) * width * wave.amp;
        });
        setDotPosition({ x: x, y: y});
    }, [scrollPosition, maxScroll, height, width]);

    useEffect(() => {
        // Check if the dot is at the bottom of the path
        const isDotAtBottom = dotPosition.y >= height;
        setIsStuck(!isDotAtBottom);
    }, [dotPosition, height]);

    useEffect(() => {
        if (circleRef.current) {
            gsap.to(circleRef.current, {
                duration: 0.1, // Adjust as needed
                attr: {
                    cx: dotPosition.x,
                    cy: dotPosition.y,
                },
                overwrite: 'auto', // Prevents conflicts with other GSAP animations
            });
        }
    }, [dotPosition]);

    // Generate a smoother wave path
    const generatePath = () => {
        let pathData = 'M ';

        // Reduced number of waves with gentler parameters
        const waves = [
            { freq: 0.015, amp: 1.0 }, // Main wave
            { freq: 0.03, amp: 0.3 }, // Subtle secondary wave
        ];

        for (let i = -5; i <= points; i++) {
            const y = (i / points) * height;

            // Combine waves for a smoother pattern
            let x = 0;
            waves.forEach((wave) => {
                x += Math.sin(y * wave.freq) * width * wave.amp;
            });

            pathData += `${x},${y} `;
        }

        return pathData;
    };

    const handleRef = (ref) => {
        pathRef.current = ref;
    };

    const path = generatePath();

    return (
        <>
            <div className={`relative flex w-full h-screen overflow-hidden ${isStuck ? 'sticky top-0' : 'translate-y-full'}`}>
                {/* Content side (left) */}
                <div
                    className={`w-1/3 px-6 py-8 overflow-auto  ${isStuck ? 'sticky top-0 h-screen' : 'relative'
                        }`}
                >
                    {children[0]}
                </div>
                {/* Wave and dot container */}
                <div className="w-1/3 h-screen pointer-events-none">
                    <svg
                        className="w-full h-full"
                        viewBox={`${-width - 10} -20 ${width * 2 + 20} ${height}`}
                        preserveAspectRatio="xMidYMin meet"
                        ref={handleRef}
                    >
                        {/* Wave path */}
                        <path
                            d={path}
                            fill="none"
                            stroke="black"
                            strokeWidth="3.5"
                            className="opacity-80"
                        />

                        {/* Moving dot */}
                        <circle
                            ref={circleRef}
                            cx={dotPosition.x}
                            cy={dotPosition.y}
                            r="20"
                            className="fill-green-500"
                        ></circle>
                    </svg>
                </div>
                {/* Content side (right) */}
                <div
                    className={`w-1/3 px-6 py-8 overflow-auto  ${isStuck ? 'sticky top-0 h-screen' : 'relative'
                        }`}
                >
                    {children[1]}
                </div>
            </div>
            <div className="h-screen"
                    ref={contentRef}
            />
        </>
    );
};

export default VerticalWaveScroll;
