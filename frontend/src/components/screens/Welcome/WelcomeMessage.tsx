import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


const WelcomeMessage = () => {
    return (
    
    <Card className="border-none rounded-[20px] bg-card-alt p-4 md:p-8 ">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam laoreet massa a tempus vehicula.
          Suspendisse potenti. In efficitur sapien non odio feugiat vehicula. Donec vitae nisl lacinia dolor
          sollicitudin bibendum et vitae sem. Proin eu tortor faucibus, efficitur sapien ullamcorper, sodales
          risus. In augue turpis, elementum vel tempus in, vehicula at purus. Pellentesque vestibulum, lectus
        </CardDescription>
      </CardHeader>
    </Card>
    );
  };


  export default WelcomeMessage;