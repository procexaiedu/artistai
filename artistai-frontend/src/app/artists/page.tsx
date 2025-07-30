"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Artist, artistsApi } from "@/lib/apiClient";
import { ArtistTable } from "@/components/ArtistTable";
import { ArtistForm } from "@/components/ArtistForm";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArtists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await artistsApi.getArtists();
      setArtists(data);
    } catch (err) {
      setError("Erro ao carregar artistas. Verifique se o backend está rodando.");
      console.error("Erro ao carregar artistas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  const handleArtistChanged = () => {
    loadArtists();
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando artistas...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadArtists} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Artistas</h1>
            <p className="text-muted-foreground">
              Gerencie os artistas do seu catálogo
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo Artista
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Artistas
                </p>
                <p className="text-2xl font-bold">{artists.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Artistas Ativos
                </p>
                <p className="text-2xl font-bold">
                  {artists.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cachê Médio
                </p>
                <p className="text-2xl font-bold">
                  {artists.length > 0 
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        artists.reduce((sum, a) => sum + a.base_fee, 0) / artists.length
                      )
                    : "R$ 0,00"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Artistas */}
        <ArtistTable artists={artists} onArtistChanged={handleArtistChanged} />

        {/* Modal de Criação */}
        <ArtistForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleArtistChanged}
        />
      </div>
      )}
    </DashboardLayout>
  );
}