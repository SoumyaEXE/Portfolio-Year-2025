import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MessageType } from '@/lib/types';
import { generateInitialMessages } from '@/lib/data';

const TYPING_DELAY_FACTOR = 30;
const MIN_TYPING_DELAY = 1000;
const MAX_TYPING_DELAY = 1500;

export function useMessages(skipIntroAnimation: boolean = false) {
  const [allMessages, setAllMessages] = useState<MessageType[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soundPlayed, setSoundPlayed] = useState(new Set<string>());
  const shouldPlaySound = !skipIntroAnimation;

  const playMessageSound = useCallback((messageId: string) => {
    // Prevent duplicate sound plays for the same message
    if (soundPlayed.has(messageId)) {
      return;
    }
    
    setSoundPlayed(prev => new Set(prev).add(messageId));
    const audio = new Audio('/punchy-taps.wav');
    audio.volume = 0.4;
    audio.play().catch(err => console.log('Audio play failed:', err));
  }, [soundPlayed]);

  useEffect(() => {
    setAllMessages(generateInitialMessages());
  }, []);

  useEffect(() => {
    if (allMessages.length === 0) return;
    
    if (currentIndex === 0) {
      setVisibleMessages([allMessages[0]]);
      setCurrentIndex(1);
      return;
    }
    
    if (currentIndex < allMessages.length) {
      setIsTyping(true);
      
      const message = allMessages[currentIndex];
      const contentLength = message.content?.length || 0;
      const typingDelay = Math.min(
        MAX_TYPING_DELAY, 
        Math.max(MIN_TYPING_DELAY, contentLength * TYPING_DELAY_FACTOR)
      );
      
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
        
        // Small delay to ensure typing indicator disappears first
        setTimeout(() => {
          setVisibleMessages(prev => [...prev, message]);
          setCurrentIndex(currentIndex + 1);
          
          // Play sound right as message appears (only if not skipping intro)
          if (shouldPlaySound) {
            setTimeout(() => {
              playMessageSound(message.id);
            }, 450);
          }
        }, 50);
      }, typingDelay);
      
      return () => clearTimeout(typingTimer);
    }
  }, [currentIndex, allMessages, playMessageSound, shouldPlaySound]);

  const addMessage = useCallback((content: string, sender: "user" | "assistant" = "user") => {
    const newMessage: MessageType = {
      id: uuidv4(),
      content,
      sender,
      timestamp: Date.now(),
      type: "text"
    };
    
    setAllMessages(prev => [...prev, newMessage]);
    setVisibleMessages(prev => [...prev, newMessage]);
    
    // Don't play sound for user messages, only for AI replies
    // Sound is handled separately in addAIReply for assistant messages
    
    return newMessage;
  }, []);

  const addAIReply = useCallback((content: string) => {
    // Show typing indicator first
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      // Small delay to ensure typing indicator disappears first
      setTimeout(() => {
        const aiMessage: MessageType = {
          id: uuidv4(),
          content,
          sender: "assistant",
          timestamp: Date.now(),
          type: "text"
        };
        
        setAllMessages(prev => [...prev, aiMessage]);
        setVisibleMessages(prev => [...prev, aiMessage]);
        
        // Play sound right as message appears
        setTimeout(() => {
          playMessageSound(aiMessage.id);
        }, 450);
      }, 50);
    }, 800); // Typing indicator shows for 800ms
  }, [playMessageSound]);

  const loadMoreMessages = useCallback((count: number = 3) => {
    return [...generateInitialMessages().slice(0, count)];
  }, []);

  return {
    messages: visibleMessages,
    isTyping,
    addMessage,
    addAIReply,
    loadMoreMessages,
    setAllMessages
  };
}