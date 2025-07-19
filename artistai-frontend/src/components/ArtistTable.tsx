"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Artist, artistsApi } from "@/lib/apiClient";
import { ArtistForm } from "./ArtistForm";

interface ArtistTableProps {
  artists: Artist[];
  onArtistChanged: () => void;
}

export function ArtistTable({ artists, onArtistChanged }: ArtistTableProps) {
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [deletingArtist, setDeletingArtist] = useState<Artist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
  };

  const handleDelete = (artist: Artist) => {
    setDeletingArtist(artist);
  };

  const confirmDelete = async () => {
    if (!deletingArtist) return;

    try {
      setIsDeleting(true);
      await artistsApi.deleteArtist(deletingArtist.id);
      onArtistChanged();
      setDeletingArtist(null);
    } catch (error) {
      console.error("Erro ao deletar artista:", error);
      // TODO: Implementar notificação de erro
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatStatus = (status: string) => {
    return status === "active" ? "Ativo" : "Inativo";
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "text-green-600 bg-green-100" 
      : "text-red-600 bg-red-100";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade Base</TableHead>
              <TableHead>Cachê Base</TableHead>
              <TableHead>Cachê Mínimo</TableHead>
              <TableHead>% Entrada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum artista encontrado
                </TableCell>
              </TableRow>
            ) : (
              artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">{artist.name}</TableCell>
                  <TableCell>{artist.base_city || "-"}</TableCell>
                  <TableCell>{formatCurrency(artist.base_fee)}</TableCell>
                  <TableCell>{formatCurrency(artist.min_fee)}</TableCell>
                  <TableCell>{artist.down_payment_percentage}%</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        artist.status
                      )}`}
                    >
                      {formatStatus(artist.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(artist)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(artist)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Edição */}
      <ArtistForm
        artist={editingArtist || undefined}
        open={!!editingArtist}
        onClose={() => setEditingArtist(null)}
        onSuccess={onArtistChanged}
      />

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingArtist} onOpenChange={() => setDeletingArtist(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o artista{" "}
              <strong>{deletingArtist?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 