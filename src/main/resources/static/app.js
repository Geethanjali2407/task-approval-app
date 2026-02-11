const API_BASE = ""; // same host/port

// --- DOM ---
const loginCard = document.getElementById("loginCard");
const appArea = document.getElementById("appArea");
const whoami = document.getElementById("whoami");
const logoutBtn = document.getElementById("logoutBtn");

const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");

const assignedUserIdEl = document.getElementById("assignedUserId");
const createTaskForm = document.getElementById("createTaskForm");
const createMsg = document.getElementById("createMsg");

const filterStatusEl = document.getElementById("filterStatus");
const sortByEl = document.getElementById("sortBy");
const directionEl = document.getElementById("direction");
const refreshBtn = document.getElementById("refreshBtn");
const listMsg = document.getElementById("listMsg");

const pendingList = document.getElementById("pendingList");
const approvedList = document.getElementById("approvedList");
const rejectedList = document.getElementById("rejectedList");
const tasksTableBody = document.getElementById("tasksTableBody");

// --- Auth state ---
function getAuth() {
    return localStorage.getItem("basicAuth") || "";
}
function setAuth(username, password) {
    const token = btoa(`${username}:${password}`);
    localStorage.setItem("basicAuth", `Basic ${token}`);
    localStorage.setItem("username", username);
}
function clearAuth() {
    localStorage.removeItem("basicAuth");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
}
function getUsername() {
    return localStorage.getItem("username") || "";
}
function setRole(role) {
    localStorage.setItem("role", role);
}
function getRole() {
    return localStorage.getItem("role") || "";
}

// --- Helpers ---
function isoFromDateTimeLocal(value) {
    // value like "2026-02-11T10:30"
    const d = new Date(value);
    return d.toISOString(); // convert local -> UTC ISO with Z
}

function badgeClass(status) {
    if (status === "PENDING") return "pending";
    if (status === "APPROVED") return "approved";
    return "rejected";
}

function canApprove() {
    const role = getRole();
    return role === "MANAGER" || role === "ADMIN";
}

async function apiFetch(path, options = {}) {
    const headers = options.headers || {};
    const auth = getAuth();
    if (auth) headers["Authorization"] = auth;

    // only set json content-type when sending body
    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) throw new Error("401: Unauthorized (check username/password)");
    if (res.status === 403) {
        const data = await safeJson(res);
        throw new Error(data?.message || "403: Forbidden");
    }
    if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.message || `${res.status}: ${res.statusText}`);
    }

    // some endpoints might return empty body
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    return res.text();
}

async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
}

function setMsg(el, text, ok = true) {
    el.textContent = text;
    el.style.color = ok ? "rgba(234,240,255,0.75)" : "#ffb4b4";
    if (!text) el.style.color = "rgba(234,240,255,0.75)";
}

function showAppUI() {
    loginCard.classList.add("hidden");
    appArea.classList.remove("hidden");
    whoami.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
}

function showLoginUI() {
    appArea.classList.add("hidden");
    loginCard.classList.remove("hidden");
    whoami.classList.add("hidden");
    logoutBtn.classList.add("hidden");
}

// --- Load users and infer role for logged-in username ---
async function loadUsersAndRole() {
    const users = await apiFetch("/users");
    assignedUserIdEl.innerHTML = "";
    users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = String(u.id);
        opt.textContent = `${u.name} (${u.role})`;
        assignedUserIdEl.appendChild(opt);
    });

    const me = users.find(u => u.username === getUsername());
    if (me) {
        setRole(me.role);
        whoami.textContent = `Logged in: ${me.username} • Role: ${me.role}`;
    } else {
        whoami.textContent = `Logged in: ${getUsername()}`;
    }

    return users;
}

// --- Task rendering ---
function renderTaskCard(t) {
    const div = document.createElement("div");
    div.className = "task";

    const top = document.createElement("div");
    top.className = "top";

    const left = document.createElement("div");
    left.innerHTML = `<div class="title">#${t.id} • ${escapeHtml(t.title)}</div>
                    <div class="muted small">${escapeHtml(t.description || "")}</div>`;

    const right = document.createElement("div");
    right.innerHTML = `<span class="badge ${badgeClass(t.status)}">${t.status}</span>`;

    top.appendChild(left);
    top.appendChild(right);

    const meta = document.createElement("div");
    meta.className = "muted small";
    meta.style.marginTop = "8px";
    meta.textContent = `Priority: ${t.priority} • Assigned: ${t.assignedUserName} • When: ${fmt(t.dateTime)} • Created: ${fmt(t.createdDate)}`;

    div.appendChild(top);
    div.appendChild(meta);

    return div;
}

function fmt(iso) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return iso;
    }
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderActionsCell(t) {
    const wrap = document.createElement("div");
    wrap.className = "actions";

    if (t.status === "PENDING" && canApprove()) {
        const approveBtn = document.createElement("button");
        approveBtn.className = "btn btn-ok";
        approveBtn.textContent = "Approve";
        approveBtn.onclick = async () => {
            await approveReject(t.id, true);
        };

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "btn btn-danger";
        rejectBtn.textContent = "Reject";
        rejectBtn.onclick = async () => {
            await approveReject(t.id, false);
        };

        wrap.appendChild(approveBtn);
        wrap.appendChild(rejectBtn);
    } else {
        const span = document.createElement("span");
        span.className = "muted small";
        span.textContent = canApprove() ? "-" : "Manager only";
        wrap.appendChild(span);
    }

    return wrap;
}

async function approveReject(id, approve) {
    const comment = prompt(approve ? "Approval comment (optional):" : "Rejection comment (optional):") || "";
    try {
        await apiFetch(`/tasks/${id}/approve`, {
            method: "PUT",
            body: JSON.stringify({ approve, comment })
        });
        setMsg(listMsg, `Task #${id} ${approve ? "approved" : "rejected"} ✅`);
        await refreshAll();
    } catch (e) {
        setMsg(listMsg, e.message, false);
    }
}

// --- Load tasks ---
async function loadDashboard() {
    const [pending, approved, rejected] = await Promise.all([
        apiFetch(`/tasks?status=PENDING&sortBy=${sortByEl.value}&direction=${directionEl.value}`),
        apiFetch(`/tasks?status=APPROVED&sortBy=${sortByEl.value}&direction=${directionEl.value}`),
        apiFetch(`/tasks?status=REJECTED&sortBy=${sortByEl.value}&direction=${directionEl.value}`)
    ]);

    pendingList.innerHTML = "";
    approvedList.innerHTML = "";
    rejectedList.innerHTML = "";

    (pending || []).forEach(t => pendingList.appendChild(renderTaskCard(t)));
    (approved || []).forEach(t => approvedList.appendChild(renderTaskCard(t)));
    (rejected || []).forEach(t => rejectedList.appendChild(renderTaskCard(t)));
}

async function loadFilteredTable() {
    const status = filterStatusEl.value;
    const sortBy = sortByEl.value;
    const direction = directionEl.value;

    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    qs.set("sortBy", sortBy);
    qs.set("direction", direction);

    const tasks = await apiFetch(`/tasks?${qs.toString()}`);

    tasksTableBody.innerHTML = "";
    (tasks || []).forEach(t => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td>${t.id}</td>
      <td>${escapeHtml(t.title)}</td>
      <td><span class="badge ${badgeClass(t.status)}">${t.status}</span></td>
      <td>${t.priority}</td>
      <td>${fmt(t.dateTime)}</td>
      <td>${escapeHtml(t.assignedUserName)}</td>
      <td>${fmt(t.createdDate)}</td>
      <td></td>
    `;

        tr.lastElementChild.appendChild(renderActionsCell(t));
        tasksTableBody.appendChild(tr);
    });
}

async function refreshAll() {
    await loadDashboard();
    await loadFilteredTable();
}

// --- Event handlers ---
loginBtn.addEventListener("click", async () => {
    const u = usernameEl.value.trim();
    const p = passwordEl.value;

    if (!u || !p) {
        setMsg(loginMsg, "Enter username and password.", false);
        return;
    }

    setAuth(u, p);

    try {
        setMsg(loginMsg, "Logging in...");
        await loadUsersAndRole(); // will 401 if creds wrong
        showAppUI();
        setMsg(loginMsg, "");
        setMsg(createMsg, "");
        await refreshAll();
    } catch (e) {
        clearAuth();
        showLoginUI();
        setMsg(loginMsg, e.message, false);
    }
});

logoutBtn.addEventListener("click", () => {
    clearAuth();
    showLoginUI();
    usernameEl.value = "";
    passwordEl.value = "";
    setMsg(loginMsg, "Logged out.");
});

refreshBtn.addEventListener("click", async () => {
    try {
        setMsg(listMsg, "Refreshing...");
        await refreshAll();
        setMsg(listMsg, "Updated ✅");
    } catch (e) {
        setMsg(listMsg, e.message, false);
    }
});

createTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg(createMsg, "");

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dateTimeLocal = document.getElementById("dateTime").value;
    const priority = document.getElementById("priority").value;
    const assignedUserId = Number(assignedUserIdEl.value);

    if (!title || !dateTimeLocal || !priority || !assignedUserId) {
        setMsg(createMsg, "Please fill required fields.", false);
        return;
    }

    const payload = {
        title,
        description,
        dateTime: isoFromDateTimeLocal(dateTimeLocal),
        priority,
        assignedUserId
    };

    try {
        await apiFetch("/tasks", { method: "POST", body: JSON.stringify(payload) });
        setMsg(createMsg, "Task created ✅");
        createTaskForm.reset();
        await refreshAll();
    } catch (e2) {
        setMsg(createMsg, e2.message, false);
    }
});

// --- Boot ---
(async function init() {
    const auth = getAuth();
    if (!auth) {
        showLoginUI();
        return;
    }

    // If user already logged in previously, try loading
    try {
        await loadUsersAndRole();
        showAppUI();
        await refreshAll();
    } catch (e) {
        clearAuth();
        showLoginUI();
    }
})();
