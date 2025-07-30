'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Calendar,
  Users,
  DollarSign,
  Music,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface EnhancedKpiCardProps {
  title: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  target?: {
    value: number;
    label: string;
  };
  comparison?: {
    value: string | number;
    label: string;
  };
  color?: 'default' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const EnhancedKpiCard: React.FC<EnhancedKpiCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  target,
  comparison,
  color = 'default',
  size = 'md'
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Se for um valor monetário (maior que 1000), formatar como moeda
      if (val > 1000 && title.toLowerCase().includes('receita')) {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      return val.toLocaleString('pt-BR');
    }
    return val.toString();
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getCardColor = () => {
    switch (color) {
      case 'success':
        return 'border-green-200 bg-green-50/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'destructive':
        return 'border-red-200 bg-red-50/50';
      default:
        return '';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'destructive':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const calculateProgress = (): number => {
    if (!target || typeof value !== 'number') return 0;
    return Math.min(100, (value / target.value) * 100);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          title: 'text-xs',
          value: 'text-lg',
          icon: 'h-4 w-4'
        };
      case 'lg':
        return {
          card: 'p-6',
          title: 'text-base',
          value: 'text-3xl',
          icon: 'h-6 w-6'
        };
      default:
        return {
          card: 'p-4',
          title: 'text-sm',
          value: 'text-2xl',
          icon: 'h-5 w-5'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Card className={`transition-all hover:shadow-md ${getCardColor()}`}>
      <CardContent className={sizeClasses.card}>
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className={`${sizeClasses.title} font-medium`}>
            {title}
          </CardTitle>
          {icon && (
            <div className={`${getIconColor()}`}>
              {React.cloneElement(icon as React.ReactElement, {
                className: sizeClasses.icon
              })}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className={`${sizeClasses.value} font-bold`}>
            {formatValue(value)}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {/* Trend Information */}
          {trend && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                {trend.percentage}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs {trend.period}
              </span>
            </div>
          )}
          
          {/* Target Progress */}
          {target && typeof value === 'number' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Meta: {target.label}</span>
                <span className="font-medium">
                  {Math.round(calculateProgress())}%
                </span>
              </div>
              <Progress value={calculateProgress()} />
            </div>
          )}
          
          {/* Comparison */}
          {comparison && (
            <div className="flex items-center justify-between text-xs pt-1 border-t">
              <span className="text-muted-foreground">{comparison.label}:</span>
              <span className="font-medium">{formatValue(comparison.value)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de exemplo para diferentes tipos de KPIs
export const KpiCardExamples = {
  Revenue: (props: Partial<EnhancedKpiCardProps>) => (
    <EnhancedKpiCard
      title="Receita do Mês"
      icon={<DollarSign />}
      color="success"
      target={{ value: 50000, label: "R$ 50.000" }}
      {...props}
    />
  ),
  
  Events: (props: Partial<EnhancedKpiCardProps>) => (
    <EnhancedKpiCard
      title="Próximos Eventos"
      icon={<Calendar />}
      color="default"
      comparison={{ value: "3 confirmados", label: "Status" }}
      {...props}
    />
  ),
  
  Artists: (props: Partial<EnhancedKpiCardProps>) => (
    <EnhancedKpiCard
      title="Artistas Ativos"
      icon={<Music />}
      color="default"
      trend={{ direction: 'up', percentage: 12, period: 'mês anterior' }}
      {...props}
    />
  ),
  
  Leads: (props: Partial<EnhancedKpiCardProps>) => (
    <EnhancedKpiCard
      title="Leads Ativos"
      icon={<Users />}
      color="warning"
      target={{ value: 20, label: "20 leads" }}
      {...props}
    />
  )
};

export default EnhancedKpiCard;