import type { Event } from "../types/events"
import { EventCard } from "./EventCard"

interface EventsSectionProps {
  title: string
  events: Event[]
}

export const EventsSection = ({ title, events }: EventsSectionProps) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-acme text-primary-green mb-6 pb-2 border-b-2 border-primary-green/20">{title}</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}

