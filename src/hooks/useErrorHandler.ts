import { useToast } from "@/hooks/use-toast";
import { handleError, AppError } from "@/utils/errorHandler";

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleErrorWithToast = (error: unknown, fallbackMessage?: string) => {
    const errorInfo = handleError(error, fallbackMessage);
    
    toast({
      title: "Error",
      description: errorInfo.message,
      variant: "destructive",
      duration: errorInfo.isRetryable ? 5000 : 7000,
    });

    return errorInfo;
  };

  const handleSuccessToast = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
    });
  };

  return {
    handleErrorWithToast,
    handleSuccessToast,
  };
};