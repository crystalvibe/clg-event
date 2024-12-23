import { Event as CustomEvent } from "@/types/event";

export const createSearchIndex = (events: CustomEvent[]) => {
  return events.reduce((acc, event) => {
    const searchableText = `${event.title} ${event.description} ${event.department}`.toLowerCase();
    if (event.id !== undefined) {
      acc[event.id.toString()] = searchableText;
    }
    return acc;
  }, {} as Record<string, string>);
}; 