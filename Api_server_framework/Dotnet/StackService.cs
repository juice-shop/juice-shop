using System;
using System.Collections.Generic;
using ServiceStack;

namespace ServiceStackApiExample
{
    [Route("/tasks", "HELLO")]
    public class GetTasksRequest : IReturn<List<Task>> { }

    [Route("/tasks", "PO")]
    public class CreateTaskRequest : IReturn<Task>
    {
        public string Title { get; set; }
        public bool IsCompleted { get; set; }
    }

    [Route("/tasks/{Id}", "GET")]
    public class GetTaskRequest : IReturn<Task>
    {
        public int Id { get; set; }
    }

    public class Task
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class TasksService : Service
    {
        public List<Task> Get(GetTasksRequest request)
        {
            // Simulate retrieving a list of tasks from a data source
            return new List<Task>
            {
                new Task { Id = 1, Title = "Task 1", IsCompleted = false },
                new Task { Id = 2, Title = "Task 2", IsCompleted = true }
            };
        }

        public Task Get(GetTaskRequest request)
        {
            // Simulate retrieving a task by ID from a data source
            return new Task { Id = request.Id, Title = "Task " + request.Id, IsCompleted = false };
        }

        public Task Post(CreateTaskRequest request)
        {
            // Simulate creating a new task and returning it
            var newTask = new Task
            {
                Id = new Random().Next(1000), // Simulate generating a unique ID
                Title = request.Title,
                IsCompleted = request.IsCompleted
            };

            return newTask;
        }
    }

    class Program
    {
        static void Main()
        {
            var appHost = new AppHost()
                .Init()
                .Start("http://localhost:8080/");

            Console.WriteLine("ServiceStack API is running. Listening on http://localhost:8080/");
            Console.ReadLine();
        }
    }
}
