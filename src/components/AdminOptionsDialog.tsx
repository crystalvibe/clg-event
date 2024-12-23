import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_SUBCATEGORIES } from "@/constants/eventCategories";

interface AdminOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "category" | "eventType";
  onAdd: (value: string) => void;
}

export function AdminOptionsDialog({ isOpen, onClose, type, onAdd }: AdminOptionsDialogProps) {
  const [newValue, setNewValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = Object.keys(DEFAULT_SUBCATEGORIES);
  
  // Get existing event types for the selected category
  const existingEventTypes = selectedCategory ? DEFAULT_SUBCATEGORIES[selectedCategory as keyof typeof DEFAULT_SUBCATEGORIES] || [] : [];

  const handleSubmit = () => {
    if (type === "eventType" && !selectedCategory) {
      alert("Please select a category first");
      return;
    }
    
    if (newValue.trim()) {
      // Check if event type already exists
      if (type === "eventType" && existingEventTypes.includes(newValue.trim())) {
        alert("This event type already exists in the selected category");
        return;
      }

      if (type === "eventType") {
        onAdd(`${selectedCategory}:${newValue.trim()}`);
      } else {
        onAdd(newValue.trim());
      }
      setNewValue("");
      setSelectedCategory("");
      onClose();
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setNewValue("");
      setSelectedCategory("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add New {type === "category" ? "Category" : "Event Type"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {type === "eventType" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Existing Event Types</label>
                  <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                    {existingEventTypes.length > 0 ? (
                      <ul className="space-y-1">
                        {existingEventTypes.map((eventType: string) => (
                          <li key={eventType} className="text-sm text-gray-600">
                            • {eventType}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No event types added yet</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {type === "category" ? "New Category Name" : "New Event Type Name"}
            </label>
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={type === "category" ? "Enter category name" : "Enter event type name"}
            />
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={type === "eventType" && !selectedCategory}
          >
            Add {type === "category" ? "Category" : "Event Type"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 