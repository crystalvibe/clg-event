import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BasicEventDetails } from "./event-form/BasicEventDetails";
import { DateAndDepartment } from "./event-form/DateAndDepartment";
import { TeamDetails } from "./event-form/TeamDetails";
import { ParticipantsAndFinance } from "./event-form/ParticipantsAndFinance";
import { MediaUpload } from "./event-form/MediaUpload";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminOptionsDialog } from "./AdminOptionsDialog";

interface EventFormProps {
  onSubmit: (eventData: any) => void;
  initialData?: any;
  mode: "add" | "edit";
  userRole: string | null;
  showOtherOptions?: boolean;
}

export function EventForm({ onSubmit, initialData, mode, userRole, showOtherOptions = false }: EventFormProps) {
  const [category, setCategory] = useState(initialData?.category || "");
  const [eventType, setEventType] = useState(initialData?.eventType || "");
  const [customCategory, setCustomCategory] = useState("");
  const [customEventType, setCustomEventType] = useState("");
  const [formData, setFormData] = useState({
    documentId: initialData?.documentId || `D${Math.floor(Math.random() * 100)}-${new Date().getFullYear()}`,
    title: initialData?.title || "",
    category: initialData?.category || "",
    eventType: initialData?.eventType || "",
    startDate: initialData?.date || initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    timeSlot: initialData?.timeSlot || "",
    department: initialData?.department || "",
    coordinator: initialData?.coordinator || "",
    teamMembers: initialData?.teamMembers || "",
    resourcePersons: initialData?.resourcePersons || "",
    participantsCount: initialData?.participantsCount || "",
    externalParticipants: initialData?.externalParticipants || "",
    sponsoredBy: initialData?.sponsoredBy || "",
    totalExpenses: initialData?.totalExpenses || "",
    description: initialData?.description || "",
    media: initialData?.media || []
  });

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showEventTypeDialog, setShowEventTypeDialog] = useState(false);

  const handleAddCategory = (newCategory: string) => {
    console.log('New category added:', newCategory);
  };

  const handleAddEventType = (newEventType: string) => {
    console.log('New event type added:', newEventType);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, Category, and Start Date)",
        variant: "destructive"
      });
      return;
    }
    
    // Format dates as YYYY-MM-DD
    const formatDate = (dateString: string) => {
      if (!dateString) return undefined;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    onSubmit({
      ...formData,
      date: formatDate(formData.startDate),
      startDate: formatDate(formData.startDate),
      endDate: formData.endDate ? formatDate(formData.endDate) : undefined,
      title: formData.title.trim(),
      category: category === "Other" ? customCategory : category,
      eventType: eventType === "Other" ? customEventType : eventType,
      coordinator: formData.coordinator.trim()
    });
  };

  const categoryOptions = [
    "Technical",
    "Cultural",
    "Sports",
    "Workshop",
    "Seminar"
  ];

  const eventTypeOptions = [
    "College Level",
    "Department Level",
    "National Level",
    "International Level"
  ];

  // Only add "Other" option for admin users
  if (userRole === 'admin') {
    categoryOptions.push("Other");
    eventTypeOptions.push("Other");
  }

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto px-1">
      <BasicEventDetails
        formData={formData}
        setFormData={setFormData}
        category={category}
        setCategory={setCategory}
        eventType={eventType}
        setEventType={setEventType}
        customCategory={customCategory}
        setCustomCategory={setCustomCategory}
        customEventType={customEventType}
        setCustomEventType={setCustomEventType}
        userRole={userRole}
        mode={mode}
      />
      
      <DateAndDepartment
        formData={formData}
        setFormData={setFormData}
      />
      
      <TeamDetails
        formData={formData}
        setFormData={setFormData}
      />
      
      <div className="space-y-6">
        <ParticipantsAndFinance
          formData={formData}
          setFormData={setFormData}
        />

        <MediaUpload
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      <div className="space-y-2">
        <label>Category</label>
        <div className="flex gap-2">
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userRole === 'admin' && (
            <Button type="button" onClick={() => setShowCategoryDialog(true)}>
              Add Category
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label>Event Type</label>
        <div className="flex gap-2">
          <Select
            value={formData.eventType}
            onValueChange={(value) => setFormData({ ...formData, eventType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userRole === 'admin' && (
            <Button type="button" onClick={() => setShowEventTypeDialog(true)}>
              Add Event Type
            </Button>
          )}
        </div>
      </div>

      {/* Only render dialogs for admin users */}
      {userRole === 'admin' && (
        <>
          <AdminOptionsDialog
            isOpen={showCategoryDialog}
            onClose={() => setShowCategoryDialog(false)}
            type="category"
            onAdd={handleAddCategory}
          />
          <AdminOptionsDialog
            isOpen={showEventTypeDialog}
            onClose={() => setShowEventTypeDialog(false)}
            type="eventType"
            onAdd={handleAddEventType}
          />
        </>
      )}

      <Button onClick={handleSubmit} className="w-full">
        {mode === "add" ? "Add Event" : "Save Changes"}
      </Button>
    </div>
  );
}