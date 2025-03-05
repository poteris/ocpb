import { Button } from "@/components/ui/button";

interface ScenarioFooterProps {
    onStartChat: () => void;
}

export default function ScenarioFooter({ onStartChat }: ScenarioFooterProps) {
    return (
        <div className=" bottom-0 left-0 right-0 p-4 bg-card-alt border-t z-10 fixed">
            <div className="max-w-full md:max-w-[calc(100%-7rem)] mx-auto flex justify-end">
                <Button
                    onClick={onStartChat}
                    className="w-full md:w-auto"
                    data-testid="startChatButton"
                >
                    Start Chat
                </Button>
            </div>
        </div>
    );
} 