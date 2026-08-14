import { ConversationsListClient } from "./ConversationsListClient";
import { getStudentConversations } from "./actions";

export default async function StudentMessagesPage() {
  const conversations = await getStudentConversations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Messages
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Communicate with your teachers
        </p>
      </div>

      <ConversationsListClient
        conversations={conversations}
        role="student"
        emptyTitle="No messages yet"
        emptyDescription="Contact a teacher to start a conversation."
        emptyHref="/student/teachers"
        emptyButtonText="Find Tutors"
      />
    </div>
  );
}
