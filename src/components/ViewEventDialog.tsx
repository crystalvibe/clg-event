import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateEventPDF } from "@/utils/pdfGenerator";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileIcon, FileAudio, FileText, Calendar } from "lucide-react";
import { format } from 'date-fns';

interface ViewEventDialogProps {
  event: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewEventDialog = ({ event, isOpen, onOpenChange }: ViewEventDialogProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    if (isOpen && event?.media?.length > 1) {
      const interval = setInterval(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % event.media.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, event?.media?.length]);

  if (!event) return null;

  const getMediaPreview = (mediaItem: any) => {
    if (!mediaItem) return null;

    if (mediaItem.type.startsWith('image/')) {
      return (
        <img
          src={mediaItem.data}
          alt="Event media"
          className="w-full h-64 object-cover rounded-lg"
        />
      );
    } else if (mediaItem.type.startsWith('video/')) {
      return (
        <video
          src={mediaItem.data}
          className="w-full h-64 object-cover rounded-lg"
          autoPlay
          loop
          muted
          playsInline
          controls
        />
      );
    } else if (mediaItem.type.startsWith('audio/')) {
      return (
        <div className="w-full bg-gray-100 rounded-lg p-8 flex flex-col items-center">
          <FileAudio className="w-16 h-16 text-gray-400 mb-4" />
          <audio src={mediaItem.data} controls className="w-full" autoPlay />
        </div>
      );
    } else if (mediaItem.type === 'application/pdf') {
      return (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
          <FileText className="w-16 h-16 text-red-400 mb-4" />
          <p className="text-gray-600 mb-4">PDF Document: {mediaItem.name}</p>
          <Button 
            variant="outline" 
            onClick={() => window.open(mediaItem.data, '_blank')}
          >
            View PDF
          </Button>
        </div>
      );
    } else {
      return (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
          <FileIcon className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500">File: {mediaItem.name}</p>
        </div>
      );
    }
  };

  const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    if (!startDate) return "Not provided";

    try {
      const formatSingleDate = (dateStr: string) => {
        // First try parsing as ISO string
        let date = new Date(dateStr);
        
        // If invalid, try parsing as YYYY-MM-DD
        if (isNaN(date.getTime()) && dateStr.includes('-')) {
          const [year, month, day] = dateStr.split('-').map(Number);
          date = new Date(year, month - 1, day);
        }
        
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateStr);
          return null;
        }
        
        return date;
      };

      const start = formatSingleDate(startDate);
      if (!start) return "Not provided";

      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const startFormatted = formatDate(start);
      
      if (endDate) {
        const end = formatSingleDate(endDate);
        if (end) {
          const endFormatted = formatDate(end);
          return `${startFormatted} - ${endFormatted}`;
        }
      }
      
      return startFormatted;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Not provided";
    }
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">{event.name || "Event Details"}</DialogTitle>
        </DialogHeader>
        
        {event.media && event.media.length > 0 && (
          <div className="relative mb-6">
            {getMediaPreview(event.media[currentMediaIndex])}
            {event.media.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setCurrentMediaIndex((prev) => 
                    prev === 0 ? event.media.length - 1 : prev - 1
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={() => setCurrentMediaIndex((prev) => 
                    (prev + 1) % event.media.length
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentMediaIndex + 1}/{event.media.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b pb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Document ID</h4>
              <p className="mt-1 text-base text-gray-900">{event.documentId || "Not provided"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="mt-1 text-base text-gray-900">{event.category || "Not provided"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b pb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Event Type</h4>
              <p className="mt-1 text-base text-gray-900">{event.eventType || "Not provided"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date</h4>
              <p className="mt-1 text-base text-gray-900">
                {formatDateRange(event.date || event.startDate, event.endDate)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b pb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Time</h4>
              <p className="mt-1 text-base text-gray-900">
                {event.timeSlot ? (
                  event.timeSlot.includes('AM') || event.timeSlot.includes('PM') ? 
                    event.timeSlot : 
                    `${event.timeSlot} ${event.timeSlotPeriod || 'AM'}`
                ) : "Not provided"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Department</h4>
              <p className="mt-1 text-base text-gray-900">{event.department || "Not provided"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b pb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Team Members</h4>
              <p className="mt-1 text-base text-gray-900">{event.teamMembers || "Not provided"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Resource Persons</h4>
              <p className="mt-1 text-base text-gray-900">{event.resourcePersons || "Not provided"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b pb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Participants Count</h4>
              <p className="mt-1 text-base text-gray-900">{event.participantsCount || "Not provided"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">External Participants</h4>
              <p className="mt-1 text-base text-gray-900">{event.externalParticipants || "Not provided"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b pb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Sponsored By</h4>
              <p className="mt-1 text-base text-gray-900">{event.sponsoredBy || "Not provided"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total Expenses</h4>
              <p className="mt-1 text-base text-gray-900">
                {event.totalExpenses ? `₹${event.totalExpenses}` : "Not provided"}
              </p>
            </div>
          </div>

          <div className="pb-4">
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">
              {event.description || "Not provided"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};