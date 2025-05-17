import { motion } from "framer-motion";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading spinner component
 * @param message - Optional message to display
 * @param fullScreen - Whether to display the spinner in full screen
 */
export function Loading({ message = "Loading...", fullScreen = true }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-12 h-12 border-4 border-t-[#006833] border-gray-200 rounded-full"
      />
      <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="bg-white rounded-lg shadow-md">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md">
        {content}
      </div>
    </div>
  );
}

export default Loading;
