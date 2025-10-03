import { memo } from "react";
import Image from "next/image";

interface SocialMediaPreview {
  url: string;
  title: string;
  siteName: string;
  favicon?: string;
}

interface SocialMediaMessageProps {
  content?: string;
  preview: SocialMediaPreview;
  bubbleClass: string;
  bubbleMaxWidth: string;
}

export const SocialMediaMessage = memo(({ 
  content,
  preview,
  bubbleClass,
  bubbleMaxWidth
}: SocialMediaMessageProps) => {
  const isUserBubble = bubbleClass.includes('bubble-sent');
  
  // Extract username from title (assuming format "Username (@username) • Platform")
  const getUsername = (title: string): string => {
    const match = title.match(/\(@([^)]+)\)/);
    return match ? `@${match[1]}` : title;
  };
  
  const username = getUsername(preview.title);
  
  return (
    <div className={`${bubbleClass} px-0 py-0 ${bubbleMaxWidth} relative overflow-hidden`}>
      {content && (
        <div className="px-3 py-2">
          <p className={`text-[16px] leading-[21px] ${isUserBubble ? 'text-white' : 'text-black dark:text-white'}`}>
            {content}
          </p>
        </div>
      )}
      
      <a 
        href={preview.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center gap-3 p-3 no-underline ${
          isUserBubble 
            ? 'bg-white/10 hover:bg-white/20' 
            : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
        } rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
      >
        {preview.favicon && (
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image
              src={preview.favicon}
              alt={`${preview.siteName} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className={`text-[14px] font-semibold truncate ${isUserBubble ? 'text-white' : 'text-black dark:text-white'}`}>
            {username}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {preview.siteName}
          </div>
        </div>
        
        <div className="text-gray-400 dark:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>
      </a>
    </div>
  );
});

SocialMediaMessage.displayName = "SocialMediaMessage";