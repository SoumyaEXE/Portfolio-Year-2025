"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMessages } from "@/hooks/useMessages";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";
import MessageList from "@/components/message-list";
import StaticMessageList from "@/components/static-message-list";
import { MessageInput } from "@/components/message-input";
import CompactHeader from "@/components/compact-header";
import NewMessagesNotification from "@/components/new-messages-notification";
import TypingIndicator from "@/components/typing-indicator";
import type { MessageType } from "@/lib/types";

interface MessagingAppProps {
  skipIntroAnimation?: boolean;
}

const TIMING_CONFIG = {
  charDelay: 20,
  minDuration: 200,
  maxDuration: 1500,
  timestampVisibility: 100,
  scrollToBottom: 100,
  typingIndicatorAnimation: 100
} as const;

const ANIMATION_CONFIG = {
  typing: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 5 },
    transition: { duration: TIMING_CONFIG.typingIndicatorAnimation / 1000 }
  },
  noTyping: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 1, y: 0 },
    transition: { duration: 0 }
  }
} as const;

const LAYOUT_CONFIG = {
  topGradient: "absolute top-0 left-0 right-0 h-16 sm:h-20 z-10 pointer-events-none",
  container: "flex-1 overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col scrollbar-hide px-3",
  footer: "bg-black/95 backdrop-blur-sm w-full flex-shrink-0 border-t border-white/5",
  footerGradient: "absolute top-[-1px] inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
} as const;

const useTypingCalculation = () => {
  const calculateTypingDelay = useCallback((content: string) => {
    return Math.min(
      Math.max(
        TIMING_CONFIG.minDuration,
        content.length * TIMING_CONFIG.charDelay
      ),
      TIMING_CONFIG.maxDuration
    );
  }, []);

  return { calculateTypingDelay };
};

const useMessageReveal = (
  messages: MessageType[],
  skipIntroAnimation: boolean
) => {
  const [visibleMessages, setVisibleMessages] = useState<MessageType[]>(
    skipIntroAnimation ? messages : []
  );
  const [isGraduallyTyping, setIsGraduallyTyping] = useState(!skipIntroAnimation);
  const prevProcessedMessagesLength = useRef(0);
  const { calculateTypingDelay } = useTypingCalculation();

  useEffect(() => {
    if (skipIntroAnimation) {
      setIsGraduallyTyping(false);
      return;
    }
  }, [skipIntroAnimation]);

  useEffect(() => {
    if (skipIntroAnimation) {
      // When skipping intro, always keep visibleMessages in sync with messages
      if (messages.length !== visibleMessages.length) {
        setVisibleMessages(messages);
        prevProcessedMessagesLength.current = messages.length;
      }
      setIsGraduallyTyping(false);
      return;
    }
    
    if (messages.length === 0 || messages.length <= prevProcessedMessagesLength.current) {
      return;
    }

    const nextMessageToReveal = messages[visibleMessages.length];
    if (!nextMessageToReveal) {
      if (prevProcessedMessagesLength.current < messages.length) {
        prevProcessedMessagesLength.current = messages.length;
      }
      return;
    }

    setIsGraduallyTyping(true);

    const typingDelay = calculateTypingDelay(nextMessageToReveal.content || "");

    const timer = setTimeout(() => {
      setIsGraduallyTyping(false);
      setVisibleMessages((current) => {
        const newVisible = [...current, nextMessageToReveal];
        prevProcessedMessagesLength.current = newVisible.length;
        return newVisible;
      });
    }, typingDelay);

    return () => clearTimeout(timer);
  }, [messages, visibleMessages, skipIntroAnimation, calculateTypingDelay]);

  return { visibleMessages, isGraduallyTyping };
};

const useNotificationState = (isScrolledUp: boolean, messages: MessageType[]) => {
  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    if (isScrolledUp && messages.length > 0) {
      setNewMessageCount(prevCount => {
        if (prevCount < messages.length) {
          return prevCount + 1;
        }
        return prevCount;
      });
    }
  }, [isScrolledUp, messages.length]);

  return { newMessageCount, setNewMessageCount };
};

const TopGradient = () => (
  <div className={LAYOUT_CONFIG.topGradient}>
    <div className="w-full h-full bg-gradient-to-b from-black via-black/80 to-transparent"></div>
  </div>
);

const FooterSection = ({ onSend, onReceiveReply }: { onSend: (content: string) => void; onReceiveReply: (reply: string) => void }) => (
  <div className={LAYOUT_CONFIG.footer}>
    <div className={LAYOUT_CONFIG.footerGradient}></div>
    <MessageInput onSend={onSend} onReceiveReply={onReceiveReply} isEnabled />
  </div>
);

const SafeAreaSpacer = ({ position }: { position: 'top' | 'bottom' }) => (
  <div className={`h-safe-area-${position} bg-black flex-shrink-0`}></div>
);

const MessagingApp = ({ skipIntroAnimation = false }: MessagingAppProps) => {
  const { messages, isTyping: isApiTyping, addMessage, addAIReply } = useMessages(skipIntroAnimation);
  const [isTimestampVisible, setIsTimestampVisible] = useState(false);

  const { visibleMessages, isGraduallyTyping } = useMessageReveal(messages, skipIntroAnimation);

  const {
    containerRef,
    isScrolledUp,
    isHeaderScrolled,
    scrollToBottom,
    autoScrollOnNewContent,
  } = useScrollBehavior();

  const { newMessageCount, setNewMessageCount } = useNotificationState(isScrolledUp, messages);

  const isTyping = skipIntroAnimation ? false : (isApiTyping || isGraduallyTyping);
  const showCompactHeader = isHeaderScrolled && !isTimestampVisible;
  const typingAnimationConfig = skipIntroAnimation ? ANIMATION_CONFIG.noTyping : ANIMATION_CONFIG.typing;

  const handleTimestampVisibilityChange = useCallback((isVisible: boolean) => {
    setTimeout(() => {
      setIsTimestampVisible(isVisible);
    }, isVisible ? 0 : TIMING_CONFIG.timestampVisibility);
  }, []);

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
    setNewMessageCount(0);
  }, [scrollToBottom, setNewMessageCount]);

  const handleSendMessage = useCallback((content: string) => {
    addMessage(content);
    setTimeout(scrollToBottom, TIMING_CONFIG.scrollToBottom);
    setNewMessageCount(0);
  }, [addMessage, scrollToBottom, setNewMessageCount]);

  const handleReceiveReply = useCallback((reply: string) => {
    // Use addAIReply which handles typing indicator and correct sender
    addAIReply(reply);
    setTimeout(scrollToBottom, TIMING_CONFIG.scrollToBottom + 1000);
  }, [addAIReply, scrollToBottom]);

  useEffect(() => {
    autoScrollOnNewContent();
  }, [visibleMessages, isTyping, autoScrollOnNewContent]);

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      <SafeAreaSpacer position="top" />
      <TopGradient />
      
      <CompactHeader isVisible={showCompactHeader} />

      <AnimatePresence>
        {isScrolledUp && newMessageCount > 0 && showCompactHeader && (
          <NewMessagesNotification
            count={2}
            onClick={handleScrollToBottom}
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className={LAYOUT_CONFIG.container}
        style={{ 
          WebkitOverflowScrolling: "touch", 
          scrollbarWidth: "none", 
          msOverflowStyle: "none" 
        }}
      >
        {skipIntroAnimation ? (
          <StaticMessageList />
        ) : (
          <MessageList
            messages={visibleMessages}
            onTimestampVisibilityChange={handleTimestampVisibilityChange}
            skipAnimation={skipIntroAnimation}
          />
        )}
        <div className="h-4"></div>
      </div>

      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="px-3 pt-1 pb-1"
            {...typingAnimationConfig}
          >
            <TypingIndicator showAvatar skipAnimation={skipIntroAnimation} />
          </motion.div>
        )}
      </AnimatePresence>

      <FooterSection onSend={handleSendMessage} onReceiveReply={handleReceiveReply} />
      <SafeAreaSpacer position="bottom" />
    </div>
  );
};

export default MessagingApp;