import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/contexts/EventContext";
import { generateAllEventsPDF, generateEventPDF } from "@/utils/pdfGenerator";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Event as CustomEvent } from "@/types/event";
import { toast } from "@/components/ui/use-toast";
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import { Calendar as LucideCalendar } from "lucide-react";

export default function Report() {
  const navigate = useNavigate();
  const { events } = useEvents();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [coordinator, setCoordinator] = useState("");
  const [venue, setVenue] = useState("");
  const [department, setDepartment] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<CustomEvent[]>([]);

  useEffect(() => {
    console.log('Events from context:', events);
    setFilteredEvents(events);
  }, [events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString();
  };

  const handleFilter = () => {
    console.log('Filtering events. Current events:', events);
    let filtered = [...events];

    if (startDate || endDate) {
      filtered = filtered.filter((event) => {
        try {
          // Parse dates and ensure they're valid
          const eventStartDate = new Date(event.date);
          const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;

          // Convert filter dates to start of day
          const filterStartDate = startDate ? new Date(startDate) : null;
          const filterEndDate = endDate ? new Date(endDate) : null;

          // Set all dates to start of day for comparison
          if (filterStartDate) filterStartDate.setHours(0, 0, 0, 0);
          if (filterEndDate) filterEndDate.setHours(0, 0, 0, 0);
          eventStartDate.setHours(0, 0, 0, 0);
          eventEndDate.setHours(0, 0, 0, 0);

          // For debugging
          console.log({
            event: event.title,
            eventStart: eventStartDate.toISOString(),
            eventEnd: eventEndDate.toISOString(),
            filterStart: filterStartDate?.toISOString(),
            filterEnd: filterEndDate?.toISOString()
          });

          // Only start date is selected
          if (filterStartDate && !filterEndDate) {
            return eventStartDate >= filterStartDate;
          }

          // Only end date is selected
          if (!filterStartDate && filterEndDate) {
            return eventStartDate <= filterEndDate;
          }

          // Both dates are selected
          if (filterStartDate && filterEndDate) {
            return eventStartDate >= filterStartDate && eventStartDate <= filterEndDate;
          }

          return true;
        } catch (error) {
          console.error('Date filtering error for event:', event.title, error);
          return false;
        }
      });
    }

    if (coordinator.trim()) {
      filtered = filtered.filter((event) => 
        event.coordinator.toLowerCase().includes(coordinator.toLowerCase().trim())
      );
    }

    if (venue.trim()) {
      filtered = filtered.filter((event) => 
        event.venue?.toLowerCase().includes(venue.toLowerCase().trim())
      );
    }

    if (department.trim()) {
      filtered = filtered.filter((event) => 
        event.department?.toLowerCase().includes(department.toLowerCase().trim())
      );
    }

    console.log('Filtered events:', filtered);
    setFilteredEvents(filtered.length > 0 ? filtered : []);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCoordinator("");
    setVenue("");
    setDepartment("");
    setFilteredEvents(events);
  };

  const handleGenerateReport = async (eventId: number) => {
    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) {
        toast({
          title: "Error",
          description: "Event not found",
          variant: "destructive"
        });
        return;
      }

      await generateEventPDF(event);
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateAllReports = async () => {
    try {
      if (filteredEvents.length === 0) {
        toast({
          title: "Error",
          description: "No events to generate report from",
          variant: "destructive"
        });
        return;
      }

      await generateAllEventsPDF(filteredEvents);
      toast({
        title: "Success",
        description: "All reports generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDFs:', error);
      toast({
        title: "Error",
        description: "Failed to generate reports. Please check console for details.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-red-50 to-slate-50">
      {/* Header Section - Fixed height */}
      <div className="h-[80px] p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Generate Reports</h1>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateAllReports}
              className="primary-button"
            >
              Generate All Reports
            </Button>
            <Button
              onClick={() => navigate("/events")}
              className="secondary-button"
            >
              Back to Events
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="fixed top-[80px] bottom-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Filters Section - Fixed height */}
          <div className="h-[180px] bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filter Events</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={handleFilter}
                  className="primary-button"
                  size="sm"
                >
                  Apply
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="secondary-button"
                  size="sm"
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">End Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Coordinator</label>
                <input 
                  type="text" 
                  placeholder="Enter coordinator"
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Venue</label>
                <input 
                  type="text" 
                  placeholder="Enter venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Department</label>
                <input 
                  type="text" 
                  placeholder="Enter department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table Section - Takes remaining height */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-[60px] p-6">
              <h2 className="text-xl font-semibold text-gray-800">Events List</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold sticky top-0 bg-gradient-to-b from-red-50 to-slate-50">Event Name</TableHead>
                    <TableHead className="font-semibold sticky top-0 bg-gradient-to-b from-red-50 to-slate-50">Start Date</TableHead>
                    <TableHead className="font-semibold sticky top-0 bg-gradient-to-b from-red-50 to-slate-50">End Date</TableHead>
                    <TableHead className="font-semibold sticky top-0 bg-gradient-to-b from-red-50 to-slate-50">Venue</TableHead>
                    <TableHead className="font-semibold sticky top-0 bg-gradient-to-b from-red-50 to-slate-50">Department</TableHead>
                    <TableHead className="font-semibold sticky top-0 bg-gradient-to-b from-red-50 to-slate-50">Coordinator</TableHead>
                    <TableHead className="font-semibold sticky top-0 bg-gradient-to-b from-red-50 to-slate-50">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {event.endDate ? new Date(event.endDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{event.venue || '-'}</TableCell>
                        <TableCell>{event.department || '-'}</TableCell>
                        <TableCell>{event.coordinator}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleGenerateReport(event.id!)}
                            className="primary-button"
                            size="sm"
                          >
                            Generate Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No events found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 