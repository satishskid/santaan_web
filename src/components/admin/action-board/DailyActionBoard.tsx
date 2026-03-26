"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, AlertCircle, Phone, Calendar, RefreshCw, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ActionTask = {
  id: string;
  type: "call" | "followup" | "system" | "marketing";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  status: "pending" | "completed";
  actionLabel: string;
  contactId?: number;
  metadata?: any;
};

export default function DailyActionBoard() {
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock fetching dynamic tasks - we will replace this with a real API call later
  useEffect(() => {
    // Simulating API load time
    const timer = setTimeout(() => {
      setTasks([
        {
          id: "t1",
          type: "call",
          priority: "high",
          title: "Hot Lead: Priority Call",
          description: "Priya spent 5 mins on IVF Pricing page but didn't call. Score: 85.",
          status: "pending",
          actionLabel: "Call Now",
        },
        {
          id: "t2",
          type: "followup",
          priority: "medium",
          title: "Missing Follow-up Date",
          description: "Rahul was marked 'Qualified' in NeoDove but has no next follow-up date.",
          status: "pending",
          actionLabel: "Set Date",
        },
        {
          id: "t3",
          type: "marketing",
          priority: "high",
          title: "Review Underperforming Ad",
          description: "Campaign 'Bangalore IVF Broad' spent ₹4,500 this week with 0 leads.",
          status: "pending",
          actionLabel: "Review in Meta",
        },
        {
          id: "t4",
          type: "system",
          priority: "low",
          title: "Sync Error: NeoDove",
          description: "Failed to push 1 lead to NeoDove due to invalid phone format.",
          status: "pending",
          actionLabel: "Fix Phone Number",
        }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const completeTask = (id: string) => {
    setTasks(current => 
      current.map(task => 
        task.id === id ? { ...task, status: "completed" } : task
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-gray-200">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Loading your action plan...</span>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const getIcon = (type: string, priority: string) => {
    const colorClass = priority === 'high' ? 'text-rose-500' : priority === 'medium' ? 'text-amber-500' : 'text-blue-500';
    switch (type) {
      case 'call': return <Phone className={`w-5 h-5 ${colorClass}`} />;
      case 'followup': return <Calendar className={`w-5 h-5 ${colorClass}`} />;
      case 'marketing': return <AlertCircle className={`w-5 h-5 ${colorClass}`} />;
      default: return <CheckCircle2 className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Action Inbox</h2>
            <p className="text-sm text-gray-500 mt-1">Focus on these tasks to drive growth today.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-santaan-teal">{pendingTasks.length}</span>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tasks Left</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
              <p className="text-sm text-gray-500 mt-1">You have completed all your high-priority actions for now.</p>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 group">
                <button 
                  onClick={() => completeTask(task.id)}
                  className="mt-1 flex-shrink-0 text-gray-300 hover:text-emerald-500 transition-colors"
                >
                  <Circle className="w-6 h-6" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getIcon(task.type, task.priority)}
                    <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                    {task.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                </div>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="text-xs font-medium">
                    {task.actionLabel}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Completed Today</h3>
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden opacity-75">
            <div className="divide-y divide-gray-100">
              {completedTasks.map((task) => (
                <div key={task.id} className="p-3 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 line-through">{task.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
