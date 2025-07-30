"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Note, notesApi, NoteCreate, NoteUpdate } from "@/lib/apiClient";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotesSectionProps {
  contractorId: string;
  contractorName: string;
}

export function NotesSection({ contractorId, contractorName }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notesApi.getNotesByContractor(contractorId);
      setNotes(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Erro ao carregar anotações:", error);
    } finally {
      setLoading(false);
    }
  }, [contractorId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      const noteData: NoteCreate = {
        contractor_id: contractorId,
        content: newNoteContent.trim(),
      };
      await notesApi.createNote(noteData);
      setNewNoteContent("");
      setShowCreateForm(false);
      loadNotes();
    } catch (error) {
      console.error("Erro ao criar anotação:", error);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editNoteContent.trim()) return;

    try {
      const updateData: NoteUpdate = {
        content: editNoteContent.trim(),
      };
      await notesApi.updateNote(editingNote.id, updateData);
      setEditingNote(null);
      setEditNoteContent("");
      loadNotes();
    } catch (error) {
      console.error("Erro ao atualizar anotação:", error);
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNote) return;

    try {
      await notesApi.deleteNote(deletingNote.id);
      setDeletingNote(null);
      loadNotes();
    } catch (error) {
      console.error("Erro ao deletar anotação:", error);
    }
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note);
    setEditNoteContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditNoteContent("");
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setNewNoteContent("");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anotações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Anotações</span>
            <Badge variant="secondary">{notes.length}</Badge>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Anotação
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Anotações sobre {contractorName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário de Nova Anotação */}
        {showCreateForm && (
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Digite sua anotação aqui..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateNote}
                    disabled={!newNoteContent.trim()}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelCreate}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Anotações */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma anotação encontrada.</p>
            <p className="text-sm">Clique em &quot;Nova Anotação&quot; para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className="relative">
                <CardContent className="pt-4">
                  {editingNote?.id === note.id ? (
                    // Modo de Edição
                    <div className="space-y-3">
                      <Textarea
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateNote}
                          disabled={!editNoteContent.trim()}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo de Visualização
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-relaxed flex-1">{note.content}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingNote(note)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {note.created_at && !isNaN(new Date(note.created_at).getTime()) ? (
                          formatDistanceToNow(new Date(note.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        ) : (
                          "Data inválida"
                        )}
                        {note.updated_at && note.updated_at !== note.created_at && !isNaN(new Date(note.updated_at).getTime()) && (
                          <span className="ml-2">
                            (editado{" "}
                            {formatDistanceToNow(new Date(note.updated_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!deletingNote} onOpenChange={() => setDeletingNote(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteNote}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}