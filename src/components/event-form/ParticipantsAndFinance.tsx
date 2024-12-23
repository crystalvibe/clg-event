import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ParticipantsAndFinanceProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ParticipantsAndFinance({ formData, setFormData }: ParticipantsAndFinanceProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="w-full">
          <label className="text-sm font-medium block mb-1.5">Total Participants</label>
          <Input
            type="number"
            value={formData.participantsCount}
            onChange={(e) => setFormData({ ...formData, participantsCount: e.target.value })}
            placeholder="Enter total participants"
            className="w-full"
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-medium block mb-1.5">External Participants</label>
          <Input
            type="number"
            value={formData.externalParticipants}
            onChange={(e) => setFormData({ ...formData, externalParticipants: e.target.value })}
            placeholder="Enter external participants"
            className="w-full"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Sponsored By</label>
        <Input
          value={formData.sponsoredBy}
          onChange={(e) => setFormData({ ...formData, sponsoredBy: e.target.value })}
          placeholder="Enter sponsor name"
          className="w-full"
        />
      </div>

        <div className="w-full">
          <label className="text-sm font-medium block mb-1.5">Total Expenses (Rs)</label>
          <Input
            type="number"
            value={formData.totalExpenses}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              setFormData({ ...formData, totalExpenses: value });
            }}
            placeholder="Enter total expenses"
            className="w-full"
            min="0"
            step="1"
          />
        </div>
    

      <div className="w-full">
        <label className="text-sm font-medium block mb-1.5">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter event description"
          className="w-full"
        />
      </div>
    </div>
  );
}