"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Settings, User, Bell } from "lucide-react";
import Link from "next/link";

const settingsCategories = [
  {
    title: "Conexões",
    description: "Gerencie suas conexões com WhatsApp e outras plataformas",
    icon: Smartphone,
    href: "/settings/connections",
    color: "bg-green-500",
  },
  {
    title: "Perfil",
    description: "Configurações da sua conta e informações pessoais",
    icon: User,
    href: "/settings/profile",
    color: "bg-blue-500",
  },
  {
    title: "Notificações",
    description: "Configure como e quando receber notificações",
    icon: Bell,
    href: "/settings/notifications",
    color: "bg-orange-500",
  },
  {
    title: "Geral",
    description: "Configurações gerais do sistema",
    icon: Settings,
    href: "/settings/general",
    color: "bg-gray-500",
  },
];

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {settingsCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${category.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={category.href}>
                      Configurar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}