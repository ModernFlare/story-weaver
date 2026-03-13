/**
 * Лаб. раб. №6: Компонент like/dislike — обновление без перезагрузки страницы
 * Передача данных в JSON, realtime-обновление через WebSocket
 */
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactions } from "@/hooks/use-reactions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReactionButtonsProps {
  productId: number;
}

const ReactionButtons = ({ productId }: ReactionButtonsProps) => {
  const { likes, dislikes, userReaction, react, loading } = useReactions(productId);
  const { user } = useAuth();

  const handleReact = (type: "like" | "dislike") => {
    if (!user) {
      toast.error("Войдите в аккаунт, чтобы оценить товар");
      return;
    }
    react(type);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2 gap-1 text-xs",
          userReaction === "like" && "text-primary bg-primary/10"
        )}
        onClick={() => handleReact("like")}
        disabled={loading}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        {likes > 0 && <span>{likes}</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2 gap-1 text-xs",
          userReaction === "dislike" && "text-destructive bg-destructive/10"
        )}
        onClick={() => handleReact("dislike")}
        disabled={loading}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
        {dislikes > 0 && <span>{dislikes}</span>}
      </Button>
    </div>
  );
};

export default ReactionButtons;
