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
import { Contractor, contractorsApi } from "@/lib/apiClient";
import { ContractorForm } from "./ContractorForm";

interface ContractorTableProps {
  contractors: Contractor[];
  onContractorChanged: () => void;
}

export function ContractorTable({ contractors, onContractorChanged }: ContractorTableProps) {
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [deletingContractor, setDeletingContractor] = useState<Contractor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (contractor: Contractor) => {
    setEditingContractor(contractor);
  };

  const handleDelete = (contractor: Contractor) => {
    setDeletingContractor(contractor);
  };

  const confirmDelete = async () => {
    if (!deletingContractor) return;

    try {
      setIsDeleting(true);
      await contractorsApi.deleteContractor(deletingContractor.id);
      onContractorChanged();
      setDeletingContractor(null);
    } catch (error) {
      console.error("Erro ao deletar contratante:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCpfCnpj = (cpfCnpj?: string) => {
    if (!cpfCnpj) return "-";
    return cpfCnpj;
  };

  const formatPhone = (phone: string) => {
    // Formatar telefone se necessário
    return phone;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="w-[50px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum contratante encontrado
                </TableCell>
              </TableRow>
            ) : (
              contractors.map((contractor) => (
                <TableRow key={contractor.id}>
                  <TableCell className="font-medium">{contractor.name}</TableCell>
                  <TableCell>{formatCpfCnpj(contractor.cpf_cnpj)}</TableCell>
                  <TableCell>{contractor.email || "-"}</TableCell>
                  <TableCell>{formatPhone(contractor.phone)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(contractor)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(contractor)}
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
      <ContractorForm
        contractor={editingContractor || undefined}
        open={!!editingContractor}
        onClose={() => setEditingContractor(null)}
        onSuccess={onContractorChanged}
      />

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingContractor} onOpenChange={() => setDeletingContractor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o contratante{" "}
              <strong>{deletingContractor?.name}</strong>? Esta ação não pode ser desfeita.
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