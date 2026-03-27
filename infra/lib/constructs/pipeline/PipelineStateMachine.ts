import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { appNamePrefix } from '../../../constants';

export class PipelineStateMachine extends Construct {
  readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const definition = sfn.Chain.start(new sfn.Pass(this, 'CleanerStep'))
      .next(new sfn.Pass(this, 'CategorizerStep'))
      .next(new sfn.Pass(this, 'RecorderStep'))
      .next(new sfn.Pass(this, 'ReportMakerStep'))
      .next(new sfn.Pass(this, 'NotifierStep'));

    this.stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      stateMachineName: `${appNamePrefix}Pipeline`,
      definition,
    });
  }
}
