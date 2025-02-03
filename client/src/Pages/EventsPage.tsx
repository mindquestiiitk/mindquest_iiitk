import NavbarHome from '@/components/Navbar/Navbar_Home'
import Timeline from '@/components/Timeline'
import React from 'react'

export default function EventsPage() {
    const events = Array.from({ length: 10 }, (_, index) => ({
        date: `${index + 1}/1/2023`,
        name: `Event ${index + 1}`,
        details: `Details for Event ${index + 1}`,
    }));
    return (
        <div>
            <NavbarHome />
            <Timeline events={events} />
        </div>
    )
}

