import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return {
      message: 'Task Management API',
      docs: 'This is the REST backend. Use the dashboard at http://localhost:4200',
      endpoints: {
        'POST /auth/login': 'Login (email, password)',
        'GET /tasks': 'List tasks (requires auth)',
        'POST /tasks': 'Create task (requires auth)',
        'PUT /tasks/:id': 'Update task (requires auth)',
        'DELETE /tasks/:id': 'Delete task (requires auth)',
        'GET /audit-log': 'Audit log (Owner/Admin only)',
      },
    };
  }
}
