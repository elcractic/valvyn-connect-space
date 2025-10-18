interface MessageProps {
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
}

const Message = ({ author, content, timestamp, avatar }: MessageProps) => {
  return (
    <div className="flex gap-3 group hover:bg-muted/30 p-2 rounded-lg transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-accent">
        <span className="text-sm font-semibold text-accent-foreground">{avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-foreground">{author}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-foreground mt-1 break-words">{content}</p>
      </div>
    </div>
  );
};

export default Message;
