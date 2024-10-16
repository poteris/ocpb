export const generateResponse = async (message: string): Promise<string> => {
  try {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    await delay(1000);
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.response) {
      throw new Error('No response received from the API');
    }
    return data.response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return "I'm sorry, I couldn't process your request at this time. Please try again later.";
  }
};
