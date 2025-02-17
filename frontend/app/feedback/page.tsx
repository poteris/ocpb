"use client"

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FeedbackPopover as FeedbackView } from "@/components/screens/FeedbackScreen/FeedbackScreen";

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const router = useRouter();

  if (!conversationId) {
    router.push("/");
    return null;
  }

  return <FeedbackView conversationId={conversationId} />;
}
