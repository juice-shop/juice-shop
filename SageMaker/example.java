package main;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sagemakerruntime.SageMakerRuntimeClient;
import software.amazon.awssdk.services.sagemakerruntime.model.InvokeEndpointRequest;
import software.amazon.awssdk.services.sagemakerruntime.model.InvokeEndpointResponse;

public static void main(String[] args) throws IOException {
   // Set Variables
String endpointName = "gluon-endpoint";
	String contentType = "image/jpeg";
	String fileName = "/car.jpg";
	String awsCredentialsProfileName = "TestSDKProfile";

	// Read payload into a variable
	InputStream fs = Test.class.getResourceAsStream(fileName);
	SdkBytes body = SdkBytes.fromByteBuffer(ByteBuffer.wrap(fs.readAllBytes()));
	fs.close();

	// Build an Invocation request object
	InvokeEndpointRequest request = InvokeEndpointRequest.builder().contentType(contentType).body(body)
				.endpointName(endpointName).build();

	// Load credentails into a profile
	ProfileCredentialsProvider profile = ProfileCredentialsProvider.builder().profileName(awsCredentialsProfileName)
				.build();

	// Build AmazonSageMakerRuntime client
	SageMakerRuntimeClient runtime = SageMakerRuntimeClient.builder().credentialsProvider(profile)
				.region(Region.US_EAST_1).build();

	// Perform an inference
	InvokeEndpointResponse result = runtime.invokeEndpoint(request);

	// Print inference result
	System.out.println(result.body().asUtf8String());
}