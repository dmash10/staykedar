
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { LeadCard, Lead } from "./LeadCard";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const COLUMNS = [
    { id: 'new', title: 'New Leads', color: 'bg-blue-500' },
    { id: 'ai_calling', title: 'AI Calling', color: 'bg-purple-500' },
    { id: 'contacted', title: 'Action Required', color: 'bg-orange-500' },
    { id: 'confirmed', title: 'Confirmed', color: 'bg-green-500' },
    { id: 'paid', title: 'Paid', color: 'bg-emerald-500' },
];

interface CRMBoardProps {
    leads: Lead[];
    onLeadClick: (lead: Lead) => void;
    onArchive: (id: string) => void;
}

export function CRMBoard({ leads, onLeadClick, onArchive }: CRMBoardProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Update Lead Status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('stay_leads' as any)
                .update({ status })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stay_leads'] });
        },
        onError: (error) => {
            toast({
                title: "Error moving lead",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // HANDLE MOCK DATA (DEMO MODE)
        const isMock = draggableId.startsWith('mock-');
        const leadName = leads.find(l => l.id === draggableId)?.customer_name || 'Lead';
        const colTitle = COLUMNS.find(c => c.id === destination.droppableId)?.title;

        if (isMock) {
            // Manually update cache to make it "stick" for the session
            queryClient.setQueryData(['stay_leads'], (old: Lead[] | undefined) => {
                if (!old) return [];
                return old.map(l =>
                    l.id === draggableId ? { ...l, status: destination.droppableId } : l
                );
            });

            toast({
                title: "Demo Mode",
                description: `${leadName} moved to ${colTitle} (Local Session Only)`,
                className: "bg-blue-900 border-blue-800 text-white"
            });
            return;
        }

        // REAL DATA: Fire Mutation
        updateStatusMutation.mutate({
            id: draggableId,
            status: destination.droppableId
        });

        toast({
            title: "Status Updating...",
            description: `Moving ${leadName} to ${colTitle}`,
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((column) => (
                    <div key={column.id} className="min-w-[280px] flex flex-col h-full bg-slate-900/40 rounded-xl border border-white/5">
                        <div className={`p-3 border-b border-white/5 flex items-center justify-between`}>
                            <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${column.color} shadow-[0_0_8px_currentColor]`} />
                                {column.title}
                            </h3>
                            <span className="text-xs text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                {leads?.filter(l => l.status === column.id).length}
                            </span>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-1 p-2 transition-all duration-200 rounded-b-xl ${snapshot.isDraggingOver ? 'bg-blue-500/10 shadow-inner' : ''}`}
                                >
                                    {leads
                                        .filter(lead => lead.status === column.id)
                                        .map((lead, index) => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                index={index}
                                                onClick={() => onLeadClick(lead)}
                                                onArchive={onArchive}
                                            />
                                        ))}

                                    {leads.filter(l => l.status === column.id).length === 0 && !snapshot.isDraggingOver && (
                                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-lg m-1">
                                            <p className="text-xs text-slate-600 font-medium">Empty Stage</p>
                                        </div>
                                    )}

                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
