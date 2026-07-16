"use client"
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FeedbackPopover as FeedbackView } from "@/components/screens/FeedbackScreen/FeedbackScreen";
import FeedbackSkeleton from "@/components/screens/FeedbackScreen/FeedbackSkeleton";

function FeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams ? searchParams.get('conversationId') : null;

  // Redirect from an effect: router.push during render throws on the server
  // (location is not defined) whenever this page is requested directly.
  useEffect(() => {
    if (!conversationId) {
      router.push("/");
    }
  }, [conversationId, router]);

  if (!conversationId) {
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