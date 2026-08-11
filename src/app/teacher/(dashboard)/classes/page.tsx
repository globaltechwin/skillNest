import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassListClient } from "./ClassListClient";

export default function TeacherClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            My Classes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your classes and schedules
          </p>
        </div>
        <Link href="/teacher/classes/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Class
          </Button>
        </Link>
      </div>

      <ClassListClient />
    </div>
  );
}
