'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Palette, 
  Layout, 
  Bell,
  Save,
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  MessageSquare,
  Zap
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  category: 'analytics' | 'communication' | 'management' | 'financial';
}

interface PersonalizationSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  widgets: DashboardWidget[];
  defaultView: 'overview' | 'detailed';
  showWelcomeMessage: boolean;
}

interface PersonalizationSettingsProps {
  onSettingsChange?: (settings: PersonalizationSettings) => void;
  initialSettings?: Partial<PersonalizationSettings>;
}

const PersonalizationSettingsComponent: React.FC<PersonalizationSettingsProps> = ({
  onSettingsChange,
  initialSettings = {}
}) => {
  const defaultWidgets: DashboardWidget[] = [
    {
      id: 'kpi-cards',
      name: 'KPIs Principais',
      description: 'Métricas principais do negócio',
      icon: <BarChart3 className="h-4 w-4" />,
      enabled: true,
      position: 1,
      size: 'large',
      category: 'analytics'
    },
    {
      id: 'action-center',
      name: 'Centro de Ações',
      description: 'Ações inteligentes sugeridas',
      icon: <Zap className="h-4 w-4" />,
      enabled: true,
      position: 2,
      size: 'medium',
      category: 'management'
    },
    {
      id: 'pipeline-chart',
      name: 'Gráfico do Pipeline',
      description: 'Visualização do funil de vendas',
      icon: <Users className="h-4 w-4" />,
      enabled: true,
      position: 3,
      size: 'medium',
      category: 'analytics'
    },
    {
      id: 'financial-chart',
      name: 'Gráfico Financeiro',
      description: 'Análise financeira mensal',
      icon: <DollarSign className="h-4 w-4" />,
      enabled: true,
      position: 4,
      size: 'medium',
      category: 'financial'
    },
    {
      id: 'recent-activities',
      name: 'Atividades Recentes',
      description: 'Últimas ações realizadas',
      icon: <MessageSquare className="h-4 w-4" />,
      enabled: true,
      position: 5,
      size: 'medium',
      category: 'communication'
    },
    {
      id: 'upcoming-events',
      name: 'Próximos Eventos',
      description: 'Agenda de eventos futuros',
      icon: <Calendar className="h-4 w-4" />,
      enabled: true,
      position: 6,
      size: 'medium',
      category: 'management'
    },
    {
      id: 'smart-notifications',
      name: 'Notificações Inteligentes',
      description: 'Alertas e lembretes automáticos',
      icon: <Bell className="h-4 w-4" />,
      enabled: true,
      position: 7,
      size: 'small',
      category: 'communication'
    },
    {
      id: 'predictive-insights',
      name: 'Insights Preditivos',
      description: 'Análises e previsões baseadas em IA',
      icon: <Zap className="h-4 w-4" />,
      enabled: true,
      position: 8,
      size: 'large',
      category: 'analytics'
    }
  ];

  const [settings, setSettings] = useState<PersonalizationSettings>({
    theme: 'system',
    compactMode: false,
    showNotifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    widgets: defaultWidgets,
    defaultView: 'overview',
    showWelcomeMessage: true,
    ...initialSettings
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('dashboard-personalization');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading personalization settings:', error);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<PersonalizationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = settings.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    updateSettings({ widgets: updatedWidgets });
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const widgets = [...settings.widgets];
    const index = widgets.findIndex(w => w.id === widgetId);
    
    if (direction === 'up' && index > 0) {
      [widgets[index], widgets[index - 1]] = [widgets[index - 1], widgets[index]];
    } else if (direction === 'down' && index < widgets.length - 1) {
      [widgets[index], widgets[index + 1]] = [widgets[index + 1], widgets[index]];
    }
    
    // Update positions
    widgets.forEach((widget, idx) => {
      widget.position = idx + 1;
    });
    
    updateSettings({ widgets });
  };

  const saveSettings = () => {
    localStorage.setItem('dashboard-personalization', JSON.stringify(settings));
    onSettingsChange?.(settings);
    setHasChanges(false);
  };

  const resetSettings = () => {
    const defaultSettings: PersonalizationSettings = {
      theme: 'system',
      compactMode: false,
      showNotifications: true,
      autoRefresh: true,
      refreshInterval: 30,
      widgets: defaultWidgets,
      defaultView: 'overview',
      showWelcomeMessage: true
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'text-blue-600';
      case 'communication': return 'text-green-600';
      case 'management': return 'text-purple-600';
      case 'financial': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'analytics': return 'Análise';
      case 'communication': return 'Comunicação';
      case 'management': return 'Gestão';
      case 'financial': return 'Financeiro';
      default: return 'Geral';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Personalização do Dashboard
        </CardTitle>
        <CardDescription>
          Configure a aparência e funcionalidades do seu dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <Label className="text-sm font-medium">Tema</Label>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'light', label: 'Claro', icon: <Sun className="h-3 w-3" /> },
              { value: 'dark', label: 'Escuro', icon: <Moon className="h-3 w-3" /> },
              { value: 'system', label: 'Sistema', icon: <Monitor className="h-3 w-3" /> }
            ].map((theme) => (
              <Button
                key={theme.value}
                variant={settings.theme === theme.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ theme: theme.value as 'light' | 'dark' | 'system' })}
                className="h-8"
              >
                {theme.icon}
                <span className="ml-1">{theme.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Display Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <Label className="text-sm font-medium">Exibição</Label>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Modo Compacto</Label>
                <p className="text-xs text-muted-foreground">
                  Reduz o espaçamento entre elementos
                </p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked: boolean) => updateSettings({ compactMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Mensagem de Boas-vindas</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe saudação personalizada
                </p>
              </div>
              <Switch
                checked={settings.showWelcomeMessage}
                onCheckedChange={(checked: boolean) => updateSettings({ showWelcomeMessage: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Atualização Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Atualiza dados automaticamente
                </p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(checked: boolean) => updateSettings({ autoRefresh: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Widget Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <Label className="text-sm font-medium">Widgets do Dashboard</Label>
          </div>
          
          <div className="space-y-2">
            {settings.widgets.map((widget, index) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={getCategoryColor(widget.category)}>
                    {widget.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{widget.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryBadge(widget.category)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {widget.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'down')}
                    disabled={index === settings.widgets.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                    className="h-6 w-6 p-0"
                  >
                    {widget.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          
          <Button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>

        {hasChanges && (
          <div className="text-xs text-muted-foreground text-center">
            Você tem alterações não salvas
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizationSettingsComponent;