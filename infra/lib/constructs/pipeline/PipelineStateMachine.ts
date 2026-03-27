import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { appNamePrefix } from '../../../constants';

interface PipelineStateMachineProps {
  cleaner: lambda.IFunction;
  categorizer: lambda.IFunction;
  recorder: lambda.IFunction;
  reportMaker: lambda.IFunction;
  notifier: lambda.IFunction;
}

export class PipelineStateMachine extends Construct {
  readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: PipelineStateMachineProps) {
    super(scope, id);

    const invoke = (stepId: string, fn: lambda.IFunction) =>
      new tasks.LambdaInvoke(this, stepId, {
        lambdaFunction: fn,
        outputPath: '$.Payload',
      });

    const definition = sfn.Chain
      .start(invoke('CleanerStep', props.cleaner))
      .next(invoke('CategorizerStep', props.categorizer))
      .next(invoke('RecorderStep', props.recorder))
      .next(invoke('ReportMakerStep', props.reportMaker))
      .next(invoke('NotifierStep', props.notifier));

    this.stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      stateMachineName: `${appNamePrefix}Pipeline`,
      definition,
    });
  }
}
