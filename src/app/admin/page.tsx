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
  1: 'Inscribe a college memory -- "What befell us at the 2023 tailgate?"',
  2: 'Inscribe a current interest -- "What spectacle am I watching of late?"',
  3: 'Inscribe a hobby -- "What pursuit occupies my Saturday mornings?"',
  4: 'Inscribe a preference -- "What is my customary order at Chipotle?"',
  5: 'Inscribe a quirk -- "What habit of mine vexes the household most?"',
}

const SCROLL_LABELS: Record<number, string> = {
  1: "Scroll I",
  2: "Scroll II",
  3: "Scroll III",
  4: "Scroll IV",
  5: "Scroll V",
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
      setError("Select thy name first.")
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
        setError("The password doth not match. Try again.")
      }
    } catch {
      setError("Verification failed. Pray, try once more.")
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
      <h1 className="text-3xl font-display text-gold-gradient tracking-wide">
        The Round Table
      </h1>

      <div className="mt-6 w-full max-w-xl scroll-card rounded-lg border-[#8b2942]/30 bg-[#8b2942]/10 p-4 text-center text-sm text-[#d4636e]">
        ONLY edit your own questions. Cheating will result in being blood eagled.
      </div>

      {!authenticated ? (
        <Card className="mt-8 w-full max-w-md scroll-card glow-gold border-[#c9a84c]/15">
          <CardHeader>
            <CardTitle className="font-display text-xl tracking-wide text-foreground">
              Identify Thyself, Knight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Who art thou?
                </label>
                <Select
                  value={selectedMemberId}
                  onValueChange={(value) => {
                    setSelectedMemberId(value ?? "")
                    setError("")
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select thy name" />
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
                  Thy password
                </label>
                <Input
                  type="password"
                  placeholder="Speak the secret word"
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
            <p className="text-lg font-display tracking-wide text-foreground">
              Editing as{" "}
              <span className="font-bold" style={{ color: selectedMember?.color }}>
                {selectedMember?.name}
              </span>
            </p>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              Depart
            </Button>
          </div>

          <div className="scroll-card rounded-lg p-4">
            <p className="text-sm font-display tracking-wide text-foreground mb-3">
              Suggested categories:
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-3 py-1 text-xs text-[#c9a84c]/80"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((slot) => (
              <Card key={slot} className="scroll-card glow-gold-hover border-[#c9a84c]/10">
                <CardHeader>
                  <CardTitle className="text-lg font-display tracking-wide">
                    {SCROLL_LABELS[slot]}
                    {getQuestionForSlot(slot) && (
                      <span className="ml-2 text-xs text-[#c9a84c]/70 font-sans italic">
                        (inscribed)
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
