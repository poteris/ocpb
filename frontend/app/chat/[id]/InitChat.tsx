import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

interface InitChatProps {
  handleStartChat: (prompt?: string) => void;
  starterPrompts: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputMessage: string;
}

export default function InitChat({ handleStartChat, starterPrompts, handleInputChange, inputMessage }: InitChatProps) {

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 ">
      <div className="flex-shrink-0 w-full" />
      <h3 className="text-center font-light text-sm mt-12">Choose a prompt below or start with your own message</h3>
      <main className="flex-grow w-full px-4 flex flex-col md:container md:mx-auto md:px-6 lg:px-8 md:max-w-screen-xl">
        <div className="w-full flex-grow flex flex-col justify-between py-4 md:py-8 md:max-w-3xl md:mx-auto">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center mb-8 md:mb-12">
              <Image
                width={200}
                height={200}
                alt="Union Training Bot"
                src="/images/chat-bot.svg"
                className="mb-6 md:mb-8 w-[150px] md:w-[250px]"
                priority
              />
            </div>
          </div>

          <div className="mt-auto">
            <div className="relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStartChat();
                }}
                className="flex flex-col sm:flex-row items-center gap-3 p-2">
                <Input
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 text-[14px] p-4 rounded-full border-none shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-0 focus:ring-0 placeholder:text-xs placeholder:px-2"
                  placeholder="Start typing..."
                  value={inputMessage}
                />

                <Button
                  type="submit"
                  className="w-full sm:w-auto text-base py-2 px-4 rounded-full whitespace-nowrap flex items-center justify-center text-sm"
                  disabled={!inputMessage}>
                  Send
                  <SendHorizontal className="w-4 h-4 mr-2" />
                </Button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-left font-regular text-xs ml-2">Struggling to start?</p>

            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <Badge
                  key={uuidv4()}
                  onClick={() => handleStartChat(prompt)}
                  className="text-xs font-light rounded-full whitespace-nowrap bg-primary-light text-primary w-fit p-2 hover:bg-primary-light/80 hover:shadow-lg cursor-pointer transition-colors">
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
