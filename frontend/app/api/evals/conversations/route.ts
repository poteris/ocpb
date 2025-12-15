import { NextRequest, NextResponse } from "next/server";
import { supabaseService as supabase } from "../../service-init";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Test if we can join feedback directly
    console.log('Testing direct feedback query...');
    const { data: testData, error: testError } = await supabase
      .from('conversations')
      .select(`
        conversation_id,
        created_at,
        feedback!public_feedback_conversation_id_fkey(
          id,
          score,
          summary
        )
      `)
      .limit(5);
    
    if (testError) {
      console.log('Test query error:', testError);
    } else {
      console.log('Test query results:');
      testData?.forEach(conv => {
        console.log(`- ${conv.conversation_id}: feedback = ${conv.feedback && conv.feedback.length > 0 ? 'YES' : 'NO'}`);
        if (conv.feedback && conv.feedback.length > 0) {
          console.log(`  Score: ${conv.feedback[0].score}`);
        }
      });
    }

    // Build the query with joins to get organization data through scenarios
    let query = supabase
      .from("conversations")
      .select(`
        *,
        scenario:scenarios!inner(
          id,
          title,
          description,
          organisation_id,
          organisation:organisations(id, name)
        ),
        persona:personas!inner(
          id,
          name,
          job,
          age,
          organisation_id
        ),
        messages(
          id,
          role,
          content,
          created_at
        ),
        feedback(
          id,
          score,
          summary,
          strengths,
          areas_for_improvement,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by organization if specified
    if (organizationId && organizationId !== 'all') {
      query = query.eq('scenario.organisation_id', organizationId);
    }

    // Filter by date range if specified
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }

    console.log(`Fetched ${data.length} conversations from database`);
    
    // Get all feedback data separately and manually join it
    const { data: allFeedbackData } = await supabase
      .from('feedback')
      .select('*');
    
    console.log('All feedback records found:', allFeedbackData?.length || 0);

    // Get all assertion data
    const { data: allAssertionData } = await supabase
      .from('conversation_assertions')
      .select('*');
    
    console.log('All assertion records found:', allAssertionData?.length || 0);
    
    // Process the data to include organization info and message counts
    const processedData = data.map(conversation => {
      // Manually find matching feedback
      const matchingFeedback = allFeedbackData?.find(f => f.conversation_id === conversation.conversation_id);
      
      // Find matching assertions
      const matchingAssertions = allAssertionData?.filter(a => a.conversation_id === conversation.conversation_id) || [];
      const assertionSummary = {
        total: matchingAssertions.length,
        passed: matchingAssertions.filter(a => a.passed).length,
        failed: matchingAssertions.filter(a => !a.passed).length
      };
      
      console.log(`Processing conversation ${conversation.conversation_id}:`);
      console.log(`- Messages: ${conversation.messages?.length || 0}`);
      console.log(`- Manual feedback match: ${matchingFeedback ? 'YES (score: ' + matchingFeedback.score + ')' : 'NO'}`);
      console.log(`- Assertions: ${assertionSummary.passed}/${assertionSummary.total} passed`);
      
      return {
        ...conversation,
        organization_id: conversation.scenario?.organisation_id,
        organization_name: conversation.scenario?.organisation?.name || 'Unknown',
        message_count: conversation.messages?.length || 0,
        feedback_score: matchingFeedback?.score || null,
        feedback_summary: matchingFeedback?.summary || null,
        feedback_strengths: matchingFeedback?.strengths || [],
        feedback_areas_for_improvement: matchingFeedback?.areas_for_improvement || [],
        has_feedback: !!matchingFeedback,
        human_rating: matchingFeedback?.human_rating || null,
        human_notes: matchingFeedback?.human_notes || null,
        assertions: matchingAssertions,
        assertion_summary: assertionSummary
      };
    });

    console.log(`Processed data - conversations with feedback: ${processedData.filter(c => c.has_feedback).length}`);
    console.log(`Sample processed conversation:`, processedData[0]);

    return NextResponse.json(processedData, { status: 200 });
  } catch (error) {
    console.error("Error in evals API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
