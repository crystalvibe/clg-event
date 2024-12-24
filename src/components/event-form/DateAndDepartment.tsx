import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DateAndDepartmentProps {
  formData: any;
  setFormData: (data: any) => void;
  userRole?: string | null;
}

export function DateAndDepartment({ formData, setFormData, userRole }: DateAndDepartmentProps) {
  const departments = ["CSE", "EEE", "ECE", "MECHANICAL", "CHEMICAL"];

  const handleDepartmentChange = (value: string) => {
    setFormData({ ...formData, department: value });
  };

  return (
    <div className="space-y-4 w-full">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="timeSlot">Time Slot</Label>
        <div className="flex gap-2">
          <Input
            type="time"
            id="timeSlot"
            value={formData.timeSlot}
            onChange={(e) => setFormData({ 
              ...formData, 
              timeSlot: e.target.value 
            })}
            className="w-full"
          />
          <Select
            value={formData.timeSlotPeriod || 'AM'}
            onValueChange={(value) => setFormData({ 
              ...formData, 
              timeSlotPeriod: value
            })}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Department</label>
        <Select 
          value={formData.department}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}