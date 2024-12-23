import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_CATEGORIES, EVENT_SUBCATEGORIES, addNewCategory, addNewSubcategory } from "@/constants/eventCategories";
import { toast } from "@/components/ui/use-toast";

interface BasicEventDetailsProps {
  formData: any;
  setFormData: (data: any) => void;
  category: string;
  setCategory: (category: string) => void;
  eventType: string;
  setEventType: (eventType: string) => void;
  customCategory: string;
  setCustomCategory: (category: string) => void;
  customEventType: string;
  setCustomEventType: (eventType: string) => void;
}

export function BasicEventDetails({
  formData,
  setFormData,
  category,
  setCategory,
  eventType,
  setEventType,
  customCategory,
  setCustomCategory,
  customEventType,
  setCustomEventType,
}: BasicEventDetailsProps) {
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value);
    setCategory(value);
    if (value !== "Other") {
      setFormData({ ...formData, category: value, eventType: "" });
      setCustomCategory("");
      setEventType("");
    }
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Custom category changed to:", value);
    setCustomCategory(value);
    setFormData({ ...formData, category: value });
  };

  const handleCustomCategoryBlur = () => {
    if (customCategory && !EVENT_CATEGORIES.includes(customCategory)) {
      console.log("Adding new category:", customCategory);
      addNewCategory(customCategory);
      setCategory(customCategory);
      toast({
        title: "Category Added",
        description: `${customCategory} has been added to the categories list.`
      });
    }
  };

  const handleEventTypeChange = (value: string) => {
    console.log("Event type changed to:", value);
    setEventType(value);
    if (value !== "Other") {
      setFormData({ ...formData, eventType: value });
      setCustomEventType("");
    }
  };

  const handleCustomEventTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Custom event type changed to:", value);
    setCustomEventType(value);
    setFormData({ ...formData, eventType: value });
  };

  const handleCustomEventTypeBlur = () => {
    if (customEventType && category) {
      console.log("Adding new event type:", customEventType, "to category:", category);
      addNewSubcategory(category, customEventType);
      setEventType(customEventType);
      toast({
        title: "Event Type Added",
        description: `${customEventType} has been added to the event types list for ${category}.`
      });
    }
  };

  const getEventTypes = () => {
    if (category === "Other") return [];
    return EVENT_SUBCATEGORIES[category] || [];
  };

  return (
    <div className="space-y-4 w-full">
      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Document ID</label>
        <Input
          value={formData.documentId}
          disabled
          className="bg-gray-100 w-full"
        />
      </div>

      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Event Name</label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Event Title"
          className="w-full"
        />
      </div>
      
      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Category</label>
        <Select
          value={category}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {category === "Other" && (
          <Input
            className="mt-2 w-full"
            placeholder="Enter new category"
            value={customCategory}
            onChange={handleCustomCategoryChange}
            onBlur={handleCustomCategoryBlur}
          />
        )}
      </div>

      {category && (
        <div className="w-full">
          <label className="text-sm font-medium block mb-1.5">Event Type</label>
          <Select
            value={eventType}
            onValueChange={handleEventTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {getEventTypes().map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {eventType === "Other" && (
            <Input
              className="mt-2 w-full"
              placeholder="Enter new event type"
              value={customEventType}
              onChange={handleCustomEventTypeChange}
              onBlur={handleCustomEventTypeBlur}
            />
          )}
        </div>
      )}

      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Venue</label>
        <Input
          value={formData.venue}
          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          placeholder="Enter event venue"
          className="w-full"
        />
      </div>
    </div>
  );
}