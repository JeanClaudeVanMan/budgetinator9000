import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { appNamePrefix } from '../../constants';

export class BudgetinatorFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    super(scope, id, {
      functionName: `${appNamePrefix}${id}`,
      bundling: { forceDockerBundling: false, ...props.bundling },
      ...props,
    });
  }
}
