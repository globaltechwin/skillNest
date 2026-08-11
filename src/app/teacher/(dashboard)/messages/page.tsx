import { ConversationsListClient } from "@/app/student/messages/ConversationsListClient";
import { getTeacherConversations, markAllConversationsAsRead } from "./actions";

export default async function TeacherMessagesPage() {
  const [conversations] = await Promise.all([
    getTeacherConversations(),
    markAllConversationsAsRead(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Messages
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Communicate with your students
        </p>
      </div>

      <ConversationsListClient
        conversations={conversations.map((c) => ({
          ...c,
          teacherProfile: {
            id: c.studentUser.id,
            user: c.studentUser,
            profilePhotoUrl: null,
          },
        }))}
        role="teacher"
        emptyTitle="No messages yet"
        emptyDescription="Students who contact you will appear here."
        emptyHref="/teacher/courses"
        emptyButtonText="View Courses"
      />
    </div>
  );
}
