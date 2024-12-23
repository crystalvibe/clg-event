import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { initDB, saveEvents, getEvents, getAllCategories, getAllEventTypes } from '@/utils/indexedDB';
import { Event as CustomEvent } from "@/types/event";

interface MediaItem {
  name: string;
  type: string;
  size: number;
  file?: File;
  url?: string;
  data?: string;
}

interface EventContextType {
  events: CustomEvent[];
  addEvent: (event: CustomEvent) => Promise<void>;
  updateEvent: (event: CustomEvent) => void;
  deleteEvent: (id: number) => void;
  fetchEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  useEffect(() => {
    // Load events when component mounts
    getEvents().then((events) => setEvents(events as CustomEvent[])).catch(console.error);
  }, []);

  useEffect(() => {
    // Only save events if there are any and they've been loaded initially
    if (events.length > 0) {
      saveEvents(events).catch(error => {
        console.error('Error saving events:', error);
        toast({
          title: "Error",
          description: "Failed to save events to storage",
          variant: "destructive"
        });
      });
    }
  }, [events]); // Only trigger when events change

  const cleanupOldMedia = async () => {
    try {
      // Revoke object URLs for media older than 2 years
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
      
      events.forEach(event => {
        if (new Date(event.date) < cutoffDate) {
          event.media?.forEach(media => {
            if (media.url) URL.revokeObjectURL(media.url);
          });
        }
      });
    } catch (error) {
      console.error('Error cleaning up media:', error);
    }
  };

  useEffect(() => {
    const cleanup = async () => {
      // Clean up old cached media
      await cleanupOldMedia();
      // Archive events older than 2 years
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
      await archiveOldEvents(cutoffDate);
    };

    // Run cleanup monthly
    const interval = setInterval(cleanup, 30 * 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const loadedCategories = await getAllCategories();
      const loadedEventTypes = await getAllEventTypes();
      setCategories(loadedCategories);
      setEventTypes(loadedEventTypes);
    };

    loadData();
    
    // Set up event listeners for IndexedDB changes
    window.addEventListener('categoriesUpdated', loadData);
    window.addEventListener('eventTypesUpdated', loadData);

    return () => {
      window.removeEventListener('categoriesUpdated', loadData);
      window.removeEventListener('eventTypesUpdated', loadData);
    };
  }, []);

  const addEvent = async (newEvent: CustomEvent) => {
    try {
      // Parse and validate dates
      const formatDate = (dateString: string) => {
        if (!dateString) throw new Error('Date is required');
        const date = new Date(dateString);
        // Set the time to noon to avoid timezone issues
        date.setHours(12, 0, 0, 0);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        return date;
      };

      const eventDate = formatDate(newEvent.date);
      let endDate: Date | undefined;
      
      if (newEvent.endDate) {
        endDate = formatDate(newEvent.endDate);
        // Validate that end date is not before start date
        if (endDate < eventDate) {
          throw new Error('End date cannot be before start date');
        }
      }

      // Create URLs for new media files
      const mediaWithUrls: MediaItem[] = [];
      
      if (Array.isArray(newEvent.media)) {
        for (const mediaItem of newEvent.media) {
          try {
            // Handle File objects
            if (mediaItem instanceof File) {
              const base64Data = await fileToBase64(mediaItem);
              mediaWithUrls.push({
                name: mediaItem.name,
                type: mediaItem.type || 'application/octet-stream',
                size: mediaItem.size,
                data: base64Data,
                url: URL.createObjectURL(mediaItem)
              });
            } 
            // Handle MediaItem objects with file property
            else if (mediaItem.file && mediaItem.file instanceof File) {
              const base64Data = await fileToBase64(mediaItem.file);
              mediaWithUrls.push({
                name: mediaItem.name,
                type: mediaItem.type || 'application/octet-stream',
                size: mediaItem.size,
                data: base64Data,
                url: URL.createObjectURL(mediaItem.file)
              });
            } 
            // Handle existing MediaItems with data
            else if (mediaItem.data) {
              mediaWithUrls.push(mediaItem);
            }
          } catch (error) {
            console.error('Error processing file:', error);
          }
        }
      }

      const eventToAdd: CustomEvent = {
        ...newEvent,
        id: Date.now(),
        date: eventDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        media: mediaWithUrls
      };

      setEvents(prevEvents => [...prevEvents, eventToAdd]);
      
      try {
        await saveEvents([...events, eventToAdd]);
      } catch (error) {
        // Revoke URLs if save failed
        mediaWithUrls.forEach(media => {
          if (media?.url) URL.revokeObjectURL(media.url);
        });
        console.error('Failed to save to IndexedDB:', error);
        toast({
          title: "Error",
          description: "Failed to save event. Please check your media files and try again.",
          variant: "destructive"
        });
        setEvents(events);
        return Promise.reject(error);
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process event data",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const updateEvent = async (updatedEvent: CustomEvent) => {
    try {
      // Process new media files if any
      const mediaWithUrls: MediaItem[] = [];
      
      if (Array.isArray(updatedEvent.media)) {
        for (const mediaItem of updatedEvent.media) {
          try {
            // Keep existing media items
            if (mediaItem.data) {
              mediaWithUrls.push(mediaItem);
              continue;
            }

            // Handle new File objects
            if (mediaItem instanceof File) {
              const base64Data = await fileToBase64(mediaItem);
              mediaWithUrls.push({
                name: mediaItem.name,
                type: mediaItem.type || 'application/octet-stream',
                size: mediaItem.size,
                data: base64Data,
                url: URL.createObjectURL(mediaItem)
              });
            } 
            // Handle MediaItem objects with file property
            else if (mediaItem.file && mediaItem.file instanceof File) {
              const base64Data = await fileToBase64(mediaItem.file);
              mediaWithUrls.push({
                name: mediaItem.name,
                type: mediaItem.type || 'application/octet-stream',
                size: mediaItem.size,
                data: base64Data,
                url: URL.createObjectURL(mediaItem.file)
              });
            }
          } catch (error) {
            console.error('Error processing file:', error);
          }
        }
      }

      const eventToUpdate = {
        ...updatedEvent,
        media: mediaWithUrls
      };

      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? eventToUpdate : event
        )
      );

      // Save to IndexedDB
      try {
        await saveEvents(events.map(event => 
          event.id === updatedEvent.id ? eventToUpdate : event
        ));
      } catch (error) {
        console.error('Failed to save updated event:', error);
        toast({
          title: "Error",
          description: "Failed to save updated event",
          variant: "destructive"
        });
        return Promise.reject(error);
      }

    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      // First update the state
      setEvents(prevEvents => {
        const eventToDelete = prevEvents.find(event => event.id === id);
        // Revoke URLs for deleted media
        eventToDelete?.media?.forEach(media => {
          if (media.url) URL.revokeObjectURL(media.url);
        });
        return prevEvents.filter(event => event.id !== id);
      });

      // Then persist the deletion to IndexedDB
      const db: any = await initDB();
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      
      await store.delete(id);
      
      // Wait for transaction to complete
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      toast({
        title: "Success",
        description: "Event deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const archiveOldEvents = async (cutoffDate: Date) => {
    const archivedEvents = events.filter(event => new Date(event.date) < cutoffDate);
    // Store in separate IndexedDB store or compress and archive
    await storeArchivedEvents(archivedEvents);
  };

  const storeArchivedEvents = async (archivedEvents: CustomEvent[]) => {
    try {
      const db: any = await initDB();
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      
      for (const event of archivedEvents) {
        // Mark events as archived
        event.archived = true;
        await store.put(event);
      }
    } catch (error) {
      console.error('Error archiving events:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents as CustomEvent[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to refresh events",
        variant: "destructive"
      });
    }
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      addEvent, 
      updateEvent, 
      deleteEvent,
      fetchEvents
    }}>
      {children}
    </EventContext.Provider>
  );
};

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
} 