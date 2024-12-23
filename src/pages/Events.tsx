import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { EventForm } from "@/components/EventForm";
import { useNavigate } from "react-router-dom";
import { EventCard } from "@/components/EventCard";
import { ViewEventDialog } from "@/components/ViewEventDialog";
import { generateAllEventsPDF } from "@/utils/pdfGenerator";
import { useEvents } from "@/contexts/EventContext";
import sdmLogo from './image-removebg-preview.png';
import { Event as CustomEvent } from "@/types/event";
import backgroundImage from './SDMCET-college-dharwad-small.jpg';
import { Input } from "@/components/ui/input";

export default function Events() {
  const { events, addEvent, updateEvent, deleteEvent, fetchEvents } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;  // Number of events per page
  const [filteredEvents, setFilteredEvents] = useState<CustomEvent[]>(events);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingEvents, setPendingEvents] = useState<CustomEvent[]>(() => {
    const saved = localStorage.getItem('pendingEvents');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPendingEvents, setShowPendingEvents] = useState(false);

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (!userRole || !username) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setUserRole(userRole);
  }, [navigate]);

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  useEffect(() => {
    const filtered = events.filter(event => {
      if (!searchQuery.trim()) return true;
      
      const searchLower = searchQuery.toLowerCase().trim();
      
      const safeIncludes = (value: any): boolean => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      };

      const safeArraySearch = (arr: string[] | undefined): boolean => {
        if (!arr) return false;
        return arr.some(item => safeIncludes(item));
      };

      const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        return [
          `${day}/${month}/${year}`,
          `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
        ].join(' ');
      };

      // Format dates with both patterns
      const dateStr = formatDate(event.date);
      const startDateStr = formatDate(event.startDate);
      const endDateStr = formatDate(event.endDate);
      const timeStr = event.timeSlot || '';

      // First check if it's an exact venue match
      if (event.venue && event.venue.toLowerCase() === searchLower) {
        return true;
      }

      // If the search term exactly matches a venue but this event's venue doesn't match,
      // filter it out
      const isVenueSearch = events.some(e => e.venue?.toLowerCase() === searchLower);
      if (isVenueSearch) {
        return false;
      }

      // If it's not a venue search, continue with normal search on other fields
      return (
        safeIncludes(event.title) ||
        safeIncludes(event.description) ||
        safeIncludes(event.department) ||
        safeIncludes(event.organizer) ||
        safeIncludes(event.eventType) ||
        safeIncludes(event.academicYear) ||
        safeIncludes(dateStr) ||
        safeIncludes(timeStr) ||
        safeIncludes(startDateStr) ||
        safeIncludes(endDateStr) ||
        safeIncludes(event.coordinator) ||
        safeIncludes(event.resourcePersons) ||
        safeArraySearch(Array.isArray(event.resourcePersons) ? event.resourcePersons : [])
      );
    });
    
    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [events, searchQuery]);

  useEffect(() => {
    localStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
  }, [pendingEvents]);

  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('username');
    navigate('/');
  };

  const handleAddEvent = async (eventData: CustomEvent) => {
    if (userRole === 'view') return;
    try {
      const cleanEventData = {
        ...eventData,
        date: eventData.date,
        status: userRole === 'admin' ? 'approved' : 'pending' as 'approved' | 'pending',
        id: Date.now(),
        media: eventData.media?.map(file => {
          if (file instanceof File) return file;
          return file;
        }) || []
      };

      if (userRole === 'admin') {
        await addEvent(cleanEventData);
        await fetchEvents();
        toast({
          title: "Success",
          description: "Event added successfully",
        });
      } else {
        setPendingEvents(prev => [...prev, cleanEventData]);
        toast({
          title: "Success",
          description: "Event submitted for admin approval",
        });
      }
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add event:', error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  const handleEditEvent = (eventData: CustomEvent) => {
    if (userRole === 'view') return;
    try {
      if (!selectedEvent?.id) return;
      
      // Convert startDate to date for the Event type
      const updatedEvent = {
        ...eventData,
        id: selectedEvent.id,
        date: eventData.startDate, // Map startDate to date
        media: eventData.media || []
      };

      // Remove startDate since we've mapped it to date
      delete (updatedEvent as any).startDate;
      
      updateEvent(updatedEvent as CustomEvent);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = (id: number) => {
    if (userRole === 'view') return;
    deleteEvent(id);
    toast({
      title: "Success",
      description: "Event deleted successfully",
    });
  };

  const getCurrentEvents = () => {
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  };

  const handleView = (event: CustomEvent) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (event: CustomEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    handleDeleteEvent(id);
  };

  const handleApproveEvent = async (event: CustomEvent) => {
    try {
      await addEvent(event);
      setPendingEvents(prev => prev.filter(e => e.id !== event.id));
      await fetchEvents();
      setFilteredEvents(events);
      toast({
        title: "Success",
        description: "Event approved and added successfully",
      });
    } catch (error) {
      console.error('Failed to approve event:', error);
      toast({
        title: "Error",
        description: "Failed to approve event",
        variant: "destructive"
      });
    }
  };

  const handleRejectEvent = (event: CustomEvent) => {
    setPendingEvents(prev => prev.filter(e => e.id !== event.id));
    toast({
      title: "Event Rejected",
      description: "Event has been rejected",
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const savedPendingEvents = localStorage.getItem('pendingEvents');
      if (savedPendingEvents) {
        const parsed = JSON.parse(savedPendingEvents);
        setPendingEvents(parsed);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-full min-h-screen overflow-auto"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="relative w-full min-h-screen p-8 flex flex-col">
        <div className="max-w-7xl mx-auto relative z-10 flex-1">
          {/* Header Section */}
          <div className="flex flex-col gap-6 mb-8">
            {/* Title and Logout Section */}
            <div className="flex items-center justify-center mb-4 relative">
              <div className="flex items-center gap-4">
                <img 
                  src={sdmLogo} 
                  alt="SDM Logo" 
                  className="h-16 w-auto"
                />
                <h1 className="text-3xl font-bold text-gray-800">
                  Sri Dharmasthala Manjunatheshwara College of Engineering
                </h1>
              </div>
              <Button 
                onClick={handleLogout}
                className="right-0 bg-gray-600 hover:bg-gray-700 text-white 
                          rounded-full px-6 py-2"
              >
                Logout
              </Button>
            </div>

            {/* Add Search Bar */}
            <div className="flex justify-center items-center space-x-4">
              <Input
                type="text"
                placeholder="Search events by any detail (title, date, venue, department, organizer, etc.)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md bg-white border-2 border-red-600 rounded-full px-6 py-2 
                          focus:ring-2 focus:ring-red-600 focus:border-red-600 
                          hover:border-red-700 outline-none"
                style={{ borderColor: '#dc2626' }}  // Forcing red border
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center space-x-4">
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 
                          flex items-center gap-2"
              >
                View Dashboard
              </Button>
              {userRole === 'edit' && (
                <>
                  <Button 
                    onClick={() => navigate("/report")}
                    className="primary-button"
                  >
                    Generate Report
                  </Button>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)} 
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 
                              flex items-center gap-2"
                  >
                    Add New Event
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showPendingEvents && userRole === 'admin' ? (
              pendingEvents.length > 0 ? (
                pendingEvents.map(event => (
                  <div key={event.id} className="relative">
                    <EventCard
                      event={event}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      userRole={userRole}
                    />
                    <div className="mt-2 flex justify-center gap-2">
                      <Button
                        onClick={() => handleApproveEvent(event)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectEvent(event)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500 text-lg">No pending events for approval</p>
                </div>
              )
            ) : (
              getCurrentEvents().length > 0 ? (
                getCurrentEvents().map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    userRole={userRole}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500 text-lg">No events found matching your search criteria.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mt-auto">
          <div className="max-w-7xl mx-auto flex justify-center items-center gap-4 py-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-transparent hover:bg-transparent text-gray-800"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-gray-800 font-medium">
              Page {currentPage} of {Math.ceil(filteredEvents.length / eventsPerPage)}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(filteredEvents.length / eventsPerPage)}
              className="bg-transparent hover:bg-transparent text-gray-800"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <EventForm onSubmit={handleAddEvent} mode="add" userRole={userRole} />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EventForm 
              onSubmit={handleEditEvent} 
              initialData={selectedEvent} 
              mode="edit" 
              userRole={userRole}
            />
          </DialogContent>
        </Dialog>

        <ViewEventDialog 
          event={selectedEvent}
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />

        {userRole === 'admin' && (
          <div className="mb-6">
            <Button
              onClick={() => setShowPendingEvents(!showPendingEvents)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2"
            >
              {showPendingEvents ? "Show All Events" : `Pending Approvals (${pendingEvents.length})`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}