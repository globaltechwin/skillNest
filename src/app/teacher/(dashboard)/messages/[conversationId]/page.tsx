import { notFound } from "next/navigation";
import { ConversationView } from "@/components/messaging/ConversationView";
import {
  getTeacherConversation,
  getTeacherMessages,
  markConversationAsRead,
  sendMessage,
} from "../actions";

export default async function TeacherConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const conversation = await getTeacherConversation(conversationId);
  if (!conversation) notFound();

  const [messages] = await Promise.all([
    getTeacherMessages(conversationId),
    markConversationAsRead(conversationId),
  ]);

  const participant = conversation.studentUser;
  const participantName =
    `${participant.firstName || ""} ${participant.lastName || ""}`.trim() ||
    "Student";

  return (
    <ConversationView
      conversationId={conversationId}
      messages={messages}
      currentUserId={conversation.studentUser.id}
      participant={{
        firstName: participant.firstName,
        lastName: participant.lastName,
      }}
      participantLabel={participantName}
      backHref="/teacher/messages"
      role="teacher"
      sendMessageAction={sendMessage}
    />
  );
}
