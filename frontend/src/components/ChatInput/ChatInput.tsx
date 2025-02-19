import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSend: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSend,
    placeholder = "Type a message...",
    disabled = false,
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim() && !disabled) {
            onSend();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col sm:flex-row items-center gap-3 p-2">
                <Input
                    value={value}
                    onChange={onChange}
                    className="w-full bg-slate-50 text-sm p-3 rounded-full border-none shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-0 focus:ring-0"
                    placeholder={placeholder}
                    disabled={disabled}
                />

                <Button
                    type="submit"
                    className="w-full sm:w-auto text-base py-2 px-4 rounded-full whitespace-nowrap flex items-center justify-center text-sm"
                    disabled={disabled || !value}>
                    Send
                    <SendHorizontal className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </form>
    );
}; 