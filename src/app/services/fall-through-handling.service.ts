import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import { PetriNet } from '../classes/petrinet/petri-net';
import { PetriNetManagementService } from './petri-net-management.service';
import { ShowFeedbackService } from './show-feedback.service';
import { Dfg } from '../classes/dfg/dfg';
import { CalculateDfgService } from './calculate-dfg.service';
import { CollectSelectedElementsService } from './collect-selected-elements.service';
import { Activity } from '../classes/dfg/activities';

@Injectable({
    providedIn: 'root',
})
export class FallThroughHandlingService {
    private _petriNet!: PetriNet;

    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _showFeedbackService: ShowFeedbackService,
        private _calculateDfgService: CalculateDfgService,
        private _collectSelectedElementsService: CollectSelectedElementsService,
    ) {
        this._petriNetManagementService.petriNet$.subscribe((pn) => {
            this._petriNet = pn;
        });
    }

    executeActivityOncePerTraceFallThrough(): void {
        const activity: Activity | undefined =
            this._collectSelectedElementsService.selectedActivity;
        if (activity === undefined) {
            this._showFeedbackService.showMessage(
                'An Activity need to be selected first.',
                true,
            );
            return;
        }
        for (const dfg of this._petriNet.getDFGs()) {
            if (dfg.activities.containsActivity(activity)) {
                if (dfg.canBeCutByAnyPartitions()) {
                    this._showFeedbackService.showMessage(
                        'Another cut can be performed in the selected DFG, try this first.',
                        true,
                    );
                    return;
                }
                if (dfg.eventLog.activityOncePerTraceIsPossibleBy(activity)) {
                    const eventLogs: [EventLog, EventLog] =
                        dfg.eventLog.splitByActivityOncePerTrace(activity);
                    const subDFGs: [Dfg, Dfg] = [
                        this._calculateDfgService.calculate(eventLogs[0]),
                        this._calculateDfgService.calculate(eventLogs[1]),
                    ];
                    this._petriNetManagementService.updatePnByParallelCut(
                        dfg,
                        subDFGs[0],
                        subDFGs[1],
                    );
                    if (this._petriNet.isBasicPetriNet()) {
                        this._petriNetManagementService.showEventLogCompletelySplitted();
                        return;
                    }
                    this._showFeedbackService.showMessage(
                        'Activity-Once-Per-Trace Fall-Through executed',
                        false,
                    );
                    return;
                }
                this._showFeedbackService.showMessage(
                    'Activity-Once-Per-Trace Fall-Through is not valid for the selected activity',
                    true,
                );
                return;
            }
        }
    }

    executeFlowerFallThrough(): void {
        const dfg: Dfg | undefined =
            this._collectSelectedElementsService.selectedDFG;
        if (dfg === undefined) {
            this._showFeedbackService.showMessage(
                'A DFG-Box need to be selected first.',
                true,
            );
            return;
        }
        if (dfg.canBeCutByAnyPartitions()) {
            this._showFeedbackService.showMessage(
                'Another cut can be performed in the selected DFG, try this first.',
                true,
            );
            return;
        }
        const eventLog: EventLog = dfg.eventLog;
        for (const trace of eventLog.getAllTraces()) {
            for (const activity of trace.getAllActivities()) {
                if (eventLog.activityOncePerTraceIsPossibleBy(activity)) {
                    this._showFeedbackService.showMessage(
                        'Another Fall-Through can be performed in this DFG, try this first.',
                        true,
                    );
                    return;
                }
            }
        }
        const eventLogs: EventLog[] = eventLog.splitByFlowerFallThrough();
        const subDFGs: Dfg[] = [];
        for (const log of eventLogs) {
            subDFGs.push(this._calculateDfgService.calculate(log));
        }
        this._petriNetManagementService.updatePnByFlowerFallThrough(
            dfg,
            subDFGs,
        );
        if (this._petriNet.isBasicPetriNet()) {
            this._petriNetManagementService.showEventLogCompletelySplitted();
            return;
        }
        this._showFeedbackService.showMessage(
            'Flower-Model Fall-Through executed',
            false,
        );
        return;
    }
}
