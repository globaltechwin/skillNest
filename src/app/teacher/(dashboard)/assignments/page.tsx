import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssignmentListClient } from "./AssignmentListClient";

export default function TeacherAssignmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Assignments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and review student assignments
          </p>
        </div>
        <Link href="/teacher/assignments/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Assignment
          </Button>
        </Link>
      </div>

      <AssignmentListClient />
    </div>
  );
}
