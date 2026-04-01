"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { AdminQuestionForm } from "@/components/admin-question-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Member, Question } from "@/lib/types"

const SESSION_AUTH_KEY = "camelot_admin_member"
const SESSION_PW_KEY = "camelot_admin_pw"

const CATEGORIES = [
  "College Memories",
  "Current Interests",
  "Hobbies",
  "Preferences & Favorites",
  "Habits & Quirks",
]

const CATEGORY_HINTS: Record<number, string> = {
  1: 'Try a college memory -- e.g. "What happened at the 2023 tailgate?"',
  2: 'Try a current interest -- e.g. "What show am I binge-watching right now?"',
  3: 'Try a hobby -- e.g. "What do I do every Saturday morning?"',
  4: 'Try a preference -- e.g. "What\'s my go-to Chipotle order?"',
  5: 'Try a quirk -- e.g. "What\'s my most annoying habit?"',
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    loadMembers()

    const savedMemberId = sessionStorage.getItem(SESSION_AUTH_KEY)
    const savedPw = sessionStorage.getItem(SESSION_PW_KEY)
    if (savedMemberId && savedPw) {
      setSelectedMemberId(savedMemberId)
      setPassword(savedPw)
      setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (authenticated && selectedMemberId) {
      loadQuestions(selectedMemberId)
    }
  }, [authenticated, selectedMemberId])

  async function loadMembers() {
    const { data } = await supabase.from("members").select("*").order("name")
    if (data) setMembers(data)
  }

  async function loadQuestions(memberId: string) {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("member_id", memberId)
      .order("order")
    setQuestions(data ?? [])
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMemberId) {
      setError("Select your name first.")
      return
    }
    setVerifying(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: selectedMemberId, password }),
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem(SESSION_AUTH_KEY, selectedMemberId)
        sessionStorage.setItem(SESSION_PW_KEY, password)
        setAuthenticated(true)
      } else {
        setError("Wrong password for this member.")
      }
    } catch {
      setError("Failed to verify. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  const handleQuestionSaved = useCallback(() => {
    if (selectedMemberId) {
      loadQuestions(selectedMemberId)
    }
  }, [selectedMemberId])

  function getQuestionForSlot(slot: number): Question | undefined {
    return questions.find((q) => q.order === slot)
  }

  const selectedMember = members.find((m) => m.id === selectedMemberId)

  function handleLogout() {
    sessionStorage.removeItem(SESSION_AUTH_KEY)
    sessionStorage.removeItem(SESSION_PW_KEY)
    setAuthenticated(false)
    setSelectedMemberId("")
    setPassword("")
    setQuestions([])
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">The Round Table</h1>

      <div className="mt-4 w-full max-w-xl rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-400">
        ONLY edit your own questions. Cheating will result in being blood eagled.
      </div>

      {!authenticated ? (
        <Card className="mt-8 w-full max-w-md">
          <CardHeader>
            <CardTitle>Identify Yourself, Knight</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Who are you?
                </label>
                <Select
                  value={selectedMemberId}
                  onValueChange={(value) => {
                    setSelectedMemberId(value ?? "")
                    setError("")
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your name" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your personal password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={verifying || !selectedMemberId}>
                {verifying ? "Verifying..." : "Enter the Round Table"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 w-full max-w-xl space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-foreground">
              Editing as{" "}
              <span style={{ color: selectedMember?.color }}>
                {selectedMember?.name}
              </span>
            </p>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Suggested categories:
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((slot) => (
              <Card key={slot}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {slot}
                    {getQuestionForSlot(slot) && (
                      <span className="ml-2 text-xs text-green-500">
                        (saved)
                      </span>
                    )}
                  </CardTitle>
                  {CATEGORY_HINTS[slot] && !getQuestionForSlot(slot) && (
                    <p className="text-xs text-muted-foreground italic">
                      {CATEGORY_HINTS[slot]}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <AdminQuestionForm
                    question={getQuestionForSlot(slot)}
                    slotNumber={slot}
                    memberId={selectedMemberId}
                    adminPassword={password}
                    onSaved={handleQuestionSaved}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
