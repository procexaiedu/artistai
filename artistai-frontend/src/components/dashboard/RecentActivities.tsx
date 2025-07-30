import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare, 
  UserPlus, 
  TrendingUp,
  Activity
} from "lucide-react";
import { RecentActivity } from "@/lib/apiClient";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'event':
      case 'evento':
        return Calendar;
      case 'contractor':
      case 'contratante':
        return Users;
      case 'transaction':
      case 'transacao':
        return DollarSign;
      case 'conversation':
      case 'conversa':
        return MessageSquare;
      case 'lead':
        return UserPlus;
      case 'revenue':
      case 'receita':
        return TrendingUp;
      default:
        return Activity;
    }
  };

  const getIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'event':
      case 'evento':
        return 'text-blue-600';
      case 'contractor':
      case 'contratante':
        return 'text-purple-600';
      case 'transaction':
      case 'transacao':
        return 'text-green-600';
      case 'conversation':
      case 'conversa':
        return 'text-orange-600';
      case 'lead':
        return 'text-indigo-600';
      case 'revenue':
      case 'receita':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma atividade recente encontrada
          </p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 8).map((activity, index) => {
              const IconComponent = getIcon(activity.type);
              const iconColor = getIconColor(activity.type);
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${iconColor} bg-transparent`}>
                      <IconComponent className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}