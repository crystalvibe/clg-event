import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface AdminOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'category' | 'eventType';
  onAdd: (value: string) => void;
}

export function AdminOptionsDialog({ isOpen, onClose, type, onAdd }: AdminOptionsDialogProps) {
  const [newValue, setNewValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) {
      toast({
        title: "Error",
        description: `Please enter a valid ${type}`,
        variant: "destructive",
      });
      return;
    }

    onAdd(newValue.trim());
    setNewValue('');
    onClose();
    
    toast({
      title: "Success",
      description: `New ${type} added successfully`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {type === 'category' ? 'Category' : 'Event Type'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Enter new ${type}`}
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 