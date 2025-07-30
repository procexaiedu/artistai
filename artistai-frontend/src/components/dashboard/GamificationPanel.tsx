'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap,
  Award,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Clock,
  Flame,
  Crown,
  Medal,
  Gift,
  Sparkles
} from 'lucide-react';
import { dashboardApi, UserStats, Achievement, Challenge } from '@/lib/apiClient';

// Tipos locais para UI específica
interface LocalAchievement extends Achievement {
  reward: {
    type: 'points' | 'badge' | 'feature';
    value: string;
  };
}

interface LocalChallenge extends Challenge {
  // Challenge já tem todas as propriedades necessárias
}

interface LocalUserStats extends UserStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  rank: string;
  completedAchievements: number;
  totalAchievements: number;
}

interface GamificationPanelProps {
  className?: string;
  userId?: string;
  onViewAchievements?: () => void;
  onViewLeaderboard?: () => void;
  onClaimReward?: (achievementId: string) => void;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({
  className,
  userId,
  onViewAchievements = () => console.log('View Achievements'),
  onViewLeaderboard = () => console.log('View Leaderboard'),
  onClaimReward = () => console.log('Claim Reward')
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'ranking'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real data from API
  const [userStats, setUserStats] = useState<LocalUserStats | null>(null);

  const [achievements, setAchievements] = useState<LocalAchievement[]>([]);

  const [challenges, setChallenges] = useState<LocalChallenge[]>([]);

  // Load data from API
  useEffect(() => {
    const loadGamificationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsData, achievementsData, challengesData] = await Promise.all([
           dashboardApi.getUserStats(userId || 'default'),
           dashboardApi.getUserAchievements(userId || 'default'),
           dashboardApi.getUserChallenges(userId || 'default')
         ]);
         
         // Transform achievements data
         const transformedAchievements: LocalAchievement[] = (achievementsData || []).map(achievement => ({
           ...achievement,
           reward: {
             type: 'points' as const,
             value: `${achievement.points_reward} pontos`
           }
         }));
         const transformedChallenges = challengesData || [];
         
         // Transform user stats to include UI-specific properties
         const transformedUserStats: LocalUserStats = {
           ...statsData,
           level: Math.floor(statsData.total_points / 1000) + 1,
           currentXP: statsData.total_points % 1000,
           nextLevelXP: 1000,
           rank: statsData.total_points > 5000 ? 'Expert' : statsData.total_points > 2000 ? 'Advanced' : 'Beginner',
           completedAchievements: transformedAchievements.filter(a => a.unlocked_at).length,
           totalAchievements: transformedAchievements.length
         };
        
        setUserStats(transformedUserStats);
         setAchievements(transformedAchievements);
         setChallenges(transformedChallenges);
      } catch (err) {
        console.error('Error loading gamification data:', err);
        setError('Erro ao carregar dados de gamificação');
      } finally {
        setLoading(false);
      }
    };

    loadGamificationData();
  }, [userId]);

  // Handle claim reward
   const handleClaimReward = async (achievementId: string) => {
     try {
       // TODO: Implement claim reward API endpoint
       console.log('Claiming reward for achievement:', achievementId);
       // Reload achievements to update status
       const updatedAchievementsData = await dashboardApi.getUserAchievements(userId || 'default');
       const transformedUpdatedAchievements: LocalAchievement[] = (updatedAchievementsData || []).map(achievement => ({
         ...achievement,
         reward: {
           type: 'points' as const,
           value: `${achievement.points_reward} pontos`
         }
       }));
       setAchievements(transformedUpdatedAchievements);
     } catch (err) {
       console.error('Error claiming reward:', err);
     }
   };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-200';
      case 'rare': return 'text-blue-600 border-blue-200';
      case 'epic': return 'text-purple-600 border-purple-200';
      case 'legendary': return 'text-yellow-600 border-yellow-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'text-green-600';
      case 'communication': return 'text-blue-600';
      case 'events': return 'text-purple-600';
      case 'growth': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d restantes`;
    if (hours > 0) return `${hours}h restantes`;
    return 'Expira em breve';
  };

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Calendar: <Calendar className="h-4 w-4" />,
      DollarSign: <DollarSign className="h-4 w-4" />,
      MessageSquare: <MessageSquare className="h-4 w-4" />,
      TrendingUp: <TrendingUp className="h-4 w-4" />,
      Users: <Users className="h-4 w-4" />,
      Target: <Target className="h-4 w-4" />,
    };
    return iconMap[iconName] || <Star className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Gamificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userStats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Gamificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              {error || 'Erro ao carregar dados'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress based on available data
   const nextLevelXP = userStats.level * 1000; // Simple calculation for next level
   const levelProgress = (userStats.total_points % 1000) / 10; // Progress within current level
   const totalAchievements = achievements.length;
   const completedAchievements = achievements.filter(a => a.unlocked).length;
   const achievementProgress = totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Gamificação
        </CardTitle>
        <CardDescription>
          Acompanhe seu progresso e conquiste recompensas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Level and Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold">Nível {userStats.level}</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {userStats.rank}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{userStats.best_streak} dias</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {userStats.total_points.toLocaleString()}</span>
              <span>{nextLevelXP.toLocaleString()}</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {nextLevelXP - userStats.total_points} XP para o próximo nível
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-primary">{userStats.total_points.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Pontos Totais</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{completedAchievements}</div>
            <div className="text-xs text-muted-foreground">Conquistas</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{userStats.best_streak}</div>
            <div className="text-xs text-muted-foreground">Sequência</div>
          </div>
        </div>

        <Separator />

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { id: 'overview', label: 'Visão Geral', icon: <Trophy className="h-3 w-3" /> },
            { id: 'achievements', label: 'Conquistas', icon: <Award className="h-3 w-3" /> },
            { id: 'challenges', label: 'Desafios', icon: <Target className="h-3 w-3" /> }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as 'achievements' | 'challenges' | 'ranking')}
              className="flex-1 h-8 text-xs"
            >
              {tab.icon}
              <span className="ml-1 hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Recent Achievements */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Conquistas Recentes
              </h4>
              {achievements.filter(a => a.unlocked_at).slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className={getCategoryColor(achievement.category)}>
                    {getIconComponent(achievement.icon as string)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                  <Badge className={getRarityBadgeColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                </div>
              ))})
            </div>

            {/* Active Challenges */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Desafios Ativos
              </h4>
              {challenges.filter(c => !c.is_completed).slice(0, 2).map((challenge) => (
                <div key={challenge.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">{getIconComponent('Target')}</div>
                      <span className="text-sm font-medium">{challenge.name}</span>
                    </div>
                    <Badge className={getChallengeTypeColor(challenge.type)}>
                      {challenge.type}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{challenge.current_progress} / {challenge.target_value}</span>
                      <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
                    </div>
                    <Progress value={challenge.progress_percentage} className="h-1" />
                  </div>
                </div>
              ))})
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 border rounded-lg transition-all ${
                  achievement.unlocked_at ? 'bg-green-50 border-green-200' : 'hover:shadow-sm'
                } ${getRarityColor(achievement.rarity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 ${getCategoryColor(achievement.category)}`}>
                      {getIconComponent(achievement.icon as string)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{achievement.name}</span>
                        <Badge className={getRarityBadgeColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        {achievement.unlocked_at && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {!achievement.unlocked_at && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progresso</span>
                            <span>{achievement.progress} / 100</span>
                          </div>
                          <Progress 
                            value={achievement.progress} 
                            className="h-1" 
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <Gift className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Recompensa: {achievement.points_reward} pontos
                        </span>
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked_at && (
                    <Button size="sm" variant="outline" onClick={() => handleClaimReward(achievement.id)}>
                      <Gift className="h-3 w-3 mr-1" />
                      Resgatar
                    </Button>
                  )}
                </div>
              </div>
            ))})
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-3 border rounded-lg ${
                  challenge.is_completed ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-muted-foreground">{getIconComponent('Target')}</div>
                    <span className="text-sm font-medium">{challenge.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getChallengeTypeColor(challenge.type)}>
                      {challenge.type}
                    </Badge>
                    {challenge.is_completed && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">
                  {challenge.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progresso: {challenge.current_progress} / {challenge.target_value}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(challenge.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <Progress 
                    value={challenge.progress_percentage} 
                    className="h-2" 
                  />
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {challenge.points_reward} pontos
                    </span>
                  </div>
                  {challenge.is_completed && (
                    <Button size="sm" variant="outline">
                      <Gift className="h-3 w-3 mr-1" />
                      Resgatar
                    </Button>
                  )}
                </div>
              </div>
            ))})
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewAchievements} className="flex-1">
            <Award className="h-3 w-3 mr-1" />
            Ver Todas
          </Button>
          <Button variant="outline" size="sm" onClick={onViewLeaderboard} className="flex-1">
            <Medal className="h-3 w-3 mr-1" />
            Ranking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamificationPanel;