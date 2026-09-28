import { notFound } from "next/navigation";
import { LESSONS, getLesson } from "@/lib/curriculum";
import LessonView from "@/components/LearnPage/LessonView";

// Required for `output: "export"` — enumerate every lesson route at build time.
export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) return { title: "Lesson not found" };
  return { title: `${lesson.title} — TokenExchange`, description: lesson.summary };
}

export default async function LessonPage({ params }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();

  // The `check` function can't cross the server/client boundary, so pass only
  // serialisable content; the client resolves challenge state from context.
  const { challenge, ...rest } = lesson;
  const safeLesson = {
    ...rest,
    challenge: { id: challenge.id, prompt: challenge.prompt, hint: challenge.hint },
  };

  return <LessonView lesson={safeLesson} />;
}
