"use client"
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FeedbackPopover as FeedbackView } from "@/components/screens/FeedbackScreen/FeedbackScreen";
import FeedbackSkeleton from "@/components/screens/FeedbackScreen/FeedbackSkeleton";

function FeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    router.push("/");
    return null;
  }

  return <FeedbackView conversationId={conversationId} />;
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<FeedbackSkeleton />}>
      <FeedbackContent />
    </Suspense>
  );
}