import { AssignmentListClient } from "./AssignmentListClient";

export default function StudentAssignmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Assignments
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and submit your assignments
        </p>
      </div>

      <AssignmentListClient />
    </div>
  );
}
