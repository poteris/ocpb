import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const WelcomeMessage = () => {
  return (
    <Card className="border-none rounded-[20px] bg-card-alt p-4 md:p-8">
      <CardHeader>
        <CardTitle className="text-2xl font-light mb-2">Welcome</CardTitle>
        <CardDescription className="leading-relaxed space-y-4">
          <p>
            Welcome to RepCoach! This is a safe space where you can practice your 
            conversation as a trade union representative, in different scenarios.
          </p>
          <p>
            For each scenario, you will be given objectives to achieve and details 
            of the persona that you will be chatting with. When you have finished 
            chatting, you will be presented with feedback that evaluates your 
            performance against the objectives.
          </p>
          <p>Have fun!</p>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default WelcomeMessage;