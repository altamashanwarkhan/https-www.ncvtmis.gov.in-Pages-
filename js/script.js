/**
 * Student Portal - Main Logic
 * Handles Auth, LocalStorage Data, and UI Rendering
 */

// --- Constants & State ---
const DB_KEYS = {
    USERS: 'sp_users',
    COURSES: 'sp_courses',
    CURRENT_USER: 'sp_current_user'
};

// Default Admin
const DEFAULT_ADMIN = {
    id: 'admin_001',
    name: 'Administrator',
    email: 'admin',
    password: 'admin123',
    role: 'admin'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initDB();
    routeGuard();
    setupEventListeners();

    // Page specific rendering
    const path = window.location.pathname;
    if (path.includes('admin-dashboard.html')) {
        renderAdminDashboard();
    } else if (path.includes('student-dashboard.html')) {
        renderStudentDashboard();
    }
});

function initDB() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify([DEFAULT_ADMIN]));
    }
    if (!localStorage.getItem(DB_KEYS.COURSES)) {
        localStorage.setItem(DB_KEYS.COURSES, JSON.stringify([]));
    }
}

// --- Authentication ---
function login(email, password) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
        return { success: true };
    } else {
        return { success: false, message: 'Invalid credentials' };
    }
}

function logout() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
}

function routeGuard() {
    const user = getCurrentUser();
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html') || path.endsWith('/'); // Assuming index is landing or login
    const isIndex = path.endsWith('index.html') || path.endsWith('/');

    // If on dashboard pages but not logged in
    if ((path.includes('admin-dashboard') || path.includes('student-dashboard')) && !user) {
        window.location.href = 'login.html';
        return;
    }

    // If logged in, prevent going back to login
    if (isLoginPage && user) {
        if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
        else window.location.href = 'student-dashboard.html';
        return;
    }

    // Role protection
    if (path.includes('admin-dashboard') && user.role !== 'admin') {
        window.location.href = 'student-dashboard.html';
    }
    if (path.includes('student-dashboard') && user.role !== 'student') {
        window.location.href = 'admin-dashboard.html';
    }

    // Update Navbar User Name if element exists
    const userNameDisplay = document.getElementById('user-name-display');
    if (userNameDisplay && user) {
        userNameDisplay.textContent = `Welcome, ${user.name}`;
    }
}

// --- Data Management (Admin) ---
function addUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    if (users.find(u => u.email === email)) {
        alert('User with this email already exists!');
        return false;
    }
    const newUser = {
        id: 'std_' + Date.now(),
        name,
        email,
        password,
        role: 'student'
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return true;
}

function deleteUser(id) {
    let users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    users = users.filter(u => u.id !== id);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    renderAdminDashboard(); // Re-render
}

function addCourse(title, link, category) {
    const courses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES));
    const newCourse = {
        id: 'crs_' + Date.now(),
        title,
        link,
        category
    };
    courses.push(newCourse);
    localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(courses));
    return true;
}

function deleteCourse(id) {
    let courses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES));
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(courses));
    renderAdminDashboard(); // Re-render
}

// --- UI Rendering ---

// Helper to get Video URL
function getVideoEmbedUrl(input) {
    if (!input) return null;

    // Trim whitespace
    input = input.trim();

    // 1. Check if it's an iframe tag
    if (input.includes('<iframe')) {
        const srcMatch = input.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
            return srcMatch[1];
        }
    }

    // 2. Extract video ID from various YouTube URL formats
    let videoId = null;

    // Try multiple regex patterns to extract video ID
    const patterns = [
        // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        // Watch URL with additional parameters: https://www.youtube.com/watch?v=VIDEO_ID&feature=share
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        // Short share link: https://youtu.be/VIDEO_ID
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        // Embed URL: https://www.youtube.com/embed/VIDEO_ID
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        // V format: https://www.youtube.com/v/VIDEO_ID
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        // Mobile URL: https://m.youtube.com/watch?v=VIDEO_ID
        /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
    ];

    // Try each pattern until we find a match
    for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
            videoId = match[1];
            break;
        }
    }

    // If we found a video ID, return the embed URL
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function renderAdminDashboard() {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
    const courses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES));

    // ... (Stats rendering remains same) ...
    const studentCount = users.filter(u => u.role === 'student').length;
    const courseCount = courses.length;

    const totalStudentsEl = document.getElementById('total-students');
    const totalCoursesEl = document.getElementById('total-courses');

    if (totalStudentsEl) totalStudentsEl.textContent = studentCount;
    if (totalCoursesEl) totalCoursesEl.textContent = courseCount;

    // Render Students Table
    const studentsTableBody = document.getElementById('students-table-body');
    if (studentsTableBody) {
        studentsTableBody.innerHTML = '';
        users.filter(u => u.role === 'student').forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteUser('${student.id}')" style="padding: 5px 10px; font-size: 0.8rem;">Delete</button>
                </td>
            `;
            studentsTableBody.appendChild(tr);
        });
    }

    // Render Courses Table
    const coursesTableBody = document.getElementById('courses-table-body');
    if (coursesTableBody) {
        coursesTableBody.innerHTML = '';
        courses.forEach(course => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${course.title}</td>
                <td>${course.category}</td>
                <td><a href="${course.link}" target="_blank">Link</a></td>
                <td>
                    <button class="btn btn-danger" onclick="deleteCourse('${course.id}')" style="padding: 5px 10px; font-size: 0.8rem;">Delete</button>
                </td>
            `;
            coursesTableBody.appendChild(tr);
        });
    }
}

function renderStudentDashboard(categoryFilter = 'All', searchQuery = '') {
    const courses = JSON.parse(localStorage.getItem(DB_KEYS.COURSES));
    const container = document.getElementById('student-courses-container');

    if (!container) return;

    container.innerHTML = '';

    const filteredCourses = courses.filter(course => {
        const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredCourses.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No courses found.</p>';
        return;
    }

    filteredCourses.forEach(course => {
        const embedUrl = getVideoEmbedUrl(course.link);

        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <div class="video-container">
                ${embedUrl ? `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#eee;color:#666;">Invalid Video Link</div>'}
            </div>
            <div class="course-info">
                <span class="course-category">${course.category}</span>
                <h3 class="course-title">${course.title}</h3>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Event Listeners ---
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const result = login(email, password);
            if (!result.success) {
                alert(result.message);
            }
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Admin: Add Student Form
    const addStudentForm = document.getElementById('add-student-form');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('student-name').value;
            const email = document.getElementById('student-email').value;
            const password = document.getElementById('student-password').value;

            if (addUser(name, email, password)) {
                alert('Student added successfully!');
                addStudentForm.reset();
                renderAdminDashboard();
            }
        });
    }

    // Admin: Add Course Form
    const addCourseForm = document.getElementById('add-course-form');
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('course-title').value;
            const link = document.getElementById('course-link').value;
            const category = document.getElementById('course-category').value;

            if (addCourse(title, link, category)) {
                alert('Course added successfully!');
                addCourseForm.reset();
                renderAdminDashboard();
            }
        });
    }

    // Student: Search & Filter
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeCategory = document.querySelector('.sidebar ul li a.active')?.dataset.category || 'All';
            renderStudentDashboard(activeCategory, e.target.value);
        });
    }

    // Student: Category Links
    const categoryLinks = document.querySelectorAll('.category-link');
    if (categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Update active state
                categoryLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                const category = e.target.dataset.category;
                const searchQuery = document.getElementById('course-search')?.value || '';
                renderStudentDashboard(category, searchQuery);
            });
        });
    }
}
