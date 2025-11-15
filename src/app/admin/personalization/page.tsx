'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

type Personalization = {
  _id?: string
  writerId: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  bgButtonColor: string
  buttonTextColor: string
  textColor: string
  createdAt?: string
  updatedAt?: string
}

export default function AdminPersonalizationPage() {
  const [personalizations, setPersonalizations] = useState<Personalization[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Omit<Personalization, '_id'>>({
    writerId: '',
    primaryColor: '#22c55e',
    secondaryColor: '#0f172a',
    backgroundColor: '#ffffff',
    bgButtonColor: '#22c55e',
    buttonTextColor: '#ffffff',
    textColor: '#000000',
  })

  // ====================== LOAD ======================
  async function loadData() {
    try {
      setLoading(true)
      const res = await fetch('/api/personalization', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data)) setPersonalizations(data)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar personalizações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ====================== SAVE ======================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.writerId) return toast.error('Informe o Writer ID')

    setSaving(true)
    try {
      const res = await fetch('/api/personalization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success('Personalização salva com sucesso!')
        setForm({
          writerId: '',
          primaryColor: '#22c55e',
          secondaryColor: '#0f172a',
          backgroundColor: '#ffffff',
          bgButtonColor: '#22c55e',
          buttonTextColor: '#ffffff',
          textColor: '#000000',
        })
        loadData()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Falha ao salvar.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro inesperado ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  // ====================== DELETE ======================
  async function handleDelete(writerId: string) {
    if (!confirm('Excluir esta personalização?')) return

    try {
      const res = await fetch(`/api/personalization?writerId=${writerId}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.deletedCount > 0) {
        toast.success('Personalização removida!')
        loadData()
      } else {
        toast.warning('Nenhuma personalização encontrada.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao excluir.')
    }
  }

  // ====================== RENDER ======================
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Personalizations</h1>
        <p className="text-muted-foreground">
          Gerencie as cores e temas visuais de cada escritor.
        </p>
      </div>

      <Separator />

      {/* FORMULÁRIO */}
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Criar / Atualizar Personalização</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Writer ID</Label>
              <Input
                value={form.writerId}
                onChange={(e) => setForm({ ...form, writerId: e.target.value })}
                placeholder="writer_123"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'primaryColor', label: 'Primary Color' },
                { key: 'secondaryColor', label: 'Secondary Color' },
                { key: 'backgroundColor', label: 'Background Color' },
                { key: 'bgButtonColor', label: 'Button BG' },
                { key: 'buttonTextColor', label: 'Button Text' },
                { key: 'textColor', label: 'Text Color' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="color"
                    value={(form as any)[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Personalização'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* LISTAGEM */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          Personalizações Existentes
        </h2>
        {loading ? (
          <p>Carregando...</p>
        ) : personalizations.length === 0 ? (
          <p className="text-muted-foreground">Nenhum registro encontrado.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizations.map((p) => (
              <Card key={p.writerId}>
                <CardHeader>
                  <CardTitle className="truncate">
                    Writer ID: {p.writerId}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {[
                      { color: p.primaryColor, label: 'Primary' },
                      { color: p.secondaryColor, label: 'Secondary' },
                      { color: p.backgroundColor, label: 'Background' },
                      { color: p.bgButtonColor, label: 'Button BG' },
                      { color: p.buttonTextColor, label: 'Button Text' },
                      { color: p.textColor, label: 'Text' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: c.color }}
                        />
                        <span>
                          {c.label}: {c.color}
                        </span>
                      </div>
                    ))}

                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleDelete(p.writerId)}
                    >
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
