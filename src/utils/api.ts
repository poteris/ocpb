export const generateResponse = async (message: string): Promise<string> => {
  try {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    await delay(1000);
    return 'Simulated response to: ' + message;
    // const response = await fetch('/api/chat', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ message }),
    // });

    // if (!response.ok) {
    //   throw new Error('Failed to generate response');
    // }

    // const data = await response.json();
    // return data.response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error;
  }
};