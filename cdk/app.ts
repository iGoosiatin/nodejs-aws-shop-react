#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GooseStoreSpaDeploymentStack } from "./lib/GooseStoreSpaDeploymentStack";

const app = new cdk.App();
new GooseStoreSpaDeploymentStack(app, "GooseStoreSpaDeploymentStack");
