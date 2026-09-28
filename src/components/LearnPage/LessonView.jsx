"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import { TokenContext } from "@/Helper/Context";
import { LESSONS } from "@/lib/curriculum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lightbulb,
  Target,
} from "lucide-react";

const LessonView = ({ lesson }) => {
  const { challengeResults } = useContext(TokenContext);
  const result = challengeResults[lesson.id];
  const passed = result?.passed;

  const index = LESSONS.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? LESSONS[index - 1] : null;
  const next = index < LESSONS.length - 1 ? LESSONS[index + 1] : null;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All lessons
        </Link>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Lesson {index + 1} of {LESSONS.length}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {lesson.minutes} min
          </span>
          {passed && (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-3 w-3" /> Complete
            </span>
          )}
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="mt-2 text-muted-foreground">{lesson.summary}</p>
      </div>

      <div className="space-y-6">
        {lesson.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-yellow-500" /> Key points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
            {lesson.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {lesson.quiz.map((q, i) => (
        <Quiz key={i} question={q} />
      ))}

      <Card className={passed ? "border-green-500/40" : undefined}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" /> Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium">{lesson.challenge.prompt}</p>
          <p className="text-sm text-muted-foreground">{lesson.challenge.hint}</p>

          <Alert variant={passed ? "default" : "destructive"}>
            <AlertDescription className="flex items-center gap-2">
              {passed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed — {result.detail}
                </>
              ) : (
                <>Not yet — {result?.detail ?? "start trading to complete this."}</>
              )}
            </AlertDescription>
          </Alert>

          {!passed && (
            <Link href="/trade">
              <Button size="sm">
                Go to the trade desk <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <nav className="flex items-center justify-between border-t pt-4">
        {prev ? (
          <Link href={`/learn/${prev.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> {prev.title}
            </Button>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/learn/${next.id}`}>
            <Button variant="ghost" size="sm">
              {next.title} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </nav>
    </article>
  );
};

/** A single knowledge check. Reveals the explanation after answering. */
function Quiz({ question }) {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  const correct = picked === question.answer;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((option, i) => {
            const isAnswer = i === question.answer;
            const isPicked = i === picked;
            return (
              <button
                key={option}
                onClick={() => !answered && setPicked(i)}
                disabled={answered}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  answered && isAnswer
                    ? "border-green-500/50 bg-green-500/10"
                    : answered && isPicked
                    ? "border-red-500/50 bg-red-500/10"
                    : "hover:border-primary/50"
                } ${answered ? "cursor-default" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {answered && (
          <p className="text-sm text-muted-foreground">
            <span
              className={correct ? "font-medium text-green-500" : "font-medium text-red-500"}
            >
              {correct ? "Correct. " : "Not quite. "}
            </span>
            {question.explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default LessonView;
