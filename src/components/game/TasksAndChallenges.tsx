import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import GameHeader from "./GameHeader";
import { Target, Coins, Package, Trophy, Star, Clock, CheckCircle, Lock } from "lucide-react";

interface TasksAndChallengesProps {
  playerData: {
    coins: number;
    level: number;
    team: any[];
    packs: number;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

const TasksAndChallenges = ({ playerData, setPlayerData, onNavigate }: TasksAndChallengesProps) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Sample tasks and challenges
  const dailyTasks = [
    {
      id: "daily_1",
      title: "Open 1 Pack",
      description: "Open any pack to get new players",
      progress: Math.min(100, (playerData.team.length > 0 ? 100 : 0)),
      maxProgress: 100,
      reward: { type: "coins", amount: 200 },
      icon: <Package className="w-6 h-6" />
    },
    {
      id: "daily_2", 
      title: "Play 3 Games",
      description: "Complete 3 season mode games",
      progress: 33,
      maxProgress: 100,
      reward: { type: "coins", amount: 300 },
      icon: <Trophy className="w-6 h-6" />
    },
    {
      id: "daily_3",
      title: "Collect Team",
      description: "Have at least 5 players in your collection",
      progress: Math.min(100, (playerData.team.length / 5) * 100),
      maxProgress: 100,
      reward: { type: "pack", amount: 1 },
      icon: <Star className="w-6 h-6" />
    }
  ];

  const weeklyTasks = [
    {
      id: "weekly_1",
      title: "Win 10 Games",
      description: "Win 10 season mode games this week",
      progress: 40,
      maxProgress: 100,
      reward: { type: "coins", amount: 1000 },
      icon: <Trophy className="w-6 h-6" />
    },
    {
      id: "weekly_2",
      title: "Team Builder",
      description: "Collect 15 different players",
      progress: Math.min(100, (playerData.team.length / 15) * 100),
      maxProgress: 100,
      reward: { type: "pack", amount: 3 },
      icon: <Star className="w-6 h-6" />
    }
  ];

  const specialChallenges = [
    {
      id: "special_1",
      title: "Elite Collection",
      description: "Collect 3 Elite players",
      progress: 0,
      maxProgress: 100,
      reward: { type: "special_pack", amount: 1 },
      icon: <Target className="w-6 h-6" />,
      locked: playerData.level < 5
    },
    {
      id: "special_2",
      title: "Stanley Cup Champion",
      description: "Win the Stanley Cup in Season Mode",
      progress: 0,
      maxProgress: 100,
      reward: { type: "legendary_player", amount: 1 },
      icon: <Trophy className="w-6 h-6" />,
      locked: playerData.level < 10
    }
  ];

  const completeTask = (taskId: string, reward: any) => {
    if (completedTasks.includes(taskId)) return;

    setCompletedTasks(prev => [...prev, taskId]);
    
    // Award rewards
    if (reward.type === "coins") {
      setPlayerData(prev => ({
        ...prev,
        coins: prev.coins + reward.amount
      }));
    } else if (reward.type === "pack") {
      setPlayerData(prev => ({
        ...prev,
        packs: prev.packs + reward.amount
      }));
    }

    // Show reward notification
    alert(`Task completed! Earned: ${reward.amount} ${reward.type}`);
  };

  const TaskCard = ({ task, timeFrame }: { task: any; timeFrame: string }) => {
    const isCompleted = completedTasks.includes(task.id) || task.progress >= 100;
    const isLocked = task.locked;

    return (
      <Card className={`game-card p-4 ${isCompleted ? 'bg-green-500/10 border-green-500/30' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`${isCompleted ? 'text-green-500' : isLocked ? 'text-muted-foreground' : 'text-primary'}`}>
              {isCompleted ? <CheckCircle className="w-6 h-6" /> : isLocked ? <Lock className="w-6 h-6" /> : task.icon}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          </div>
          <Badge variant={timeFrame === 'daily' ? 'default' : timeFrame === 'weekly' ? 'secondary' : 'outline'}>
            {timeFrame}
          </Badge>
        </div>

        {!isLocked && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(task.progress)}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Reward:</span>
                {task.reward.type === 'coins' && <Coins className="w-4 h-4 text-gold" />}
                {task.reward.type === 'pack' && <Package className="w-4 h-4 text-primary" />}
                {task.reward.type === 'special_pack' && <Package className="w-4 h-4 text-gold" />}
                {task.reward.type === 'legendary_player' && <Star className="w-4 h-4 text-purple-500" />}
                <span className="text-sm font-semibold">
                  {task.reward.amount} {task.reward.type.replace('_', ' ')}
                </span>
              </div>

              {isCompleted ? (
                <Badge variant="outline" className="text-green-500 border-green-500">
                  Completed
                </Badge>
              ) : task.progress >= 100 ? (
                <Button 
                  onClick={() => completeTask(task.id, task.reward)}
                  className="btn-primary"
                  size="sm"
                >
                  Claim
                </Button>
              ) : (
                <Badge variant="outline">
                  In Progress
                </Badge>
              )}
            </div>
          </>
        )}

        {isLocked && (
          <div className="text-center py-2">
            <Badge variant="outline" className="text-muted-foreground">
              Unlocks at Level {task.id === 'special_1' ? '5' : '10'}
            </Badge>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader 
        playerData={playerData} 
        showBackButton 
        onBack={() => onNavigate('team')}
        title="Tasks & Challenges"
      />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Tasks & Challenges</h1>
          <p className="text-xl text-muted-foreground">Complete tasks to earn coins, packs, and special rewards</p>
        </div>

        <div className="space-y-8">
          {/* Daily Tasks */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Daily Tasks</h2>
              <Badge variant="default">Resets in 18h</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailyTasks.map(task => (
                <TaskCard key={task.id} task={task} timeFrame="daily" />
              ))}
            </div>
          </div>

          {/* Weekly Tasks */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">Weekly Challenges</h2>
              <Badge variant="secondary">Resets in 4d</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {weeklyTasks.map(task => (
                <TaskCard key={task.id} task={task} timeFrame="weekly" />
              ))}
            </div>
          </div>

          {/* Special Challenges */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-bold text-foreground">Special Challenges</h2>
              <Badge variant="outline" className="border-gold text-gold">Limited Time</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {specialChallenges.map(task => (
                <TaskCard key={task.id} task={task} timeFrame="special" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksAndChallenges;