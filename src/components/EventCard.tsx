import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, Calendar, Edit2, Trash2, Eye, FileAudio, FileText, MapPin, Building2, Clock, Users, Award, BookOpen, Presentation, Mic, Video, Globe, Tag, Music, Code, Brush, Laptop, Rocket, Gamepad, Brain, Heart, Coffee, Camera, Newspaper, Lightbulb, GraduationCap, Trophy, Target, Puzzle } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: any;
  onView: (event: any) => void;
  onEdit: (event: any) => void;
  onDelete: (id: number) => void;
  userRole?: string | null;
}

const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src = 'fallback-image-url';
      }}
    />
  );
};

export const EventCard = React.memo(({ event, onEdit, onDelete, onView, userRole }: EventCardProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    if (event.media && event.media.length > 1) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % event.media.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [event.media]);

  const getMediaPreview = () => {
    if (!event.media || event.media.length === 0) {
      return (
        <div className="w-full h-48 relative overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
          <FileIcon className="w-16 h-16 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">No media available</span>
        </div>
      );
    }

    const currentMedia = event.media[currentMediaIndex];
    
    if (!currentMedia) {
      return (
        <div className="w-full h-48 relative overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
          <FileIcon className="w-16 h-16 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Media not available</span>
        </div>
      );
    }

    try {
      if (currentMedia.type?.startsWith('image/')) {
        const mediaSource = currentMedia.url || currentMedia.data;
        if (!mediaSource) {
          console.error('No media source available');
          return null;
        }

        return (
          <div className="w-full h-48 relative overflow-hidden">
            <LazyImage
              src={mediaSource}
              alt={currentMedia.name || "Event media"}
            />
            {event.media.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm z-10">
                {currentMediaIndex + 1}/{event.media.length}
              </div>
            )}
          </div>
        );
      } else if (currentMedia.type?.startsWith('video/')) {
        return (
          <div className="w-full h-48 relative overflow-hidden">
            <video
              src={currentMedia.url || currentMedia.data}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        );
      } else if (currentMedia.type?.startsWith('audio/')) {
        return (
          <div className="w-full h-48 relative overflow-hidden bg-gray-100 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <FileAudio className="w-16 h-16 text-gray-400 mb-4" />
              <audio 
                src={currentMedia.url || currentMedia.data} 
                controls 
                className="w-64"
              />
            </div>
          </div>
        );
      } else if (currentMedia.type === 'application/pdf') {
        return (
          <div className="w-full h-48 relative overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-red-400 mb-4" />
            <span className="text-sm text-gray-600">PDF Document</span>
          </div>
        );
      } else {
        return (
          <div className="w-full h-48 relative overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
            <FileIcon className="w-16 h-16 text-gray-400 mb-4" />
            <span className="text-sm text-gray-600">{currentMedia.name}</span>
          </div>
        );
      }
    } catch (error) {
      console.error('Media preview error:', error);
      return (
        <div className="w-full h-48 relative overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
          <FileIcon className="w-16 h-16 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Media preview unavailable</span>
        </div>
      );
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      // First, try to parse the date string directly
      let date = new Date(dateString);
      
      // If the date is invalid, try parsing it as a YYYY-MM-DD format
      if (isNaN(date.getTime()) && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-based in Date constructor
      }

      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid Date';
      }

      // Format the date as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Invalid Date';
    }
  };

  const getEventTypeIcon = (event: any) => {
    const title = event.title?.toLowerCase() || '';
    const description = event.description?.toLowerCase() || '';
    const type = event.eventType?.toLowerCase() || '';
    const combinedText = `${title} ${description} ${type}`;

    const iconMappings = [
      // Cultural & Festival Events
      {
        keywords: ['puja', 'pooja', 'festival', 'celebration', 'cultural', 'diwali', 'holi', 'navratri', 'sankranti'],
        icon: <Music className="w-4 h-4 flex-shrink-0" />
      },
      // Paper Presentations & Research
      {
        keywords: ['paper', 'presentation', 'research', 'journal', 'conference paper', 'technical paper', 'publication'],
        icon: <FileText className="w-4 h-4 flex-shrink-0" />
      },
      // Drama & Performance
      {
        keywords: ['drama', 'skit', 'theatre', 'play', 'stage', 'acting', 'performance', 'mime'],
        icon: <Mic className="w-4 h-4 flex-shrink-0" />
      },
      // Technical Events
      {
        keywords: ['technical', 'engineering', 'yantra', 'tantrika', 'robotics', 'coding', 'hackathon', 'project'],
        icon: <Code className="w-4 h-4 flex-shrink-0" />
      },
      // Workshops & Training
      {
        keywords: ['workshop', 'hands-on', 'training', 'practical', 'shiksha', 'vidya', 'skill'],
        icon: <Users className="w-4 h-4 flex-shrink-0" />
      },
      // Sports & Games
      {
        keywords: ['sports', 'khel', 'tournament', 'cricket', 'kabaddi', 'kho-kho', 'competition', 'athletics'],
        icon: <Trophy className="w-4 h-4 flex-shrink-0" />
      },
      // Cultural Arts
      {
        keywords: ['kala', 'art', 'dance', 'sangeet', 'nritya', 'sahitya', 'kavita', 'rangoli', 'mehendi'],
        icon: <Brush className="w-4 h-4 flex-shrink-0" />
      },
      // Innovation & Ideation
      {
        keywords: ['innovation', 'idea', 'startup', 'entrepreneurship', 'incubation', 'prototype'],
        icon: <Lightbulb className="w-4 h-4 flex-shrink-0" />
      },
      // Educational & Academic
      {
        keywords: ['seminar', 'lecture', 'class', 'course', 'learning', 'shikshan', 'adhyayan', 'guest lecture'],
        icon: <BookOpen className="w-4 h-4 flex-shrink-0" />
      },
      // Quiz & Competitions
      {
        keywords: ['quiz', 'competition', 'contest', 'pratiyogita', 'debate', 'group discussion'],
        icon: <Brain className="w-4 h-4 flex-shrink-0" />
      },
      // Social & Community
      {
        keywords: ['samaj', 'social', 'community', 'seva', 'gathering', 'milan', 'outreach'],
        icon: <Heart className="w-4 h-4 flex-shrink-0" />
      },
      // Department Events
      {
        keywords: ['department', 'dept', 'branch', 'faculty', 'staff', 'college'],
        icon: <Building2 className="w-4 h-4 flex-shrink-0" />
      }
    ];

    // Try exact match first
    const exactMatch = iconMappings.find(mapping => 
      mapping.keywords.some(keyword => combinedText.includes(keyword))
    );
    if (exactMatch) return exactMatch.icon;

    // Try partial match
    const words = combinedText.split(/\s+/);
    for (const word of words) {
      if (word.length < 3) continue;
      const partialMatch = iconMappings.find(mapping => 
        mapping.keywords.some(keyword => 
          keyword.includes(word) || word.includes(keyword)
        )
      );
      if (partialMatch) return partialMatch.icon;
    }

    // Smart fallback based on event type
    const defaultIcons = {
      'event': <Calendar className="w-4 h-4 flex-shrink-0" />,
      'meeting': <Users className="w-4 h-4 flex-shrink-0" />,
      'activity': <Rocket className="w-4 h-4 flex-shrink-0" />,
      'program': <Presentation className="w-4 h-4 flex-shrink-0" />,
      'session': <Clock className="w-4 h-4 flex-shrink-0" />,
      'default': <Tag className="w-4 h-4 flex-shrink-0" />
    };

    // Try to match with common event type words
    const eventTypeWord = type.split(/\s+/)[0];
    return defaultIcons[eventTypeWord as keyof typeof defaultIcons] || defaultIcons.default;
  };

  return (
    <Card className="overflow-hidden bg-white 
                    transition-shadow duration-300
                    shadow-[0_4px_12px_rgba(220,38,38,0.15)] 
                    hover:shadow-[0_8px_24px_rgba(220,38,38,0.25)]
                    h-full flex flex-col">
      <div className="h-48 flex-shrink-0">
        {getMediaPreview()}
      </div>
      <CardHeader className="space-y-2 flex-shrink-0 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold line-clamp-1">{event.title}</CardTitle>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm whitespace-nowrap">
            {event.category}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">
            {formatDisplayDate(event.date)}
            {event.endDate && ` - ${formatDisplayDate(event.endDate)}`}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">
            Time: {event.timeSlot ? (
              event.timeSlot.includes('AM') || event.timeSlot.includes('PM') ? 
                event.timeSlot : 
                `${event.timeSlot} ${event.timeSlotPeriod || 'AM'}`
            ) : 'Not specified'}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <Building2 className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">Department: {event.department || 'Not specified'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">Venue: {event.venue || 'No location'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          {getEventTypeIcon(event)}
          <span className="line-clamp-1">Type: {event.eventType}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4">
        <div className="space-y-2 h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
          </div>
          
          <div className="flex justify-end items-center space-x-2 pt-4 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(event)}
              className="flex items-center space-x-1 min-w-[80px] justify-center"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </Button>
            
            {userRole !== 'view' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(event)}
                  className="flex items-center space-x-1 min-w-[80px] justify-center primary-button"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  className="flex items-center space-x-1 min-w-[80px] justify-center primary-button"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});