import sagemaker

algo = sagemaker.AlgorithmEstimator(
    algorithm_arn='arn:aws:sagemaker:us-west-2:1234567:algorithm/some-algorithm',
    role='SageMakerRole',
    instance_count=1,
    instance_type='ml.c4.xlarge')

train_input = algo.sagemaker_session.upload_data(path='/path/to/your/data')

algo.fit({'training': train_input})
predictor = algo.deploy(1, 'ml.m4.xlarge')

# When you are done using your endpoint
predictor.delete_endpoint()