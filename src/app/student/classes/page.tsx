import { ClassListClient } from "./ClassListClient";

export default function StudentClassesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Classes
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your upcoming and past classes
        </p>
      </div>

      <ClassListClient />
    </div>
  );
}
