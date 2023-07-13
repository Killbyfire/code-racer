import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";
import ReviewButtons from "./review-buttons";

export default async function ReviewPage() {
  const user = await getCurrentUser();

  if (user?.role !== "ADMIN") notFound();

  const downvotedSnippets = await prisma.snippet.findMany({
    // Get snippets that are too much downvoted by community
    // where: {
    //   rating: -10
    // }
  });

  return (
    <div className="container flex flex-col items-center max-w-2xl p-4 space-y-4">
      <h1 className="text-4xl">Review page </h1>
      {downvotedSnippets.map((s) => (
        <div
          className="flex flex-col gap-4 w-full max-w-sm rounded border border-border p-4"
          key={s.id}
        >
          <code className="text-muted-foreground">{s.code}</code>
          <span className="text-sm">Total characters: {s.code.length}</span>
          <ReviewButtons snippetId={s.id} />
        </div>
      ))}
    </div>
  );
}
