"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Question } from "@/lib/types"

interface AdminQuestionFormProps {
  question?: Question
  slotNumber: number
  memberId: string
  adminPassword: string
  onSaved: () => void
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const

export function AdminQuestionForm({
  question,
  slotNumber,
  memberId,
  adminPassword,
  onSaved,
}: AdminQuestionFormProps) {
  const [questionText, setQuestionText] = useState(
    question?.question_text ?? ""
  )
  const [options, setOptions] = useState<string[]>(
    question?.options ?? ["", "", "", ""]
  )
  const [correctIndex, setCorrectIndex] = useState<number | null>(
    question?.correct_index ?? null
  )
  const [saving, setSaving] = useState(false)

  function updateOption(index: number, value: string) {
    setOptions((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function validate(): string | null {
    if (!questionText.trim()) return "Question text is required."
    for (let i = 0; i < 4; i++) {
      if (!options[i]?.trim()) return `Option ${OPTION_LABELS[i]} is required.`
    }
    if (correctIndex === null) return "Select the correct answer."
    return null
  }

  async function handleSave() {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPassword,
          member_id: memberId,
          question_text: questionText.trim(),
          options: options.map((o) => o.trim()),
          correct_index: correctIndex,
          order: slotNumber,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to save question")
      }

      toast.success("Question saved successfully.")
      onSaved()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save question"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Question Text
        </label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question..."
          rows={3}
        />
      </div>

      <div className="space-y-3">
        {OPTION_LABELS.map((label, index) => (
          <div key={label} className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Option {label}
            </label>
            <Input
              value={options[index]}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Enter option ${label}...`}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Correct Answer
        </label>
        <RadioGroup
          value={correctIndex !== null ? String(correctIndex) : undefined}
          onValueChange={(value: string | number) =>
            setCorrectIndex(Number(value))
          }
        >
          <div className="flex gap-4">
            {OPTION_LABELS.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <RadioGroupItem value={index} />
                <label className="text-sm cursor-pointer">{label}</label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? "Saving..." : "Save Question"}
      </Button>
    </div>
  )
}
