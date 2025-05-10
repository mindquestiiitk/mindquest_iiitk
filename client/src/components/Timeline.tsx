import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';


interface IEvent {
    id: string
    title: string;
    image: string;
    brief: string;
    date: string;
}

interface IEventProps {
    isActive: boolean;
    isLeft: boolean;
    title: string;
    description: string;
    top: number;
    id: string;
}

const Event: React.FC<IEventProps> = ({ isActive, title, description, top, isLeft, id }) => {
    const elementRef = useRef(null);
    const animation = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        animation.current = gsap.fromTo(elementRef.current, {
            opacity: 0,
            x: isLeft ? -100 : 100,
        }, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            paused: true,
        });

        return () => { if (animation.current) animation.current.kill(); }
    }, [isLeft]);

    useEffect(() => {
        if (isActive && animation.current) animation.current.play();
        else if (animation.current) animation.current.reverse();
    }, [isActive]);

    return (
        <Link to={`/events/${id}`}>
            <div
                ref={elementRef}
                className={`absolute w-full ${isLeft ? 'text-right md:pr-12' : 'text-left md:pl-12'} `}
                style={{ top: `${top}%` }}
            >
                <div className="bg-lighter-green p-4 rounded-lg shadow-lg hover:-translate-y-2">
                    <h3 className="text-xl text-green-800 font-bold mb-2 ">{title}</h3>
                    <p className="text-gray-600 hidden md:block ">{description}</p>
                </div>
            </div>
        </Link>
    );
};


const Timeline = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
    const [maxScroll, setMaxScroll] = useState<number>(0);
    const [isStuck, setIsStuck] = useState(false); // Initially, side content is stuck
    const [activeIndex, setActiveIndex] = useState(-1);
    const pathRef = useRef<SVGSVGElement | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const circleRef = useRef(null);
    // state of events
    const [events, setEvents] = useState<IEvent[]>([]);

    // Fetch events data
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('./events.json');
                const data = await response.json();
                setEvents(data.events);
            } catch (error) {
                console.error('Error fetching events data:', error);
            }
        };
        fetchEvents();
    }, []);

    // Wave parameters
    const height = 1000; // Total height of the path
    const width = 60;    // Maximum deviation from center
    const points = 200;  // Number of points to generate the path

    useEffect(() => {
        const calculateMaxScroll = () => {
            setMaxScroll(window.innerHeight);
        };
        calculateMaxScroll();

        window.addEventListener('resize', calculateMaxScroll);
        return () => window.removeEventListener('resize', calculateMaxScroll);
    }, []);

    useEffect(() => {
        const handleScroll = (): void => {
            const position = window.scrollY;
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                if (rect.top <= maxScroll) {
                    setScrollPosition(maxScroll - rect.top);
                }   else {
                    setScrollPosition(0);
                }
            }
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                if (position < rect.top) return;
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return (): void => window.removeEventListener('scroll', handleScroll);
    }, [maxScroll]);

    useEffect(() => {
        if (maxScroll === 0) return;
        const progress = Math.min(scrollPosition / maxScroll, 1);
        const y = progress * height;

        let x = 0;
        const waves = [
            { freq: 0.015, amp: 1.0 },
            { freq: 0.03, amp: 0.3 },
        ];

        waves.forEach((wave) => {
            x += Math.sin(y * wave.freq) * width * wave.amp;
        });
        setDotPosition({ x: x, y: y });
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

    useEffect(() => {
        if (!events.length || !height) return;

        // Calculate thresholds for all events
        const thresholds = events.map((_, index) => {
            const isLeft = index % 2 === 0;
            const i = Math.floor(index / 2);
            return isLeft
                ? (2 * i * height) / events.length + 10
                : ((2 * i + 1) * height) / events.length + 10;
        });

        // Find the last threshold that's <= current Y position
        let newActiveIndex = -1;
        for (let i = 0; i < thresholds.length; i++) {
            if (dotPosition.y >= thresholds[i]) {
                newActiveIndex = i;
            } else {
                break;
            }
        }

        setActiveIndex(newActiveIndex);
    }, [dotPosition.y, events, height]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (dotPosition.y > 0 && dotPosition.y < height) {
                e.preventDefault();

                // Calculate the new scroll position
                let delta = e.deltaY;
                let scrollPosition = window.scrollY + (delta * 0.5);

                // Set the new scroll position
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [dotPosition.y]);

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

    const handleRef = (ref: SVGSVGElement | null): void => {
        pathRef.current = ref;
    };

    const path = generatePath();

    return (
        <>
            <div className={`relative flex w-full h-screen overflow-hidden ${isStuck ? 'sticky top-0' : 'translate-y-full'}`}>
                {/* Content side (left) */}
                <div
                    className={`w-1/2 md:w-1/3 p-6 overflow-auto  ${isStuck ? 'sticky top-0 h-screen' : 'relative'
                        }`}
                >
                    <div className="relative h-full overflow-hidden">
                        {events
                            .filter((_, i) => i % 2 === 0)
                            .map((event, i) => (
                                <Event
                                    key={i}
                                    isActive={dotPosition.y >= (2 * i) * height / events.length + 10}
                                    isLeft={true}
                                    title={event.title}
                                    description={event.brief}
                                    top={(2 * i / events.length) * 100}
                                    id={event.id}
                                />
                            ))}
                    </div>
                </div>
                {/* Wave and dot container */}
                <div className="w-1/3 h-screen pointer-events-none hidden md:block">
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
                        {activeIndex >= 0 && (
                            <text
                                x={dotPosition.x + (activeIndex % 2 === 0 ? 30 : -30)}
                                y={dotPosition.y}
                                textAnchor={activeIndex % 2 === 0 ? 'start' : 'end'}
                                dominantBaseline="middle"
                                className="text-lg font-bold"
                                fill="black"
                                stroke="white"
                                strokeWidth="2"
                                paintOrder="stroke"
                            >
                                {events[activeIndex].date ? events[activeIndex].date : "1/1/2025"}
                            </text>
                        )}
                    </svg>
                </div>
                {/* Content side (right) */}
                <div
                    className={`w-1/2 md:w-1/3 p-6 overflow-auto  ${isStuck ? 'sticky top-0 h-screen' : 'relative'
                        }`}
                >
                    <div className="relative h-full overflow-hidden">
                        {events
                            .filter((_, i) => i % 2 !== 0)
                            .map((event, i) => (
                                <Event
                                    key={i}
                                    isActive={dotPosition.y >= (2 * i + 1) * height / events.length + 10}
                                    isLeft={false}
                                    title={event.title}
                                    description={event.brief}
                                    top={((2 * i + 1) / events.length) * 100}
                                    id={event.id}
                                />
                            ))}
                    </div>
                </div>
            </div>
            <div className="h-screen"
                ref={contentRef}
            />
        </>
    );
}
export default Timeline;


