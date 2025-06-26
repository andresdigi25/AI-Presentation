Here's an effective prompting strategy for rapid API prototyping in Cursor:
Initial Setup Prompt
Start with a comprehensive architectural prompt in Cursor's chat:
Create a Node.js REST API with the following requirements:
- CRUD operations for [your data entity, e.g., "users" or "products"]
- Data sources: JSON files and CSV files
- JWT authentication middleware
- Express.js framework
- Input validation and error handling
- RESTful endpoints following best practices

Please create the project structure and start with package.json
Follow-up Prompts for Rapid Development
1. Data Layer Prompt:
Create data access functions that can:
- Read from both JSON and CSV files
- Support switching between data sources
- Include functions for Create, Read, Update, Delete operations
- Handle file I/O errors gracefully
2. Authentication Prompt:
Implement JWT authentication with:
- User registration endpoint
- Login endpoint that returns JWT token
- Middleware to protect routes
- Token validation and refresh logic
- Password hashing with bcrypt
3. API Routes Prompt:
Create RESTful endpoints:
- GET /api/items (with pagination and filtering)
- GET /api/items/:id
- POST /api/items (protected)
- PUT /api/items/:id (protected)
- DELETE /api/items/:id (protected)
- POST /api/auth/register
- POST /api/auth/login

Include input validation and proper HTTP status codes
Pro Tips for Cursor Prompting
Be Specific About File Structure:
Organize the project with this structure:
- /controllers - API route handlers
- /middleware - JWT and validation middleware
- /data - JSON and CSV data files
- /utils - Data access utilities
- /routes - Express route definitions
Use Incremental Prompts:
Rather than asking for everything at once, build iteratively:

Start with basic Express setup
Add data reading functionality
Implement authentication
Add CRUD operations
Include validation and error handling

Leverage Cursor's Context:

Select existing code and ask: "Add JWT middleware to protect these routes"
Highlight a function and prompt: "Add error handling and input validation to this function"
Select your data files and ask: "Create TypeScript interfaces based on this data structure"

Sample Demo Flow

Start empty - Show the initial prompt creating the entire project structure
Data integration - Demonstrate adding CSV parsing with a simple prompt
Security layer - Show how one prompt adds complete JWT authentication
API testing - Use Cursor to generate test requests or Postman collections
Documentation - End by prompting for API documentation generation

# COMPREHENSIVE PROJECT CREATION GUIDELINES

## Frontend Projects

### React/Next.js Projects
**Initial Setup Prompt:**
```
Create a modern React/Next.js application with:
- TypeScript support
- Tailwind CSS for styling
- ESLint and Prettier configuration
- Component library (shadcn/ui or similar)
- State management (Zustand or Redux Toolkit)
- API integration layer
- Responsive design system
- Dark/light mode support
```

**Follow-up Prompts:**
1. **Component Architecture:**
   ```
   Create reusable components with:
   - Proper TypeScript interfaces
   - Storybook integration
   - Unit tests with Jest/React Testing Library
   - Accessibility features (ARIA labels, keyboard navigation)
   ```

2. **State Management:**
   ```
   Implement state management for:
   - User authentication state
   - Global app state
   - Form state handling
   - API data caching
   ```

3. **Styling System:**
   ```
   Set up a design system with:
   - CSS variables for theming
   - Component variants
   - Responsive breakpoints
   - Animation utilities
   ```

### Vue.js Projects
**Initial Setup Prompt:**
```
Create a Vue 3 application with:
- Composition API
- Vite build tool
- Pinia for state management
- Vue Router
- TypeScript support
- Tailwind CSS
- Component library (Vuetify or similar)
```

### Svelte Projects
**Initial Setup Prompt:**
```
Create a SvelteKit application with:
- TypeScript support
- Svelte UI library
- Stores for state management
- API routes
- Static site generation
- Progressive Web App features
```

## Backend API Projects

### Node.js/Express APIs
**Initial Setup Prompt:**
```
Create a production-ready Node.js API with:
- Express.js framework
- TypeScript support
- Database integration (PostgreSQL/MongoDB)
- JWT authentication
- Input validation (Joi/Zod)
- Error handling middleware
- Logging (Winston)
- Rate limiting
- CORS configuration
- Environment configuration
```

### Python FastAPI Projects
**Initial Setup Prompt:**
```
Create a FastAPI application with:
- Pydantic models for validation
- SQLAlchemy ORM
- Alembic for migrations
- JWT authentication
- OpenAPI documentation
- Background tasks
- WebSocket support
- Docker configuration
- Testing with pytest
```

### Python Django Projects
**Initial Setup Prompt:**
```
Create a Django REST Framework API with:
- Custom user model
- JWT authentication (djangorestframework-simplejwt)
- Database models with migrations
- Serializers for API responses
- ViewSets and routers
- Permissions and authentication
- CORS headers
- Environment variables
- Testing setup
```

## CLI Applications

### Node.js CLI Tools
**Initial Setup Prompt:**
```
Create a Node.js CLI application with:
- Commander.js for argument parsing
- Inquirer.js for interactive prompts
- Chalk for colored output
- Ora for spinners
- Conf for configuration management
- Update notifier
- Help documentation
- TypeScript support
```

**Follow-up Prompts:**
1. **Interactive Features:**
   ```
   Add interactive features:
   - Progress bars for long operations
   - Confirmation prompts
   - Auto-completion
   - Command suggestions
   ```

2. **Configuration Management:**
   ```
   Implement configuration with:
   - Default config files
   - Environment variable support
   - User preferences storage
   - Config validation
   ```

### Python CLI Tools
**Initial Setup Prompt:**
```
Create a Python CLI with:
- Click or Typer for argument parsing
- Rich for beautiful terminal output
- Pydantic for configuration validation
- Logging configuration
- Error handling
- Help documentation
- Package distribution setup
```

## Full-Stack Applications

### MERN Stack
**Initial Setup Prompt:**
```
Create a MERN stack application with:
- MongoDB with Mongoose
- Express.js API
- React frontend
- Node.js backend
- JWT authentication
- File upload capabilities
- Real-time features (Socket.io)
- Docker configuration
- Environment setup
```

### T3 Stack
**Initial Setup Prompt:**
```
Create a T3 stack application with:
- Next.js for full-stack development
- TypeScript throughout
- tRPC for type-safe APIs
- Prisma for database management
- NextAuth.js for authentication
- Tailwind CSS for styling
- ESLint and Prettier
- Vercel deployment ready
```

## Mobile Applications

### React Native
**Initial Setup Prompt:**
```
Create a React Native application with:
- Expo SDK
- TypeScript support
- Navigation (React Navigation)
- State management (Redux Toolkit)
- UI library (React Native Elements)
- AsyncStorage for local data
- Push notifications
- Camera and image picker
- Maps integration
```

### Flutter
**Initial Setup Prompt:**
```
Create a Flutter application with:
- GetX for state management
- Dio for HTTP requests
- Shared preferences for local storage
- Firebase integration
- Custom widgets
- Theme management
- Internationalization
- Testing setup
```

## Database Projects

### Database Design
**Initial Setup Prompt:**
```
Design a database schema for [domain] with:
- Entity relationships
- Normalization rules
- Indexes for performance
- Constraints and validations
- Migration scripts
- Seed data
- Backup strategies
```

## DevOps & Infrastructure

### Docker Projects
**Initial Setup Prompt:**
```
Create Docker configuration for [project] with:
- Multi-stage builds
- Environment-specific configurations
- Health checks
- Volume management
- Network configuration
- Docker Compose for local development
- Production optimization
```

### CI/CD Pipelines
**Initial Setup Prompt:**
```
Create CI/CD pipeline with:
- GitHub Actions or GitLab CI
- Automated testing
- Code quality checks
- Security scanning
- Deployment automation
- Environment management
- Rollback strategies
```

## Advanced Prompting Techniques

### Context-Aware Prompts
```
Based on the existing [file/component/function], add:
- [specific feature]
- [error handling]
- [performance optimization]
- [security improvements]
```

### Refactoring Prompts
```
Refactor this [code/component] to:
- Improve performance
- Enhance maintainability
- Add better error handling
- Implement design patterns
- Improve testability
```

### Testing Prompts
```
Create comprehensive tests for [component/function] including:
- Unit tests
- Integration tests
- Edge cases
- Error scenarios
- Performance tests
- Accessibility tests
```

### Documentation Prompts
```
Generate documentation for [project/component] including:
- API documentation
- User guides
- Developer setup
- Architecture diagrams
- Code examples
- Troubleshooting guides
```

## Best Practices for All Projects

1. **Start with Architecture:**
   - Define project structure first
   - Plan data flow and dependencies
   - Consider scalability from the beginning

2. **Incremental Development:**
   - Build core functionality first
   - Add features iteratively
   - Test each increment

3. **Code Quality:**
   - Include linting and formatting
   - Add type safety where possible
   - Implement error handling early

4. **Security First:**
   - Input validation
   - Authentication and authorization
   - Secure configuration management

5. **Testing Strategy:**
   - Unit tests for business logic
   - Integration tests for APIs
   - E2E tests for critical flows

6. **Documentation:**
   - README with setup instructions
   - API documentation
   - Code comments for complex logic

7. **Deployment Ready:**
   - Environment configuration
   - Build scripts
   - Deployment documentation

Scrum-O-Master
- Based on the projects inside the working_projects folder, could you add a README into the workink folder explaining or summarizing  each of the projects
- can we create a new script in the working_projects/scrum_master , using the same libraries we are using in the scrum_master.py and poc1.py that voice the phrase that in have in the readme.md in the root folder about limits and fears
using a strong male voice