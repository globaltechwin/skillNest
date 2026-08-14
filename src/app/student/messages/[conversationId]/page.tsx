import { notFound } from "next/navigation";
import { ConversationView } from "@/components/messaging/ConversationView";
import {
  getStudentConversation,
  getStudentMessages,
  markConversationAsRead,
} from "../actions";

export default async function StudentConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const conversation = await getStudentConversation(conversationId);
  if (!conversation) notFound();

  const [messages] = await Promise.all([
    getStudentMessages(conversationId),
    markConversationAsRead(conversationId),
  ]);

  const participant = conversation.teacherProfile.user;
  const participantName =
    `${participant.firstName || ""} ${participant.lastName || ""}`.trim() ||
    "Tutor";

  return (
    <ConversationView
      conversationId={conversationId}
      messages={messages}
      currentUserId={conversation.studentUserId}
      participant={{
        firstName: participant.firstName,
        lastName: participant.lastName,
        profilePhotoUrl: conversation.teacherProfile.profilePhotoUrl,
      }}
      participantLabel={participantName}
      backHref="/student/messages"
      role="student"
    />
  );
}
