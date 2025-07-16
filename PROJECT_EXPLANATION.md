# MindConnect Project - Complete Code Explanation

## Overview
MindConnect is a **mental health management system** that connects users with therapists. It's built with:
- **Backend**: Java Spring Boot (REST API)
- **Frontend**: React.js
- **Database**: H2 (in-memory) for development, PostgreSQL for production
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Spring Security

---

## BACKEND EXPLANATION (Java Spring Boot)

### 1. Project Configuration (pom.xml)

This is your **Maven configuration file** that defines:

```xml
<groupId>mind_backend.example</groupId>
<artifactId>mind_connect</artifactId>
<version>0.0.1-SNAPSHOT</version>
```
- **groupId**: Your project's organization identifier
- **artifactId**: Your project name
- **version**: Current version (SNAPSHOT = development version)

**Key Dependencies:**
- `spring-boot-starter-web`: Creates REST APIs
- `spring-boot-starter-data-jpa`: Database operations (Object-Relational Mapping)
- `spring-boot-starter-security`: Authentication & authorization
- `h2database`: In-memory database for testing
- `postgresql`: Production database
- `lombok`: Reduces boilerplate code (auto-generates getters/setters)
- `jjwt`: JWT token handling for authentication

### 2. Main Application Class

```java
@SpringBootApplication
public class MindConnectApplication {
    public static void main(String[] args) {
        SpringApplication.run(MindConnectApplication.class, args);
    }
}
```

**Line-by-line breakdown:**
- `@SpringBootApplication`: This annotation combines three annotations:
  - `@Configuration`: Marks this as a configuration class
  - `@EnableAutoConfiguration`: Automatically configures Spring based on dependencies
  - `@ComponentScan`: Scans for Spring components in this package and sub-packages
- `SpringApplication.run()`: Starts the entire Spring Boot application
- This creates an embedded web server (usually Tomcat) on port 8080

---

## ENTITY CLASSES (Database Models)

These represent your database tables as Java objects. Each entity becomes a table in your database.

### 3. User Entity (User.java)

**Purpose**: Represents system users (patients/clients)

```java
@Entity
@Table(name = "users")
public class User {
```

**Key Annotations Explained:**
- `@Entity`: Marks this class as a JPA entity (database table)
- `@Table(name = "users")`: Specifies the table name in database

**Important Fields:**
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
- `@Id`: Primary key
- `@GeneratedValue`: Auto-increment ID

```java
@NotBlank
@Email
@Column(unique = true)
private String email;
```
- `@NotBlank`: Field cannot be empty
- `@Email`: Validates email format
- `@Column(unique = true)`: Ensures unique emails

```java
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
private String password;
```
- `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`: Password can be written but never returned in API responses

**Relationships:**
```java
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "role_id")
private Role role;
```
- `@ManyToOne`: Many users can have one role
- `@JoinColumn`: Foreign key column

```java
@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
@JsonIgnore
private List<Journal> journals;
```
- `@OneToMany`: One user can have many journals
- `mappedBy = "user"`: References the 'user' field in Journal entity
- `@JsonIgnore`: Prevents circular references in JSON serialization

### 4. Role Entity (Role.java)

**Purpose**: Defines user roles (USER, ADMIN, etc.)

```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(unique = true)
    private String name;
}
```

**Simple structure**: Just stores role names like "USER", "ADMIN", "THERAPIST"

### 5. Therapist Entity (Therapist.java)

**Purpose**: Represents therapists/mental health professionals

**Key Fields:**
- `specialization`: What type of therapy they specialize in
- `qualification`: Their educational background
- `experience`: Years of experience
- `rating`: Average rating from patients
- `available`: Whether they're currently accepting patients

**Constructor defaults:**
```java
public Therapist() {
    this.createdAt = LocalDateTime.now();
    this.available = true;
    this.rating = 0.0;
}
```

### 6. Session Entity (Session.java)

**Purpose**: Represents therapy sessions between users and therapists

**Key Features:**
```java
public enum SessionStatus {
    SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
}
```

**Relationships:**
- Links to both User and Therapist
- `@JsonIgnoreProperties`: Prevents infinite loops when converting to JSON

**Default values:**
```java
this.status = SessionStatus.SCHEDULED;
this.duration = 60; // 60 minutes default
```

### 7. Journal Entity (Journal.java)

**Purpose**: Users' personal journal entries for mental health tracking

**Mood tracking:**
```java
public enum MoodLevel {
    VERY_HAPPY, HAPPY, NEUTRAL, SAD, VERY_SAD, 
    ANXIOUS, STRESSED, CALM, EXCITED, ANGRY
}
```

**Content storage:**
```java
@Column(columnDefinition = "TEXT")
private String content;
```
- `TEXT`: Allows longer content than VARCHAR

**Auto-timestamps:**
```java
@PreUpdate
public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
}
```

### 8. Motivation Entity (Motivation.java)

**Purpose**: Stores motivational content (quotes, tips, articles)

**Content types:**
```java
public enum ContentType {
    QUOTE, ARTICLE, TIP, EXERCISE, VIDEO, AUDIO
}
```

### 9. Notification Entity (Notification.java)

**Purpose**: System notifications for users

**Notification types:**
```java
public enum NotificationType {
    SESSION_CANCELLED, SESSION_RESCHEDULED, 
    SESSION_COMPLETED, SESSION_REMINDER
}
```

---

## REPOSITORY LAYER (Data Access)

Repositories handle all database operations. They extend `JpaRepository` which provides basic CRUD operations automatically.

### 10. UserRepository.java

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole_Name(String roleName);
    boolean existsByEmail(String email);
}
```

**What Spring Boot auto-generates:**
- `save(user)`: Save/update user
- `findById(id)`: Find user by ID
- `findAll()`: Get all users
- `deleteById(id)`: Delete user

**Custom methods explained:**
- `findByEmail(String email)`: Spring automatically creates SQL: `SELECT * FROM users WHERE email = ?`
- `findByRole_Name(String roleName)`: Joins with Role table: `SELECT * FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = ?`
- `existsByEmail(String email)`: Returns boolean if email exists

### 11. SessionRepository.java

**Advanced query methods:**
```java
List<Session> findBySessionDateBetween(LocalDateTime start, LocalDateTime end);
```
- Finds sessions between two dates
- Auto-generated SQL: `SELECT * FROM sessions WHERE session_date BETWEEN ? AND ?`

```java
List<Session> findByUserIdAndStatus(Long userId, SessionStatus status);
```
- Combines multiple conditions with AND

### 12. JournalRepository.java

**Ordering results:**
```java
List<Journal> findByUserIdOrderByCreatedAtDesc(Long userId);
```
- Gets user's journals ordered by newest first
- `OrderBy` + `Desc` = Descending order

---

## SECURITY LAYER (Authentication & Authorization)

Your app uses **JWT (JSON Web Token)** authentication instead of traditional sessions.

### 13. SecurityConfig.java

**Main security configuration:**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
```

**Password encryption:**
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```
- `BCryptPasswordEncoder`: Securely hashes passwords (never stores plain text)

**Security rules:**
```java
.authorizeHttpRequests(authz -> authz
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/h2-console/**").permitAll()
    .anyRequest().authenticated()
)
```
- `/api/auth/**`: Login/register endpoints (no authentication needed)
- `/h2-console/**`: Database console access (for development)
- `anyRequest().authenticated()`: Everything else requires login

**Stateless sessions:**
```java
.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```
- No server-side sessions (uses JWT tokens instead)

**CORS configuration:**
```java
configuration.setAllowedOriginPatterns(Arrays.asList("*"));
configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
```
- Allows React frontend to make API calls from different port

### 14. JwtUtil.java

**Token generation:**
```java
public String generateToken(String email) {
    return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
}
```
- Creates a JWT token with user email and expiration
- Signs with secret key to prevent tampering

**Token validation:**
```java
public boolean validateToken(String token) {
    try {
        Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token);
        return true;
    } catch (JwtException | IllegalArgumentException e) {
        return false;
    }
}
```

### 15. JwtAuthenticationFilter.java

**Request filtering:**
```java
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return path.startsWith("/api/auth/") || path.startsWith("/h2-console/");
}
```
- Skips authentication for login/register endpoints

**Token processing:**
```java
if (authHeader != null && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
    email = jwtUtil.getEmailFromToken(token);
}
```
- Extracts JWT token from `Authorization: Bearer <token>` header
- Gets user email from token

**Setting authentication:**
```java
if (jwtUtil.validateToken(token) && !jwtUtil.isTokenExpired(token)) {
    UsernamePasswordAuthenticationToken authToken = 
        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authToken);
}
```
- If token is valid, sets user as authenticated for this request

---

## SERVICE LAYER (Business Logic)

Services contain the core business logic. Controllers call services, services call repositories.

### 16. UserService.java

**User creation with validation:**
```java
public User createUser(User user) {
    if (userRepository.existsByEmail(user.getEmail())) {
        throw new RuntimeException("Email already exists");
    }
    
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    
    // Set role based on userType
    String roleName = "USER"; // Default role
    if (user.getUserType() != null && !user.getUserType().isEmpty()) {
        roleName = user.getUserType().toUpperCase();
    }
    
    Role userRole = roleRepository.findByName(roleName)
        .orElseGet(() -> roleRepository.findByName("USER")
            .orElseThrow(() -> new RuntimeException("Default role not found")));
    user.setRole(userRole);
    
    return userRepository.save(user);
}
```

**Key business logic:**
1. **Email uniqueness check**: Prevents duplicate accounts
2. **Password encryption**: Uses BCrypt to hash passwords
3. **Role assignment**: Automatically assigns roles based on user type
4. **Error handling**: Throws meaningful exceptions

### 17. SessionService.java

**Session management with notifications:**
```java
public Session updateSessionStatus(Long id, SessionStatus status) {
    Session session = sessionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Session not found"));
    
    SessionStatus oldStatus = session.getStatus();
    session.setStatus(status);
    Session updatedSession = sessionRepository.save(session);

    // Create notifications based on status change
    if (status == SessionStatus.CANCELLED && oldStatus != SessionStatus.CANCELLED) {
        notificationService.createSessionCancelledNotification(updatedSession, reason);
    } else if (status == SessionStatus.COMPLETED && oldStatus != SessionStatus.COMPLETED) {
        notificationService.createSessionCompletedNotification(updatedSession);
    }

    return updatedSession;
}
```

**Business logic features:**
- **Status tracking**: Monitors session state changes
- **Automatic notifications**: Sends alerts when sessions are cancelled/completed
- **Validation**: Ensures users and therapists exist before creating sessions

---

## CONTROLLER LAYER (REST API Endpoints)

Controllers handle HTTP requests and responses. They're the interface between frontend and backend.

### 18. AuthController.java

**Login endpoint:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
    String email = loginRequest.get("email");
    String password = loginRequest.get("password");
    String userType = loginRequest.get("userType"); // "user" or "therapist"
    
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(email, password)
    );
    
    String token = jwtUtil.generateToken(email);
    
    Map<String, Object> response = new HashMap<>();
    response.put("token", token);
    response.put("userType", userType);
    response.put("user", userOrTherapist);
    
    return ResponseEntity.ok(response);
}
```

**Key features:**
- `@PostMapping("/login")`: Creates POST endpoint at `/api/auth/login`
- `@RequestBody`: Converts JSON request to Java object
- `ResponseEntity<?>`: Allows returning different response types
- Returns JWT token + user data on successful login

### 19. UserController.java

**CRUD operations:**
```java
@GetMapping("/{id}")
public ResponseEntity<User> getUserById(@PathVariable Long id) {
    return userService.getUserById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}

@PostMapping
public ResponseEntity<?> createUser(@RequestBody User user) {
    try {
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
```

**HTTP method mappings:**
- `@GetMapping`: GET requests (retrieve data)
- `@PostMapping`: POST requests (create new data)
- `@PutMapping`: PUT requests (update data)
- `@DeleteMapping`: DELETE requests (remove data)

**Path variables:**
- `@PathVariable Long id`: Extracts ID from URL like `/api/users/123`

**Error handling:**
- Try-catch blocks return appropriate HTTP status codes
- `ResponseEntity.ok()`: 200 Success
- `ResponseEntity.badRequest()`: 400 Bad Request
- `ResponseEntity.notFound()`: 404 Not Found

---

## FRONTEND-BACKEND CONNECTION 🔗

The connection between your React frontend and Spring Boot backend happens through **HTTP API calls** using the **Axios** library. Here's exactly where and how:

### 🌐 Base URL Configuration
**Every API call uses**: `http://localhost:8080`
- **Backend (Spring Boot)**: Runs on port 8080
- **Frontend (React/Vite)**: Runs on port 5173
- **Communication**: HTTP requests with JSON data

### 🔑 Authentication Headers
```jsx
const token = localStorage.getItem("token")
const headers = { Authorization: `Bearer ${token}` }
```
Every authenticated request includes the JWT token in the header.

### 📍 API Connection Points

#### 1. **Login Authentication** (Login.jsx)
```jsx
const response = await axios.post("http://localhost:8080/api/auth/login", formData)
```
- **Frontend**: Sends email, password, userType
- **Backend**: AuthController.login() validates and returns JWT token

#### 2. **User Registration** (Register.jsx)
```jsx
const endpoint = userType === "therapist" 
  ? "http://localhost:8080/api/auth/register-therapist"
  : "http://localhost:8080/api/auth/register"
```

#### 3. **Dashboard Data** (UserDashboard.jsx)
```jsx
// Get user's journals
const journalsResponse = await axios.get(
  `http://localhost:8080/api/journals/user/${user.id}`, 
  { headers }
)

// Get user's sessions
const sessionsResponse = await axios.get(
  `http://localhost:8080/api/sessions/user/${user.id}`, 
  { headers }
)

// Get motivational content
const motivationResponse = await axios.get(
  "http://localhost:8080/api/motivations/active", 
  { headers }
)
```

#### 4. **Journal Management** (JournalForm.jsx, JournalList.jsx)
```jsx
// Create new journal
await axios.post("http://localhost:8080/api/journals", journalData, { headers })

// Update existing journal
await axios.put(`http://localhost:8080/api/journals/${id}`, journalData, { headers })

// Delete journal
await axios.delete(`http://localhost:8080/api/journals/${id}`, { headers })
```

#### 5. **Session Booking** (SessionBooking.jsx)
```jsx
// Get available therapists
const response = await axios.get("http://localhost:8080/api/therapists/available", { headers })

// Book a session
await axios.post("http://localhost:8080/api/sessions", sessionData, { headers })
```

#### 6. **Session Management** (SessionList.jsx)
```jsx
// Get sessions (different for users vs therapists)
const endpoint = userType === "therapist"
  ? `http://localhost:8080/api/sessions/therapist/${user.id}`
  : `http://localhost:8080/api/sessions/user/${user.id}`

// Update session status
await axios.put(
  `http://localhost:8080/api/sessions/${sessionId}/status`,
  { status: newStatus },
  { headers }
)
```

#### 7. **Admin Operations** (Admin components)
```jsx
// Get all users, therapists, sessions simultaneously
const [usersResponse, therapistsResponse, sessionsResponse] = await Promise.all([
  axios.get("http://localhost:8080/api/users", { headers }),
  axios.get("http://localhost:8080/api/therapists", { headers }),
  axios.get("http://localhost:8080/api/sessions", { headers })
])
```

### 🔄 Request/Response Flow

**Example: Creating a Journal Entry**
```jsx
// 1. Frontend (JournalForm.jsx)
const journalData = {
  title: "My day",
  content: "Today was good...",
  mood: "HAPPY",
  tags: "positive"
}

// 2. API Call
const response = await axios.post(
  "http://localhost:8080/api/journals", 
  journalData, 
  { headers: { Authorization: `Bearer ${token}` } }
)

// 3. Backend receives request at JournalController
@PostMapping
public ResponseEntity<Journal> createJournal(@RequestBody Journal journal) {
  // 4. JournalService processes business logic
  // 5. JournalRepository saves to database
  // 6. Returns saved journal as JSON
}

// 7. Frontend receives response and updates UI
setJournals([...journals, response.data])
```

### 🛡️ CORS Configuration (Backend)
In your `SecurityConfig.java`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```
This allows your React app (port 5173) to make requests to Spring Boot (port 8080).

### 📱 Error Handling
```jsx
try {
  const response = await axios.post("http://localhost:8080/api/journals", journalData, { headers })
  // Success handling
} catch (error) {
  setError(error.response?.data || "Operation failed")
  // Error handling
}
```

### 🚀 How to Start Both Servers

**Backend (Spring Boot):**
```bash
cd mind_connect
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

**Frontend (React):**
```bash
cd mind-frontend
npm run dev
# Runs on http://localhost:5173
```

**The connection is established when both are running!**

---

## FRONTEND EXPLANATION (React.js)

### 20. Project Structure & Dependencies

**package.json dependencies:**
```json
"dependencies": {
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.6.3",
  "axios": "^1.10.0",
  "tailwindcss": "^4.1.11"
}
```

**Key libraries:**
- **React**: Component-based UI framework
- **React Router**: Client-side routing (navigation between pages)
- **Axios**: HTTP client for API calls to backend
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast build tool (development server)

### 21. main.jsx (Entry Point)

```jsx
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**What it does:**
- Finds the HTML element with ID "root"
- Renders the main App component into it
- `StrictMode`: Helps catch common React mistakes during development

### 22. App.jsx (Main Application Component)

**State management:**
```jsx
const [user, setUser] = useState(null)
const [token, setToken] = useState(localStorage.getItem("token"))
const [userType, setUserType] = useState(localStorage.getItem("userType"))
```

**Key features:**
- `useState`: React hook for managing component state
- `localStorage`: Browser storage for persisting login data
- Manages user authentication state across the entire app

**Authentication logic:**
```jsx
const handleLogin = (userData, authToken, type) => {
  setUser(userData)
  setToken(authToken)
  setUserType(type)
  localStorage.setItem("token", authToken)
  localStorage.setItem("user", JSON.stringify(userData))
  localStorage.setItem("userType", type)
}
```

**Route protection:**
```jsx
const ProtectedRoute = ({ children }) => {
  return token ? children : <Navigate to="/login" />
}
```
- If user is logged in (has token), show the requested page
- If not logged in, redirect to login page

**Routing setup:**
```jsx
<Routes>
  <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Home />} />
  <Route path="/login" element={<Login onLogin={handleLogin} />} />
  <Route path="/dashboard" element={
    <ProtectedRoute>
      {userType === "therapist" ? 
        <TherapistDashboard user={user} /> : 
        <UserDashboard user={user} />
      }
    </ProtectedRoute>
  } />
</Routes>
```

**Different dashboards based on user type:**
- **Therapist**: Can manage sessions, view patient data
- **Admin**: Can manage all users, therapists, and content
- **User**: Can book sessions, write journals, view motivation

### 23. Login.jsx Component

**Form state management:**
```jsx
const [formData, setFormData] = useState({
  email: "",
  password: "",
  userType: "user",
})
```

**API call to backend:**
```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    const response = await axios.post("http://localhost:8080/api/auth/login", formData)
    const { token, user, userType } = response.data
    onLogin(user, token, userType)
  } catch (error) {
    setError(error.response?.data || "Login failed")
  }
}
```

**Key concepts:**
- `e.preventDefault()`: Stops form from refreshing page
- `axios.post()`: Makes HTTP POST request to backend login endpoint
- `async/await`: Handles asynchronous operations
- `onLogin()`: Callback function passed from parent (App.jsx)

### 24. UserDashboard.jsx Component

**Data fetching on component load:**
```jsx
useEffect(() => {
  fetchDashboardData()
}, [user])

const fetchDashboardData = async () => {
  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }
  
  const journalsResponse = await axios.get(
    `http://localhost:8080/api/journals/user/${user.id}`, 
    { headers }
  )
}
```

**Key concepts:**
- `useEffect()`: React hook that runs code when component loads
- Authorization header: Sends JWT token with each API request
- Multiple API calls to gather dashboard data

**Component structure:**
1. **Stats section**: Shows total journals, upcoming sessions
2. **Recent journals**: Last 3 journal entries
3. **Upcoming sessions**: Next 3 scheduled sessions
4. **Motivation**: Random motivational content

---

## HOW EVERYTHING WORKS TOGETHER

### Authentication Flow:
1. User enters email/password in **Login.jsx**
2. Frontend sends POST to `/api/auth/login`
3. **AuthController** validates credentials
4. **JwtUtil** generates token
5. Frontend stores token in localStorage
6. **JwtAuthenticationFilter** validates token on future requests

### Data Flow Example (Creating a Journal):
1. User fills form in **JournalForm.jsx**
2. Frontend: `axios.post('/api/journals', journalData, headers)`
3. **JournalController** receives request
4. **JournalService** processes business logic
5. **JournalRepository** saves to database
6. Response sent back to frontend
7. Frontend updates UI

### Security:
- **Backend**: JWT tokens, password encryption, role-based access
- **Frontend**: Protected routes, token-based authentication
- **CORS**: Allows React (port 5173) to call Spring Boot (port 8080)

### Database Tables Created:
- `users`, `roles`, `therapists`, `sessions`, `journals`, `notifications`, `motivations`

This is a **full-stack application** with proper separation of concerns, authentication, and a modern user interface!

---

## SUMMARY FOR YOUR DEFENSE

**Backend (Java Spring Boot):**
- **Entities**: Define database structure (User, Session, Journal, etc.)
- **Repositories**: Handle database operations (save, find, delete)
- **Services**: Contain business logic (validation, notifications)
- **Controllers**: Create REST API endpoints for frontend
- **Security**: JWT authentication, password encryption, role-based access

**Frontend (React.js):**
- **Components**: Reusable UI pieces (Login, Dashboard, forms)
- **Routing**: Navigate between pages without page refreshes
- **State Management**: Track user login status and data
- **API Integration**: Communicate with backend using Axios
- **Styling**: Modern UI with Tailwind CSS

**Key Features:**
- User authentication (login/register)
- Role-based dashboards (User/Therapist/Admin)
- Session booking and management
- Personal journaling with mood tracking
- Motivational content system
- Notification system
- Profile management