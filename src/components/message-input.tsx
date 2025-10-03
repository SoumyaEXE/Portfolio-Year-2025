import { motion } from "framer-motion";
import { memo, useCallback, useRef, useState } from "react";

interface MessageInputProps {
  onSend?: (content: string) => void;
  onReceiveReply?: (reply: string) => void;
  isEnabled?: boolean;
  placeholder?: string;
}

const ANIMATION_CONFIG = {
  tap: { 
    scale: 0.94,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 25
    }
  },
  focus: { 
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  blur: { 
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    scale: 1,
    transition: { duration: 0.2 }
  },
  buttonHover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  opacity: { duration: 0.2 },
  background: { duration: 0.2 }
} as const;

const AppStoreIcon = memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="22" 
    height="22" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-white/80"
  >
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
));

AppStoreIcon.displayName = 'AppStoreIcon';

const SendIcon = memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m12 19V5"></path>
    <path d="m5 12 7-7 7 7"></path>
  </svg>
));

SendIcon.displayName = 'SendIcon';

const AppStoreButton = memo(({ isEnabled }: { isEnabled: boolean }) => (
  <motion.button 
    className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-white/70 focus:outline-none"
    whileHover={isEnabled ? ANIMATION_CONFIG.buttonHover : undefined}
    whileTap={ANIMATION_CONFIG.tap}
    aria-label="App Store"
    disabled={!isEnabled}
  >
    <AppStoreIcon />
  </motion.button>
));

AppStoreButton.displayName = 'AppStoreButton';

const MessageInput = memo<MessageInputProps>(({ 
  onSend,
  onReceiveReply,
  isEnabled = true, 
  placeholder = "Say Hi ..." 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSend = useCallback(async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || !isEnabled || isLoading) return;
    
    onSend?.(trimmedValue);
    setInputValue("");
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedValue }),
      });
      
      if (response.ok) {
        const data = await response.json();
        onReceiveReply?.(data.reply);
      } else {
        onReceiveReply?.("yo my bad, something went wrong. try again? 🤔");
      }
    } catch (error) {
      console.error('Chat error:', error);
      onReceiveReply?.("oops, couldn't connect rn. maybe refresh? 💭");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [inputValue, isEnabled, isLoading, onSend, onReceiveReply]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && isEnabled) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend, isEnabled]);

  const canSend = inputValue.trim() && isEnabled;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2">
        <AppStoreButton isEnabled={isEnabled} />
        
        <motion.div 
          className="flex-grow flex items-center bg-white/10 rounded-full transition-all h-9 px-4"
          animate={isFocused && isEnabled ? ANIMATION_CONFIG.focus : ANIMATION_CONFIG.blur}
          initial={false}
          transition={ANIMATION_CONFIG.background}
        >
          <input 
            ref={inputRef}
            className="bg-transparent text-white w-full resize-none outline-none border-none text-sm placeholder:text-white/40 focus:outline-none focus:border-none focus:ring-0"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={!isEnabled}
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          />
        </motion.div>
        
        <motion.button 
          onClick={handleSend}
          className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full focus:outline-none ${
            canSend 
              ? "bg-blue-500 text-white" 
              : "bg-white/10 text-white/40"
          }`}
          whileHover={canSend ? { 
            scale: 1.1,
            rotate: -10,
            transition: { type: "spring", stiffness: 400, damping: 20 }
          } : undefined}
          whileTap={canSend ? ANIMATION_CONFIG.tap : {}}
          initial={false}
          animate={{ 
            opacity: isEnabled ? 1 : 0.7,
            scale: canSend ? [1, 1.05, 1] : 1,
            transition: {
              opacity: ANIMATION_CONFIG.opacity,
              scale: { duration: 0.3, times: [0, 0.5, 1] }
            }
          }}
          aria-label="Send message"
          disabled={!canSend}
        >
          <motion.div
            animate={canSend ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <SendIcon />
          </motion.div>
        </motion.button>
      </div>
      
      <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent mx-auto mt-2.5 rounded-full"></div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';
export { MessageInput };