That's an application using TypeScript, added Swagger for API documentation, and used Zod for schema validation. The code follows best practices and is structured for maintainability and scalability.

# Useful Commands
Build and Run Services
```
bash
Copy code
docker-compose up --build
Stop Services

bash
Copy code
docker-compose down
Access RabbitMQ Management UI

URL: http://localhost:15672
Username: guest
Password: guest
Access Swagger UI

URL: http://localhost:3000/api-docs
Check Logs in PostgreSQL

bash
Copy code

```

# Connect to PostgreSQL
docker exec -it postgres psql -U admin -d distributed_system

# Query logs
SELECT * FROM logs;
