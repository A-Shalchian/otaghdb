import { ChatView } from "@/features/chat/chat-view";

export default function AskPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Ask</h1>
        <p className="mt-1 text-sm text-soft">Qwen3.5 answers from your database and can prepare changes. Runs on this laptop.</p>
      </div>
      <ChatView />
    </div>
  );
}
