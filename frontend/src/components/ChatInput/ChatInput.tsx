import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(({
    value,
    onChange,
    placeholder = "Type a message...",
    disabled = false,
}, ref) => {
    return (
        <Input
            ref={ref}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-50 text-[14px] p-4 rounded-full border-none shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-0 focus:ring-0 placeholder:text-xs placeholder:px-2"
            placeholder={placeholder}
            disabled={disabled}
        />
    );
});

ChatInput.displayName = 'ChatInput'; 