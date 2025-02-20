import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainingScenario } from "@/types/scenarios";
import { Skeleton } from "@/components/ui/skeleton";

const ScenarioCard = ({ scenario, onSelect }: { 
    scenario: TrainingScenario; 
    onSelect: (id: string) => void 
  }) => (
    <Card key={scenario.id} className="border-none rounded-[20px] bg-card p-2 md:p-2">
      <CardHeader>
        <div className="flex flex-row justify-between">
          <CardTitle className="font-normal capitalize">{scenario.title}</CardTitle> 
          <Button 
            onClick={() => onSelect(scenario.id)} 
            className="w-24 py-3"
          >
            Start Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
          <div className="w-full sm:w-2/3 flex flex-row">
            <CardDescription className="first-letter:capitalize">{scenario.description}</CardDescription>
          </div>
          <div className="w-full sm:w-1/3 flex justify-start sm:justify-end" />
        </div>
      </CardContent>
    </Card>
  );

export const ScenarioCardSkeleton = () => (
  <Card className="border-none rounded-[20px] bg-card p-2 md:p-2">
    <CardHeader>
      <div className="flex flex-row justify-between">
        <Skeleton className="h-6 w-48" /> 
        <Skeleton className="w-24 h-9" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
        <div className="w-full sm:w-2/3 flex flex-row">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="w-full sm:w-1/3" />
      </div>
    </CardContent>
  </Card>
);

export default ScenarioCard;