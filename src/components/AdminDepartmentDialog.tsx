import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface AdminDepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

export function AdminDepartmentDialog({ 
  isOpen, 
  onClose, 
  isEditMode,
  setIsEditMode 
}: AdminDepartmentDialogProps) {
  const [newDepartment, setNewDepartment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newDepartment.trim()) {
        setNewDepartment("");
        onClose();
        toast.success('Department added successfully');
      }
    } catch (error) {
      toast.error('Failed to add department');
    }
  };

  const handleClose = () => {
    onClose();
    setIsEditMode(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Department Name</label>
            <Input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Enter department name"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Add Department
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 