export interface AssertionResult {
  assertion_name: string;
  passed: boolean;
  details: string;
}

export interface FeedbackValidationResult {
  summary: string;
  strengths: Array<{ title: string; description: string }>;
  areas_for_improvement: Array<{ title: string; description: string }>;
  score: number;
}

/**
 * Validates that feedback has all required components with sufficient content
 */
export function validateFeedbackQuality(feedback: FeedbackValidationResult): AssertionResult {
  const issues: string[] = [];

  // Check summary length
  if (!feedback.summary || feedback.summary.trim().length < 10) {
    issues.push("Summary is too short (less than 10 characters)");
  }

  // Check strengths
  if (!feedback.strengths || feedback.strengths.length === 0) {
    issues.push("No strengths provided");
  } else {
    const invalidStrengths = feedback.strengths.filter(s => 
      !s.title || !s.description || s.title.trim().length < 3 || s.description.trim().length < 10
    );
    if (invalidStrengths.length > 0) {
      issues.push(`${invalidStrengths.length} strength(s) have insufficient content`);
    }
  }

  // Check areas for improvement
  if (!feedback.areas_for_improvement || feedback.areas_for_improvement.length === 0) {
    issues.push("No areas for improvement provided");
  } else {
    const invalidAreas = feedback.areas_for_improvement.filter(a => 
      !a.title || !a.description || a.title.trim().length < 3 || a.description.trim().length < 10
    );
    if (invalidAreas.length > 0) {
      issues.push(`${invalidAreas.length} area(s) for improvement have insufficient content`);
    }
  }

  const passed = issues.length === 0;
  const details = passed 
    ? "Feedback has all required components with sufficient content" 
    : `Issues found: ${issues.join("; ")}`;

  return {
    assertion_name: "feedback_quality",
    passed,
    details
  };
}


/**
 * Checks for system prompt leakage in bot responses
 */
export function checkSystemPromptLeakage(messages: Array<{ role: string; content: string }>): AssertionResult {
  // Patterns that might indicate system prompt leakage
  const leakagePatterns = [
    /\b(system prompt|system message|instructions?)\b/i,
    /\b(you are (a|an|the))\b/i,
    /\b(act as|role.?play|pretend to be)\b/i,
    /\b(ignore (previous|all) instructions?)\b/i,
    /\b(your (role|character|persona) is)\b/i,
    /\b(respond as if|behave like)\b/i
  ];

  const botMessages = messages.filter(m => m.role === 'assistant');
  const flaggedMessages: string[] = [];

  botMessages.forEach((message, index) => {
    leakagePatterns.forEach(pattern => {
      if (pattern.test(message.content)) {
        flaggedMessages.push(`Message ${index + 1}: ${pattern.source}`);
      }
    });
  });

  const passed = flaggedMessages.length === 0;
  const details = passed 
    ? "No system prompt leakage detected"
    : `Potential prompt leakage in ${flaggedMessages.length} message(s): ${flaggedMessages.join("; ")}`;

  return {
    assertion_name: "prompt_leakage_check",
    passed,
    details
  };
}

/**
 * Validates that the conversation has sufficient length for meaningful evaluation
 */
export function validateConversationLength(messages: Array<{ role: string; content: string }>): AssertionResult {
  const minExchanges = 3; // Configurable minimum
  const userMessages = messages.filter(m => m.role === 'user');
  const botMessages = messages.filter(m => m.role === 'assistant');
  const exchanges = Math.min(userMessages.length, botMessages.length);

  const passed = exchanges >= minExchanges;
  const details = passed 
    ? `Conversation has ${exchanges} exchanges (minimum ${minExchanges})`
    : `Conversation too short: ${exchanges} exchanges (minimum ${minExchanges} required)`;

  return {
    assertion_name: "conversation_length",
    passed,
    details
  };
}

/**
 * Runs all assertions on a conversation
 */
export function runAllAssertions(
  messages: Array<{ role: string; content: string }>,
  feedback?: FeedbackValidationResult
): AssertionResult[] {
  const results: AssertionResult[] = [];

  // Always run these assertions
  results.push(checkSystemPromptLeakage(messages));
  results.push(validateConversationLength(messages));

  // Only run feedback validation if feedback is provided
  if (feedback) {
    results.push(validateFeedbackQuality(feedback));
  }

  return results;
}
