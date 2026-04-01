"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { MEMBERS_CONFIG } from "@/lib/constants"
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

const SESSION_AUTH_KEY = "camelot_admin_auth"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")

  const [members, setMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const savedAuth = sessionStorage.getItem(SESSION_AUTH_KEY)
    if (savedAuth) {
      setPassword(savedAuth)
      setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadMembers()
    }
  }, [authenticated])

  useEffect(() => {
    if (selectedMemberId) {
      loadQuestions(selectedMemberId)
    }
  }, [selectedMemberId])

  async function loadMembers() {
    const { data } = await supabase.from("members").select("*").order("name")
    if (data) {
      setMembers(data)
    }
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
    setVerifying(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem(SESSION_AUTH_KEY, password)
        setAuthenticated(true)
      } else {
        setError("Invalid password.")
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

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">The Round Table</h1>

      <div className="mt-4 w-full max-w-xl rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-400">
        ONLY edit your own questions. Cheating will result in being blood eagled.
      </div>

      {!authenticated ? (
        <Card className="mt-8 w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={verifying}>
                {verifying ? "Verifying..." : "Authenticate"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 w-full max-w-xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Who are you?
            </label>
            <Select
              value={selectedMemberId}
              onValueChange={(value) => setSelectedMemberId(value ?? "")}
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

          {selectedMemberId && (
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
          )}
        </div>
      )}
    </main>
  )
}
