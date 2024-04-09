package main

import (
    "context"
    "fmt"
    "github.com/aws/aws-lambda-go/lambda"
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/sagemakerruntime"
)

func handler(ctx context.Context, userRequest string) (string, error) {
    // Create a session using the default credentials and region
    sess, _ := session.NewSession(&aws.Config{
        Region: aws.String("YOUR_REGION"),
    })

    // Create a SageMaker Runtime client
    svc := sagemakerruntime.New(sess)

    // Define the SageMaker endpoint name where your chatbot model is deployed
    endpointName := "your-chatbot-endpoint"

    // Call the SageMaker endpoint
    response, err := svc.InvokeEndpoint(&sagemakerruntime.InvokeEndpointInput{
        EndpointName: aws.String(endpointName),
        ContentType:  aws.String("text/plain"),
        Body:         []byte(userRequest),
    })

    if err != nil {
        return "", err
    }

    return string(response.Body), nil
}

func main() {
    lambda.Start(handler)
}
