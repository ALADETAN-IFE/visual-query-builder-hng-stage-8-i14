:rocket: Frontend Wizards — Stage 8 @channel
One Last Dance: Build a Visual Query Builder with Next.js

:dart: Objective
Build a highly interactive visual query builder that allows users to construct complex database/API queries through a graphical interface instead of writing raw query syntax manually.
Think:

Postman query builders
Supabase filters
MongoDB Compass
GraphQL explorers
advanced admin filtering systems
# Stage 8 — Frontend Task

🚀 Frontend Wizards — One Last Dance: Build a Visual Query Builder with Next.js

## 🎯 Objective
Build a highly interactive visual query builder that allows users to construct complex database/API queries through a graphical interface instead of writing raw query syntax manually.

Examples to inspire:
- Postman query builders
- Supabase filters
- MongoDB Compass
- GraphQL explorers
- Advanced admin filtering systems

### Key user capabilities
- Visually create filters
- Group conditions
- Nest logic
- Preview generated queries
- Execute simulated queries
- Inspect results dynamically

This challenge evaluates recursive UI engineering, complex state management, schema-driven rendering, frontend systems architecture, interaction engineering, and scalability.

## 🧠 What the Application Should Do
- Choose a data source / schema
- Visually construct queries
- Nest logical conditions (unlimited depth)
- Dynamically add/remove rules
- Preview generated query syntax in real time
- Simulate query execution and inspect results

Example supported logic:

(age > 18 AND country = "Nigeria")
OR
(status = "active" AND purchases > 10)

## 🧩 Required Features

### 1️⃣ Dynamic Query Rule Builder
Users must create query rules visually. Each rule includes:
- Field selector
- Operator selector
- Value input

Supported operators:
- equals, not equals, contains, starts with
- greater than, less than, in array, between

Bonus: regex, null checks, date comparisons

### 2️⃣ Nested Condition Groups
- Support AND / OR logic
- Unlimited nesting depth
- Collapsible groups
- Dynamically add/remove conditions and groups
- Reorder conditions/groups (drag-and-drop recommended)

### 3️⃣ Schema-Driven Query System
The UI must adapt based on a provided schema. Example schema:

```json
{
  "name": "string",
  "age": "number",
  "status": "enum",
  "createdAt": "date"
}
```

Behavior:
- Render correct input types (date pickers, numeric inputs, enums)
- Restrict invalid operators
- Validate values and surface errors

### 4️⃣ Live Query Preview
Generate either SQL-like syntax, Mongo-style objects, or GraphQL filters and update the preview in real time.

Example outputs:

SQL:

```
SELECT * FROM users
WHERE age > 18
AND status = 'active'
```

Mongo-style:

```json
{ "age": { "$gt": 18 }, "status": "active" }
```

### 5️⃣ Query Execution Simulator
- Execute queries against a mock dataset
- Dynamic filtering, result count, loading and empty states
- Bonus: pagination, sorting, virtualization

### 6️⃣ State Management Architecture
Expectations:
- Normalized query tree structure
- Recursive state handling
- Reusable abstractions and immutable updates

### 7️⃣ Recursive Component Engineering
- Recursive condition groups and rendering
- Recursive query parsing and tree traversal

### 8️⃣ Query Validation Engine
- Prevent invalid queries (e.g., `contains` on numbers)
- Validate date ranges and non-empty groups
- Surface validation errors clearly

### 9️⃣ Performance Optimization
Test with deep nesting and large datasets. Optimize:
- Avoid unnecessary re-renders
- Memoization, derived state, stable keys, component isolation

### 🔟 Advanced Interactions
Include all of the following:
- ✅ Drag-and-drop condition reordering
- ✅ Keyboard shortcuts
- ✅ Collapsible groups
- ✅ Query history
- ✅ Saved query presets
- ✅ Export/import query JSON
- ✅ Dark/light mode
- ✅ Animated transitions

## 🧪 Testing Requirements
Implement unit and integration tests for critical logic and UI:
- Query generation logic
- Recursive rendering and validation
- State management logic and utilities

Suggested tools: Vitest, Jest, React Testing Library, Cypress or Playwright (optional).

## 🚀 Continuous Deployment (CD) Requirements
Configure automatic deployment with Vercel or Netlify and ensure preview deployments for PRs.

## 🔁 Git Workflow Requirements
- Do not push directly to `main`
- Use feature branches and PRs
- Maintain clear commit history
- Minimum: at least 7 meaningful pull requests during implementation

## 📦 Technical Requirements
- Must use Next.js (App Router) and TypeScript
- Allowed: TailwindCSS, Shadcn/UI, DnD Kit, React Hook Form, Zustand/Jotai/Redux
- Must include modular architecture, reusable components, typed models, and no console errors

## 🔒 Security & Stability
- Sanitize generated queries
- Validate imported JSON
- Prevent malformed recursive structures and handle dynamic rendering safely

## 📱 UI/UX Expectations
The app should feel professional, scalable and highly interactive with polished nesting UX and responsive layouts.

## ✅ Acceptance & Submission
You will be graded on recursive UI engineering, query architecture quality, state management, validation, performance, UX, tests and code quality.

Submission:
- GitHub repo
- Live deployed URL
- README describing architecture, recursive rendering strategy, state decisions, query engine design, performance techniques, and trade-offs
- Demo video (3–7 minutes recommended)

Trophy areas: frontend systems thinking, recursive UI engineering, state architecture, interaction complexity, performance, and testing.

Deadline: 11:59 AM, 1 June 2026.