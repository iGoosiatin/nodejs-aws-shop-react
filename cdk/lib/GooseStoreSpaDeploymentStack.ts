import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { Construct } from "constructs";

export class GooseStoreSpaDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket to store the website files
    const websiteBucket = new s3.Bucket(this, "GooseStoreSpaBucket", {
      // Block all public access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Delete bucket and contents when stack is destroyed
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // Delete contents of bucket when stack is destroyed
      autoDeleteObjects: true,
      // Enable encryption at rest
      encryption: s3.BucketEncryption.S3_MANAGED,
      // Enable web hosting due to task requirements
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
    });

    // Create Origin Access Control for CloudFront
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: "OAC for website bucket",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    // Create CloudFront distribution with CfnDistribution
    const distribution = new cloudfront.CfnDistribution(
      this,
      "GooseStoreSpaDistribution",
      {
        distributionConfig: {
          enabled: true,
          priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
          defaultRootObject: "index.html",
          defaultCacheBehavior: {
            targetOriginId: "S3Origin",
            viewerProtocolPolicy: "redirect-to-https",
            cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6", // CachingOptimized ID
            compress: true,
          },
          origins: [
            {
              id: "S3Origin",
              domainName: websiteBucket.bucketRegionalDomainName,
              originAccessControlId: oac.attrId,
              s3OriginConfig: {}, // Required empty config for S3 origins
            },
          ],
          customErrorResponses: [
            {
              errorCode: 403,
              responseCode: 200,
              responsePagePath: "/index.html",
            },
            {
              errorCode: 404,
              responseCode: 200,
              responsePagePath: "/index.html",
            },
          ],
        },
      }
    );

    // Update bucket policy to allow access from CloudFront only
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.ref}`,
          },
        },
      })
    );
    // Deploy site contents to S3
    new s3deploy.BucketDeployment(this, "GooseStoreSpaBucketDeployment", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../dist"))],
      destinationBucket: websiteBucket,
      distribution: cloudfront.Distribution.fromDistributionAttributes(
        this,
        "DistributionConfig",
        {
          distributionId: distribution.ref,
          domainName: distribution.attrDomainName,
        }
      ),
      // Invalidate CloudFront cache after deployment
      distributionPaths: ["/*"],
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.attrDomainName,
      description: "CloudFront Distribution URL",
    });
  }
}
