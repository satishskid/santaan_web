"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, AlertCircle, Phone, Calendar, RefreshCw, Mail, Check, ChevronDown, ChevronUp, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ActionTask = {
  id: string;
  type: "call" | "followup" | "system" | "marketing";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning?: string;
  status: "pending" | "completed";
  actionLabel: string;
  contactId?: number;
  guidedAction?: {
    type: "copy_message" | "link";
    message?: string;
    url?: string;
  };
  metadata?: any;
};

export default function DailyActionBoard() {
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchTasks() {
      try {
        const response = await fetch('/api/admin/action-board');
        if (!response.ok) throw new Error('Failed to fetch action tasks');
        const data = await response.json();
        
        if (mounted && data.ok) {
          setTasks(data.tasks);
        }
      } catch (error) {
        console.error('Error fetching action tasks:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchTasks();
    return () => { mounted = false; };
  }, []);

  const completeTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(current => 
      current.map(task => 
        task.id === id ? { ...task, status: "completed" } : task
      )
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
            pendingTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              return (
                <div 
                  key={task.id} 
                  className={`transition-all duration-200 ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                >
                  <div 
                    className="p-4 flex items-start gap-4 cursor-pointer group"
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  >
                    <button 
                      onClick={(e) => completeTask(task.id, e)}
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
                      <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-1'}`}>{task.description}</p>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="p-1 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-14 pb-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      {task.reasoning && (
                        <div className="p-3 bg-white rounded-lg border border-blue-100 text-sm text-gray-700 shadow-sm">
                          <p className="font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Why this matters (Proof of Pudding)
                          </p>
                          {task.reasoning}
                        </div>
                      )}

                      {task.guidedAction && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Action</p>
                          {task.guidedAction.type === 'copy_message' && (
                            <div className="relative group/copy">
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 italic">
                                "{task.guidedAction.message}"
                              </div>
                              <Button 
                                size="sm" 
                                className="mt-2 w-full flex items-center justify-center gap-2"
                                onClick={() => copyToClipboard(task.guidedAction?.message || '', task.id)}
                              >
                                {copiedId === task.id ? (
                                  <><Check className="w-4 h-4" /> Copied!</>
                                ) : (
                                  <><Copy className="w-4 h-4" /> Copy Message for Agency</>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {!task.guidedAction && (
                        <Button size="sm" className="w-full">
                          {task.actionLabel}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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
